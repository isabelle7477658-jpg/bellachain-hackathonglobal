import db from '../config/db.js';
import { calcularPontosServico } from '../services/rewardsService.js';

const cancelarAtendimento = async (tx, id) => {
  const [atendimentos] = await tx.query(
    'SELECT id, cliente_id, pontos_gerados, valor_servico, status FROM atendimentos WHERE id = ? FOR UPDATE',
    [id]
  );
  if (atendimentos.length === 0) return { error: 'Atendimento não encontrado', status: 404 };

  const atendimento = atendimentos[0];
  if (atendimento.status === 'cancelado') return { alreadyCancelled: true };
  if (atendimento.status !== 'concluido') {
    return { error: 'Somente atendimentos concluídos podem ser cancelados', status: 409 };
  }

  const [clientes] = await tx.query(
    'SELECT saldo_pontos FROM clientes WHERE id = ? FOR UPDATE',
    [atendimento.cliente_id]
  );
  if (clientes.length === 0) return { error: 'Cliente não encontrado', status: 404 };
  if (clientes[0].saldo_pontos < atendimento.pontos_gerados) {
    return { error: 'Os pontos deste atendimento já foram utilizados e não podem ser revertidos', status: 409 };
  }

  await tx.query(
    'UPDATE clientes SET saldo_pontos = saldo_pontos - ?, total_gasto = GREATEST(0, total_gasto - ?) WHERE id = ?',
    [atendimento.pontos_gerados, atendimento.valor_servico, atendimento.cliente_id]
  );
  if (atendimento.pontos_gerados > 0) {
    await tx.query(
      `INSERT INTO movimentacoes_pontos (cliente_id, tipo, quantidade, motivo, descricao, atendimento_id)
       VALUES (?, 'saida', ?, 'cancelamento_atendimento', ?, ?)`,
      [atendimento.cliente_id, atendimento.pontos_gerados, `Cancelamento do atendimento ${id}`, id]
    );
  }
  await tx.query("UPDATE atendimentos SET status = 'cancelado' WHERE id = ?", [id]);
  return { cancelled: true };
};

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
       ${req.usuario.tipo === 'cliente' ? 'WHERE c.usuario_id = ?' : ''}
       ORDER BY a.data_atendimento DESC`,
      req.usuario.tipo === 'cliente' ? [req.usuario.id] : []
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
       WHERE a.id = ?${req.usuario.tipo === 'cliente' ? ' AND c.usuario_id = ?' : ''}`,
      req.usuario.tipo === 'cliente' ? [id, req.usuario.id] : [id]
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
       JOIN clientes c ON a.cliente_id = c.id
       JOIN usuarios f_user ON a.funcionario_id = f_user.id
       JOIN servicos s ON a.servico_id = s.id
       WHERE a.cliente_id = ?${req.usuario.tipo === 'cliente' ? ' AND c.usuario_id = ?' : ''}
       ORDER BY a.data_atendimento DESC`,
      req.usuario.tipo === 'cliente' ? [cliente_id, req.usuario.id] : [cliente_id]
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
    const { cliente_id, servico_id, valor_servico, descricao } = req.body;
    const funcionarioId = req.usuario.tipo === 'funcionario'
      ? req.usuario.id
      : req.body.funcionario_id;

    // Validações
    if (!cliente_id || !funcionarioId || !servico_id) {
      return res.status(400).json({ 
        message: 'cliente_id, funcionario_id e servico_id são obrigatórios' 
      });
    }

    const valorInformado = valor_servico === '' || valor_servico === undefined
      ? null
      : Number(valor_servico);
    if (valorInformado !== null && (!Number.isFinite(valorInformado) || valorInformado <= 0)) {
      return res.status(400).json({ message: 'O valor do serviço deve ser maior que zero.' });
    }

    const resultado = await db.transaction(async (tx) => {
      const [clientes] = await tx.query('SELECT id FROM clientes WHERE id = ?', [cliente_id]);
      if (clientes.length === 0) return { error: 'Cliente não encontrado', status: 404 };

      const [funcionarios] = await tx.query(
        'SELECT id FROM usuarios WHERE id = ? AND tipo IN (?, ?)',
        [funcionarioId, 'funcionario', 'admin']
      );
      if (funcionarios.length === 0) return { error: 'Funcionário não encontrado', status: 404 };

      const [servicos] = await tx.query(
        'SELECT valor, pontos_por_servico FROM servicos WHERE id = ? AND ativo = TRUE',
        [servico_id]
      );
      if (servicos.length === 0) return { error: 'Serviço não encontrado ou inativo', status: 404 };

      const servico = servicos[0];
      const valorFinal = valorInformado ?? Number(servico.valor);
      const pontosGerados = calcularPontosServico(servico.pontos_por_servico);
      const [inserido] = await tx.query(
        `INSERT INTO atendimentos (cliente_id, funcionario_id, servico_id, data_atendimento, valor_servico, pontos_gerados, descricao, status)
         VALUES (?, ?, ?, NOW(), ?, ?, ?, 'concluido')`,
        [cliente_id, funcionarioId, servico_id, valorFinal, pontosGerados, descricao]
      );

      await tx.query(
        'UPDATE clientes SET total_gasto = total_gasto + ? WHERE id = ?',
        [valorFinal, cliente_id]
      );

      return {
        id: inserido.insertId,
        funcionarioId,
        valorFinal,
        pontosGerados,
      };
    });

    if (resultado.error) {
      return res.status(resultado.status).json({ message: resultado.error });
    }

    res.status(201).json({
      id: resultado.id,
      cliente_id,
      funcionario_id: resultado.funcionarioId,
      servico_id,
      valor_servico: resultado.valorFinal,
      pontos_gerados: resultado.pontosGerados,
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

    if (status !== undefined && status !== 'cancelado') {
      return res.status(400).json({ message: 'O status só pode ser alterado para cancelado.' });
    }
    if (status === undefined && descricao === undefined) {
      return res.status(400).json({ 
        message: 'Nenhum campo para atualizar' 
      });
    }

    const result = await db.transaction(async (tx) => {
      if (status === 'cancelado') {
        const cancellation = await cancelarAtendimento(tx, id);
        if (cancellation.error) return cancellation;
      }
      if (descricao !== undefined) {
        await tx.query('UPDATE atendimentos SET descricao = ? WHERE id = ?', [descricao, id]);
      }
      return { updated: true };
    });

    if (result.error) return res.status(result.status).json({ message: result.error });

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

// Cancelar sem apagar o registro de auditoria.
export const deleteAtendimento = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.transaction((tx) => cancelarAtendimento(tx, id));
    if (result.error) return res.status(result.status).json({ message: result.error });

    res.json({ 
      message: result.alreadyCancelled ? 'Atendimento já estava cancelado.' : 'Atendimento cancelado com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao deletar atendimento:', error);
    res.status(500).json({ 
      message: 'Erro ao deletar atendimento',
      error: error.message 
    });
  }
};
