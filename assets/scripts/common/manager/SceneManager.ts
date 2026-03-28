import { director, Node } from "cc";

/**
 * 场景管理器
 * 负责场景和UI层级的管理
 */
export class SceneManager {
    /**
     * 初始化场景
     */
    static initScene(): void {
        // 子类可以重写此方法实现具体逻辑
    }

    /**
     * 获取Canvas节点
     */
    static getCanvas(): Node | null {
        const scene = director.getScene();
        if (!scene) {
            console.error("[SceneManager] Scene is null");
            return null;
        }
        return scene.getChildByName("Canvas");
    }

    /**
     * 获取区域层（用于显示全屏界面）
     */
    static get areaLayer(): Node | null {
        const canvas = this.getCanvas();
        if (!canvas) {
            return null;
        }
        return canvas.getChildByPath("UIRoot/AreaLayer");
    }

    /**
     * 获取弹窗层（用于显示弹窗界面）
     */
    static get popupLayer(): Node | null {
        const canvas = this.getCanvas();
        if (!canvas) {
            return null;
        }
        return canvas.getChildByPath("UIRoot/PopupLayer");
    }

    /**
     * 获取场景根节点
     */
    static getSceneRoot(): Node | null {
        return director.getScene();
    }

    /**
     * 加载场景
     * @param sceneName 场景名称
     */
    static loadScene(sceneName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            director.loadScene(sceneName, (err) => {
                if (err) {
                    console.error(`[SceneManager] Failed to load scene ${sceneName}:`, err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

