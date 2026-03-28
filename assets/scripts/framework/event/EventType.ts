/*
 * @Author: wangshuaihua@playcarb.com
 * @Date: 2023-03-30 10:41:42
 * @LastEditors: wangshuaihua@playcarb.com
 * @LastEditTime: 2023-03-30 19:12:54
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\event\EventType.ts
 * @Description: File Description
 */

export class EventType {

    constructor(parameters) {

    }
    private static _eventNum: number = 10000;
    private static _eventTypeMap = {}

    public static eventTypeFromString(EventName: string): number {
        if (this._eventTypeMap[EventName]) {
            throw new Error("eventType: " + EventName + " is repeated");
        }
        this._eventNum++;
        this._eventTypeMap[EventName] = this._eventNum;
        return this._eventNum;
    }
}

let PCEventType = EventType.prototype;
export { PCEventType };


