import { Router } from 'express';
import db from '../config/db.js';
import authRouter from './auth.js';
import clientesRouter from './clientes.js';
import atendimentosRouter from './atendimentos.js';
import servicosRouter from './servicos.js';
import recompensasRouter from './recompensas.js';
import pacotesRouter from './pacotes.js';
import solanaWalletRouter from './solanaWallet.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'BellaChain API - Pacotes de serviços com liquidação Solana' });
});

router.get('/db/test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({
      success: true,
      database: 'Supabase PostgreSQL',
      result: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao conectar com o banco PostgreSQL/Supabase',
      error: error.message,
    });
  }
});

// Rotas principais
router.use('/auth', authRouter);
router.use('/clientes', clientesRouter);
router.use('/atendimentos', atendimentosRouter);
router.use('/servicos', servicosRouter);
router.use('/recompensas', recompensasRouter);
router.use('/pacotes', pacotesRouter);
router.use('/carteira-solana', solanaWalletRouter);

export default router;
