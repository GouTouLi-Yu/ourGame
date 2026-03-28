/**
 * 框架统一导出文件
 * 方便统一导入框架模块
 */

// 核心框架
export { Framework } from "./Framework";

// 依赖注入
export { Injector } from "./Injector/Injector";

// 基础类
export { SingleTon } from "./SingleTon";
export { DisposableObject } from "./disposableObject/DisposableObject";
export { EventObject } from "./event/EventObject";

// 事件系统
export { EventType } from "./event/EventType";
export { EventManager } from "./manager/EventManager";

// 管理器
export { GameManager } from "./manager/GameManager";
export { ResManager } from "./manager/ResManager";
export { SceneManager } from "./manager/SceneManager";
export { UIManager, EMediatorType, IMediator } from "./manager/UIManager";
export { PlayerDataManager } from "./manager/PlayerDataManager";

// 数据存储
export { DataStore } from "./dataStore/DataStore";

// 配置系统
export { ClassConfig } from "./config/ClassConfig";
export { GameConfig } from "./config/GameConfig";
export { ViewConfig, IViewConfig } from "./config/ViewConfig";
export { ConfigReader, DeepReadonly } from "./ConfigReader/ConfigReader";

// 调试工具
export { Debug } from "./debug/Debug";

// 字符串管理
export { Strings } from "./strings/Strings";
export { stringsMap } from "./strings/StringConstants";

