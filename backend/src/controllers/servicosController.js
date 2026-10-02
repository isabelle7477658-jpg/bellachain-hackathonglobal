import db from '../config/db.js';

// Listar todos os serviços
export const getServicos = async (req, res) => {
  try {
    const [servicos] = await db.query(
      `SELECT id, nome, descricao, valor, pontos_por_servico, categoria, ativo, created_at
       FROM servicos
       WHERE ativo = 1
       ORDER BY categoria, nome`
    );

    res.json(servicos);
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ 
      message: 'Erro ao listar serviços',
      error: error.message 
    });
  }
};

// Obter serviço por ID
export const getServicoById = async (req, res) => {
  try {
    const { id } = req.params;

    const [servicos] = await db.query(
      `SELECT id, nome, descricao, valor, pontos_por_servico, categoria, ativo, created_at
       FROM servicos
       WHERE id = ?`,
      [id]
    );

    if (servicos.length === 0) {
      return res.status(404).json({ 
        message: 'Serviço não encontrado' 
      });
    }

    res.json(servicos[0]);
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar serviço',
      error: error.message 
    });
  }
};

// Criar novo serviço
export const createServico = async (req, res) => {
  try {
    const { nome, descricao, valor, pontos_por_servico, categoria } = req.body;

    // Validações
    if (!nome || !valor || !pontos_por_servico) {
      return res.status(400).json({ 
        message: 'nome, valor e pontos_por_servico são obrigatórios' 
      });
    }

    const [resultado] = await db.query(
      `INSERT INTO servicos (nome, descricao, valor, pontos_por_servico, categoria, ativo)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [nome, descricao, valor, pontos_por_servico, categoria || 'Geral']
    );

    res.status(201).json({
      id: resultado.insertId,
      nome,
      descricao,
      valor,
      pontos_por_servico,
      categoria: categoria || 'Geral',
      ativo: 1,
      message: 'Serviço criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ 
      message: 'Erro ao criar serviço',
      error: error.message 
    });
  }
};

// Atualizar serviço
export const updateServico = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, valor, pontos_por_servico, categoria, ativo } = req.body;

    // Verificar se serviço existe
    const [servicos] = await db.query(
      'SELECT id FROM servicos WHERE id = ?',
      [id]
    );

    if (servicos.length === 0) {
      return res.status(404).json({ 
        message: 'Serviço não encontrado' 
      });
    }

    // Montar query dinâmica
    const updates = [];
    const values = [];

    if (nome !== undefined) { updates.push('nome = ?'); values.push(nome); }
    if (descricao !== undefined) { updates.push('descricao = ?'); values.push(descricao); }
    if (valor !== undefined) { updates.push('valor = ?'); values.push(valor); }
    if (pontos_por_servico !== undefined) { updates.push('pontos_por_servico = ?'); values.push(pontos_por_servico); }
    if (categoria !== undefined) { updates.push('categoria = ?'); values.push(categoria); }
    if (ativo !== undefined) { updates.push('ativo = ?'); values.push(ativo); }

    if (updates.length === 0) {
      return res.status(400).json({ 
        message: 'Nenhum campo para atualizar' 
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE servicos SET ${updates.join(', ')} WHERE id = ?`;
    await db.query(query, values);

    res.json({ 
      message: 'Serviço atualizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar serviço',
      error: error.message 
    });
  }
};

// Deletar serviço
export const deleteServico = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se serviço existe
    const [servicos] = await db.query(
      'SELECT id FROM servicos WHERE id = ?',
      [id]
    );

    if (servicos.length === 0) {
      return res.status(404).json({ 
        message: 'Serviço não encontrado' 
      });
    }

    // Deletar ou desativar?
    // Aqui vamos apenas desativar para não quebrar histórico
    await db.query(
      'UPDATE servicos SET ativo = 0 WHERE id = ?',
      [id]
    );

    res.json({ 
      message: 'Serviço deletado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ 
      message: 'Erro ao deletar serviço',
      error: error.message 
    });
  }
};
