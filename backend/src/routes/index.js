import { Router } from 'express';
import db from '../config/db.js';
import authRouter from './auth.js';
import clientesRouter from './clientes.js';
import atendimentosRouter from './atendimentos.js';
import servicosRouter from './servicos.js';
import recompensasRouter from './recompensas.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'BellaChain API - Sistema de Pontos e Recompensas' });
});

router.get('/db/test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({
      success: true,
      database: process.env.DB_NAME || 'bellachain',
      result: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao conectar com o banco MySQL',
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

export default router;
