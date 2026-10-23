-- =============================================================================
-- BELLACHAIN - DADOS DE TESTE (SUPABASE / POSTGRES)
-- Insere dados iniciais para testes
-- =============================================================================

-- =============================================================================
-- 1. INSERIR USUÁRIOS
-- =============================================================================

-- Admin
INSERT INTO usuarios (nome, email, senha, telefone, cpf, tipo, status)
VALUES (
  'Administrador',
  'admin@bellachain.com',
  '$2a$10$YIjlrKQJj5h7N8K3M9P2qO2e6X1Y5Z8A9B3C6D9E2F5G8H1J4K7L',
  '(11) 99999-0001',
  '12345678901234',
  'admin',
  'ativo'
)
ON CONFLICT (email) DO NOTHING;

-- Funcionários
INSERT INTO usuarios (nome, email, senha, telefone, cpf, tipo, status)
VALUES
(
  'Ana Silva - Cabeleireira',
  'ana@bellachain.com',
  '$2a$10$YIjlrKQJj5h7N8K3M9P2qO2e6X1Y5Z8A9B3C6D9E2F5G8H1J4K7L',
  '(11) 98888-0001',
  '12345678901235',
  'funcionario',
  'ativo'
),
(
  'Beatriz Santos - Manicure',
  'beatriz@bellachain.com',
  '$2a$10$YIjlrKQJj5h7N8K3M9P2qO2e6X1Y5Z8A9B3C6D9E2F5G8H1J4K7L',
  '(11) 98888-0002',
  '12345678901236',
  'funcionario',
  'ativo'
)
ON CONFLICT (email) DO NOTHING;

-- Clientes
INSERT INTO usuarios (nome, email, senha, telefone, cpf, tipo, status)
VALUES
(
  'Marina Costa',
  'marina@bellachain.com',
  '$2a$10$YIjlrKQJj5h7N8K3M9P2qO2e6X1Y5Z8A9B3C6D9E2F5G8H1J4K7L',
  '(11) 97777-0001',
  '12345678901237',
  'cliente',
  'ativo'
),
(
  'Juliana Oliveira',
  'juliana@bellachain.com',
  '$2a$10$YIjlrKQJj5h7N8K3M9P2qO2e6X1Y5Z8A9B3C6D9E2F5G8H1J4K7L',
  '(11) 97777-0002',
  '12345678901238',
  'cliente',
  'ativo'
),
(
  'Carla Ferreira',
  'carla@bellachain.com',
  '$2a$10$YIjlrKQJj5h7N8K3M9P2qO2e6X1Y5Z8A9B3C6D9E2F5G8H1J4K7L',
  '(11) 97777-0003',
  '12345678901239',
  'cliente',
  'ativo'
),
(
  'Daniela Mendes',
  'daniela@bellachain.com',
  '$2a$10$YIjlrKQJj5h7N8K3M9P2qO2e6X1Y5Z8A9B3C6D9E2F5G8H1J4K7L',
  '(11) 97777-0004',
  '12345678901240',
  'cliente',
  'ativo'
)
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 2. INSERIR CLIENTES (Extensão de usuários)
-- =============================================================================

INSERT INTO clientes (usuario_id, saldo_pontos, categoria, total_gasto, total_pontos_ganhos, total_pontos_resgatados, ultima_visita)
VALUES
(
  (SELECT id FROM usuarios WHERE email = 'marina@bellachain.com'),
  185,
  'Ouro',
  520.00,
  235,
  50,
  '2026-09-23T10:30:00Z'
),
(
  (SELECT id FROM usuarios WHERE email = 'juliana@bellachain.com'),
  420,
  'Platina',
  1200.00,
  490,
  70,
  '2026-09-20T14:15:00Z'
),
(
  (SELECT id FROM usuarios WHERE email = 'carla@bellachain.com'),
  75,
  'Prata',
  280.00,
  150,
  75,
  '2026-09-18T09:45:00Z'
),
(
  (SELECT id FROM usuarios WHERE email = 'daniela@bellachain.com'),
  310,
  'Ouro',
  450.00,
  380,
  70,
  '2026-09-21T16:20:00Z'
)
ON CONFLICT (usuario_id) DO NOTHING;

-- =============================================================================
-- 3. INSERIR SERVIÇOS
-- =============================================================================

INSERT INTO servicos (nome, descricao, valor, pontos_por_servico, categoria, ativo)
VALUES
(
  'Corte de Cabelo',
  'Corte simples com acabamento profissional',
  50.00,
  8,
  'Cabelo',
  TRUE
),
(
  'Coloração',
  'Coloração completa com produtos premium',
  120.00,
  15,
  'Cabelo',
  TRUE
),
(
  'Hidratação Capilar',
  'Tratamento completo de hidratação e nutrição',
  80.00,
  10,
  'Cabelo',
  TRUE
),
(
  'Escova Modelada',
  'Escova em qualquer estilo de cabelo',
  40.00,
  5,
  'Cabelo',
  TRUE
),
(
  'Manicure',
  'Manicure simples com esmalte da cor escolhida',
  35.00,
  5,
  'Unhas',
  TRUE
),
(
  'Pedicure',
  'Pedicure simples com esmalte da cor escolhida',
  45.00,
  6,
  'Unhas',
  TRUE
),
(
  'Alongamento de Unhas',
  'Alongamento de unhas em gel ou acrílico',
  65.00,
  8,
  'Unhas',
  TRUE
),
(
  'Limpeza de Pele',
  'Limpeza profunda com higienização facial',
  60.00,
  7,
  'Facial',
  TRUE
),
(
  'Depilação com Cera',
  'Depilação completa das sobrancelhas',
  25.00,
  3,
  'Depilação',
  TRUE
),
(
  'Depilação Laser',
  'Depilação com tecnologia laser',
  150.00,
  18,
  'Depilação',
  TRUE
)
ON CONFLICT (nome) DO NOTHING;

-- =============================================================================
-- 4. INSERIR RECOMPENSAS
-- =============================================================================

INSERT INTO recompensas (titulo, descricao, pontos_necessarios, tipo, valor_desconto, dinheiro_valor, quantidade_disponivel, ativa)
VALUES
(
  '10% de Desconto',
  'Desconto de 10% válido em qualquer serviço do salão',
  50,
  'desconto',
  10.00,
  NULL,
  -1,
  TRUE
),
(
  '20% de Desconto',
  'Desconto de 20% válido em qualquer serviço do salão',
  100,
  'desconto',
  20.00,
  NULL,
  -1,
  TRUE
),
(
  'Hidratação Gratuita',
  'Um atendimento de hidratação capilar completamente gratuito',
  100,
  'servico_gratis',
  NULL,
  NULL,
  -1,
  TRUE
),
(
  'Escova Gratuita',
  'Uma escova modelada para qualquer ocasião',
  120,
  'servico_gratis',
  NULL,
  NULL,
  -1,
  TRUE
),
(
  'R$ 30 de Desconto',
  'Abatimento de R$ 30 no valor final dos serviços',
  150,
  'dinheiro',
  NULL,
  30.00,
  -1,
  TRUE
),
(
  'R$ 50 de Desconto',
  'Abatimento de R$ 50 no valor final dos serviços',
  250,
  'dinheiro',
  NULL,
  50.00,
  -1,
  TRUE
),
(
  'Corte + Coloração Grátis',
  'Pacote especial com corte + coloração',
  200,
  'servico_gratis',
  NULL,
  NULL,
  -1,
  TRUE
),
(
  'Manicure + Pedicure Grátis',
  'Pacote completo de manicure e pedicure',
  120,
  'servico_gratis',
  NULL,
  NULL,
  -1,
  TRUE
)
ON CONFLICT (titulo) DO NOTHING;

-- =============================================================================
-- 5. INSERIR ATENDIMENTOS
-- =============================================================================

INSERT INTO atendimentos (cliente_id, funcionario_id, servico_id, data_atendimento, valor_servico, pontos_gerados, descricao, status)
VALUES
(
  (SELECT id FROM clientes WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'marina@bellachain.com')),
  (SELECT id FROM usuarios WHERE email = 'ana@bellachain.com'),
  (SELECT id FROM servicos WHERE nome = 'Hidratação Capilar'),
  '2026-08-10T10:00:00Z',
  80.00,
  15,
  'Hidratação completa',
  'concluido'
),
(
  (SELECT id FROM clientes WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'marina@bellachain.com')),
  (SELECT id FROM usuarios WHERE email = 'ana@bellachain.com'),
  (SELECT id FROM servicos WHERE nome = 'Corte de Cabelo'),
  '2026-08-18T14:30:00Z',
  50.00,
  8,
  'Corte simples',
  'concluido'
),
(
  (SELECT id FROM clientes WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'marina@bellachain.com')),
  (SELECT id FROM usuarios WHERE email = 'ana@bellachain.com'),
  (SELECT id FROM servicos WHERE nome = 'Coloração'),
  '2026-09-02T09:15:00Z',
  120.00,
  10,
  'Coloração loiro dourado',
  'concluido'
),
(
  (SELECT id FROM clientes WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'juliana@bellachain.com')),
  (SELECT id FROM usuarios WHERE email = 'beatriz@bellachain.com'),
  (SELECT id FROM servicos WHERE nome = 'Manicure'),
  '2026-09-15T11:00:00Z',
  35.00,
  5,
  'Manicure com esmalte rosa',
  'concluido'
),
(
  (SELECT id FROM clientes WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'juliana@bellachain.com')),
  (SELECT id FROM usuarios WHERE email = 'ana@bellachain.com'),
  (SELECT id FROM servicos WHERE nome = 'Coloração'),
  '2026-09-10T10:00:00Z',
  120.00,
  15,
  'Coloração e corte',
  'concluido'
),
(
  (SELECT id FROM clientes WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'carla@bellachain.com')),
  (SELECT id FROM usuarios WHERE email = 'ana@bellachain.com'),
  (SELECT id FROM servicos WHERE nome = 'Corte de Cabelo'),
  '2026-09-08T15:45:00Z',
  50.00,
  8,
  'Corte com franja',
  'concluido'
),
(
  (SELECT id FROM clientes WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'carla@bellachain.com')),
  (SELECT id FROM usuarios WHERE email = 'beatriz@bellachain.com'),
  (SELECT id FROM servicos WHERE nome = 'Pedicure'),
  '2026-09-18T13:20:00Z',
  45.00,
  6,
  'Pedicure vermelha',
  'concluido'
),
(
  (SELECT id FROM clientes WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'daniela@bellachain.com')),
  (SELECT id FROM usuarios WHERE email = 'ana@bellachain.com'),
  (SELECT id FROM servicos WHERE nome = 'Hidratação Capilar'),
  '2026-09-21T11:30:00Z',
  80.00,
  10,
  'Hidratação profunda',
  'concluido'
);

-- =============================================================================
-- 6. INSERIR RESGATES DE RECOMPENSAS
-- =============================================================================

INSERT INTO resgates_recompensas (cliente_id, recompensa_id, data_resgate, status, codigo_resgate)
VALUES
(
  (SELECT id FROM clientes WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'marina@bellachain.com')),
  (SELECT id FROM recompensas WHERE titulo = '10% de Desconto'),
  '2026-09-10T16:00:00Z',
  'pendente',
  'BELLA001'
),
(
  (SELECT id FROM clientes WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'juliana@bellachain.com')),
  (SELECT id FROM recompensas WHERE titulo = 'Hidratação Gratuita'),
  '2026-09-12T10:30:00Z',
  'pendente',
  'BELLA002'
),
(
  (SELECT id FROM clientes WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'carla@bellachain.com')),
  (SELECT id FROM recompensas WHERE titulo = '20% de Desconto'),
  '2026-09-16T14:45:00Z',
  'utilizado',
  'BELLA003'
);

-- =============================================================================
-- 7. VERIFICAÇÃO DOS DADOS INSERIDOS
-- =============================================================================

SELECT 'Total de Usuários:' AS info, COUNT(*)::INTEGER AS qtd FROM usuarios
UNION ALL
SELECT 'Total de Clientes:', COUNT(*)::INTEGER FROM clientes
UNION ALL
SELECT 'Total de Serviços:', COUNT(*)::INTEGER FROM servicos
UNION ALL
SELECT 'Total de Recompensas:', COUNT(*)::INTEGER FROM recompensas
UNION ALL
SELECT 'Total de Atendimentos:', COUNT(*)::INTEGER FROM atendimentos
UNION ALL
SELECT 'Total de Resgates:', COUNT(*)::INTEGER FROM resgates_recompensas;

-- =============================================================================
-- FIM DOS DADOS DE TESTE
-- =============================================================================
