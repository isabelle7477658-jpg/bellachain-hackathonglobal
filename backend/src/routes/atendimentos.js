import { Router } from 'express';
import * as atendimentosController from '../controllers/atendimentosController.js';
import { autenticar, autorizarPor } from '../middleware/authMiddleware.js';

const router = Router();

// Rotas de leitura (públicas)
router.get('/', autenticar, autorizarPor('cliente', 'funcionario'), atendimentosController.getAtendimentos);
router.get('/cliente/:cliente_id', autenticar, autorizarPor('cliente', 'funcionario'), atendimentosController.getAtendimentosPorCliente);
router.get('/:id', autenticar, autorizarPor('cliente', 'funcionario'), atendimentosController.getAtendimentoById);

// Rotas de escrita (apenas funcionário e admin)
router.post('/', autenticar, autorizarPor('funcionario', 'admin'), atendimentosController.createAtendimento);
router.put('/:id', autenticar, autorizarPor('funcionario', 'admin'), atendimentosController.updateAtendimento);
router.delete('/:id', autenticar, autorizarPor('admin'), atendimentosController.deleteAtendimento);

export default router;
