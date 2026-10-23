import { Router } from 'express';
import { autenticar } from '../middleware/authMiddleware.js';
import * as controller from '../controllers/pacotesController.js';

const router = Router();
router.get('/', controller.listPublishedPackages);
router.get('/gerenciados', autenticar, controller.listManagedPackages);
router.get('/compras/meus', autenticar, controller.listMyPurchases);
router.post('/compras/confirmar', autenticar, controller.confirmPackagePurchase);
router.post('/', autenticar, controller.createPackage);
router.post('/:id/publicacao', autenticar, controller.confirmPackagePublication);
router.patch('/:id/ativo', autenticar, controller.updatePackageActive);

export default router;
