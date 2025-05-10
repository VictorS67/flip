import { Request, Response } from 'express';
import { logger } from '../../../utils/crawlers/logger.js';
import { UserListHelper } from '../../../crawlers/mediaPlatforms/wyy/UserListHelper.js';

/**
 * 获取用户信息
 */
export async function getUserInfo(req: Request, res: Response): Promise<void> {
  const { creatorId, crawlInterval, autoLogin, loginType, cookieStr, maxCount } = req.body;

  if (!creatorId) {
    res.status(400).json({ error: '用户 ID (creatorId) 是必填的' });
    return;
  }

  try {
    const rank = await getUserInfoById(
      creatorId,
      crawlInterval || 1.0,
      undefined,
      autoLogin,
      loginType,
      cookieStr,
      maxCount
    );
    res.json({ data: rank });
  } catch (error) {
    res.status(500).json({ error: `获取用户信息失败: ${(error as Error).message}` });
  }
}


async function getUserInfoById(
    creatorId: string,
    crawlInterval: number = 1.0,
    callback?: (notes: any[]) => Promise<void>,
    autoLogin = true,
    loginType?: 'qrcode' | 'phone' | 'cookie',
    cookieStr?: string,
    maxCount: number | null = null
): Promise<object> {
    logger.info(`[Wyy UserInfo] start`);
    let userListHelper = new UserListHelper(Number(creatorId));
    let userInfo = await userListHelper.getUserInfo();

    logger.info(`[Wyy UserInfo] User ${creatorId} Info collection done`);
    return userInfo;
}


/**
 * 获取用户的播放排行
 */
export async function getUserPlayRank(req: Request, res: Response): Promise<void> {
  const { creatorId, crawlInterval, autoLogin, loginType, cookieStr, maxCount } = req.body;

  if (!creatorId) {
    res.status(400).json({ error: '用户 ID (creatorId) 是必填的' });
    return;
  }

  try {
    const rank = await getPlayRankByUserId(
      creatorId,
      crawlInterval || 1.0,
      undefined,
      autoLogin,
      loginType,
      cookieStr,
      maxCount
    );
    res.json({ data: rank });
  } catch (error) {
    res.status(500).json({ error: `获取用户播放排行失败: ${(error as Error).message}` });
  }
}


async function getPlayRankByUserId(
    creatorId: string,
    crawlInterval: number = 1.0,
    callback?: (notes: any[]) => Promise<void>,
    autoLogin = true,
    loginType?: 'qrcode' | 'phone' | 'cookie',
    cookieStr?: string,
    maxCount: number | null = null
): Promise<object> {
    logger.info(`[Wyy Rank] start`);
    let userListHelper = new UserListHelper(Number(creatorId));
    let userAllPlayRank = await userListHelper.getAllPlayRank(maxCount);
    let userRecentPlayRank = await userListHelper.getRecentPlayRank(maxCount);
    let userRank = {
        recent: userRecentPlayRank,
        all: userAllPlayRank
    }

    logger.info(`[Wyy Rank] user ${creatorId} play rank collection done`);
    return userRank;
}

