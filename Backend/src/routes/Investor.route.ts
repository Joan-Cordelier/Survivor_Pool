import express from 'express';
const router = express.Router();

import { authorizeRoles, requireAuth } from '../middleware/auth';
import * as InvestorController from '../controller/Investor.controller';

router.post('/create', requireAuth, authorizeRoles('admin'), InvestorController.createInvestorController);
router.get('/get/:id', InvestorController.getInvestorByIdController);
router.get('/get', InvestorController.getAllInvestorsController);
router.delete('/delete/:id', requireAuth, authorizeRoles('admin'), InvestorController.deleteInvestorController);

export default router;
