import { Router } from 'express';
import * as recompensasController from '../controllers/recompensasController.js';
import { autenticar, autorizarPor } from '../middleware/authMiddleware.js';

const router = Router();

// Rotas de leitura (públicas)
router.get('/', recompensasController.getRecompensas);
router.get('/:id', recompensasController.getRecompensaById);

// Rotas de escrita (admin)
router.post('/', autenticar, autorizarPor('admin'), recompensasController.createRecompensa);
router.put('/:id', autenticar, autorizarPor('admin'), recompensasController.updateRecompensa);
router.delete('/:id', autenticar, autorizarPor('admin'), recompensasController.deleteRecompensa);

// Rota de resgate (cliente autenticado)
router.post('/resgatar', autenticar, recompensasController.resgatarRecompensa);

// Rotas de resgates
router.get('/cliente/:cliente_id/resgates', recompensasController.getResgatesPorCliente);
router.put('/resgatar/utilizar', autenticar, recompensasController.utilizarResgate);

export default router;
