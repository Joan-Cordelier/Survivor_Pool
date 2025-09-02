import express from 'express';
const router = express.Router();

import * as UserController from '../controller/User.controller';

router.post('/create', UserController.createUserController);
router.get('/get/:id', UserController.getUserByIdController);
router.get('/get', UserController.getAllUsersController);
router.delete('/delete/:id', UserController.deleteUserController);

export default router;
