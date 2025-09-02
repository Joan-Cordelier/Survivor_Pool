import express from 'express';
const router = express.Router();

import * as UserController from '../controller/User.controller';

router.post('/user', UserController.createUserController);
router.get('/user/:id', UserController.getUserByIdController);
router.get('/users', UserController.getAllUsersController);
router.delete('/user/:id', UserController.deleteUserController);

export default router;
