import express from 'express';
import appRouter from './app/index.js';
import weiboLoginRouter from './crawlers/weibo/index.js';
import wyyLoginRouter from './crawlers/wyy/index.js';

const router = express.Router();

router.use('/app', appRouter);


router.use('/weibo', weiboLoginRouter);

router.use('/wyy', wyyLoginRouter);

export default router;
