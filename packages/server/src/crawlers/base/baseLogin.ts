


export abstract class BaseLogin {
    abstract begin(): Promise<void>;
  
    abstract loginByQrcode(): Promise<void>;
  
    // abstract loginByMobile(): Promise<void>;
  
    // abstract loginByCookies(): Promise<void>;
  }
  