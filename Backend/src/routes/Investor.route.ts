import express from 'express';
const router = express.Router();

import * as InvestorController from '../controller/Investor.controller';

router.post('/create', InvestorController.createInvestorController);
router.get('/get/:id', InvestorController.getInvestorByIdController);
router.get('/get', InvestorController.getAllInvestorsController);
router.delete('/delete/:id', InvestorController.deleteInvestorController);

export default router;
