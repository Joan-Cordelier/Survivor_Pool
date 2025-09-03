import express from 'express';
const router = express.Router();

import * as AuthController from '../controller/Auth.controller';
import { requireAuth } from '../middleware/auth';

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router;
