import express from 'express';
const router = express.Router();

import * as EventController from '../controller/Event.controller';

router.post('/create', EventController.createEventController);
router.get('/get/:id', EventController.getEventByIdController);
router.get('/get', EventController.getAllEventsController);
router.delete('/delete/:id', EventController.deleteEventController);

export default router;
