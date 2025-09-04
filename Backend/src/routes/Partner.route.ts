import express from 'express';
const router = express.Router();

import * as PartnerController from '../controller/Partner.controller';
import { requireAuth, authorizeRoles } from '../middleware/auth';

router.post('/create', requireAuth, authorizeRoles('admin'), PartnerController.createPartnerController);
router.get('/get', PartnerController.getAllPartnersController);
router.get('/get/:id', PartnerController.getPartnerByIdController);
router.delete('/delete/:id', requireAuth, authorizeRoles('admin'), PartnerController.deletePartnerController);
router.put('/update/:id', requireAuth, authorizeRoles('admin'), PartnerController.updatePartnerController);

export default router;
