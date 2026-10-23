import { randomBytes } from 'node:crypto';
import db from '../config/db.js';
import { isSolanaAddress, verifySolanaMessage } from '../utils/solanaWallet.js';

const userIdFrom = (req) => Number(req.usuario?.id ?? req.usuario?.usuario_id);

export const getWallet = async (req, res) => {
  const userId = userIdFrom(req);
  if (!Number.isSafeInteger(userId)) return res.status(401).json({ message: 'Sessão não persistida.' });
  const [rows] = await db.query('SELECT solana_wallet_address FROM usuarios WHERE id = ?', [userId]);
  if (!rows.length) return res.status(404).json({ message: 'Usuário não encontrado.' });
  return res.json({ address: rows[0].solana_wallet_address || null });
};

export const createWalletChallenge = async (req, res) => {
  const userId = userIdFrom(req);
  const { address } = req.body || {};
  if (!Number.isSafeInteger(userId)) return res.status(401).json({ message: 'Sessão não persistida.' });
  if (!isSolanaAddress(address)) return res.status(400).json({ message: 'Endereço Solana inválido.' });

  const nonce = randomBytes(24).toString('base64url');
  const message = [
    'BellaChain vinculação de carteira',
    `Usuário: ${userId}`,
    `Carteira: ${address}`,
    `Código: ${nonce}`,
    'Esta assinatura confirma apenas o controle da carteira; não autoriza transferências.',
  ].join('\n');

  await db.query(
    `INSERT INTO desafios_carteira_solana (usuario_id, carteira, nonce, mensagem, expira_em)
     VALUES (?, ?, ?, ?, NOW() + INTERVAL '5 minutes')`,
    [userId, address, nonce, message]
  );
  return res.status(201).json({ nonce, message, expires_in_seconds: 300 });
};

export const verifyWalletChallenge = async (req, res) => {
  const userId = userIdFrom(req);
  const { address, nonce, signature } = req.body || {};
  if (!Number.isSafeInteger(userId)) return res.status(401).json({ message: 'Sessão não persistida.' });
  if (!isSolanaAddress(address) || typeof nonce !== 'string' || typeof signature !== 'string') {
    return res.status(400).json({ message: 'Informe carteira, código e assinatura válidos.' });
  }

  const [challenges] = await db.query(
    `SELECT id, mensagem FROM desafios_carteira_solana
     WHERE usuario_id = ? AND carteira = ? AND nonce = ? AND usado_em IS NULL AND expira_em > NOW()`,
    [userId, address, nonce]
  );
  if (!challenges.length) return res.status(400).json({ message: 'Desafio inexistente, expirado ou já utilizado.' });

  let valid = false;
  try {
    valid = verifySolanaMessage({ address, message: challenges[0].mensagem, signature });
  } catch {
    valid = false;
  }
  if (!valid) return res.status(400).json({ message: 'A assinatura não corresponde à carteira.' });

  try {
    await db.transaction(async (tx) => {
      const [owners] = await tx.query(
        'SELECT id FROM usuarios WHERE solana_wallet_address = ? AND id <> ? FOR UPDATE',
        [address, userId]
      );
      if (owners.length) throw Object.assign(new Error('Esta carteira já está vinculada a outro usuário.'), { status: 409 });

      const [claimed] = await tx.query(
        `UPDATE desafios_carteira_solana SET usado_em = NOW()
         WHERE id = ? AND usado_em IS NULL AND expira_em > NOW() RETURNING id`,
        [challenges[0].id]
      );
      if (!claimed.length) throw Object.assign(new Error('O desafio já foi utilizado.'), { status: 409 });
      await tx.query('UPDATE usuarios SET solana_wallet_address = ? WHERE id = ?', [address, userId]);
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.status ? error.message : 'Não foi possível vincular a carteira.' });
  }

  return res.json({ address, message: 'Carteira Solana vinculada.' });
};
