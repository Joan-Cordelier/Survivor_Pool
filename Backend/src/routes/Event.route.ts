import express from 'express';
const router = express.Router();

import { authorizeRoles, requireAuth } from '../middleware/auth';
import * as EventController from '../controller/Event.controller';

router.post('/create', requireAuth, authorizeRoles('admin', 'founder'), EventController.createEventController);
router.get('/get/:id', EventController.getEventByIdController);
router.get('/get', EventController.getAllEventsController);
router.delete('/delete/:id', requireAuth, authorizeRoles('admin', 'founder'), EventController.deleteEventController);
router.put('/update/:id', requireAuth, authorizeRoles('admin', 'founder'), EventController.updateEventController);

export default router;
