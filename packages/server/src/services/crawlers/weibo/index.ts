// src/services/crawlers/weibo/WeiboService.ts

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { logger } from '../../../utils/crawlers/logger.js';

import { WeiboLogin } from '../../../crawlers/mediaPlatforms/weibo/weibo.js';


export class WeiboService {
  /**
   * @param loginType 'qrcode' | 'phone' | 'cookie'
   * @param cookieStr 可选的 cookie
   * @returns 登录后的 cookie 字符串
   */
  public async loginWeibo(
    loginType: 'qrcode' | 'phone' | 'cookie',
    cookieStr: string = ''
  ): Promise<string> {
    let browser: Browser | null = null;

    try {
      
      browser = await chromium.launch({ headless: false });
      
      const context = await browser.newContext();
      const page = await context.newPage();

      
      const weiboLogin = new WeiboLogin(loginType, context, page, '', cookieStr);
      
      await weiboLogin.begin();

      
      const cookies = await context.cookies();
      const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

      logger.info(`[WeiboService] 登录成功，Cookie = ${cookieString}`);
      return cookieString;
    } catch (error) {
      logger.error(`[WeiboService] 登录失败: ${(error as Error).message}`);
      throw error; 
    } finally {
     
      if (browser) {
        await browser.close();
        logger.info('[WeiboService] 浏览器已关闭');
      }
    }
  }

}
