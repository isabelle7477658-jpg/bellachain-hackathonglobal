import { Router } from 'express';
import * as servicosController from '../controllers/servicosController.js';
import { autenticar, autorizarPor } from '../middleware/authMiddleware.js';

const router = Router();

// Rotas públicas (qualquer um pode ver os serviços)
router.get('/', servicosController.getServicos);
router.get('/:id', servicosController.getServicoById);

// Rotas protegidas (apenas admin e funcionário podem criar/editar)
router.post('/', autenticar, autorizarPor('admin', 'funcionario'), servicosController.createServico);
router.put('/:id', autenticar, autorizarPor('admin', 'funcionario'), servicosController.updateServico);
router.delete('/:id', autenticar, autorizarPor('admin'), servicosController.deleteServico);

export default router;
