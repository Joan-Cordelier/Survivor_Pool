import express from 'express';
const router = express.Router();

import * as StartupController from '../controller/Startup.controller';

router.post('/Startup', StartupController.createStartupController);
router.get('/Startups', StartupController.getAllStartupsController);
router.get('/Startup/:id', StartupController.getStartupByIdController);
router.delete('/Startup/:id', StartupController.deleteStartupController);

export default router;
