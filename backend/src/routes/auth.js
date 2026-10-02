import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { autenticar } from '../middleware/authMiddleware.js';

const router = Router();

// Rotas públicas
router.post('/registrar', authController.registrar);
router.post('/login', authController.login);

// Rotas protegidas
router.get('/me', autenticar, authController.me);
router.post('/logout', autenticar, authController.logout);
router.post('/alterar-senha', autenticar, authController.alterarSenha);

export default router;
