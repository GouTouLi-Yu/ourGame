/**
 * 依赖注入容器
 * 提供单例管理功能，确保每个类只有一个实例
 */
type Constructor<T = {}> = new (...args: any[]) => T;

interface Initializable {
    initialize?(): void;
}

interface Destroyable {
    destroy?(): void;
}

export class Injector {
    private static classMap: Map<Constructor, any> = new Map<Constructor, any>();

    /**
     * 获取类的单例实例
     * @param classType 类的构造函数
     * @returns 类的单例实例
     */
    static getInstance<T>(classType: Constructor<T>): T {
        // 先尝试获取已存在的实例（性能优化：减少一次has操作）
        let instance = this.classMap.get(classType);
        
        if (instance !== undefined) {
            return instance;
        }

        // 如果不存在，创建新实例并存储到Map中
        try {
            instance = new classType();
            this.classMap.set(classType, instance);

            // 如果实例有initialize方法，调用它
            if (typeof (instance as Initializable).initialize === 'function') {
                (instance as Initializable).initialize!();
            }

            return instance;
        } catch (error) {
            console.error(`[Injector] Failed to create instance of ${classType.name}:`, error);
            throw error;
        }
    }

    /**
     * 初始化Injector（清空所有已注册的实例）
     */
    static init(): void {
        this.clear();
    }

    /**
     * 清空所有已注册的实例
     * 如果实例有destroy方法，会在清理前调用
     */
    static clear(): void {
        // 在清理前调用所有实例的destroy方法（如果有）
        this.classMap.forEach((instance) => {
            if (typeof (instance as Destroyable).destroy === 'function') {
                try {
                    (instance as Destroyable).destroy!();
                } catch (error) {
                    console.error('[Injector] Error calling destroy method:', error);
                }
            }
        });
        this.classMap.clear();
    }

    /**
     * 删除指定类的实例
     * 如果实例有destroy方法，会在删除前调用
     * @param classType 类的构造函数
     */
    static delete<T>(classType: Constructor<T>): boolean {
        const instance = this.classMap.get(classType);
        if (instance !== undefined) {
            // 如果实例有destroy方法，调用它
            if (typeof (instance as Destroyable).destroy === 'function') {
                try {
                    (instance as Destroyable).destroy!();
                } catch (error) {
                    console.error('[Injector] Error calling destroy method:', error);
                }
            }
        }
        return this.classMap.delete(classType);
    }

    /**
     * 检查指定类是否已注册实例
     * @param classType 类的构造函数
     * @returns 如果已注册返回true，否则返回false
     */
    static hasClass<T>(classType: Constructor<T>): boolean {
        return this.classMap.has(classType);
    }

    /**
     * 获取已注册实例的数量
     * @returns 已注册实例的数量
     */
    static getSize(): number {
        return this.classMap.size;
    }
}

