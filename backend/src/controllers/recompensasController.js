import db from '../config/db.js';
import { randomBytes } from 'node:crypto';

// Listar todas as recompensas
export const getRecompensas = async (req, res) => {
  try {
    const [recompensas] = await db.query(
      `SELECT 
        id,
        titulo,
        descricao,
        pontos_necessarios,
        tipo,
        valor_desconto,
        servico_gratis_id,
        dinheiro_valor,
        quantidade_disponivel,
        ativa,
        created_at
       FROM recompensas
       WHERE ativa = TRUE
       ORDER BY pontos_necessarios ASC`
    );

    res.json(recompensas);
  } catch (error) {
    console.error('Erro ao listar recompensas:', error);
    res.status(500).json({ 
      message: 'Erro ao listar recompensas',
      error: error.message 
    });
  }
};

// Obter recompensa por ID
export const getRecompensaById = async (req, res) => {
  try {
    const { id } = req.params;

    const [recompensas] = await db.query(
      `SELECT 
        id,
        titulo,
        descricao,
        pontos_necessarios,
        tipo,
        valor_desconto,
        servico_gratis_id,
        dinheiro_valor,
        quantidade_disponivel,
        ativa,
        created_at
       FROM recompensas
       WHERE id = ?`,
      [id]
    );

    if (recompensas.length === 0) {
      return res.status(404).json({ 
        message: 'Recompensa não encontrada' 
      });
    }

    res.json(recompensas[0]);
  } catch (error) {
    console.error('Erro ao buscar recompensa:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar recompensa',
      error: error.message 
    });
  }
};

// Criar nova recompensa
export const createRecompensa = async (req, res) => {
  try {
    const { titulo, descricao, pontos_necessarios, tipo, valor_desconto, servico_gratis_id, dinheiro_valor } = req.body;

    // Validações
    if (!titulo || !pontos_necessarios || !tipo) {
      return res.status(400).json({ 
        message: 'titulo, pontos_necessarios e tipo são obrigatórios' 
      });
    }

    const [resultado] = await db.query(
      `INSERT INTO recompensas (titulo, descricao, pontos_necessarios, tipo, valor_desconto, servico_gratis_id, dinheiro_valor, ativa)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [titulo, descricao, pontos_necessarios, tipo, valor_desconto || null, servico_gratis_id || null, dinheiro_valor || null]
    );

    res.status(201).json({
      id: resultado.insertId,
      titulo,
      descricao,
      pontos_necessarios,
      tipo,
      valor_desconto,
      servico_gratis_id,
      dinheiro_valor,
      message: 'Recompensa criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar recompensa:', error);
    res.status(500).json({ 
      message: 'Erro ao criar recompensa',
      error: error.message 
    });
  }
};

// Atualizar recompensa
export const updateRecompensa = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, pontos_necessarios, tipo, valor_desconto, servico_gratis_id, dinheiro_valor, ativa } = req.body;

    // Verificar se recompensa existe
    const [recompensas] = await db.query(
      'SELECT id FROM recompensas WHERE id = ?',
      [id]
    );

    if (recompensas.length === 0) {
      return res.status(404).json({ 
        message: 'Recompensa não encontrada' 
      });
    }

    // Montar query dinâmica
    const updates = [];
    const values = [];

    if (titulo !== undefined) { updates.push('titulo = ?'); values.push(titulo); }
    if (descricao !== undefined) { updates.push('descricao = ?'); values.push(descricao); }
    if (pontos_necessarios !== undefined) { updates.push('pontos_necessarios = ?'); values.push(pontos_necessarios); }
    if (tipo !== undefined) { updates.push('tipo = ?'); values.push(tipo); }
    if (valor_desconto !== undefined) { updates.push('valor_desconto = ?'); values.push(valor_desconto || null); }
    if (servico_gratis_id !== undefined) { updates.push('servico_gratis_id = ?'); values.push(servico_gratis_id || null); }
    if (dinheiro_valor !== undefined) { updates.push('dinheiro_valor = ?'); values.push(dinheiro_valor || null); }
    if (ativa !== undefined) { updates.push('ativa = ?'); values.push(ativa); }

    if (updates.length === 0) {
      return res.status(400).json({ 
        message: 'Nenhum campo para atualizar' 
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE recompensas SET ${updates.join(', ')} WHERE id = ?`;
    await db.query(query, values);

    res.json({ 
      message: 'Recompensa atualizada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao atualizar recompensa:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar recompensa',
      error: error.message 
    });
  }
};

// Deletar recompensa
export const deleteRecompensa = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se recompensa existe
    const [recompensas] = await db.query(
      'SELECT id FROM recompensas WHERE id = ?',
      [id]
    );

    if (recompensas.length === 0) {
      return res.status(404).json({ 
        message: 'Recompensa não encontrada' 
      });
    }

    // Desativar em vez de deletar
    await db.query(
      'UPDATE recompensas SET ativa = FALSE WHERE id = ?',
      [id]
    );

    res.json({ 
      message: 'Recompensa deletada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar recompensa:', error);
    res.status(500).json({ 
      message: 'Erro ao deletar recompensa',
      error: error.message 
    });
  }
};

// Resgatar recompensa
export const resgatarRecompensa = async (req, res) => {
  try {
    const { cliente_id, recompensa_id } = req.body;

    if ((!cliente_id && req.usuario.tipo === 'admin') || !recompensa_id) {
      return res.status(400).json({ 
        message: 'recompensa_id e um cliente válido são obrigatórios'
      });
    }

    const codigo_resgate = `BELLA${randomBytes(6).toString('hex').toUpperCase()}`;
    const resultado = await db.transaction(async (tx) => {
      const [clientes] = req.usuario.tipo === 'cliente'
        ? await tx.query(
          'SELECT id, saldo_pontos FROM clientes WHERE usuario_id = ? FOR UPDATE',
          [req.usuario.id]
        )
        : await tx.query(
          'SELECT id, saldo_pontos FROM clientes WHERE id = ? FOR UPDATE',
          [cliente_id]
        );

      if (clientes.length === 0) return { error: 'Cliente não encontrado', status: 404 };
      const cliente = clientes[0];

      const [recompensas] = await tx.query(
        'SELECT pontos_necessarios, quantidade_disponivel FROM recompensas WHERE id = ? AND ativa = TRUE FOR UPDATE',
        [recompensa_id]
      );
      if (recompensas.length === 0) return { error: 'Recompensa não encontrada ou inativa', status: 404 };

      const recompensa = recompensas[0];
      if (cliente.saldo_pontos < recompensa.pontos_necessarios) {
        return {
          error: 'Saldo de pontos insuficiente',
          status: 400,
          saldo_atual: cliente.saldo_pontos,
          pontos_necessarios: recompensa.pontos_necessarios,
        };
      }
      if (recompensa.quantidade_disponivel !== -1 && recompensa.quantidade_disponivel <= 0) {
        return { error: 'Recompensa sem disponibilidade', status: 400 };
      }

      if (recompensa.quantidade_disponivel !== -1) {
        await tx.query(
          'UPDATE recompensas SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = ? AND quantidade_disponivel > 0',
          [recompensa_id]
        );
      }

      const [resgate] = await tx.query(
        `INSERT INTO resgates_recompensas (cliente_id, recompensa_id, codigo_resgate, status)
         VALUES (?, ?, ?, 'pendente')`,
        [cliente.id, recompensa_id, codigo_resgate]
      );

      return { id: resgate.insertId, clienteId: cliente.id };
    });

    if (resultado.error) {
      return res.status(resultado.status).json({
        message: resultado.error,
        ...(resultado.saldo_atual !== undefined ? {
          saldo_atual: resultado.saldo_atual,
          pontos_necessarios: resultado.pontos_necessarios,
        } : {}),
      });
    }

    res.status(201).json({
      id: resultado.id,
      cliente_id: resultado.clienteId,
      recompensa_id,
      codigo_resgate,
      status: 'pendente',
      data_resgate: new Date(),
      message: 'Recompensa resgatada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao resgatar recompensa:', error);
    res.status(500).json({ 
      message: 'Erro ao resgatar recompensa',
      error: error.message 
    });
  }
};

// Listar resgates de um cliente
export const getResgatesPorCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;

    const [resgates] = await db.query(
      `SELECT 
        rr.id,
        rr.cliente_id,
        rr.recompensa_id,
        r.titulo,
        r.tipo,
        rr.data_resgate,
        rr.data_utilizacao,
        rr.status,
        rr.codigo_resgate
       FROM resgates_recompensas rr
       JOIN clientes c ON rr.cliente_id = c.id
       JOIN recompensas r ON rr.recompensa_id = r.id
       WHERE rr.cliente_id = ?${req.usuario.tipo === 'cliente' ? ' AND c.usuario_id = ?' : ''}
       ORDER BY rr.data_resgate DESC`,
      req.usuario.tipo === 'cliente' ? [cliente_id, req.usuario.id] : [cliente_id]
    );

    res.json(resgates);
  } catch (error) {
    console.error('Erro ao listar resgates do cliente:', error);
    res.status(500).json({ 
      message: 'Erro ao listar resgates do cliente',
      error: error.message 
    });
  }
};

// Marcar resgate como utilizado
export const utilizarResgate = async (req, res) => {
  try {
    const { codigo_resgate } = req.body;

    if (!codigo_resgate) {
      return res.status(400).json({ 
        message: 'codigo_resgate é obrigatório' 
      });
    }

    const [atualizados] = await db.query(
      `UPDATE resgates_recompensas
       SET status = 'utilizado', data_utilizacao = NOW()
       WHERE codigo_resgate = ? AND status = 'pendente'
       RETURNING id`,
      [codigo_resgate]
    );
    if (atualizados.length === 0) {
      const [resgates] = await db.query(
        'SELECT status FROM resgates_recompensas WHERE codigo_resgate = ?',
        [codigo_resgate]
      );
      if (resgates.length === 0) {
        return res.status(404).json({ message: 'Código de resgate não encontrado' });
      }
      return res.status(409).json({
        message: resgates[0].status === 'cancelado'
          ? 'Este resgate foi cancelado'
          : 'Este resgate já foi utilizado',
      });
    }

    res.json({ 
      message: 'Resgate utilizado com sucesso',
      codigo_resgate
    });
  } catch (error) {
    console.error('Erro ao utilizar resgate:', error);
    res.status(500).json({ 
      message: 'Erro ao utilizar resgate',
      error: error.message 
    });
  }
};
