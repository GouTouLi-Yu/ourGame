import { _decorator, Component, DynamicAtlasManager } from "cc";
import { Framework } from "./common/Framework";
import { GameManager } from "./common/manager/GameManager";
import { Debug } from "./common/debug/Debug";

const { ccclass, property } = _decorator;

/**
 * 游戏主入口
 * 负责框架初始化和游戏启动
 */
@ccclass("Main")
export class Main extends Component {
    /**
     * 组件加载时调用
     */
    protected onLoad(): void {
        // 启用动态图集管理器（优化小图纹理）
        DynamicAtlasManager.instance.enabled = true;
        
        // 初始化静态类（同步初始化）
        this.initStaticClass();
    }

    /**
     * 组件启动时调用
     */
    protected start(): void {
        // 异步初始化框架和配置
        this.initFramework()
            .then(() => {
                // 框架初始化完成后，启动游戏
                this.startGame();
            })
            .catch((error) => {
                console.error("[Main] Framework initialization failed:", error);
                Debug.error("框架初始化失败，游戏无法启动", error);
            });
    }

    /**
     * 初始化静态类（同步初始化）
     * 这些类不需要异步操作，可以在onLoad中直接初始化
     */
    private initStaticClass(): void {
        // 注意：这里只初始化不需要异步的静态类
        // 其他需要异步初始化的类会在Framework.init()中处理
        console.log("[Main] Static classes initialized");
    }

    /**
     * 初始化框架（异步）
     * @returns Promise，初始化完成后resolve
     */
    private async initFramework(): Promise<void> {
        console.log("[Main] Starting framework initialization...");
        
        try {
            // 使用Framework统一初始化
            await Framework.init({
                initConfig: true,      // 初始化配置
                configPath: "config",  // 配置路径
                debugMode: true       // 启用调试模式（生产环境可设为false）
            });
            
            console.log("[Main] Framework initialization completed");
        } catch (error) {
            console.error("[Main] Framework initialization error:", error);
            throw error;
        }
    }

    /**
     * 启动游戏
     */
    private startGame(): void {
        console.log("[Main] Starting game...");
        
        // 初始化游戏管理器
        GameManager.init();
        
        // 启动游戏逻辑
        GameManager.startGame();
        
        console.log("[Main] Game started successfully");
    }

    /**
     * 组件销毁时调用
     */
    protected onDestroy(): void {
        // 清理框架资源
        Framework.cleanup();
        console.log("[Main] Framework cleaned up");
    }
}

