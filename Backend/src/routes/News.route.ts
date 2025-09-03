import express from 'express';
const router = express.Router();

import { authorizeRoles, requireAuth } from '../middleware/auth';
import * as NewsController from '../controller/News.controller';

router.post('/create', requireAuth, authorizeRoles('admin'), NewsController.createNewsController);
router.get('/get/:id', NewsController.getNewsByIdController);
router.get('/get', NewsController.getAllNewsController);
router.delete('/delete/:id', requireAuth, authorizeRoles('admin'), NewsController.deleteNewsController);

export default router;
