-- BellaChain package-credit model for PostgreSQL.
-- Amounts on-chain are stored as integer token base units to avoid float rounding.

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS solana_wallet_address VARCHAR(64);

CREATE TABLE IF NOT EXISTS desafios_carteira_solana (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  carteira VARCHAR(64) NOT NULL,
  nonce VARCHAR(64) NOT NULL UNIQUE,
  mensagem TEXT NOT NULL,
  expira_em TIMESTAMPTZ NOT NULL,
  usado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_solana_wallet_unique
  ON usuarios(solana_wallet_address) WHERE solana_wallet_address IS NOT NULL;

ALTER TABLE servicos
  ADD COLUMN IF NOT EXISTS prestador_usuario_id BIGINT REFERENCES usuarios(id),
  ADD COLUMN IF NOT EXISTS cancelamento_prazo_minutos INTEGER NOT NULL DEFAULT 1440,
  ADD COLUMN IF NOT EXISTS cancelamento_tardio_acao TEXT NOT NULL DEFAULT 'devolver',
  ADD COLUMN IF NOT EXISTS cancelamento_tardio_taxa_bps INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS falta_acao TEXT NOT NULL DEFAULT 'devolver',
  ADD COLUMN IF NOT EXISTS falta_taxa_bps INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS regras_versao INTEGER NOT NULL DEFAULT 1;

ALTER TABLE servicos ALTER COLUMN pontos_por_servico SET DEFAULT 0;

ALTER TABLE servicos
  DROP CONSTRAINT IF EXISTS servicos_cancelamento_tardio_acao_check,
  ADD CONSTRAINT servicos_cancelamento_tardio_acao_check
    CHECK (cancelamento_tardio_acao IN ('devolver', 'cobrar_taxa')),
  DROP CONSTRAINT IF EXISTS servicos_falta_acao_check,
  ADD CONSTRAINT servicos_falta_acao_check
    CHECK (falta_acao IN ('devolver', 'cobrar_taxa')),
  DROP CONSTRAINT IF EXISTS servicos_cancelamento_prazo_check,
  ADD CONSTRAINT servicos_cancelamento_prazo_check
    CHECK (cancelamento_prazo_minutos >= 0),
  DROP CONSTRAINT IF EXISTS servicos_cancelamento_tardio_taxa_check,
  ADD CONSTRAINT servicos_cancelamento_tardio_taxa_check
    CHECK (cancelamento_tardio_taxa_bps BETWEEN 0 AND 10000),
  DROP CONSTRAINT IF EXISTS servicos_falta_taxa_check,
  ADD CONSTRAINT servicos_falta_taxa_check
    CHECK (falta_taxa_bps BETWEEN 0 AND 10000);

CREATE TABLE IF NOT EXISTS pacotes_credito (
  id BIGSERIAL PRIMARY KEY,
  prestador_usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  titulo VARCHAR(120) NOT NULL,
  descricao TEXT,
  token_mint VARCHAR(64) NOT NULL,
  valor_base_units NUMERIC(30, 0) NOT NULL CHECK (valor_base_units > 0),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  publicado BOOLEAN NOT NULL DEFAULT FALSE,
  programa_solana VARCHAR(64),
  conta_onchain VARCHAR(64),
  assinatura_publicacao VARCHAR(128),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pacotes_credito_prestador_ativo
  ON pacotes_credito(prestador_usuario_id, ativo);

ALTER TABLE pacotes_credito
  ADD COLUMN IF NOT EXISTS publicado BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS compras_pacotes (
  id BIGSERIAL PRIMARY KEY,
  pacote_id BIGINT NOT NULL REFERENCES pacotes_credito(id),
  cliente_usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  carteira_cliente VARCHAR(64) NOT NULL,
  saldo_total_units NUMERIC(30, 0) NOT NULL CHECK (saldo_total_units > 0),
  saldo_disponivel_units NUMERIC(30, 0) NOT NULL CHECK (saldo_disponivel_units >= 0),
  saldo_reservado_units NUMERIC(30, 0) NOT NULL DEFAULT 0 CHECK (saldo_reservado_units >= 0),
  status TEXT NOT NULL DEFAULT 'aguardando_compra'
    CHECK (status IN ('aguardando_compra', 'ativo', 'esgotado', 'cancelado')),
  conta_onchain VARCHAR(64),
  assinatura_compra VARCHAR(128),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (saldo_disponivel_units + saldo_reservado_units <= saldo_total_units)
);

CREATE INDEX IF NOT EXISTS idx_compras_pacotes_cliente_status
  ON compras_pacotes(cliente_usuario_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_compras_pacotes_assinatura
  ON compras_pacotes(assinatura_compra) WHERE assinatura_compra IS NOT NULL;

CREATE TABLE IF NOT EXISTS reservas_pacotes (
  id BIGSERIAL PRIMARY KEY,
  compra_id BIGINT NOT NULL REFERENCES compras_pacotes(id),
  servico_id BIGINT NOT NULL REFERENCES servicos(id),
  cliente_usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  prestador_usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  valor_units NUMERIC(30, 0) NOT NULL CHECK (valor_units > 0),
  inicio_atendimento TIMESTAMPTZ NOT NULL,
  cancelamento_limite TIMESTAMPTZ NOT NULL,
  cancelamento_prazo_minutos INTEGER NOT NULL CHECK (cancelamento_prazo_minutos >= 0),
  acao_cancelamento_tardio TEXT NOT NULL CHECK (acao_cancelamento_tardio IN ('devolver', 'cobrar_taxa')),
  taxa_cancelamento_tardio_bps INTEGER NOT NULL CHECK (taxa_cancelamento_tardio_bps BETWEEN 0 AND 10000),
  acao_falta TEXT NOT NULL CHECK (acao_falta IN ('devolver', 'cobrar_taxa')),
  taxa_falta_bps INTEGER NOT NULL CHECK (taxa_falta_bps BETWEEN 0 AND 10000),
  regras_versao INTEGER NOT NULL,
  regras_aceitas_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'aguardando_reserva_onchain'
    CHECK (status IN ('aguardando_reserva_onchain', 'reservada', 'concluida', 'cancelada', 'falta', 'contestada')),
  assinatura_reserva VARCHAR(128),
  assinatura_cancelamento VARCHAR(128),
  assinatura_liquidacao VARCHAR(128),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservas_pacotes_cliente_status
  ON reservas_pacotes(cliente_usuario_id, status, inicio_atendimento);
CREATE INDEX IF NOT EXISTS idx_reservas_pacotes_prestador_status
  ON reservas_pacotes(prestador_usuario_id, status, inicio_atendimento);

CREATE TABLE IF NOT EXISTS eventos_pacotes_solana (
  id BIGSERIAL PRIMARY KEY,
  reserva_id BIGINT REFERENCES reservas_pacotes(id),
  compra_id BIGINT REFERENCES compras_pacotes(id),
  assinatura VARCHAR(128) NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('compra', 'reserva', 'cancelamento', 'liquidacao', 'contestacao')),
  slot BIGINT,
  estado_verificacao TEXT NOT NULL DEFAULT 'pendente'
    CHECK (estado_verificacao IN ('pendente', 'confirmado', 'falhou')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  observado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_pacotes_solana_reserva
  ON eventos_pacotes_solana(reserva_id, observado_em DESC);

