import { director } from "cc";

/**
 * 游戏管理器
 * 负责游戏的整体流程控制
 */
export class GameManager {
    private static _isInitialized: boolean = false;

    /**
     * 初始化游戏管理器
     */
    static init(): void {
        if (this._isInitialized) {
            console.warn("[GameManager] Already initialized");
            return;
        }

        this._isInitialized = true;
        this.addGlobalTimer();
    }

    /**
     * 添加全局计时器
     */
    private static addGlobalTimer(): void {
        const scheduler = director.getScheduler();
        scheduler.schedule(
            () => {
                // 全局计时器逻辑
                // 可以在这里添加心跳、定时任务等
            },
            null,
            1, // 每秒执行一次
            Infinity // 无限循环
        );
    }

    /**
     * 启动游戏
     * 由具体游戏实现此方法
     */
    static startGame(): void {
        // 游戏启动逻辑，由具体游戏实现
        console.log("[GameManager] Game started");
    }

    /**
     * 暂停游戏
     */
    static pauseGame(): void {
        director.pause();
    }

    /**
     * 恢复游戏
     */
    static resumeGame(): void {
        director.resume();
    }

    /**
     * 检查是否已初始化
     */
    static get isInitialized(): boolean {
        return this._isInitialized;
    }
}

