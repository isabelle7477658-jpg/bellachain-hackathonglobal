-- =============================================================================
-- BELLACHAIN - DATABASE SCHEMA
-- Sistema de Gerenciamento de Pontos e Recompensas para Salão de Beleza
-- =============================================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS bellachain;
USE bellachain;

-- =============================================================================
-- 1. TABELA: USUARIOS
-- =============================================================================
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14) UNIQUE,
  tipo ENUM('cliente', 'funcionario', 'admin') NOT NULL DEFAULT 'cliente',
  status ENUM('ativo', 'inativo') DEFAULT 'ativo',
  wallet_address VARCHAR(255),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_tipo (tipo),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. TABELA: CLIENTES
-- =============================================================================
CREATE TABLE clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL UNIQUE,
  saldo_pontos INT DEFAULT 0,
  categoria ENUM('Bronze', 'Prata', 'Ouro', 'Platina') DEFAULT 'Bronze',
  total_gasto DECIMAL(10, 2) DEFAULT 0,
  total_pontos_ganhos INT DEFAULT 0,
  total_pontos_resgatados INT DEFAULT 0,
  ultima_visita TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_categoria (categoria),
  INDEX idx_saldo_pontos (saldo_pontos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. TABELA: SERVICOS
-- =============================================================================
CREATE TABLE servicos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10, 2) NOT NULL,
  pontos_por_servico INT NOT NULL,
  categoria VARCHAR(50),
  ativo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_ativo (ativo),
  INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. TABELA: ATENDIMENTOS
-- =============================================================================
CREATE TABLE atendimentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  funcionario_id INT NOT NULL,
  servico_id INT NOT NULL,
  data_atendimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valor_servico DECIMAL(10, 2) NOT NULL,
  pontos_gerados INT NOT NULL,
  descricao TEXT,
  status ENUM('concluido', 'cancelado', 'em_processamento') DEFAULT 'concluido',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (funcionario_id) REFERENCES usuarios(id),
  FOREIGN KEY (servico_id) REFERENCES servicos(id),
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_data_atendimento (data_atendimento),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. TABELA: RECOMPENSAS
-- =============================================================================
CREATE TABLE recompensas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT,
  pontos_necessarios INT NOT NULL,
  tipo ENUM('desconto', 'servico_gratis', 'dinheiro') DEFAULT 'desconto',
  valor_desconto DECIMAL(10, 2),
  servico_gratis_id INT,
  dinheiro_valor DECIMAL(10, 2),
  quantidade_disponivel INT DEFAULT -1,
  ativa TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (servico_gratis_id) REFERENCES servicos(id),
  INDEX idx_ativa (ativa),
  INDEX idx_pontos_necessarios (pontos_necessarios)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. TABELA: RESGATES_RECOMPENSAS
-- =============================================================================
CREATE TABLE resgates_recompensas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  recompensa_id INT NOT NULL,
  data_resgate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_utilizacao TIMESTAMP NULL,
  status ENUM('pendente', 'utilizado', 'cancelado') DEFAULT 'pendente',
  codigo_resgate VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (recompensa_id) REFERENCES recompensas(id),
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_status (status),
  INDEX idx_codigo_resgate (codigo_resgate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 7. TABELA: MOVIMENTACOES_PONTOS
-- =============================================================================
CREATE TABLE movimentacoes_pontos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  tipo ENUM('entrada', 'saida') NOT NULL,
  quantidade INT NOT NULL,
  motivo VARCHAR(100),
  descricao TEXT,
  atendimento_id INT,
  resgate_id INT,
  data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id),
  FOREIGN KEY (resgate_id) REFERENCES resgates_recompensas(id),
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_tipo (tipo),
  INDEX idx_data_movimentacao (data_movimentacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TRIGGERS - Lógica de Negócio Automática
-- =============================================================================

-- Trigger: Atualizar saldo de pontos do cliente ao registrar atendimento
DELIMITER $$
CREATE TRIGGER tg_adicionar_pontos_atendimento
AFTER INSERT ON atendimentos
FOR EACH ROW
BEGIN
  UPDATE clientes 
  SET saldo_pontos = saldo_pontos + NEW.pontos_gerados,
      total_pontos_ganhos = total_pontos_ganhos + NEW.pontos_gerados,
      ultima_visita = NEW.data_atendimento
  WHERE id = NEW.cliente_id;
  
  INSERT INTO movimentacoes_pontos 
  (cliente_id, tipo, quantidade, motivo, descricao, atendimento_id) 
  VALUES 
  (NEW.cliente_id, 'entrada', NEW.pontos_gerados, 'atendimento', 
   CONCAT('Serviço: ', NEW.descricao), NEW.id);
END$$
DELIMITER ;

-- Trigger: Remover pontos ao resgatar recompensa
DELIMITER $$
CREATE TRIGGER tg_remover_pontos_resgate
AFTER INSERT ON resgates_recompensas
FOR EACH ROW
BEGIN
  DECLARE pontos_necesarios INT;
  
  SELECT pontos_necessarios INTO pontos_necesarios 
  FROM recompensas WHERE id = NEW.recompensa_id;
  
  UPDATE clientes 
  SET saldo_pontos = saldo_pontos - pontos_necesarios,
      total_pontos_resgatados = total_pontos_resgatados + pontos_necesarios
  WHERE id = NEW.cliente_id;
  
  INSERT INTO movimentacoes_pontos 
  (cliente_id, tipo, quantidade, motivo, descricao, resgate_id) 
  VALUES 
  (NEW.cliente_id, 'saida', pontos_necesarios, 'resgate', 
   CONCAT('Resgate: ', NEW.codigo_resgate), NEW.id);
END$$
DELIMITER ;

-- Trigger: Atualizar categoria do cliente baseado em total gasto
DELIMITER $$
CREATE TRIGGER tg_atualizar_categoria_cliente
AFTER UPDATE ON clientes
FOR EACH ROW
BEGIN
  IF NEW.total_gasto >= 1000 THEN
    UPDATE clientes SET categoria = 'Platina' WHERE id = NEW.id;
  ELSEIF NEW.total_gasto >= 500 THEN
    UPDATE clientes SET categoria = 'Ouro' WHERE id = NEW.id;
  ELSEIF NEW.total_gasto >= 200 THEN
    UPDATE clientes SET categoria = 'Prata' WHERE id = NEW.id;
  ELSE
    UPDATE clientes SET categoria = 'Bronze' WHERE id = NEW.id;
  END IF;
END$$
DELIMITER ;

-- =============================================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =============================================================================

CREATE INDEX idx_atendimentos_cliente_data 
ON atendimentos(cliente_id, data_atendimento DESC);

CREATE INDEX idx_movimentacoes_cliente_data 
ON movimentacoes_pontos(cliente_id, data_movimentacao DESC);

CREATE INDEX idx_resgates_cliente_status 
ON resgates_recompensas(cliente_id, status);

-- =============================================================================
-- FIM DO SCHEMA
-- =============================================================================
