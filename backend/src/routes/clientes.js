import { Router } from 'express';
import * as clientesController from '../controllers/clientesController.js';
import { autenticar, autorizarPor } from '../middleware/authMiddleware.js';

const router = Router();

// Rotas pÃºblicas
router.get('/', clientesController.getClientes);

// Specific route must precede the dynamic /:id route.
router.get('/meu-perfil', autenticar, clientesController.getMeuPerfil);
router.get('/:id', clientesController.getClienteById);

// Rotas protegidas
router.post('/', autenticar, autorizarPor('admin'), clientesController.createCliente);
router.put('/:id', autenticar, autorizarPor('admin'), clientesController.updateCliente);
router.delete('/:id', autenticar, autorizarPor('admin'), clientesController.deleteCliente);

// Rota para o perfil do cliente autenticado

export default router;
