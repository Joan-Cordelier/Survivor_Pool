import express from 'express';
const router = express.Router();

import * as PartnerController from '../controller/Partner.controller';

router.post('/create', PartnerController.createPartnerController);
router.get('/get', PartnerController.getAllPartnersController);
router.get('/get/:id', PartnerController.getPartnerByIdController);
router.delete('/delete/:id', PartnerController.deletePartnerController);

export default router;
