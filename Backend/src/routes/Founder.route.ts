import express from 'express';
const router = express.Router();

import * as FounderController from '../controller/Founder.controller';

router.post('/founder', FounderController.createFounderController);
router.get('/founder/:id', FounderController.getFounderByIdController);
router.get('/founders', FounderController.getAllFoundersController);
router.delete('/founder/:id', FounderController.deleteFounderController);

export default router;
