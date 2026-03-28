/**
 * 类配置管理器
 * 用于管理类的字符串名称到类构造函数的映射
 */
export class ClassConfig {
    private static _classMap: Map<string, any> = new Map<string, any>();

    /**
     * 销毁类配置
     */
    static destroy(): void {
        this._classMap.clear();
    }

    /**
     * 添加类配置
     * @param className 类名称（字符串）
     * @param classType 类构造函数
     */
    static addClass(className: string, classType: any): void {
        if (this._classMap.has(className)) {
            console.warn(`[ClassConfig] Class ${className} already exists, will be overwritten`);
        }
        this._classMap.set(className, classType);
    }

    /**
     * 获取类构造函数
     * @param className 类名称（字符串）
     * @returns 类构造函数，如果不存在则返回undefined
     */
    static getClass(className: string): any {
        const classType = this._classMap.get(className);
        if (!classType) {
            console.error(`[ClassConfig] Class ${className} not found`);
        }
        return classType;
    }

    /**
     * 删除类配置
     * @param className 类名称（字符串）
     * @returns 是否删除成功
     */
    static deleteClass(className: string): boolean {
        return this._classMap.delete(className);
    }

    /**
     * 检查类是否存在
     * @param className 类名称（字符串）
     * @returns 是否存在
     */
    static hasClass(className: string): boolean {
        return this._classMap.has(className);
    }

    /**
     * 获取所有已注册的类名
     * @returns 类名数组
     */
    static getAllClassNames(): string[] {
        return Array.from(this._classMap.keys());
    }

    /**
     * 获取已注册类的数量
     * @returns 类的数量
     */
    static getClassCount(): number {
        return this._classMap.size;
    }

    /**
     * 根据类构造函数获取类名称
     * @param classType 类构造函数
     * @returns 类名称，如果未找到则返回类构造函数的 name 属性
     */
    static getClassName(classType: any): string {
        // 先尝试从映射中查找
        for (const [className, type] of this._classMap.entries()) {
            if (type === classType) {
                return className;
            }
        }
        // 如果找不到，返回类构造函数的名称
        return classType?.name || "UnknownClass";
    }
}

