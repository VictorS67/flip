import { BrowserContext, BrowserType } from 'playwright';

// interface PlaywrightProxy {
//   server: string;
//   bypass?: string[];
// }

export interface PlaywrightProxy {
    host: string;
    port: number;
    username?: string;
    password?: string;
  }


export abstract class BaseCrawler {
    /**
     * start crawler
     */
    abstract start(): Promise<void>;
  
    /**
     * search
     */
    abstract search(): Promise<void>;
  
    /**
     * launch browser
     * @param chromium - chromium browser
     * @param playwrightProxy - playwright proxy
     * @param userAgent - user agent
     * @param headless - headless mode
     */
    abstract launchBrowser(
      chromium: BrowserType,
      playwrightProxy?: PlaywrightProxy,
      userAgent?: string,
      headless?: boolean
    ): Promise<BrowserContext>;
  }