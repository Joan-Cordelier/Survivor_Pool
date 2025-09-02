import express from 'express';
const router = express.Router();

import * as NewsController from '../controller/News.controller';

router.post('/news', NewsController.createNewsController);
router.get('/news/:id', NewsController.getNewsByIdController);
router.get('/news', NewsController.getAllNewsController);
router.delete('/news/:id', NewsController.deleteNewsController);

export default router;
