import express from 'express';
const router = express.Router();

import * as PartnerController from '../controller/Partner.controller';

router.post('/Partner', PartnerController.createPartnerController);
router.get('/Partner', PartnerController.getAllPartnersController);
router.get('/Partner/:id', PartnerController.getPartnerByIdController);
router.delete('/Partner/:id', PartnerController.deletePartnerController);

export default router;
