import { BrowserContext } from 'playwright';

export interface BaseApiClient {
  request(
    method: string,
    url: string,
    options?: Record<string, any>
  ): Promise<any>;

  updateCookies(creatorId:string, browserContext: BrowserContext): Promise<void>;
}
