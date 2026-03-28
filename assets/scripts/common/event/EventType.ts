/**
 * 事件类型管理类
 * 用于生成和管理唯一的事件类型ID
 */
export class EventType {
    private static _eventNum: number = 10000;
    private static _eventTypeMap: Map<string, number> = new Map<string, number>();

    /**
     * 从字符串生成事件类型ID
     * @param eventName 事件名称
     * @returns 事件类型ID
     */
    public static eventTypeFromString(eventName: string): number {
        if (this._eventTypeMap.has(eventName)) {
            throw new Error(`[EventType] Event type "${eventName}" is already registered`);
        }
        this._eventNum++;
        this._eventTypeMap.set(eventName, this._eventNum);
        return this._eventNum;
    }

    /**
     * 获取事件类型ID（如果不存在则创建）
     * @param eventName 事件名称
     * @returns 事件类型ID
     */
    public static getEventType(eventName: string): number {
        if (this._eventTypeMap.has(eventName)) {
            return this._eventTypeMap.get(eventName)!;
        }
        return this.eventTypeFromString(eventName);
    }

    /**
     * 检查事件类型是否存在
     * @param eventName 事件名称
     * @returns 是否存在
     */
    public static hasEventType(eventName: string): boolean {
        return this._eventTypeMap.has(eventName);
    }

    /**
     * 清除所有事件类型
     */
    public static clear(): void {
        this._eventTypeMap.clear();
        this._eventNum = 10000;
    }
}

