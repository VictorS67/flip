import {Request} from "./Request.js";
import {UserList} from "./UserList.js";
import {Crypto} from "../../../utils/crawlers/crypto.js";
import { logger } from "../../../utils/crawlers/logger.js";

const request = new Request();

export class UserListHelper{
    // 固定值
    searchUrlList:string = "https://music.163.com/weapi/user/playlist";
    searchUrlRank:string = "https://music.163.com/weapi/v1/play/record";
    searchUrlInfo:string = "https://music.163.com/weapi/v1/user/detail/"
    offset:number=0;    //不分页
    limit:number=1000;  // 不分页显示最多1000条
    // 设定值
    userId:number;
    
    // 运行时产生值
    userList:Array<UserList> = new Array<UserList>();
    userRank:Array<object> = new Array<object>();
    constructor(userId:number){
        this.userId = userId;
    }

    /**
     * 获取用户所有歌单
     */
    public async getAllLists(){
        let originData = {
            "offset": this.offset,
            "uid": this.userId,
            "limit": this.limit,
            "csrf_token": ""
        }
        let timer =0;
        let cryptoData;
        let urlData;
        let postResult: any;
        do{
            cryptoData = Crypto.encrypt(originData);
            urlData = `params=${cryptoData.params}&encSecKey=${cryptoData.encSecKey}`;
            postResult = await request.request('POST', this.searchUrlList, urlData);
            timer++;
          }while (postResult.data == "" && timer<20);
        this.userList = UserList.buildByPostResult(postResult);
        return this.userList;
    }

    /**
     * 获取用户我喜欢歌单
     */
    public async getILikeList(){
        let originData = {
            "offset": this.offset,
            "uid": this.userId,
            "limit": this.limit,
            "csrf_token": ""
        }
        let timer =0;
        let cryptoData;
        let postResult: any;
        do{
            cryptoData = Crypto.encrypt(originData);
            postResult = await request.request('POST', this.searchUrlList, cryptoData);
            timer++;
            }while (postResult.data == "" && timer<20);
        this.userList = UserList.buildByPostResult(postResult);
        return this.userList[0];
    }

    /**
     * 获取用户的全部播放排行
     */
    public async getAllPlayRank(maxCount: number | null = null): Promise<object[]>{
        maxCount = (maxCount === null || maxCount === undefined) ? 10 : maxCount;

        let originData = {
            "offset": this.offset,
            "uid": this.userId,
            "limit": this.limit,
            "total": "true",
            "type": "0",
            "csrf_token": ""
        }
        let timer =0;
        let cryptoData;
        let postResult: any;
        try {

            do{
                cryptoData = Crypto.encrypt(originData);
                postResult = await request.request('POST', this.searchUrlRank, cryptoData);
                timer++;
            }while (postResult.data == "" && timer<20);

            let rank:Array<object> = new Array<object>();
            let lists:any = postResult.data.allData;
            
            let i = 0;
            while (i < lists.length && i < maxCount){

                let list = lists[i];

                let artistList = new Array<object>();
                for (let artist of list.song.ar){
                    artistList.push(artist.name);
                };

                let song = {
                    name: list.song.name,
                    // playCount: list.playCount,
                    artists: artistList,
                    album: list.song.al.name,
                };
                
                rank.push(song);

                i++;
            };

            logger.info(`[Wyy getAllPlayRank] rank length: ${rank.length}`);

            this.userRank = rank;
            return this.userRank;
        } catch (error: any) {
            logger.error(`[Wyy getAllPlayRank] cannot get user's play rank, error: ${error.message}`);
            throw error;
        };
    }


    /**
     * 获取用户最近一周的播放排行
     */
    public async getRecentPlayRank(maxCount: number | null = null): Promise<object[]>{
        maxCount = (maxCount === null || maxCount === undefined) ? 10 : maxCount;

        let originData = {
            "offset": this.offset,
            "uid": this.userId,
            "limit": this.limit,
            "total": "true",
            "type": "1",
            "csrf_token": ""
        }
        let timer =0;
        let cryptoData;
        let postResult: any;
        try {

            do{
                cryptoData = Crypto.encrypt(originData);
                postResult = await request.request('POST', this.searchUrlRank, cryptoData);
                timer++;
            }while (postResult.data == "" && timer<20);
            // logger.info(`[WyyClient.request] playRank got: ${Object.keys(postResult)}`);

            let rank:Array<object> = new Array<object>();
            let lists:any = postResult.data.weekData;
            // logger.info(`[WyyClient.request] playRank: ${JSON.stringify(postResult.data)}`);
            let i = 0;
            while (i < lists.length && i < maxCount){

                let list = lists[i];

                let artistList = new Array<object>();
                for (let artist of list.song.ar){
                    artistList.push(artist.name);
                };

                // logger.info(`[WyyClient.request] playRank got: ${Object.keys(list)}`);

                let song = {
                    name: list.song.name,
                    // playCount: list.playCount,
                    artists: artistList,
                    album: list.song.al.name,
                };
                
                rank.push(song);

                i++;
            };

            logger.info(`[Wyy getRecentPlayRank] rank length: ${rank.length}`);

            this.userRank = rank;
            return this.userRank;
        } catch (error: any) {
            logger.error(`[Wyy getRecentPlayRank] cannot get user's play rank, error: ${error.message}`);
            throw error;
        };
    } 


    /**
     * 获取用户信息
     */
    public async getUserInfo(maxCount: number | null = null): Promise<object[]>{
        maxCount = (maxCount === null || maxCount === undefined) ? 10 : maxCount;

        let originData = {
            "offset": this.offset,
            "uid": this.userId,
            "limit": this.limit,
            "total": "true",
            "type": "1",
            "csrf_token": ""
        }
        let timer =0;
        let cryptoData;
        let postResult: any;
        try {

            do{
                cryptoData = Crypto.encrypt(originData);
                postResult = await request.request('POST', `${this.searchUrlInfo}${this.userId}`, cryptoData);
                timer++;
            }while (postResult.data == "" && timer<20);

            let data:any = postResult.data;

            logger.info(`[Wyy getUserInfo] info done`);

            return data;


        } catch (error: any) {
            logger.error(`[Wyy getUserInfo] cannot get user's info, error: ${error.message}`);
            throw error;
        };
    } 

}