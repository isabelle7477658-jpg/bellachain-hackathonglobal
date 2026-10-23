import db from '../config/db.js';
import { confirmProgramInstruction, readU64LE } from '../utils/solanaRpc.js';

const isPositiveIntegerAmount = (value) => {
  const normalized = String(value ?? '');
  return /^\d{1,30}$/.test(normalized) && BigInt(normalized) > 0n;
};

const isProvider = (tipo) => tipo === 'funcionario' || tipo === 'admin';

export const listPublishedPackages = async (_req, res) => {
  try {
    const [packages] = await db.query(
      `SELECT p.id, p.titulo, p.descricao, p.token_mint, p.valor_base_units,
              p.programa_solana, p.conta_onchain, u.nome AS prestador_nome,
              u.solana_wallet_address AS prestador_carteira
       FROM pacotes_credito p
       JOIN usuarios u ON u.id = p.prestador_usuario_id
       WHERE p.ativo = TRUE AND p.publicado = TRUE
       ORDER BY p.criado_em DESC`
    );
    return res.json(packages);
  } catch (error) {
    console.error('Erro ao listar pacotes:', error);
    return res.status(500).json({ message: 'Erro ao listar pacotes.' });
  }
};

export const listManagedPackages = async (req, res) => {
  if (!isProvider(req.usuario.tipo)) return res.status(403).json({ message: 'Acesso exclusivo para prestadores.' });
  try {
    const [packages] = await db.query(
      `SELECT id, titulo, descricao, token_mint, valor_base_units, ativo, publicado,
              programa_solana, conta_onchain, criado_em
       FROM pacotes_credito WHERE prestador_usuario_id = ? ORDER BY criado_em DESC`,
      [req.usuario.id]
    );
    return res.json(packages);
  } catch (error) {
    console.error('Erro ao listar pacotes do prestador:', error);
    return res.status(500).json({ message: 'Erro ao listar seus pacotes.' });
  }
};

export const createPackage = async (req, res) => {
  if (!isProvider(req.usuario.tipo)) return res.status(403).json({ message: 'Acesso exclusivo para prestadores.' });
  const { titulo, descricao, valor_base_units } = req.body || {};
  if (typeof titulo !== 'string' || !titulo.trim() || titulo.trim().length > 120) {
    return res.status(400).json({ message: 'Informe um título de até 120 caracteres.' });
  }
  if (descricao !== undefined && descricao !== null && typeof descricao !== 'string') {
    return res.status(400).json({ message: 'A descrição precisa ser texto.' });
  }
  if (!isPositiveIntegerAmount(valor_base_units)) {
    return res.status(400).json({ message: 'O valor deve ser um inteiro positivo em unidades mínimas do token.' });
  }

  const tokenMint = process.env.SOLANA_PAYMENT_MINT;
  const programId = process.env.SOLANA_PROGRAM_ID;
  if (!tokenMint || !programId) {
    return res.status(503).json({ message: 'A configuração do token e do programa Solana ainda não foi definida.' });
  }

  try {
    const [users] = await db.query('SELECT solana_wallet_address FROM usuarios WHERE id = ?', [req.usuario.id]);
    if (!users.length || !users[0].solana_wallet_address) {
      return res.status(409).json({ message: 'Vincule e comprove uma carteira Solana antes de criar pacotes.' });
    }
    const [result] = await db.query(
      `INSERT INTO pacotes_credito
       (prestador_usuario_id, titulo, descricao, token_mint, valor_base_units, programa_solana, ativo, publicado)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, FALSE)
       RETURNING id, titulo, descricao, token_mint, valor_base_units, programa_solana, ativo, publicado`,
      [req.usuario.id, titulo.trim(), descricao?.trim() || null, tokenMint, String(valor_base_units), programId]
    );
    return res.status(201).json({
      ...result,
      prestador_carteira: users[0].solana_wallet_address,
      chain_status: 'aguardando_publicacao_onchain',
      message: 'Pacote criado como rascunho. Ele só ficará disponível após publicação confirmada na Solana.',
    });
  } catch (error) {
    console.error('Erro ao criar pacote:', error);
    return res.status(500).json({ message: 'Erro ao criar pacote.' });
  }
};

export const confirmPackagePublication = async (req, res) => {
  if (!isProvider(req.usuario.tipo)) return res.status(403).json({ message: 'Acesso exclusivo para prestadores.' });
  const { assinatura, conta_onchain } = req.body || {};
  if (typeof assinatura !== 'string' || typeof conta_onchain !== 'string') {
    return res.status(400).json({ message: 'Informe a assinatura e a conta do pacote.' });
  }
  try {
    const [rows] = await db.query(
      'SELECT id, token_mint, valor_base_units, publicado FROM pacotes_credito WHERE id = ? AND prestador_usuario_id = ?',
      [req.params.id, req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Pacote não encontrado.' });
    if (rows[0].publicado) return res.status(409).json({ message: 'Este pacote já foi publicado.' });
    const [users] = await db.query('SELECT solana_wallet_address FROM usuarios WHERE id = ?', [req.usuario.id]);
    const providerWallet = users[0]?.solana_wallet_address;
    const packageRef = BigInt(rows[0].id);
    const expectedPrice = BigInt(rows[0].valor_base_units);
    const chainTransaction = await confirmProgramInstruction({
      signature: assinatura,
      instructionName: 'create_package',
      validate: ({ accounts, instructionData }) => instructionData.length === 25
        && readU64LE(instructionData, 8) === packageRef
        && readU64LE(instructionData, 16) === expectedPrice
        && instructionData[24] === 1
        && accounts[0] === providerWallet
        && accounts[1] === rows[0].token_mint
        && accounts[2] === conta_onchain,
    });
    const [updated] = await db.query(
      `UPDATE pacotes_credito SET publicado = TRUE, conta_onchain = ?, assinatura_publicacao = ?, atualizado_em = NOW()
       WHERE id = ? AND prestador_usuario_id = ? AND publicado = FALSE
       RETURNING id, titulo, valor_base_units, publicado, conta_onchain`,
      [conta_onchain, assinatura, req.params.id, req.usuario.id]
    );
    if (!updated.length) return res.status(409).json({ message: 'O estado do pacote mudou; atualize a lista e tente novamente.' });
    return res.json({ ...updated[0], message: 'Pacote confirmado e publicado na Solana.' });
  } catch (error) {
    console.error('Erro ao confirmar publicação on-chain:', error);
    return res.status(error.status || 500).json({ message: error.status ? error.message : 'Não foi possível confirmar a publicação on-chain.' });
  }
};

export const listMyPurchases = async (req, res) => {
  try {
    const [purchases] = await db.query(
      `SELECT c.id, c.pacote_id, c.carteira_cliente, c.saldo_total_units,
              c.saldo_disponivel_units, c.saldo_reservado_units, c.status,
              c.conta_onchain, c.assinatura_compra, c.criado_em,
              p.titulo AS pacote_titulo, p.token_mint, u.nome AS prestador_nome
       FROM compras_pacotes c
       JOIN pacotes_credito p ON p.id = c.pacote_id
       JOIN usuarios u ON u.id = p.prestador_usuario_id
       WHERE c.cliente_usuario_id = ? ORDER BY c.criado_em DESC`,
      [req.usuario.id]
    );
    return res.json(purchases);
  } catch (error) {
    console.error('Erro ao listar compras:', error);
    return res.status(500).json({ message: 'Erro ao listar seus pacotes comprados.' });
  }
};

export const confirmPackagePurchase = async (req, res) => {
  if (req.usuario.tipo !== 'cliente') return res.status(403).json({ message: 'Somente clientes podem confirmar compras.' });
  const { pacote_id, assinatura, conta_compra, purchase_ref } = req.body || {};
  if (!pacote_id || typeof assinatura !== 'string' || typeof conta_compra !== 'string' || !/^\d{1,18}$/.test(String(purchase_ref))) {
    return res.status(400).json({ message: 'Dados de confirmação da compra inválidos.' });
  }
  try {
    const [packages] = await db.query(
      `SELECT id, prestador_usuario_id, token_mint, valor_base_units, conta_onchain
       FROM pacotes_credito WHERE id = ? AND ativo = TRUE AND publicado = TRUE`,
      [pacote_id]
    );
    if (!packages.length) return res.status(404).json({ message: 'Pacote publicado não encontrado.' });
    const [users] = await db.query('SELECT solana_wallet_address FROM usuarios WHERE id = ?', [req.usuario.id]);
    const clientWallet = users[0]?.solana_wallet_address;
    if (!clientWallet) return res.status(409).json({ message: 'Vincule sua carteira Solana primeiro.' });

    const purchaseRef = BigInt(purchase_ref);
    const amount = BigInt(packages[0].valor_base_units);
    const chainTransaction = await confirmProgramInstruction({
      signature: assinatura,
      instructionName: 'buy_package',
      validate: ({ accounts, instructionData }) => instructionData.length === 24
        && readU64LE(instructionData, 8) === purchaseRef
        && readU64LE(instructionData, 16) === amount
        && accounts[0] === clientWallet
        && accounts[2] === packages[0].conta_onchain
        && accounts[4] === packages[0].token_mint
        && accounts[7] === conta_compra,
    });

    const result = await db.transaction(async (tx) => {
      const [inserted] = await tx.query(
        `INSERT INTO compras_pacotes
         (pacote_id, cliente_usuario_id, carteira_cliente, saldo_total_units,
          saldo_disponivel_units, saldo_reservado_units, status, conta_onchain, assinatura_compra)
         VALUES (?, ?, ?, ?, ?, 0, 'ativo', ?, ?)
         ON CONFLICT (assinatura_compra) WHERE assinatura_compra IS NOT NULL DO NOTHING
         RETURNING id, pacote_id, saldo_total_units, saldo_disponivel_units, saldo_reservado_units,
                   status, conta_onchain, assinatura_compra`,
        [pacote_id, req.usuario.id, clientWallet, amount.toString(), amount.toString(), conta_compra, assinatura]
      );
      if (inserted.length) {
        await tx.query(
          `INSERT INTO eventos_pacotes_solana (compra_id, assinatura, tipo, estado_verificacao, payload)
           VALUES (?, ?, 'compra', 'confirmado', ?::jsonb)`,
          [inserted[0].id, assinatura, JSON.stringify({ slot: chainTransaction.slot, conta_compra })]
        );
        return inserted[0];
      }
      const [existing] = await tx.query(
        'SELECT id, pacote_id, saldo_total_units, saldo_disponivel_units, saldo_reservado_units, status, conta_onchain, assinatura_compra FROM compras_pacotes WHERE assinatura_compra = ?',
        [assinatura]
      );
      return existing[0];
    });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Erro ao confirmar compra on-chain:', error);
    return res.status(error.status || 500).json({ message: error.status ? error.message : 'Não foi possível confirmar a compra na Solana.' });
  }
};

export const updatePackageActive = async (req, res) => {
  if (!isProvider(req.usuario.tipo)) return res.status(403).json({ message: 'Acesso exclusivo para prestadores.' });
  const { ativo } = req.body || {};
  if (typeof ativo !== 'boolean') return res.status(400).json({ message: 'Informe ativo como booleano.' });

  try {
    const [current] = await db.query(
      'SELECT id, ativo, publicado FROM pacotes_credito WHERE id = ? AND prestador_usuario_id = ?',
      [req.params.id, req.usuario.id]
    );
    if (!current.length) return res.status(404).json({ message: 'Pacote não encontrado.' });
    if (current[0].publicado && current[0].ativo !== ativo) {
      return res.status(409).json({ message: 'Pacotes publicados só podem ser ativados ou pausados por uma transação assinada na Solana.' });
    }
    if (current[0].publicado) return res.json(current[0]);
    const [updated] = await db.query(
      `UPDATE pacotes_credito SET ativo = ?, atualizado_em = NOW()
       WHERE id = ? AND prestador_usuario_id = ? AND publicado = FALSE RETURNING id, ativo, publicado`,
      [ativo, req.params.id, req.usuario.id]
    );
    if (!updated.length) return res.status(404).json({ message: 'Pacote não encontrado.' });
    return res.json(updated[0]);
  } catch (error) {
    console.error('Erro ao atualizar pacote:', error);
    return res.status(500).json({ message: 'Erro ao atualizar pacote.' });
  }
};
