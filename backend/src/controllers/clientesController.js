import db from '../config/db.js';

// Listar todos os clientes
export const getClientes = async (req, res) => {
  try {
    const [clientes] = await db.query(
      `SELECT 
        c.id,
        c.usuario_id,
        u.nome,
        u.email,
        u.telefone,
        c.saldo_pontos,
        c.categoria,
        c.total_gasto,
        c.total_pontos_ganhos,
        c.total_pontos_resgatados,
        c.ultima_visita,
        c.created_at
       FROM clientes c
       JOIN usuarios u ON c.usuario_id = u.id
       ORDER BY c.created_at DESC`
    );

    res.json(clientes);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ 
      message: 'Erro ao listar clientes',
      error: error.message 
    });
  }
};

// Obter cliente por ID
export const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;

    const [clientes] = await db.query(
      `SELECT 
        c.id,
        c.usuario_id,
        u.nome,
        u.email,
        u.telefone,
        u.cpf,
        c.saldo_pontos,
        c.categoria,
        c.total_gasto,
        c.total_pontos_ganhos,
        c.total_pontos_resgatados,
        c.ultima_visita,
        c.created_at
       FROM clientes c
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({ 
        message: 'Cliente não encontrado' 
      });
    }

    res.json(clientes[0]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar cliente',
      error: error.message 
    });
  }
};

// Criar novo cliente
export const createCliente = async (req, res) => {
  try {
    const { usuario_id, categoria, saldo_pontos } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ 
        message: 'usuario_id é obrigatório' 
      });
    }

    // Verificar se usuário existe
    const [usuarios] = await db.query(
      'SELECT id FROM usuarios WHERE id = ? AND tipo = ?',
      [usuario_id, 'cliente']
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ 
        message: 'Usuário cliente não encontrado' 
      });
    }

    // Inserir cliente
    const [resultado] = await db.query(
      `INSERT INTO clientes (usuario_id, categoria, saldo_pontos, total_gasto, total_pontos_ganhos, total_pontos_resgatados)
       VALUES (?, ?, ?, 0, 0, 0)`,
      [usuario_id, categoria || 'Bronze', saldo_pontos || 0]
    );

    res.status(201).json({
      id: resultado.insertId,
      usuario_id,
      categoria: categoria || 'Bronze',
      saldo_pontos: saldo_pontos || 0,
      message: 'Cliente criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ 
      message: 'Erro ao criar cliente',
      error: error.message 
    });
  }
};

// Atualizar cliente
export const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { saldo_pontos, categoria, total_gasto } = req.body;

    // Verificar se cliente existe
    const [clientes] = await db.query(
      'SELECT id FROM clientes WHERE id = ?',
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({ 
        message: 'Cliente não encontrado' 
      });
    }

    // Montar query dinâmica
    let updates = [];
    let values = [];

    if (saldo_pontos !== undefined) {
      updates.push('saldo_pontos = ?');
      values.push(saldo_pontos);
    }
    if (categoria !== undefined) {
      updates.push('categoria = ?');
      values.push(categoria);
    }
    if (total_gasto !== undefined) {
      updates.push('total_gasto = ?');
      values.push(total_gasto);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        message: 'Nenhum campo para atualizar' 
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE clientes SET ${updates.join(', ')} WHERE id = ?`;
    await db.query(query, values);

    // Retornar cliente atualizado
    const [clientesAtualizados] = await db.query(
      `SELECT 
        c.id,
        c.usuario_id,
        u.nome,
        u.email,
        c.saldo_pontos,
        c.categoria,
        c.total_gasto
       FROM clientes c
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    res.json({
      message: 'Cliente atualizado com sucesso',
      cliente: clientesAtualizados[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar cliente',
      error: error.message 
    });
  }
};

// Deletar cliente
export const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se cliente existe
    const [clientes] = await db.query(
      'SELECT usuario_id FROM clientes WHERE id = ?',
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({ 
        message: 'Cliente não encontrado' 
      });
    }

    const usuario_id = clientes[0].usuario_id;

    // Deletar cliente (irá deletar usuário em cascata por FK)
    await db.query('DELETE FROM clientes WHERE id = ?', [id]);

    // Deletar usuário
    await db.query('DELETE FROM usuarios WHERE id = ?', [usuario_id]);

    res.json({ 
      message: 'Cliente deletado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ 
      message: 'Erro ao deletar cliente',
      error: error.message 
    });
  }
};

// Obter dados do cliente autenticado
export const getMeuPerfil = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const [clientes] = await db.query(
      `SELECT 
        c.id,
        c.usuario_id,
        u.nome,
        u.email,
        u.telefone,
        c.saldo_pontos,
        c.categoria,
        c.total_gasto,
        c.total_pontos_ganhos,
        c.total_pontos_resgatados,
        c.ultima_visita
       FROM clientes c
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.usuario_id = ?`,
      [usuario_id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({ 
        message: 'Perfil de cliente não encontrado' 
      });
    }

    res.json(clientes[0]);
  } catch (error) {
    console.error('Erro ao buscar perfil do cliente:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar perfil do cliente',
      error: error.message 
    });
  }
};
