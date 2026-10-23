-- =============================================================================
-- BELLACHAIN - DATABASE SCHEMA (SUPABASE / POSTGRES)
-- Sistema de Gerenciamento de Pontos e Recompensas para Salão de Beleza
-- =============================================================================

-- Observações:
-- - Este schema foi adaptado para PostgreSQL/Supabase.
-- - Remove recursos específicos do MySQL (ENGINE, DELIMITER, ON UPDATE, TRIGGER recursiva).

-- =============================================================================
-- 1. TABELA: USUARIOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14) UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'funcionario', 'admin')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  wallet_address VARCHAR(255),
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON usuarios(status);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_password_reset_tokens_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_usuario ON password_reset_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expira ON password_reset_tokens(expires_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'usuarios' THEN
    NEW.data_atualizacao := NOW();
  ELSIF TG_TABLE_NAME IN ('clientes', 'servicos', 'recompensas') THEN
    NEW.updated_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 2. TABELA: CLIENTES
-- =============================================================================
CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL UNIQUE,
  saldo_pontos INTEGER NOT NULL DEFAULT 0 CHECK (saldo_pontos >= 0),
  categoria TEXT NOT NULL DEFAULT 'Bronze' CHECK (categoria IN ('Bronze', 'Prata', 'Ouro', 'Platina')),
  total_gasto NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_pontos_ganhos INTEGER NOT NULL DEFAULT 0 CHECK (total_pontos_ganhos >= 0),
  total_pontos_resgatados INTEGER NOT NULL DEFAULT 0 CHECK (total_pontos_resgatados >= 0),
  ultima_visita TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_clientes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_clientes_categoria ON clientes(categoria);
CREATE INDEX IF NOT EXISTS idx_clientes_saldo_pontos ON clientes(saldo_pontos);

DROP TRIGGER IF EXISTS trg_clientes_updated_at ON clientes;
CREATE TRIGGER trg_clientes_updated_at
BEFORE UPDATE ON clientes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION set_cliente_categoria()
RETURNS TRIGGER AS $$
BEGIN
  NEW.categoria := CASE
    WHEN NEW.total_gasto >= 1000 THEN 'Platina'
    WHEN NEW.total_gasto >= 500 THEN 'Ouro'
    WHEN NEW.total_gasto >= 200 THEN 'Prata'
    ELSE 'Bronze'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clientes_set_categoria ON clientes;
CREATE TRIGGER trg_clientes_set_categoria
BEFORE INSERT OR UPDATE OF total_gasto
ON clientes
FOR EACH ROW
EXECUTE FUNCTION set_cliente_categoria();

-- =============================================================================
-- 3. TABELA: SERVICOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS servicos (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
  pontos_por_servico INTEGER NOT NULL CHECK (pontos_por_servico >= 0),
  categoria VARCHAR(50),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servicos_ativo ON servicos(ativo);
CREATE INDEX IF NOT EXISTS idx_servicos_categoria ON servicos(categoria);

DROP TRIGGER IF EXISTS trg_servicos_updated_at ON servicos;
CREATE TRIGGER trg_servicos_updated_at
BEFORE UPDATE ON servicos
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 4. TABELA: ATENDIMENTOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS atendimentos (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL,
  funcionario_id BIGINT NOT NULL,
  servico_id BIGINT NOT NULL,
  data_atendimento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valor_servico NUMERIC(10,2) NOT NULL CHECK (valor_servico >= 0),
  pontos_gerados INTEGER NOT NULL CHECK (pontos_gerados >= 0),
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'concluido' CHECK (status IN ('concluido', 'cancelado', 'em_processamento')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_atendimentos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_atendimentos_funcionario FOREIGN KEY (funcionario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_atendimentos_servico FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

CREATE INDEX IF NOT EXISTS idx_atendimentos_cliente_id ON atendimentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_data_atendimento ON atendimentos(data_atendimento DESC);
CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON atendimentos(status);

-- =============================================================================
-- 5. TABELA: RECOMPENSAS
-- =============================================================================
CREATE TABLE IF NOT EXISTS recompensas (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  pontos_necessarios INTEGER NOT NULL CHECK (pontos_necessarios > 0),
  tipo TEXT NOT NULL DEFAULT 'desconto' CHECK (tipo IN ('desconto', 'servico_gratis', 'dinheiro')),
  valor_desconto NUMERIC(10,2),
  servico_gratis_id BIGINT,
  dinheiro_valor NUMERIC(10,2),
  quantidade_disponivel INTEGER NOT NULL DEFAULT -1 CHECK (quantidade_disponivel = -1 OR quantidade_disponivel >= 0),
  ativa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_recompensas_servico FOREIGN KEY (servico_gratis_id) REFERENCES servicos(id)
);

CREATE INDEX IF NOT EXISTS idx_recompensas_ativa ON recompensas(ativa);
CREATE INDEX IF NOT EXISTS idx_recompensas_pontos_necessarios ON recompensas(pontos_necessarios);

DROP TRIGGER IF EXISTS trg_recompensas_updated_at ON recompensas;
CREATE TRIGGER trg_recompensas_updated_at
BEFORE UPDATE ON recompensas
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 6. TABELA: RESGATES_RECOMPENSAS
-- =============================================================================
CREATE TABLE IF NOT EXISTS resgates_recompensas (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL,
  recompensa_id BIGINT NOT NULL,
  data_resgate TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_utilizacao TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'utilizado', 'cancelado')),
  codigo_resgate VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_resgates_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_resgates_recompensa FOREIGN KEY (recompensa_id) REFERENCES recompensas(id)
);

CREATE INDEX IF NOT EXISTS idx_resgates_cliente_id ON resgates_recompensas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_resgates_status ON resgates_recompensas(status);
CREATE INDEX IF NOT EXISTS idx_resgates_codigo_resgate ON resgates_recompensas(codigo_resgate);

-- =============================================================================
-- 7. TABELA: MOVIMENTACOES_PONTOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS movimentacoes_pontos (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  motivo VARCHAR(100),
  descricao TEXT,
  atendimento_id BIGINT,
  resgate_id BIGINT,
  data_movimentacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_movimentacoes_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_movimentacoes_atendimento FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id),
  CONSTRAINT fk_movimentacoes_resgate FOREIGN KEY (resgate_id) REFERENCES resgates_recompensas(id)
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_cliente_id ON movimentacoes_pontos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes_pontos(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data_movimentacao ON movimentacoes_pontos(data_movimentacao DESC);

-- =============================================================================
-- 8. FUNÇÕES E TRIGGERS DE NEGÓCIO
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_adicionar_pontos_atendimento()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clientes
  SET saldo_pontos = saldo_pontos + NEW.pontos_gerados,
      total_pontos_ganhos = total_pontos_ganhos + NEW.pontos_gerados,
      ultima_visita = NEW.data_atendimento,
      updated_at = NOW()
  WHERE id = NEW.cliente_id;

  IF NEW.pontos_gerados > 0 THEN
    INSERT INTO movimentacoes_pontos (
      cliente_id,
      tipo,
      quantidade,
      motivo,
      descricao,
      atendimento_id
    ) VALUES (
      NEW.cliente_id,
      'entrada',
      NEW.pontos_gerados,
      'atendimento',
      CONCAT('Serviço: ', COALESCE(NEW.descricao, '')),
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_adicionar_pontos_atendimento ON atendimentos;
CREATE TRIGGER trg_adicionar_pontos_atendimento
AFTER INSERT ON atendimentos
FOR EACH ROW
EXECUTE FUNCTION fn_adicionar_pontos_atendimento();

CREATE OR REPLACE FUNCTION fn_remover_pontos_resgate()
RETURNS TRIGGER AS $$
DECLARE
  pontos_recompensa INTEGER;
BEGIN
  SELECT r.pontos_necessarios INTO pontos_recompensa
  FROM recompensas r
  WHERE r.id = NEW.recompensa_id;

  UPDATE clientes
  SET saldo_pontos = saldo_pontos - pontos_recompensa,
      total_pontos_resgatados = total_pontos_resgatados + pontos_recompensa,
      updated_at = NOW()
  WHERE id = NEW.cliente_id;

  INSERT INTO movimentacoes_pontos (
    cliente_id,
    tipo,
    quantidade,
    motivo,
    descricao,
    resgate_id
  ) VALUES (
    NEW.cliente_id,
    'saida',
    pontos_recompensa,
    'resgate',
    CONCAT('Resgate: ', NEW.codigo_resgate),
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_remover_pontos_resgate ON resgates_recompensas;
CREATE TRIGGER trg_remover_pontos_resgate
AFTER INSERT ON resgates_recompensas
FOR EACH ROW
EXECUTE FUNCTION fn_remover_pontos_resgate();

-- =============================================================================
-- 9. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_atendimentos_cliente_data
ON atendimentos(cliente_id, data_atendimento DESC);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_cliente_data
ON movimentacoes_pontos(cliente_id, data_movimentacao DESC);

CREATE INDEX IF NOT EXISTS idx_resgates_cliente_status
ON resgates_recompensas(cliente_id, status);

-- =============================================================================
-- FIM DO SCHEMA
-- =============================================================================
