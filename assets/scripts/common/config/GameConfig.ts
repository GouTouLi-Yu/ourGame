import { ConfigReader } from "../ConfigReader/ConfigReader";

/**
 * 游戏配置管理器
 * 提供游戏配置数据的访问接口
 */
export class GameConfig {
    /** 玩家所有数据的存储键 */
    static playerAllDataKey: string = "player_all_data";

    /**
     * 获取配置数据
     * @param configName 配置表名
     * @param id 配置ID（可选，如果不提供则返回整个表）
     * @returns 配置数据
     */
    static getConfig(configName: string, id?: string): any {
        if (id) {
            return ConfigReader.getDataById(configName, id);
        }
        return ConfigReader.getData(configName);
    }

    /**
     * 获取配置数据的指定字段
     * @param configName 配置表名
     * @param id 配置ID
     * @param key 字段名
     * @returns 字段值
     */
    static getConfigField(configName: string, id: string, key: string): any {
        return ConfigReader.getDataByIdAndKey(configName, id, key);
    }

    /**
     * 获取配置表的所有ID
     * @param configName 配置表名
     * @returns ID迭代器
     */
    static getAllConfigIds(configName: string): IterableIterator<string> | undefined {
        return ConfigReader.getAllId(configName);
    }
}

