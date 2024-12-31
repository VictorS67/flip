// server/controllers/userController.ts
import { Request, Response } from 'express';
import { convertStringToNumberService } from '../../services/user/index.js';

/**
 * 接收请求中的字符串，调用 Service 进行转换，返回结果
 */
export const convertStringToNumberController = (req: Request, res: Response) => {
  try {
    const { inputStr } = req.body; // 前端请求体里带的参数
    const result = convertStringToNumberService(inputStr);

    // 返回 JSON 格式
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};
