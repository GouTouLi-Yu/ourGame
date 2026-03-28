/**
 * 可销毁对象基类
 * 提供生命周期管理和资源清理功能
 */
export class DisposableObject {
    private _isValid: boolean = true;

    /**
     * 获取对象是否有效
     */
    get isValid(): boolean {
        return this._isValid;
    }

    /**
     * 销毁对象
     * 子类可以重写此方法添加自定义清理逻辑
     */
    dispose(): void {
        if (!this._isValid) {
            console.error(`[DisposableObject] ${this.constructor.name} is already disposed`);
            return;
        }
        this._isValid = false;
        this.onDispose();
    }

    /**
     * 子类重写此方法实现自定义清理逻辑
     */
    protected onDispose(): void {
        // 子类实现
    }
}

