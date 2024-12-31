/**
 * 将输入字符串转换为数字
 */
import { baseConfig } from "../../crawler.config.js";
export const convertStringToNumberService = (inputStr: string): number => {
    // parseInt 仅作示例，更健壮的做法需要判断是否 NaN 等
    // return parseInt(inputStr, 10);
    return baseConfig.PUBLISH_TIME_TYPE;
  };