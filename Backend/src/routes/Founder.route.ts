import express from 'express';
const router = express.Router();

import * as FounderController from '../controller/Founder.controller';

router.post('/create', FounderController.createFounderController);
router.get('/get/:id', FounderController.getFounderByIdController);
router.get('/get', FounderController.getAllFoundersController);
router.delete('/delete/:id', FounderController.deleteFounderController);

export default router;
