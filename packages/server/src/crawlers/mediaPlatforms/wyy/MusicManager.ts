// 音乐功能集合类
import {UserListHelper} from "./UserListHelper.js";
export class MusicManager{

    /**
     * 获取一个读取用户列表的对象
     * @param userId 用户id
     */
    public static getUserListHelper(userId:number):UserListHelper{
      return new UserListHelper(userId);
    }

}