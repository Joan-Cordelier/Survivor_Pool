import express from 'express';
const router = express.Router();

import * as NewsController from '../controller/News.controller';

router.post('/create', NewsController.createNewsController);
router.get('/get/:id', NewsController.getNewsByIdController);
router.get('/get', NewsController.getAllNewsController);
router.delete('/delete/:id', NewsController.deleteNewsController);

export default router;
