export interface BaseLogin {
    begin(): Promise<void>;
  
    loginByQrcode(): Promise<void>;
  
    loginByMobile(): Promise<void>;
  
    loginByCookies(): Promise<void>;
  }
  