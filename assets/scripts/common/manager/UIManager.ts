import { Node } from "cc";
import { ClassConfig } from "../config/ClassConfig";
import { Injector } from "../Injector/Injector";
import { ResManager } from "./ResManager";
import { SceneManager } from "./SceneManager";

/**
 * 中介者类型枚举
 */
export enum EMediatorType {
    area = "area",    // 区域视图（全屏）
    popup = "popup"   // 弹窗视图
}

/**
 * 中介者接口
 */
export interface IMediator {
    type: EMediatorType;
    fullPath: string;
    view?: Node;
    onRegister?(): void;
    enterWithData?(params?: any): void;
    dispose?(): void;
}

/**
 * UI管理器
 * 负责UI界面的打开、关闭和管理
 */
export class UIManager {
    private static areaViewOpenedMap: Map<string, IMediator> = new Map();
    private static popupViewOpenedMap: Map<string, IMediator> = new Map();
    private static openNingView: string | null = null;

    /**
     * 初始化UI管理器
     */
    static init(): void {
        this.areaViewOpenedMap = new Map();
        this.popupViewOpenedMap = new Map();
        this.openNingView = null;
    }

    private static _isGoing: boolean = false;

    /**
     * 跳转界面
     * @param viewName 界面名字，必须以View结尾（如：MainMenuView）
     * @param params 传递的参数
     * @returns 界面节点
     */
    static gotoView(viewName: string, params?: any): Promise<Node | null> {
        if (this._isGoing) {
            console.warn(`[UIManager] Already navigating to another view`);
            return Promise.resolve(null);
        }

        if (!viewName.endsWith("View")) {
            console.error(`[UIManager] View name must end with "View": ${viewName}`);
            return Promise.resolve(null);
        }

        this._isGoing = true;
        this.openNingView = viewName;

        // 传进来MainMenuView，得到MainMenu
        const viewNameWithOutSuffix = viewName.slice(0, -4);
        const layerName = viewNameWithOutSuffix + "Layer";
        const mediatorName = viewNameWithOutSuffix + "Mediator";

        // 从ClassConfig获取Mediator类
        const MediatorClass = ClassConfig.getClass(mediatorName);
        if (!MediatorClass) {
            console.error(`[UIManager] ${mediatorName} not found in ClassConfig`);
            this._isGoing = false;
            this.openNingView = null;
            return Promise.resolve(null);
        }

        // 从Injector获取Mediator实例
        const mediator: IMediator = Injector.getInstance(MediatorClass);
        if (!mediator) {
            console.error(`[UIManager] Failed to get mediator instance: ${mediatorName}`);
            this._isGoing = false;
            this.openNingView = null;
            return Promise.resolve(null);
        }

        const layerPath = mediator.fullPath + layerName;

        return ResManager.loadPrefab(layerPath)
            .then((node: Node | null) => {
                if (!node) {
                    console.error(`[UIManager] Failed to load prefab: ${layerPath}`);
                    this._isGoing = false;
                    this.openNingView = null;
                    return null;
                }

                // 根据类型选择父节点
                const parentNode = mediator.type === EMediatorType.popup
                    ? SceneManager.popupLayer
                    : SceneManager.areaLayer;

                if (!parentNode) {
                    console.error(`[UIManager] Failed to get parent node for ${viewName}`);
                    this._isGoing = false;
                    this.openNingView = null;
                    return null;
                }

                parentNode.addChild(node);
                return node;
            })
            .then((node: Node | null) => {
                if (!node) {
                    this._isGoing = false;
                    this.openNingView = null;
                    return null;
                }

                mediator.view = node;

                // 调用Mediator的生命周期方法
                if (mediator.onRegister) {
                    mediator.onRegister();
                }
                if (mediator.enterWithData) {
                    mediator.enterWithData(params);
                }

                // 根据类型存储到对应的Map
                if (mediator.type === EMediatorType.popup) {
                    this.popupViewOpenedMap.set(viewName, mediator);
                } else {
                    // 区域视图只能同时存在一个，关闭之前的
                    for (const [oldViewName, oldMediator] of this.areaViewOpenedMap.entries()) {
                        if (oldMediator.dispose) {
                            oldMediator.dispose();
                        }
                        this.areaViewOpenedMap.delete(oldViewName);
                    }
                    this.areaViewOpenedMap.set(viewName, mediator);
                }

                this._isGoing = false;
                this.openNingView = null;
                return node;
            })
            .catch((error) => {
                console.error(`[UIManager] Error loading view ${viewName}:`, error);
                this._isGoing = false;
                this.openNingView = null;
                return null;
            });
    }

    /**
     * 将视图绑定到节点（用于Panel等）
     * @param viewNode Panel视图的根节点
     * @param panelName 必须以Panel结尾
     * @param params 传递的参数
     */
    static bindViewToNode(viewNode: Node, panelName: string, params?: any): void {
        if (!panelName.endsWith("Panel")) {
            console.error(`[UIManager] Panel name must end with "Panel": ${panelName}`);
            return;
        }

        const mediatorName = panelName;
        const MediatorClass = ClassConfig.getClass(mediatorName);
        if (!MediatorClass) {
            console.error(`[UIManager] ${mediatorName} not found in ClassConfig`);
            return;
        }

        // 从Injector获取Mediator实例
        const mediator: IMediator = Injector.getInstance(MediatorClass);
        mediator.view = viewNode;

        if (mediator.onRegister) {
            mediator.onRegister();
        }
        if (mediator.enterWithData) {
            mediator.enterWithData(params);
        }
    }

    /**
     * 移除视图
     * @param viewName 视图名称
     */
    static removeView(viewName: string): void {
        // 从区域视图Map中移除
        const areaMediator = this.areaViewOpenedMap.get(viewName);
        if (areaMediator) {
            if (areaMediator.dispose) {
                areaMediator.dispose();
            }
            if (areaMediator.view) {
                areaMediator.view.destroy();
            }
            this.areaViewOpenedMap.delete(viewName);
            return;
        }

        // 从弹窗视图Map中移除
        const popupMediator = this.popupViewOpenedMap.get(viewName);
        if (popupMediator) {
            if (popupMediator.dispose) {
                popupMediator.dispose();
            }
            if (popupMediator.view) {
                popupMediator.view.destroy();
            }
            this.popupViewOpenedMap.delete(viewName);
        }
    }

    /**
     * 关闭所有弹窗
     */
    static closeAllPopups(): void {
        for (const [viewName, mediator] of this.popupViewOpenedMap.entries()) {
            if (mediator.dispose) {
                mediator.dispose();
            }
            if (mediator.view) {
                mediator.view.destroy();
            }
        }
        this.popupViewOpenedMap.clear();
    }

    /**
     * 获取当前打开的区域视图
     */
    static getCurrentAreaView(): string | null {
        const keys = Array.from(this.areaViewOpenedMap.keys());
        return keys.length > 0 ? keys[0] : null;
    }
}

