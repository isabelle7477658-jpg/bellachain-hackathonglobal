import db from '../config/db.js';

// Listar todos os atendimentos
export const getAtendimentos = async (req, res) => {
  try {
    const [atendimentos] = await db.query(
      `SELECT 
        a.id,
        a.cliente_id,
        a.funcionario_id,
        a.servico_id,
        c_user.nome as cliente_nome,
        f_user.nome as funcionario_nome,
        s.nome as servico_nome,
        a.data_atendimento,
        a.valor_servico,
        a.pontos_gerados,
        a.descricao,
        a.status,
        a.created_at
       FROM atendimentos a
       JOIN clientes c ON a.cliente_id = c.id
       JOIN usuarios c_user ON c.usuario_id = c_user.id
       JOIN usuarios f_user ON a.funcionario_id = f_user.id
       JOIN servicos s ON a.servico_id = s.id
       ORDER BY a.data_atendimento DESC`
    );

    res.json(atendimentos);
  } catch (error) {
    console.error('Erro ao listar atendimentos:', error);
    res.status(500).json({ 
      message: 'Erro ao listar atendimentos',
      error: error.message 
    });
  }
};

// Obter atendimento por ID
export const getAtendimentoById = async (req, res) => {
  try {
    const { id } = req.params;

    const [atendimentos] = await db.query(
      `SELECT 
        a.id,
        a.cliente_id,
        a.funcionario_id,
        a.servico_id,
        c_user.nome as cliente_nome,
        f_user.nome as funcionario_nome,
        s.nome as servico_nome,
        a.data_atendimento,
        a.valor_servico,
        a.pontos_gerados,
        a.descricao,
        a.status,
        a.created_at
       FROM atendimentos a
       JOIN clientes c ON a.cliente_id = c.id
       JOIN usuarios c_user ON c.usuario_id = c_user.id
       JOIN usuarios f_user ON a.funcionario_id = f_user.id
       JOIN servicos s ON a.servico_id = s.id
       WHERE a.id = ?`,
      [id]
    );

    if (atendimentos.length === 0) {
      return res.status(404).json({ 
        message: 'Atendimento não encontrado' 
      });
    }

    res.json(atendimentos[0]);
  } catch (error) {
    console.error('Erro ao buscar atendimento:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar atendimento',
      error: error.message 
    });
  }
};

// Listar atendimentos de um cliente
export const getAtendimentosPorCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;

    const [atendimentos] = await db.query(
      `SELECT 
        a.id,
        a.cliente_id,
        a.funcionario_id,
        a.servico_id,
        f_user.nome as funcionario_nome,
        s.nome as servico_nome,
        a.data_atendimento,
        a.valor_servico,
        a.pontos_gerados,
        a.descricao,
        a.status
       FROM atendimentos a
       JOIN usuarios f_user ON a.funcionario_id = f_user.id
       JOIN servicos s ON a.servico_id = s.id
       WHERE a.cliente_id = ?
       ORDER BY a.data_atendimento DESC`,
      [cliente_id]
    );

    res.json(atendimentos);
  } catch (error) {
    console.error('Erro ao listar atendimentos do cliente:', error);
    res.status(500).json({ 
      message: 'Erro ao listar atendimentos do cliente',
      error: error.message 
    });
  }
};

// Criar novo atendimento
export const createAtendimento = async (req, res) => {
  try {
    const { cliente_id, funcionario_id, servico_id, valor_servico, descricao } = req.body;

    // Validações
    if (!cliente_id || !funcionario_id || !servico_id) {
      return res.status(400).json({ 
        message: 'cliente_id, funcionario_id e servico_id são obrigatórios' 
      });
    }

    // Verificar se cliente existe
    const [clientes] = await db.query(
      'SELECT id FROM clientes WHERE id = ?',
      [cliente_id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({ 
        message: 'Cliente não encontrado' 
      });
    }

    // Verificar se funcionário existe
    const [funcionarios] = await db.query(
      'SELECT id FROM usuarios WHERE id = ? AND tipo = ?',
      [funcionario_id, 'funcionario']
    );

    if (funcionarios.length === 0) {
      return res.status(404).json({ 
        message: 'Funcionário não encontrado' 
      });
    }

    // Buscar serviço
    const [servicos] = await db.query(
      'SELECT valor, pontos_por_servico FROM servicos WHERE id = ?',
      [servico_id]
    );

    if (servicos.length === 0) {
      return res.status(404).json({ 
        message: 'Serviço não encontrado' 
      });
    }

    const servico = servicos[0];
    const pontos_gerados = servico.pontos_por_servico;
    const valor_final = valor_servico || servico.valor;

    // Inserir atendimento (trigger irá atualizar saldo de pontos)
    const [resultado] = await db.query(
      `INSERT INTO atendimentos (cliente_id, funcionario_id, servico_id, data_atendimento, valor_servico, pontos_gerados, descricao, status)
       VALUES (?, ?, ?, NOW(), ?, ?, ?, 'concluido')`,
      [cliente_id, funcionario_id, servico_id, valor_final, pontos_gerados, descricao]
    );

    // Atualizar total_gasto do cliente
    await db.query(
      `UPDATE clientes SET total_gasto = total_gasto + ? WHERE id = ?`,
      [valor_final, cliente_id]
    );

    res.status(201).json({
      id: resultado.insertId,
      cliente_id,
      funcionario_id,
      servico_id,
      valor_servico: valor_final,
      pontos_gerados,
      descricao,
      status: 'concluido',
      message: 'Atendimento registrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar atendimento:', error);
    res.status(500).json({ 
      message: 'Erro ao criar atendimento',
      error: error.message 
    });
  }
};

// Atualizar atendimento
export const updateAtendimento = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, descricao } = req.body;

    // Verificar se atendimento existe
    const [atendimentos] = await db.query(
      'SELECT id, status FROM atendimentos WHERE id = ?',
      [id]
    );

    if (atendimentos.length === 0) {
      return res.status(404).json({ 
        message: 'Atendimento não encontrado' 
      });
    }

    // Atualizar
    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (descricao !== undefined) {
      updates.push('descricao = ?');
      values.push(descricao);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        message: 'Nenhum campo para atualizar' 
      });
    }

    values.push(id);
    const query = `UPDATE atendimentos SET ${updates.join(', ')} WHERE id = ?`;
    await db.query(query, values);

    res.json({ 
      message: 'Atendimento atualizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao atualizar atendimento:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar atendimento',
      error: error.message 
    });
  }
};

// Deletar atendimento (apenas se for cancelado)
export const deleteAtendimento = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar atendimento
    const [atendimentos] = await db.query(
      'SELECT id, cliente_id, pontos_gerados, valor_servico FROM atendimentos WHERE id = ?',
      [id]
    );

    if (atendimentos.length === 0) {
      return res.status(404).json({ 
        message: 'Atendimento não encontrado' 
      });
    }

    const atendimento = atendimentos[0];

    // Remover pontos do cliente
    await db.query(
      `UPDATE clientes SET saldo_pontos = saldo_pontos - ?, total_gasto = total_gasto - ? WHERE id = ?`,
      [atendimento.pontos_gerados, atendimento.valor_servico, atendimento.cliente_id]
    );

    // Deletar atendimento
    await db.query('DELETE FROM atendimentos WHERE id = ?', [id]);

    res.json({ 
      message: 'Atendimento deletado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar atendimento:', error);
    res.status(500).json({ 
      message: 'Erro ao deletar atendimento',
      error: error.message 
    });
  }
};
