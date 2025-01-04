// src/services/weibo/index.ts

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { logger } from '../../../utils/crawlers/logger.js';
import { WeiboLogin } from '../../../crawlers/mediaPlatforms/weibo/login.js';
import { WeiboClient } from '../../../crawlers/mediaPlatforms/weibo/client.js';

export class WeiboService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private client: WeiboClient | null = null;

  /**
   * 手动登录并初始化服务
   * - 用户可先调用此方法进行登录后，再多次调用爬取方法，而无需再次登录
   * @param loginType 'qrcode' | 'phone' | 'cookie'
   * @param cookieStr 可选 cookie
   */
  public async loginWeibo(
    loginType: 'qrcode' | 'phone' | 'cookie',
    cookieStr: string = ''
  ): Promise<void> {
    try {
      if (this.browser) {
        // 如果之前已存在一个浏览器实例，先关闭
        await this.close();
      }

      this.browser = await chromium.launch({ headless: false });
      this.context = await this.browser.newContext();
      this.page = await this.context.newPage();

      // 调用登录
      const weiboLogin = new WeiboLogin(loginType, this.context, this.page, '', cookieStr);
      await weiboLogin.begin();

      // 获取登录后 Cookie，并初始化 client
      const cookies = await this.context.cookies();
      const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

      logger.info(`[WeiboService] 登录成功，Cookie = ${cookieString}`);

      this.client = new WeiboClient({
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Cookie': cookieString,
          'Content-Type': 'application/json',
        },
        playwrightPage: this.page,
        cookieDict: Object.fromEntries(cookies.map(c => [c.name, c.value])),
      });
    } catch (error) {
      logger.error(`[WeiboService] 登录失败: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * 私有方法: 检查是否已登录，若未登录且autoLogin为true，则自动登录
   * @param autoLogin 是否允许在未登录时自动登录
   * @param loginType 若autoLogin=true，需要指定的登录方式
   * @param cookieStr 若loginType='cookie'时可传递的cookie
   */
  private async ensureLoggedIn(
    autoLogin: boolean,
    loginType?: 'qrcode' | 'phone' | 'cookie',
    cookieStr?: string
  ): Promise<void> {
    // 若 client 还未初始化，则视为未登录
    if (!this.client) {
      if (autoLogin && loginType) {
        logger.info('[WeiboService] 未登录，自动执行登录流程...');
        await this.loginWeibo(loginType='qrcode', cookieStr);
      } else {
        throw new Error('WeiboClient 未初始化，请先手动登录或在调用方法时设置autoLogin=true并传loginType');
      }
    } else {

      const isLogged = await this.client.pong();
      if (!isLogged && autoLogin && loginType) {
        logger.info('[WeiboService] Cookie 失效，自动再次登录...');
        await this.loginWeibo(loginType, cookieStr);
      } else if (!isLogged) {
        throw new Error('WeiboClient 未登录或已失效，请先调用 loginWeibo 或启用 autoLogin');
      }
    }
  }

  /**
   * 自动模式爬取示例: 「搜索微博」
   * - 若未登录, 且 autoLogin=true，会先自动登录
   */
  public async searchWeibo(
    keyword: string,
    page: number = 1,
    autoLogin = false,
    loginType?: 'qrcode' | 'phone' | 'cookie',
    cookieStr?: string
  ): Promise<any> {
    // 确保登录
    await this.ensureLoggedIn(autoLogin, loginType, cookieStr);

    // 继续爬取
    if (!this.client) {
      throw new Error('WeiboClient 初始化失败');
    }
    return this.client.getNoteByKeyword(keyword, page);
  }

  /**
   * 自动模式爬取示例: 「获取微博详情」
   */
  public async getWeiboDetail(
    noteId: string,
    autoLogin = false,
    loginType?: 'qrcode' | 'phone' | 'cookie',
    cookieStr?: string
  ): Promise<any> {
    // 确保登录
    await this.ensureLoggedIn(autoLogin, loginType, cookieStr);

    if (!this.client) {
      throw new Error('WeiboClient 未初始化');
    }
    return this.client.getNoteInfoById(noteId);
  }

  /**
   * 自动模式爬取示例: 「获取用户信息」
   */
  public async getCreatorInfoByID(
    creatorID: string,
    autoLogin = true,
    loginType?: 'qrcode' | 'phone' | 'cookie',
    cookieStr?: string
  ): Promise<any> {
    await this.ensureLoggedIn(autoLogin, loginType, cookieStr);

    if (!this.client) {
      throw new Error('WeiboClient 未初始化');
    }
    return this.client.getCreatorInfoById(creatorID);
  }

  /**
   * 自动模式爬取示例: 「获取用户所有帖子」
   */
  public async getAllNotesByCreatorId(
    creatorId: string,
    crawlInterval: number = 1.0,
    callback?: (notes: any[]) => Promise<void>,
    autoLogin = true,
    loginType?: 'qrcode' | 'phone' | 'cookie',
    cookieStr?: string
  ): Promise<any[]> {
    await this.ensureLoggedIn(autoLogin, loginType, cookieStr);

    if (!this.client) {
      throw new Error('WeiboClient 未初始化');
    }

    // 先获取creator信息，以拿到container_id
    const creatorInfo = await this.client.getCreatorInfoById(creatorId);
    const lfidContainerId = creatorInfo.lfid_container_id;
    if (!lfidContainerId) {
      throw new Error('获取用户容器信息失败, 无法继续');
    }

    const result: any[] = [];
    let notesHasMore = true;
    let sinceId = '';
    let crawlerTotalCount = 0;

    while (notesHasMore) {
      const notesRes = await this.client.getNotesByCreator(creatorId, lfidContainerId, sinceId);
      if (!notesRes) {
        logger.error(`[WeiboService] 用户 ${creatorId} 的数据可能被封禁或无法访问`);
        break;
      }

      sinceId = notesRes.cardlistInfo?.since_id || '0';

      if (!notesRes.cards) {
        logger.info(`[WeiboService] 响应中未找到 'cards'，原始响应: ${JSON.stringify(notesRes)}`);
        break;
      }

      const notes = notesRes.cards.filter((note: any) => note.card_type === 9);
      logger.info(`[WeiboService] 本轮获取到用户 ${creatorId} 的帖子数量: ${notes.length}`);

      if (callback) {
        await callback(notes);
      }

      // sleep
      await new Promise(resolve => setTimeout(resolve, crawlInterval * 1000));

      result.push(...notes);
      crawlerTotalCount += notes.length;

      const total = notesRes.cardlistInfo?.total ?? 0;
      notesHasMore = total > crawlerTotalCount;
    }

    logger.info(`[WeiboService] 用户 ${creatorId} 的所有帖子获取完毕, 总数 = ${result.length}`);
    return result;
  }

  /**
   * 关闭浏览器
   */
  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      logger.info('[WeiboService] 浏览器已关闭');
      this.browser = null;
      this.context = null;
      this.page = null;
      this.client = null;
    }
  }
}
