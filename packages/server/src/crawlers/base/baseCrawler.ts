import { BrowserContext, BrowserType } from 'playwright';
export interface PlaywrightProxy {
    host: string;
    port: number;
    username?: string;
    password?: string;
  }


export interface BaseCrawler {
    /**
     * start crawler
     */
    start(): Promise<void>;
  
    /**
     * search
     */
    search(): Promise<void>;
  
    /**
     * launch browser
     * @param chromium - chromium browser
     * @param playwrightProxy - playwright proxy
     * @param userAgent - user agent
     * @param headless - headless mode
     */
    launchBrowser(
      chromium: BrowserType,
      playwrightProxy?: PlaywrightProxy,
      userAgent?: string,
      headless?: boolean
    ): Promise<BrowserContext>;
  }