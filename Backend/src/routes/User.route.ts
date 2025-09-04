import express from 'express';
const router = express.Router();

import { authorizeRoles, requireAuth } from '../middleware/auth';
import * as UserController from '../controller/User.controller';

router.post('/create', requireAuth, authorizeRoles('admin'), UserController.createUserController);
router.get('/get/:id', UserController.getUserByIdController);
router.get('/get', UserController.getAllUsersController);
router.delete('/delete/:id', requireAuth, authorizeRoles('admin'), UserController.deleteUserController);
router.put('/update/:id', requireAuth, authorizeRoles('admin'), UserController.updateUserController);

export default router;
