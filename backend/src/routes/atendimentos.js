import { Router } from 'express';
import * as atendimentosController from '../controllers/atendimentosController.js';
import { autenticar, autorizarPor } from '../middleware/authMiddleware.js';

const router = Router();

// Rotas de leitura (públicas)
router.get('/', atendimentosController.getAtendimentos);
router.get('/:id', atendimentosController.getAtendimentoById);
router.get('/cliente/:cliente_id', atendimentosController.getAtendimentosPorCliente);

// Rotas de escrita (apenas funcionário e admin)
router.post('/', autenticar, autorizarPor('funcionario', 'admin'), atendimentosController.createAtendimento);
router.put('/:id', autenticar, autorizarPor('funcionario', 'admin'), atendimentosController.updateAtendimento);
router.delete('/:id', autenticar, autorizarPor('admin'), atendimentosController.deleteAtendimento);

export default router;
