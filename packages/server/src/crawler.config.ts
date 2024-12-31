
export interface BaseConfig {
    PLATFORM: string;
    KEYWORDS: string;               // 关键词搜索配置，以英文逗号分隔
    LOGIN_TYPE: string;             // qrcode / phone / cookie
    COOKIES: string;
    SORT_TYPE: string;
    PUBLISH_TIME_TYPE: number;
    CRAWLER_TYPE: string;           // 例如 'search' | 'creator' | 'detail' 等
    UA: string;
    ENABLE_IP_PROXY: boolean;
    CRAWLER_MAX_SLEEP_SEC: number;
    IP_PROXY_POOL_COUNT: number;
    IP_PROXY_PROVIDER_NAME: string;
    HEADLESS: boolean;
    SAVE_LOGIN_STATE: boolean;
    SAVE_DATA_OPTION: string;       // 'csv' | 'db' | 'json'
    USER_DATA_DIR: string;
    START_PAGE: number;
    CRAWLER_MAX_NOTES_COUNT: number;
    MAX_CONCURRENCY_NUM: number;
    ENABLE_GET_IMAGES: boolean;
    ENABLE_GET_COMMENTS: boolean;
    CRAWLER_MAX_COMMENTS_COUNT_SINGLENOTES: number;
    ENABLE_GET_SUB_COMMENTS: boolean;
    XHS_SPECIFIED_NOTE_URL_LIST: string[];
    DY_SPECIFIED_ID_LIST: string[];
    KS_SPECIFIED_ID_LIST: string[];
    BILI_SPECIFIED_ID_LIST: string[];
    WEIBO_SPECIFIED_ID_LIST: string[];
    WEIBO_CREATOR_ID_LIST: string[];
    TIEBA_SPECIFIED_ID_LIST: string[];
    TIEBA_NAME_LIST: string[];
    TIEBA_CREATOR_URL_LIST: string[];
    XHS_CREATOR_ID_LIST: string[];
    DY_CREATOR_ID_LIST: string[];
    BILI_CREATOR_ID_LIST: string[];
    KS_CREATOR_ID_LIST: string[];
    ZHIHU_CREATOR_URL_LIST: string[];
    ENABLE_GET_WORDCLOUD: boolean;
    CUSTOM_WORDS: Record<string, string>; // 自定义词语及分组 { xx: "组名" }
    STOP_WORDS_FILE: string;
    FONT_PATH: string;
  }
  
  export const baseConfig: BaseConfig = {
    // 基础配置
    PLATFORM: "xhs",
    KEYWORDS: "编程副业,编程兼职",
    LOGIN_TYPE: "cookie",
    COOKIES: "",
  
    // 仅对 XHS 有效
    SORT_TYPE: "popularity_descending",
  
    // 仅对抖音有效
    PUBLISH_TIME_TYPE: 10,
  
    // 爬取类型：search(关键词搜索) / detail(帖子详情) / creator(创作者主页数据)
    CRAWLER_TYPE: "creator",
  
    // 自定义User-Agent (对XHS有效)
    UA: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  
    // 是否开启 IP 代理
    ENABLE_IP_PROXY: false,
  
    // 未启用代理时的最大爬取间隔(秒)
    CRAWLER_MAX_SLEEP_SEC: 2,
  
    // 代理IP池数量
    IP_PROXY_POOL_COUNT: 2,
  
    // 代理IP提供商名称
    IP_PROXY_PROVIDER_NAME: "kuaidaili",
  
    // True 无头浏览器，False 会打开浏览器窗口
    HEADLESS: false,
  
    // 是否保存登录状态（cookie等）
    SAVE_LOGIN_STATE: true,
  
    // 数据保存类型：csv / db / json
    SAVE_DATA_OPTION: "json",
  
    // 用户浏览器缓存的目录 (%s 会被替换为 platform)
    USER_DATA_DIR: "%s_user_data_dir",
  
    // 爬取起始页数
    START_PAGE: 1,
  
    // 爬取视频/帖子的数量控制
    CRAWLER_MAX_NOTES_COUNT: 10,
  
    // 并发爬虫数量
    MAX_CONCURRENCY_NUM: 4,
  
    // 是否开启爬图片模式, 默认false
    ENABLE_GET_IMAGES: false,
  
    // 是否开启爬评论模式, 默认true
    ENABLE_GET_COMMENTS: false,
  
    // 爬取一级评论的数量(单视频/帖子)
    CRAWLER_MAX_COMMENTS_COUNT_SINGLENOTES: 10,
  
    // 是否开启爬二级评论模式, 默认false
    ENABLE_GET_SUB_COMMENTS: false,
  
    // 指定小红书需要爬虫的笔记URL列表
    XHS_SPECIFIED_NOTE_URL_LIST: [
      "https://www.xiaohongshu.com/explore/66fad51c000000001b0224b8?xsec_token=AB3rO-QopW5sgrJ41GwN01WCXh6yWPxjSoFI9D5JIMgKw=&xsec_source=pc_search",
    ],
  
    // 指定抖音需要爬取的ID列表
    DY_SPECIFIED_ID_LIST: [
      "7280854932641664319",
      "7202432992642387233",
    ],
  
    // 指定快手平台需要爬取的ID列表
    KS_SPECIFIED_ID_LIST: ["3xf8enb8dbj6uig", "3x6zz972bchmvqe"],
  
    // 指定B站视频 bvid 列表
    BILI_SPECIFIED_ID_LIST: [
      "BV1d54y1g7db",
      "BV1Sz4y1U77N",
      "BV14Q4y1n7jz",
    ],
  
    // 指定微博帖子ID列表
    WEIBO_SPECIFIED_ID_LIST: [
      "4982041758140155",
    ],
  
    // 指定微博创作者ID列表
    WEIBO_CREATOR_ID_LIST: [
      // "5533390220", ...
    ],
  
    // 指定贴吧帖子列表
    TIEBA_SPECIFIED_ID_LIST: [],
  
    // 指定贴吧名称列表
    TIEBA_NAME_LIST: [
      // "盗墓笔记"
    ],
  
    // 指定贴吧创作者主页URL列表
    TIEBA_CREATOR_URL_LIST: [
      "https://tieba.baidu.com/home/main/?id=tb.1.7f139e2e.6CyEwxu3VJruH_-QqpCi6g&fr=frs",
    ],
  
    // 指定小红书创作者ID列表
    XHS_CREATOR_ID_LIST: [
      // "63c9f1a60000000027028708",
    ],
  
    // 指定抖音创作者ID列表(sec_id)
    DY_CREATOR_ID_LIST: [
      "MS4wLjABAAAATJPY7LAlaa5X-c8uNdWkvz0jUGgpw4eeXIwu_8BhvqE",
    ],
  
    // 指定B站创作者ID列表
    BILI_CREATOR_ID_LIST: [
      "20813884",
    ],
  
    // 指定快手创作者ID列表
    KS_CREATOR_ID_LIST: [
      "3x4sm73aye7jq7i",
    ],
  
    // 指定知乎创作者主页URL列表
    ZHIHU_CREATOR_URL_LIST: [
      "https://www.zhihu.com/people/yd1234567",
    ],
  
    // 是否开启生成评论词云图
    ENABLE_GET_WORDCLOUD: false,
  
    // 自定义词语及其分组
    CUSTOM_WORDS: {
      "零几": "年份",
      "高频词": "专业术语",
    },
  
    // 停用(禁用)词文件路径
    STOP_WORDS_FILE: "./docs/hit_stopwords.txt",
  
    // 中文字体文件路径
    FONT_PATH: "./docs/STZHONGS.TTF",
  };
  