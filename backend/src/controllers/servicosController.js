import db from '../config/db.js';

// Listar todos os serviços
export const getServicos = async (req, res) => {
  try {
    const [servicos] = await db.query(
      `SELECT id, nome, descricao, valor, pontos_por_servico, categoria, ativo,
              prestador_usuario_id, cancelamento_prazo_minutos, cancelamento_tardio_acao,
              cancelamento_tardio_taxa_bps, falta_acao, falta_taxa_bps, regras_versao, created_at
       FROM servicos
       WHERE ativo = TRUE
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
      `SELECT id, nome, descricao, valor, pontos_por_servico, categoria, ativo,
              prestador_usuario_id, cancelamento_prazo_minutos, cancelamento_tardio_acao,
              cancelamento_tardio_taxa_bps, falta_acao, falta_taxa_bps, regras_versao, created_at
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
    const {
      nome, descricao, valor, pontos_por_servico = 0, categoria,
      cancelamento_prazo_minutos = 1440,
      cancelamento_tardio_acao = 'devolver',
      cancelamento_tardio_taxa_bps = 0,
      falta_acao = 'devolver',
      falta_taxa_bps = 0,
    } = req.body;

    // Validações
    const noticeMinutes = Number(cancelamento_prazo_minutos);
    const lateFeeBps = Number(cancelamento_tardio_taxa_bps);
    const noShowFeeBps = Number(falta_taxa_bps);
    if (!nome || !Number.isFinite(Number(valor)) || Number(valor) <= 0) {
      return res.status(400).json({ 
        message: 'Nome e valor do serviço são obrigatórios.'
      });
    }
    if (!Number.isInteger(noticeMinutes) || noticeMinutes < 0
      || !['devolver', 'cobrar_taxa'].includes(cancelamento_tardio_acao)
      || !['devolver', 'cobrar_taxa'].includes(falta_acao)
      || !Number.isInteger(lateFeeBps) || lateFeeBps < 0 || lateFeeBps > 10000
      || !Number.isInteger(noShowFeeBps) || noShowFeeBps < 0 || noShowFeeBps > 10000) {
      return res.status(400).json({ message: 'Política de cancelamento inválida.' });
    }

    const [resultado] = await db.query(
      `INSERT INTO servicos
       (nome, descricao, valor, pontos_por_servico, categoria, ativo, prestador_usuario_id,
        cancelamento_prazo_minutos, cancelamento_tardio_acao, cancelamento_tardio_taxa_bps,
        falta_acao, falta_taxa_bps)
       VALUES (?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?, ?, ?)`,
      [nome, descricao, valor, pontos_por_servico, categoria || 'Geral', req.usuario.id,
        noticeMinutes, cancelamento_tardio_acao, lateFeeBps, falta_acao, noShowFeeBps]
    );

    res.status(201).json({
      id: resultado.insertId,
      nome,
      descricao,
      valor,
      pontos_por_servico,
      categoria: categoria || 'Geral',
      ativo: true,
      prestador_usuario_id: req.usuario.id,
      cancelamento_prazo_minutos: noticeMinutes,
      cancelamento_tardio_acao,
      cancelamento_tardio_taxa_bps: lateFeeBps,
      falta_acao,
      falta_taxa_bps: noShowFeeBps,
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
    const {
      nome, descricao, valor, pontos_por_servico, categoria, ativo,
      cancelamento_prazo_minutos, cancelamento_tardio_acao,
      cancelamento_tardio_taxa_bps, falta_acao, falta_taxa_bps,
    } = req.body;

    // Verificar se serviço existe
    const [servicos] = await db.query(
      'SELECT id, prestador_usuario_id FROM servicos WHERE id = ?',
      [id]
    );

    if (servicos.length === 0) {
      return res.status(404).json({ 
        message: 'Serviço não encontrado' 
      });
    }
    if (req.usuario.tipo !== 'admin' && Number(servicos[0].prestador_usuario_id) !== Number(req.usuario.id)) {
      return res.status(403).json({ message: 'Você só pode alterar regras dos seus próprios serviços.' });
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
    if (cancelamento_prazo_minutos !== undefined) {
      const minutes = Number(cancelamento_prazo_minutos);
      if (!Number.isInteger(minutes) || minutes < 0) return res.status(400).json({ message: 'Prazo de cancelamento inválido.' });
      updates.push('cancelamento_prazo_minutos = ?'); values.push(minutes);
    }
    if (cancelamento_tardio_acao !== undefined) {
      if (!['devolver', 'cobrar_taxa'].includes(cancelamento_tardio_acao)) return res.status(400).json({ message: 'Ação de cancelamento tardio inválida.' });
      updates.push('cancelamento_tardio_acao = ?'); values.push(cancelamento_tardio_acao);
    }
    if (cancelamento_tardio_taxa_bps !== undefined) {
      const fee = Number(cancelamento_tardio_taxa_bps);
      if (!Number.isInteger(fee) || fee < 0 || fee > 10000) return res.status(400).json({ message: 'Taxa de cancelamento inválida.' });
      updates.push('cancelamento_tardio_taxa_bps = ?'); values.push(fee);
    }
    if (falta_acao !== undefined) {
      if (!['devolver', 'cobrar_taxa'].includes(falta_acao)) return res.status(400).json({ message: 'Ação de falta inválida.' });
      updates.push('falta_acao = ?'); values.push(falta_acao);
    }
    if (falta_taxa_bps !== undefined) {
      const fee = Number(falta_taxa_bps);
      if (!Number.isInteger(fee) || fee < 0 || fee > 10000) return res.status(400).json({ message: 'Taxa por falta inválida.' });
      updates.push('falta_taxa_bps = ?'); values.push(fee);
    }
    if ([cancelamento_prazo_minutos, cancelamento_tardio_acao, cancelamento_tardio_taxa_bps, falta_acao, falta_taxa_bps]
      .some((value) => value !== undefined)) {
      updates.push('regras_versao = regras_versao + 1');
    }

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
      'UPDATE servicos SET ativo = FALSE WHERE id = ?',
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
