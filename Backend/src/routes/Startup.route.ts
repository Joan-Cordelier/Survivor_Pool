import express from 'express';
const router = express.Router();

import * as StartupController from '../controller/Startup.controller';

router.post('/create', StartupController.createStartupController);
router.get('/get', StartupController.getAllStartupsController);
router.get('/get/:id', StartupController.getStartupByIdController);
router.delete('/delete/:id', StartupController.deleteStartupController);

export default router;
