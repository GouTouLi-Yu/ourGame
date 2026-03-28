import { ResManager } from "../manager/ResManager";
import { JsonAsset } from "cc";

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 配置读取器
 * 负责加载和读取游戏配置文件
 */
export class ConfigReader {
    // configName --> id --> data
    private static _configMap: Map<string, Map<string, any>> = new Map();

    /**
     * 初始化配置读取器
     */
    static init(): void {
        this._configMap = new Map();
    }

    /**
     * 初始化配置（加载所有配置文件）
     * @returns Promise，加载完成后resolve
     */
    static initConfig(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            ResManager.loadConfig("config")
                .then((jsonArr: JsonAsset[]) => {
                    jsonArr.forEach((json) => {
                        const data = json.json;
                        const map = new Map<string, any>();

                        // 假设配置数据是数组格式
                        if (Array.isArray(data)) {
                            for (let i = 0; i < data.length; i++) {
                                const item = data[i];
                                if (item && item.id) {
                                    map.set(item.id, Object.freeze(item));
                                }
                            }
                        } else if (typeof data === 'object') {
                            // 如果是对象格式，遍历所有键
                            for (const key in data) {
                                if (Object.prototype.hasOwnProperty.call(data, key)) {
                                    const item = data[key];
                                    if (item && item.id) {
                                        map.set(item.id, Object.freeze(item));
                                    }
                                }
                            }
                        }

                        this._configMap.set(json.name, Object.freeze(map));
                    });
                    console.log(`[ConfigReader] Loaded ${jsonArr.length} config files`);
                    resolve();
                })
                .catch((error) => {
                    console.error("[ConfigReader] Failed to load config:", error);
                    reject(error);
                });
        });
    }

    /**
     * 深度冻结对象
     */
    private static deepFreeze<T>(obj: T): DeepReadonly<T> {
        Object.freeze(obj);
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (typeof value === "object" && value !== null) {
                    this.deepFreeze(value);
                }
            }
        }
        return obj as DeepReadonly<T>;
    }

    /**
     * 根据表名和ID获取指定字段的数据
     * @param tableName 表名
     * @param id ID
     * @param key 字段名
     * @returns 字段值
     */
    static getDataByIdAndKey(tableName: string, id: string, key: string): any {
        const data = this.getDataById(tableName, id);
        if (!data) {
            return null;
        }
        const val = data[key];
        return this.deepFreeze(val);
    }

    /**
     * 根据表名和ID获取数据
     * @param tableName 表名
     * @param id ID
     * @returns 数据对象
     */
    static getDataById(tableName: string, id: string): any {
        if (!this._configMap.has(tableName)) {
            console.error(`[ConfigReader] Config table "${tableName}" not found`);
            return null;
        }

        const table = this._configMap.get(tableName);
        if (!table) {
            return null;
        }

        if (!table.has(id)) {
            console.error(
                `[ConfigReader] ID "${id}" not found in config table "${tableName}"`
            );
            return null;
        }

        return this.deepFreeze(table.get(id));
    }

    /**
     * 获取表的所有ID
     * @param tableName 表名
     * @returns ID迭代器
     */
    static getAllId(tableName: string): IterableIterator<string> | undefined {
        return this._configMap.get(tableName)?.keys();
    }

    /**
     * 获取整个表的数据
     * @param tableName 表名
     * @returns 表数据Map
     */
    static getData(tableName: string): Map<string, any> | undefined {
        return this._configMap.get(tableName);
    }

    /**
     * 检查表是否存在
     * @param tableName 表名
     * @returns 是否存在
     */
    static hasTable(tableName: string): boolean {
        return this._configMap.has(tableName);
    }

    /**
     * 获取所有表名
     * @returns 表名数组
     */
    static getAllTableNames(): string[] {
        return Array.from(this._configMap.keys());
    }
}

