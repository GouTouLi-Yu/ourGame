import { DisposableObject } from "../disposableObject/DisposableObject";
import { EventManager } from "../manager/EventManager";

/**
 * 事件对象基类
 * 提供事件派发和监听功能
 */
export class EventObject extends DisposableObject {
    /**
     * 移除所有事件监听器
     */
    removeAllListeners(): void {
        // 子类可以重写此方法实现具体逻辑
    }

    /**
     * 派发事件
     * @param event 事件类型
     * @param args 事件参数
     */
    dispatchEvent(event: number, args?: any): void {
        EventManager.dispatchEvent(event, args);
    }

    /**
     * 映射事件监听器
     * @param event 事件类型
     * @param target 目标对象
     * @param callback 回调函数
     */
    mapEventListener(event: number, target: any, callback: Function): void {
        EventManager.addEventListener(event, target, callback.bind(target));
    }

    /**
     * 移除事件监听器
     * @param event 事件类型
     */
    removeEventListener(event: number): void {
        EventManager.removeEventListener(event, this);
    }
}

