// src/services/weibo/WeiboClient.ts

/**
 * 声明：本代码仅供学习和研究目的使用。使用者应遵守以下原则：
 * 1. 不得用于任何商业用途。
 * 2. 使用时应遵守目标平台的使用条款和robots.txt规则。
 * 3. 不得进行大规模爬取或对平台造成运营干扰。
 * 4. 应合理控制请求频率，避免给目标平台带来不必要的负担。
 * 5. 不得用于任何非法或不当的用途。
 *
 * 详细许可条款请参阅项目根目录下的LICENSE文件。
 * 使用本代码即表示您同意遵守上述原则和LICENSE中的所有条款。
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BrowserContext, Page } from 'playwright';
import { DataFetchError } from '../../../exceptions/crawler.js';      
import { logger } from '../../../utils/crawlers/logger.js';                          
import { SearchType } from './field.js';                                  
import config from '../../../crawler.config.js';                          
import { convertCookies, convertStrCookieToDict} from '../../../utils/crawlers/crawler_util.js'; 


interface WeiboClientOptions {
  timeout?: number;
  proxies?: any;                       
  headers: Record<string, string>;
  playwrightPage: Page;               
  cookieDict: Record<string, string>; 
}

export class WeiboClient {
  private proxies: any;
  private timeout: number;
  private headers: Record<string, string>;
  private playwrightPage: Page;
  private cookieDict: Record<string, string>;

  private _host = 'https://m.weibo.cn';
  private _imageAgentHost = 'https://i1.wp.com/';

  constructor(opts: WeiboClientOptions) {
    this.proxies = opts.proxies;
    this.timeout = opts.timeout ?? 10;
    this.headers = opts.headers;
    this.playwrightPage = opts.playwrightPage;
    this.cookieDict = opts.cookieDict;
  }

 
  public async request(method: string, url: string, extra?: any): Promise<any> {
    const enableReturnResponse = extra?.return_response || false;
    // axios 实例
    const client = axios.create({
      proxy: this.proxies,
      timeout: this.timeout * 1000, 
    });

    try {
      const response: AxiosResponse = await client.request({
        method,
        url,
        headers: extra?.headers || this.headers,
        data: extra?.data,
      });

      if (enableReturnResponse) {
        
        return response;
      }

      const data = response.data;
      const okCode = data?.ok;
      if (okCode !== 0 && okCode !== 1) {
        logger.error(`[WeiboClient.request] request ${method}:${url} err, res:${JSON.stringify(data)}`);
        throw new DataFetchError(data?.msg || 'unknown error');
      } else {
        return data?.data || {};
      }
    } catch (error: any) {
      logger.error(`[WeiboClient.request] request ${method}:${url} error: ${error.message}`);
      throw error;
    }
  }

  
  public async get(uri: string, params?: Record<string, any>, customHeaders?: Record<string, string>, extra?: any): Promise<any> {
    let finalUri = uri;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      finalUri = `${uri}?${queryString}`;
    }
    const usedHeaders = customHeaders ? { ...this.headers, ...customHeaders } : this.headers;
    const fullUrl = `${this._host}${finalUri}`;
    return this.request('GET', fullUrl, { headers: usedHeaders, ...extra });
  }

  
  public async post(uri: string, data: Record<string, any>): Promise<any> {
    const fullUrl = `${this._host}${uri}`;
    
    return this.request('POST', fullUrl, {
      data: JSON.stringify(data),
      headers: this.headers,
    });
  }

 
  public async pong(): Promise<boolean> {
    logger.info('[WeiboClient.pong] Begin pong weibo...');
    let pingFlag = false;
    try {
      const uri = '/api/config';
      const respData = await this.request('GET', `${this._host}${uri}`, {
        headers: this.headers
      });
      if (respData?.login) {
        pingFlag = true;
      } else {
        logger.error('[WeiboClient.pong] cookie may be invalid');
      }
    } catch (err) {
      logger.error(`[WeiboClient.pong] Pong weibo failed: ${err}`);
      pingFlag = false;
    }
    return pingFlag;
  }

  
  public async updateCookies(creatorId: string, browserContext: BrowserContext): Promise<void> {
    const page = await browserContext.newPage();
    const url =  `https://m.weibo.cn/u/${creatorId}`;
    logger.info(`The url is ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const cookies = await browserContext.cookies();
    const cookieStr = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    const mWeibocnParams = cookies.find(cookie => cookie.name === 'M_WEIBOCN_PARAMS');
    if (!mWeibocnParams) {
      logger.error('[WeiboClient.updateCookies] M_WEIBOCN_PARAMS is missing');
      throw new Error('M_WEIBOCN_PARAMS is not available');
    }

    logger.info(`[WeiboClient.updateCookies] Updated Cookie: ${cookieStr}`);
    this.headers['Cookie'] = cookieStr;
    this.cookieDict = cookies.reduce((dict, cookie) => {
      dict[cookie.name] = cookie.value;
      return dict;
    }, {} as Record<string, string>);
  }

  
  public async getNoteByKeyword(
    keyword: string,
    page = 1,
    searchType: SearchType = SearchType.DEFAULT
  ): Promise<any> {
    const uri = '/api/container/getIndex';
    const containerid = `100103type=${searchType}&q=${keyword}`;
    const params = {
      containerid,
      page_type: 'searchall',
      page,
    };
    return this.get(uri, params);
  }

  
  public async getNoteComments(midId: string, maxId: number): Promise<any> {
    const uri = '/comments/hotflow';
    const params: Record<string, any> = {
      id: midId,
      mid: midId,
      max_id_type: 0,
    };
    if (maxId > 0) {
      params.max_id = maxId;
    }

    const refererUrl = `https://m.weibo.cn/detail/${midId}`;
    const newHeaders = { ...this.headers, Referer: refererUrl };

    return this.get(uri, params, newHeaders);
  }

  
  public async getNoteAllComments(
    noteId: string,
    crawlInterval: number = 1.0,
    callback?: (nid: string, cList: any[]) => Promise<void>,
    maxCount: number = 10
  ): Promise<any[]> {
    const result: any[] = [];
    let isEnd = false;
    let maxId = -1;

    while (!isEnd && result.length < maxCount) {
      const commentsRes = await this.getNoteComments(noteId, maxId);
      maxId = commentsRes?.max_id || 0;

      let commentList: any[] = commentsRes?.data || [];
      isEnd = maxId === 0;

      
      if (result.length + commentList.length > maxCount) {
        commentList = commentList.slice(0, maxCount - result.length);
      }

      if (callback) {
        await callback(noteId, commentList);
      }
      await sleep(crawlInterval * 1000); 
      result.push(...commentList);

      
      const subCommentResult = await WeiboClient.getCommentsAllSubComments(noteId, commentList, callback);
      result.push(...subCommentResult);
    }
    return result;
  }

  
  public static async getCommentsAllSubComments(
    noteId: string,
    commentList: any[],
    callback?: (nid: string, cList: any[]) => Promise<void>
  ): Promise<any[]> {
    if (!config.ENABLE_GET_SUB_COMMENTS) {
      logger.info('[WeiboClient.getCommentsAllSubComments] sub_comment mode not enabled');
      return [];
    }

    const resSubComments: any[] = [];
    for (const comment of commentList) {
      const subComments = comment.comments;
      if (subComments && Array.isArray(subComments)) {
        if (callback) {
          await callback(noteId, subComments);
        }
        resSubComments.push(...subComments);
      }
    }
    return resSubComments;
  }

  
  public async getNoteInfoById(noteId: string): Promise<any> {
    const url = `${this._host}/detail/${noteId}`;
    const instance = axios.create({
      proxy: this.proxies,
      timeout: this.timeout * 1000,
    });

    const response = await instance.get(url, { headers: this.headers });
    if (response.status !== 200) {
      throw new DataFetchError(`get weibo detail err: ${response.data}`);
    }

    
    const match = /var \$render_data = (\[.*?\])\[0\]/s.exec(response.data);
    if (match) {
      const renderDataJson = match[1];
      const renderDataDict = JSON.parse(renderDataJson);
      const noteDetail = renderDataDict[0]?.status;
      return { mblog: noteDetail };
    } else {
      logger.info('[WeiboClient.getNoteInfoById] 未找到 $render_data 的值');
      return {};
    }
  }

  
  public async getNoteImage(imageUrl: string): Promise<Buffer | null> {
    
    let tmp = imageUrl.replace(/^https:\/\//, '');
    const subUrl = tmp.split('/');

    let finalPath = '';
    for (let i = 0; i < subUrl.length; i++) {
      if (i === 1) {
        finalPath += 'large/'; // 获取大图
      } else if (i === subUrl.length - 1) {
        finalPath += subUrl[i];
      } else {
        finalPath += subUrl[i] + '/';
      }
    }
    const finalUri = `${this._imageAgentHost}${finalPath}`;

    const instance = axios.create({
      proxy: this.proxies,
      timeout: this.timeout * 1000,
      responseType: 'arraybuffer'
    });
    const resp = await instance.get(finalUri, { headers: this.headers });
    if (resp.statusText !== 'OK') {
      logger.error(`[WeiboClient.getNoteImage] request ${finalUri} err, res:${resp.data}`);
      return null;
    }
    return resp.data; // Buffer
  }

  public async getCreatorContainerInfo(creatorId: string): Promise<any> {
    await this.updateCookies(creatorId, this.playwrightPage.context());

    const response = await this.get(`/u/${creatorId}`, undefined, undefined, { return_response: true });

    const cookieHeaders = response.headers['set-cookie'];
    if (!cookieHeaders) {
      logger.error('[WeiboClient.getCreatorContainerInfo] No cookies in response');
      throw new DataFetchError('get containerid failed');
    }
  
    const mWeibocnParams = cookieHeaders.find((header: string) => header.includes('M_WEIBOCN_PARAMS='));
    if (!mWeibocnParams) {
      logger.error('[WeiboClient.getCreatorContainerInfo] M_WEIBOCN_PARAMS missing in cookies');
      throw new DataFetchError('get containerid failed');
    }
  
    const decodedParams = decodeURIComponent(mWeibocnParams.split(';')[0].split('=')[1]);
    const paramsDict = new URLSearchParams(decodedParams);
  
    return {
      fid_container_id: paramsDict.get('fid') || '',
      lfid_container_id: paramsDict.get('lfid') || '',
    };
  }
  
  
  public async getCreatorInfoById(creatorId: string): Promise<any> {
   
    const containerInfo = await this.getCreatorContainerInfo(creatorId);

  if (!containerInfo.fid_container_id || !containerInfo.lfid_container_id) {
    logger.error('[WeiboClient.getCreatorInfoById] get containerid failed');
    throw new DataFetchError('get containerid failed');
  }

  const uri = '/api/container/getIndex';
  const params = {
    jumpfrom: 'weibocom',
    type: 'uid',
    value: creatorId,
    containerid: containerInfo.fid_container_id,
  };

  const userRes = await this.get(uri, params);

  if (userRes?.tabsInfo?.tabs) {
    const tabs = userRes.tabsInfo.tabs;
    for (const tab of tabs) {
      if (tab.tabKey === 'weibo') {
        containerInfo.lfid_container_id = tab.containerid;
        break;
      }
    }
  }

  return { ...userRes, ...containerInfo };
  }

  
  public async getNotesByCreator(creator: string, containerId: string, sinceId = '0'): Promise<any> {
    const uri = '/api/container/getIndex';
    const params = {
      jumpfrom: 'weibocom',
      type: 'uid',
      value: creator,
      containerid: containerId,
      since_id: sinceId,
    };
    return this.get(uri, params);
  }

  
  public async getAllNotesByCreatorId(
    creatorId: string,
    containerId: string,
    crawlInterval = 1.0,
    callback?: (notes: any[]) => Promise<void>
  ): Promise<any[]> {
    const result: any[] = [];
    let notesHasMore = true;
    let sinceId = '';
    let crawlerTotalCount = 0;

    while (notesHasMore) {
      const notesRes = await this.getNotesByCreator(creatorId, containerId, sinceId);
      if (!notesRes) {
        logger.error(`[WeiboClient.getAllNotesByCreatorId] maybe banned, cannot access data`);
        break;
      }
      sinceId = notesRes?.cardlistInfo?.since_id || '0';
      if (!notesRes.cards) {
        logger.info(`[WeiboClient.getAllNotesByCreatorId] No 'cards' key found in response: ${JSON.stringify(notesRes)}`);
        break;
      }
      const notes = notesRes.cards;
      logger.info(`[WeiboClient.getAllNotesByCreatorId] user_id:${creatorId}, notes.length = ${notes.length}`);

      const filteredNotes = notes.filter((note: any) => note.card_type === 9);
      if (callback) {
        await callback(filteredNotes);
      }
      await sleep(crawlInterval * 1000);
      result.push(...filteredNotes);

      crawlerTotalCount += 10;
      const total = notesRes?.cardlistInfo?.total || 0;
      notesHasMore = total > crawlerTotalCount;
    }
    return result;
  }
}
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

