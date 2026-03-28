/*
 * @Author: wangshuaihua@playcarb.com
 * @Date: 2023-03-22 10:41:50
 * @LastEditors: wangshuaihua@playcarb.com
 * @LastEditTime: 2023-04-07 16:55:14
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\base\EventObject.ts
 * @Description: File Description
 */

import * as Event from "../event/EventDispatcher";
import { EventMap } from "../event/EventMap";
import { LuaEvent, PCEvent } from "../event/PCEvent";
import { Injector } from "../injector/Injector";
import DisposableObject from "./DisposableObject";

export default class EventObject extends DisposableObject {

    private _eventDispatcher: Event.EventDispatcher;
    public get eventDispatcher(): Event.EventDispatcher {
        return this._eventDispatcher;
    }
    public set eventDispatcher(value: Event.EventDispatcher) {
        this._eventDispatcher = value;
    }

    private _eventMap: EventMap;
    public get eventMap(): EventMap {
        return this._eventMap;
    }
    public set eventMap(value: EventMap) {
        this._eventMap = value;
    }

    public constructor() {
        super();
    }

    /**
     * sysInject
     */
    public sysInject(injector: Injector) {
        super.sysInject(injector);
        this._eventDispatcher = injector.getInstance("SharedEventDispatcher")
        this._eventMap = new EventMap(this._eventDispatcher);
    }

    public customInject(injector: Injector, eventDispatcher: Event.EventDispatcher) {
        super.sysInject(injector);
        this._eventDispatcher = eventDispatcher
        this._eventMap = new EventMap(this._eventDispatcher);
    }

    protected _dispose() {
        super._dispose();
        this.removeAllEventListener();
    }

    public removeAllEventListener() {
        this._eventMap?.removeAllEventListener();
    }

    //protected _funcMap = {}
    public handler(func: Function) {
        // let fun = this._funcMap[func.name];
        // if(fun){
        //     return fun;
        // }
        // var self = this;
        // fun = function (...args) {
        //     Reflect.apply(func, self, args);
        // }
        // this._funcMap[func.name] = fun;
        return [this, func]
    }
    //Targetfun:[this,func]
    public addListener(eventType, Targetfun: any[], prepend: boolean = false): boolean {
        return this._eventMap.addEventListener(eventType, Targetfun[0], Targetfun[1], prepend)
    }

    public mapEventListener(eventType, target, fun: Function, prepend: boolean = false): boolean {
        return this._eventMap.addEventListener(eventType, target, fun, prepend)
    }

    public unmapEventListener(eventType, target, fun: Function) {
        return this._eventMap.removeEventListener(eventType, target, fun)
    }

    public removeListener(eventType, target, fun: Function) {
        this._eventMap.removeEventListener(eventType, target, fun);
    }

    public dispatchEvent(event: PCEvent) {
        this._eventDispatcher?.dispatchEvent(event.getEventType(), event);
    }

    public dispatch(event: PCEvent | number, payload?: any) {
        if (typeof event == "number") {
            event = new LuaEvent(event, payload);
        }
        this._eventDispatcher?.dispatchEvent(event.getEventType(), event);
    }
}


