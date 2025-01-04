// src/routes/WeiboRoutes.ts

import { Router } from 'express';
import { WeiboController } from '../../../controllers/crawlers/weibo/index.js';

const router = Router();
const weiboController = new WeiboController();

//Test login
router.post('/login', weiboController.login.bind(weiboController));

router.post('/crawler', weiboController.getAllNotes.bind(weiboController));

router.post('/logout', weiboController.closeBrowser.bind(weiboController));


export default router;
