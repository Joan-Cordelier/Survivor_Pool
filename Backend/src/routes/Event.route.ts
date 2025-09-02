import express from 'express';
const router = express.Router();

import * as EventController from '../controller/Event.controller';

router.post('/event', EventController.createEventController);
router.get('/event/:id', EventController.getEventByIdController);
router.get('/events', EventController.getAllEventsController);
router.delete('/event/:id', EventController.deleteEventController);

export default router;
