import { EventObject } from "../event/EventObject";

/**
 * 事件目标接口
 */
interface IEventTarget {
    addEventListener(type: string, listener: (event: CustomEvent) => void): void;
    removeEventListener(type: string, listener: (event: CustomEvent) => void): void;
    dispatchEvent(event: CustomEvent): void;
}

/**
 * 事件管理器
 * 负责全局事件的派发和监听
 */
export class EventManager {
    private static eventMap: Map<number, Map<EventObject, IEventTarget>> = new Map();

    /**
     * 初始化事件管理器
     */
    static init(): void {
        this.eventMap = new Map();
    }

    /**
     * 派发事件
     * @param eventName 事件类型ID
     * @param data 事件数据
     */
    static dispatchEvent(eventName: number, data?: any): void {
        const eventTargets = this.eventMap.get(eventName);
        if (!eventTargets) {
            return;
        }

        // 创建事件副本，避免在迭代时修改集合
        const targets = Array.from(eventTargets.entries());
        for (const [target, eventTarget] of targets) {
            if (target.isValid) {
                eventTarget.dispatchEvent(
                    new CustomEvent(eventName.toString(), { detail: data })
                );
            } else {
                // 如果目标已失效，移除监听器
                eventTargets.delete(target);
            }
        }
    }

    /**
     * 添加事件监听器
     * @param eventName 事件类型ID
     * @param target 目标对象
     * @param callback 回调函数
     */
    static addEventListener(
        eventName: number,
        target: EventObject,
        callback: Function
    ): void {
        let eventTargetsMap = this.eventMap.get(eventName);
        if (!eventTargetsMap) {
            eventTargetsMap = new Map<EventObject, IEventTarget>();
            this.eventMap.set(eventName, eventTargetsMap);
        }

        // 如果已经存在该目标的监听器，先移除
        if (eventTargetsMap.has(target)) {
            this.removeEventListener(eventName, target);
        }

        const eventTarget: IEventTarget = {
            addEventListener: (type: string, listener: (event: CustomEvent) => void) => {
                // 浏览器环境
                if (typeof window !== 'undefined' && window.addEventListener) {
                    window.addEventListener(type, listener as EventListener);
                }
            },
            removeEventListener: (type: string, listener: (event: CustomEvent) => void) => {
                // 浏览器环境
                if (typeof window !== 'undefined' && window.removeEventListener) {
                    window.removeEventListener(type, listener as EventListener);
                }
            },
            dispatchEvent: (event: CustomEvent) => {
                // 直接调用回调函数
                callback(event.detail);
            }
        };

        // 创建包装的监听器
        const listener = (event: CustomEvent) => {
            if (target.isValid) {
                callback(event.detail);
            } else {
                eventTargetsMap.delete(target);
            }
        };

        eventTarget.addEventListener(eventName.toString(), listener);
        eventTargetsMap.set(target, eventTarget);
    }

    /**
     * 移除事件监听器
     * @param eventName 事件类型ID
     * @param target 目标对象
     */
    static removeEventListener(eventName: number, target: EventObject): void {
        const eventTargetsMap = this.eventMap.get(eventName);
        if (!eventTargetsMap) {
            return;
        }

        const eventTarget = eventTargetsMap.get(target);
        if (!eventTarget) {
            return;
        }

        eventTargetsMap.delete(target);
    }

    /**
     * 清除所有事件监听器
     */
    static clear(): void {
        this.eventMap.clear();
    }

    /**
     * 获取事件监听器数量
     * @param eventName 事件类型ID（可选）
     * @returns 监听器数量
     */
    static getListenerCount(eventName?: number): number {
        if (eventName !== undefined) {
            const eventTargetsMap = this.eventMap.get(eventName);
            return eventTargetsMap ? eventTargetsMap.size : 0;
        }

        let count = 0;
        this.eventMap.forEach((targets) => {
            count += targets.size;
        });
        return count;
    }
}

