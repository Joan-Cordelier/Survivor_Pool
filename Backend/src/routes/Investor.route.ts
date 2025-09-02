import express from 'express';
const router = express.Router();

import * as InvestorController from '../controller/Investor.controller';

router.post('/investor', InvestorController.createInvestorController);
router.get('/investor/:id', InvestorController.getInvestorByIdController);
router.get('/investor', InvestorController.getAllInvestorsController);
router.delete('/investor/:id', InvestorController.deleteInvestorController);

export default router;
