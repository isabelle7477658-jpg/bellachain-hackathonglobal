import { Router } from 'express';
import { autenticar } from '../middleware/authMiddleware.js';
import * as controller from '../controllers/solanaWalletController.js';

const router = Router();
router.use(autenticar);
router.get('/me', controller.getWallet);
router.post('/challenge', controller.createWalletChallenge);
router.post('/verify', controller.verifyWalletChallenge);

export default router;
