import { Injector } from "./Injector/Injector";
import { EventManager } from "./manager/EventManager";
import { GameManager } from "./manager/GameManager";
import { ResManager } from "./manager/ResManager";
import { UIManager } from "./manager/UIManager";
import { ConfigReader } from "./ConfigReader/ConfigReader";
import { ClassConfig } from "./config/ClassConfig";
import { Debug } from "./debug/Debug";

/**
 * 框架初始化器
 * 统一管理框架的初始化流程
 */
export class Framework {
    private static _isInitialized: boolean = false;

    /**
     * 初始化框架
     * @param options 初始化选项
     */
    static async init(options?: {
        initConfig?: boolean;      // 是否初始化配置
        configPath?: string;       // 配置路径
        debugMode?: boolean;      // 是否启用调试模式
    }): Promise<void> {
        if (this._isInitialized) {
            console.warn("[Framework] Framework already initialized");
            return;
        }

        const {
            initConfig = true,
            configPath = "config",
            debugMode = true
        } = options || {};

        console.log("========== 框架初始化开始 ==========");

        try {
            // 1. 设置调试模式
            Debug.setDebugMode(debugMode);

            // 2. 初始化依赖注入容器
            Injector.init();
            console.log("✓ Injector initialized");

            // 3. 初始化事件管理器
            EventManager.init();
            console.log("✓ EventManager initialized");

            // 4. 初始化资源管理器
            ResManager.init();
            console.log("✓ ResManager initialized");

            // 5. 初始化UI管理器
            UIManager.init();
            console.log("✓ UIManager initialized");

            // 6. 初始化配置读取器
            ConfigReader.init();
            console.log("✓ ConfigReader initialized");

            // 7. 加载配置文件（如果需要）
            if (initConfig) {
                await ConfigReader.initConfig();
                console.log("✓ Config files loaded");
            }

            // 8. 初始化游戏管理器
            GameManager.init();
            console.log("✓ GameManager initialized");

            this._isInitialized = true;
            console.log("========== 框架初始化完成 ==========");
        } catch (error) {
            console.error("[Framework] Framework initialization failed:", error);
            throw error;
        }
    }

    /**
     * 清理框架
     */
    static cleanup(): void {
        console.log("========== 框架清理开始 ==========");

        // 清理所有管理器
        EventManager.clear();
        ResManager.clearAllAssets();
        Injector.clear();
        ClassConfig.destroy();
        ConfigReader.init(); // 重新初始化以清空配置

        this._isInitialized = false;
        console.log("========== 框架清理完成 ==========");
    }

    /**
     * 检查框架是否已初始化
     */
    static get isInitialized(): boolean {
        return this._isInitialized;
    }
}

