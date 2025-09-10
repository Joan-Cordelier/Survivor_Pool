import express from 'express';
const router = express.Router();

import { authorizeRoles, requireAuth } from '../middleware/auth';
import * as MessageController from '../controller/Message.controller';

router.post('/create', requireAuth, MessageController.createMessageController);
router.get('/get/:id', requireAuth, MessageController.getMessageByIdController);
router.get('/get', requireAuth, MessageController.getAllMessagesController);
router.delete('/delete/:id', requireAuth, authorizeRoles('admin'), MessageController.deleteMessageController);
router.put('/update/:id', requireAuth, MessageController.updateMessageController);
router.get('/received/:userId', requireAuth, MessageController.getReceivedMessagesByUserIdController);
router.get('/sent/:userId', requireAuth, MessageController.getSentMessagesByUserIdController);

export default router;
