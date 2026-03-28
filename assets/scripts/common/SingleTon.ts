/**
 * 单例基类
 * 继承此类可以快速实现单例模式
 */
export class SingleTon {
    protected static _instance: any;

    static get instance(): any {
        if (!this._instance) {
            this._instance = new (this as any)();
        }
        return this._instance;
    }

    /**
     * 清除单例实例
     */
    static clearInstance(): void {
        this._instance = null;
    }
}

