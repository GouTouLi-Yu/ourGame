/**
 * 视图配置
 * 用于配置视图相关的信息
 */
export interface IViewConfig {
    viewName: string;
    mediatorName: string;
    layerName: string;
    fullPath: string;
    type: "area" | "popup";
}

/**
 * 视图配置数组
 * 可以在这里添加视图配置
 */
export const ViewConfig: IViewConfig[] = [
    // 示例：
    // {
    //     viewName: "MainMenuView",
    //     mediatorName: "MainMenuMediator",
    //     layerName: "MainMenuLayer",
    //     fullPath: "prefabs/ui/",
    //     type: "area"
    // }
];

