import express from 'express';
const router = express.Router();

import { authorizeRoles, requireAuth } from '../middleware/auth';
import * as EventController from '../controller/Event.controller';

router.post('/create', requireAuth, authorizeRoles('admin'), EventController.createEventController);
router.get('/get/:id', EventController.getEventByIdController);
router.get('/get', EventController.getAllEventsController);
router.delete('/delete/:id', requireAuth, authorizeRoles('admin'), EventController.deleteEventController);

export default router;
