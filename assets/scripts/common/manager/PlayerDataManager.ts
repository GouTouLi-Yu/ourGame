import { GameConfig } from "../config/GameConfig";
import { DataStore } from "../dataStore/DataStore";

/**
 * 玩家数据管理器
 * 负责玩家数据的保存和读取
 */
export class PlayerDataManager {
    /**
     * 保存数据到磁盘
     * @param data 要保存的数据
     * @param key 存储键（可选，默认使用GameConfig.playerAllDataKey）
     */
    static saveDataToDisk(data: any, key?: string): void {
        const dataKey = key || GameConfig.playerAllDataKey;
        DataStore.saveObjectData(dataKey, data);
    }

    /**
     * 清空玩家所有数据（磁盘）
     * @param key 存储键（可选，默认使用GameConfig.playerAllDataKey）
     */
    static clearPlayerAllDataFromDisk(key?: string): void {
        const dataKey = key || GameConfig.playerAllDataKey;
        DataStore.removeData(dataKey);
        console.log(`[PlayerDataManager] Cleared player data for key: ${dataKey}`);
    }

    /**
     * 从磁盘获取玩家数据
     * @param key 存储键（可选，默认使用GameConfig.playerAllDataKey）
     * @returns 玩家数据对象
     */
    static getPlayerDataFromDisk(key?: string): any {
        const dataKey = key || GameConfig.playerAllDataKey;
        const data = DataStore.getObjectData(dataKey);
        return data;
    }

    /**
     * 更新玩家数据的指定字段
     * @param field 字段名
     * @param value 字段值
     * @param key 存储键（可选，默认使用GameConfig.playerAllDataKey）
     */
    static updatePlayerDataField(field: string, value: any, key?: string): void {
        const dataKey = key || GameConfig.playerAllDataKey;
        const data = this.getPlayerDataFromDisk(dataKey);
        data[field] = value;
        this.saveDataToDisk(data, dataKey);
    }

    /**
     * 获取玩家数据的指定字段
     * @param field 字段名
     * @param defaultValue 默认值（如果字段不存在）
     * @param key 存储键（可选，默认使用GameConfig.playerAllDataKey）
     * @returns 字段值
     */
    static getPlayerDataField(field: string, defaultValue: any = null, key?: string): any {
        const data = this.getPlayerDataFromDisk(key);
        return data[field] !== undefined ? data[field] : defaultValue;
    }
}

