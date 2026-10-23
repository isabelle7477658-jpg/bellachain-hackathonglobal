import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { autenticar } from '../middleware/authMiddleware.js';

const router = Router();

// Rotas públicas
router.post('/registrar', authController.registrar);
router.post('/login', authController.login);
router.post('/solicitar-recuperacao', authController.solicitarRecuperacaoSenha);
router.post('/validar-token-recuperacao', authController.validarTokenRecuperacaoSenha);
router.post('/redefinir-senha', authController.redefinirSenha);

// Rotas protegidas
router.get('/me', autenticar, authController.me);
router.post('/logout', autenticar, authController.logout);
router.post('/alterar-senha', autenticar, authController.alterarSenha);

export default router;
