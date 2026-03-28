/** 
 * @Author: liuyitong@ourpalm.com
 * @Date: 2025-03-08 15:31:12
 * @LastEditors: liuyitong@ourpalm.com
 * @LastEditTime: 2025-03-15 15:32:05
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\core\EnumType.ts
 * @Description: File description
 */
/*
 * @Author: wangshuaihua@playcarb.com
 * @Date: 2023-03-22 10:41:50
 * @LastEditors: wangshuaihua@playcarb.com
 * @LastEditTime: 2025-05-12 15:23:49
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\core\EnumType.ts
 * @Description: File Description
 */

export let SERVER_DELETE_FLAG = "$nil"
export let IS_SERVER_DELETE_FLAG = (value) => {
    return value == SERVER_DELETE_FLAG
}
export let REQUEST_OK_CODE = 0;

/** 同步类型 */
export enum SyncType {
    /** 登录 */
    kData = 1,
    /** 同步 */
    kDiff = 2,
    /** 删除 */
    kDel = 3,
}

/** 服务器同步数据的key */
export enum SyncKey {
    /**组织活跃提示 */
    kUnionActive = 1,

    kShowAddHeros = 2,

    kShowHerosSeason = 3,


    /** 章节赛季通知 */
    kChapterNewSeason = 4,
    /** 竞技场赛季通知 */
    kArenaNewSeason = 5,
    /** 王者挑战 */
    kDailyBossNewSeason = 6,
    kMonopolyFirstBerserker = 7,
    /** 爬塔 */
    kTowerNewSeason = 8,
    /** 组织boss */
    kUnionBossNewSeason = 9,
    /** 主线关卡 */
    kMainBlockNewSeason = 10,
    /**赛季全新冒险活动是否打开过*/
    kSeasonLetterActivityOpen = 11,
    /** 海岛新区域解锁 */
    kPirateNewAreaUnlocked = 12,
    /** 赛季全新冒险活动是否打开过*/
    kSeasonTechNewSeason = 13,
}


