// src/routes/WeiboRoutes.ts

import { Router } from 'express';
import { WeiboController } from '../../../controllers/crawlers/weibo/index.js';

const router = Router();

//Test login
router.post('/login', WeiboController.login);


export default router;
