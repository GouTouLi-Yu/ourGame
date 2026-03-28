import { sys } from "cc";

/**
 * 数据存储管理器
 * 提供本地数据持久化功能
 */
export class DataStore {
    /**
     * 保存数字数据
     * @param key 键名
     * @param value 数值
     */
    static saveNumData(key: string, value: number): void {
        if (key === null || key === undefined) {
            console.error("[DataStore] Key cannot be null or undefined");
            return;
        }
        sys.localStorage.setItem(key, value.toString());
    }

    /**
     * 获取数字数据
     * @param key 键名
     * @returns 数值，如果不存在或无效则返回0
     */
    static getNumData(key: string): number {
        if (key === null || key === undefined) {
            console.error("[DataStore] Key cannot be null or undefined");
            return 0;
        }

        const value = sys.localStorage.getItem(key);
        if (value === null || value === undefined) {
            return 0;
        }

        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }

    /**
     * 保存字符串数据
     * @param key 键名
     * @param value 字符串值
     */
    static saveStringData(key: string, value: string): void {
        if (key === null || key === undefined) {
            console.error("[DataStore] Key cannot be null or undefined");
            return;
        }
        sys.localStorage.setItem(key, value);
    }

    /**
     * 获取字符串数据
     * @param key 键名
     * @returns 字符串值，如果不存在则返回null
     */
    static getStringData(key: string): string | null {
        if (key === null || key === undefined) {
            console.error("[DataStore] Key cannot be null or undefined");
            return null;
        }
        return sys.localStorage.getItem(key);
    }

    /**
     * 保存对象数据（JSON序列化）
     * @param key 键名
     * @param value 对象值
     */
    static saveObjectData(key: string, value: Object): void {
        if (key === null || key === undefined) {
            console.error("[DataStore] Key cannot be null or undefined");
            return;
        }

        try {
            const jsonStr = JSON.stringify(value);
            console.log(`[DataStore] Saving data for key: ${key}`, value);
            sys.localStorage.setItem(key, jsonStr);
        } catch (error) {
            console.error(`[DataStore] Failed to save object data for key ${key}:`, error);
        }
    }

    /**
     * 获取对象数据（JSON反序列化）
     * @param key 键名
     * @returns 对象值，如果不存在或解析失败则返回空对象
     */
    static getObjectData(key: string): Object {
        if (key === null || key === undefined) {
            console.error("[DataStore] Key cannot be null or undefined");
            return {};
        }

        try {
            const jsonStr = sys.localStorage.getItem(key);
            if (!jsonStr) {
                return {};
            }
            return JSON.parse(jsonStr) ?? {};
        } catch (error) {
            console.error(`[DataStore] Failed to parse object data for key ${key}:`, error);
            return {};
        }
    }

    /**
     * 删除指定键的数据
     * @param key 键名
     */
    static removeData(key: string): void {
        if (key === null || key === undefined) {
            console.error("[DataStore] Key cannot be null or undefined");
            return;
        }
        sys.localStorage.removeItem(key);
    }

    /**
     * 删除所有数据
     */
    static removeAllData(): void {
        sys.localStorage.clear();
        console.log("[DataStore] All data cleared");
    }

    /**
     * 检查指定键是否存在
     * @param key 键名
     * @returns 是否存在
     */
    static hasData(key: string): boolean {
        if (key === null || key === undefined) {
            return false;
        }
        return sys.localStorage.getItem(key) !== null;
    }

    /**
     * 获取所有键名
     * @returns 键名数组
     */
    static getAllKeys(): string[] {
        const keys: string[] = [];
        for (let i = 0; i < sys.localStorage.length; i++) {
            const key = sys.localStorage.key(i);
            if (key) {
                keys.push(key);
            }
        }
        return keys;
    }
}

