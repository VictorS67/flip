import { BrowserContext } from 'playwright';

export abstract class BaseApiClient{
  abstract request(
    method: string,
    url: string,
    options?: Record<string, any>
  ): Promise<any>;

  abstract updateCookies(browserContext: BrowserContext): Promise<void>;
}
