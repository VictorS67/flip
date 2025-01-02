// src/controllers/WeiboController.ts

import { Request, Response } from 'express';
import { WeiboService } from '../../../services/crawlers/weibo/index.js';
// import { logger } from '../utils/logger'; // 日志工具

const weiboService = new WeiboService();

export class WeiboController {
  /**
   * 处理微博登录请求
   * POST /api/weibo/login
   */
  public static async login(req: Request, res: Response) {
    try {
      const { loginType, cookieStr } = req.body;

      // 参数验证
      if (!['qrcode', 'phone', 'cookie'].includes(loginType)) {
        return res.status(400).json({ success: false, message: 'Invalid login type' });
      }

      const cookieString = await weiboService.loginWeibo(loginType, cookieStr);
      res.json({ success: true, cookieString });
    } catch (error) {
    //   logger.error(`WeiboController: 登录失败 - ${(error as Error).message}`);
      res.status((error as any).status || 500).json({ success: false, message: -1 });
    }
  }

  //TODO: CRAWLER
}
