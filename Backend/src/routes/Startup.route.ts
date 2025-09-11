import express from 'express';
import { authorizeRoles, requireAuth } from '../middleware/auth';
const router = express.Router();

import * as StartupController from '../controller/Startup.controller';

router.post('/create', requireAuth, authorizeRoles('admin'), StartupController.createStartupController);
router.get('/get', StartupController.getAllStartupsController);
router.get('/get/:id', StartupController.getStartupByIdController);
router.delete('/delete/:id', requireAuth, authorizeRoles('admin'), StartupController.deleteStartupController);
router.put('/update/:id', requireAuth, authorizeRoles('admin', 'founder'), StartupController.updateStartupController);

export default router;
