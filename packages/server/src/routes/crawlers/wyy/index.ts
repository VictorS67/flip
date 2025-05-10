// src/routes/WyyRoutes.ts

import { Router } from 'express';
import { getUserInfo, getUserPlayRank } from '../../../controllers/crawlers/wyy/index.js';

const router = Router();

router.post('/user', getUserInfo);

router.post('/rank', getUserPlayRank);

export default router;
