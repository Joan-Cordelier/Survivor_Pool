import express from 'express';
const router = express.Router();

import { authorizeRoles, requireAuth } from '../middleware/auth';
import * as FounderController from '../controller/Founder.controller';

router.post('/create', requireAuth, authorizeRoles('admin'), FounderController.createFounderController);
router.get('/get/:id', FounderController.getFounderByIdController);
router.get('/get', FounderController.getAllFoundersController);
router.delete('/delete/:id', requireAuth, authorizeRoles('admin'), FounderController.deleteFounderController);

export default router;
