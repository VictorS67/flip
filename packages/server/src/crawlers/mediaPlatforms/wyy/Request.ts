import axios, { AxiosResponse } from 'axios';
import { logger } from '../../../utils/crawlers/logger.js';     
import { DataFetchError } from '../../../exceptions/crawler.js';      



// 网络请求模块
export class Request{

  private _host = 'https://music.163.com';
  // private _host = 'https://y.music.163.com';
  private _imageAgentHost = 'https://i1.wp.com/';

  public async request(method: string, url: string, extra?: any): Promise<any> {
    const enableReturnResponse = extra?.return_response || false;
    const client = axios.create({

      timeout: 10000, 
    });

    try {
      const response: AxiosResponse = await client.request({
        method,
        url,
        headers: {
          "Accept": "*/*",
          "Accept-Language": "zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4",
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": "appver=2.0.2",
          "cache-control": "no-cache"
        },
        data: extra,
      });

      if (enableReturnResponse) {
        
        return response;
      }

      // const data = response.data;
      // logger.error(`[WyyClient.request] data:${data}`);
      // logger.error(`[WyyClient.request] request ${method}:${url} err, res:${JSON.stringify(data)}`);
      logger.info(`[Wyy request] request done: ${method} : ${url}`);
      return response;

    } catch (error: any) {
      logger.error(`[Wyy srequest] request ${method}:${url} error: ${error.message}`);
      throw error;
    }
  }

}