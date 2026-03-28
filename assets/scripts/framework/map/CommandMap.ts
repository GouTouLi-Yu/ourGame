/*
 * @Author: wangshuaihua@playcarb.com
 * @Date: 2023-03-22 10:41:50
 * @LastEditors: wangshuaihua@playcarb.com
 * @LastEditTime: 2023-03-22 20:03:12
 * @FilePath: \koscreator\assets\scripts\Playcrab\FrameWork\Map\CommandMap.ts
 * @Description: File Description
 */
import EventObject from "../base/EventObject";
import { EventDispatcher } from "../event/EventDispatcher";
import { Injector } from "../injector/Injector";

export class CommandEventHandler {
    private _isOneshot: boolean;
    public get isOneshot(): boolean {
        return this._isOneshot;
    }
    public set isOneshot(value: boolean) {
        this._isOneshot = value;
    }
    private _commandClazz:String;
    private _commandMap:CommandMap;
    private _eventType;
    constructor(commandMap:CommandMap, eventType, commandClazz:String, oneshot:boolean = false) {
        this._commandMap = commandMap;
        this._eventType = eventType;
        this._commandClazz = commandClazz;
        this._isOneshot = oneshot;
    }

    public onCommandEvent(event)
    {
        if(this._isOneshot){
            this._commandMap.removeListener(this._eventType,this,this.onCommandEvent)
        }
        this._commandMap.execute(this._commandClazz, event)
    }

    private _funcMap = {}
    public handler(func:Function)
    {
        // let fun = this._funcMap[func.name];
        // if(fun){
        //     return fun;
        // }
        // var self =  this;
        // fun = function (...args) {
        //     Reflect.apply(func, self, args);
        // }
        // this._funcMap[func.name] = fun;
        return [this,func]
    }
}


export class CommandMap extends EventObject {

    private _comandMap = {}
    constructor(eventDispatcher:EventDispatcher, injector:Injector) {
        super();
        this.customInject(injector,eventDispatcher);
    }

    public mapEvent(eventType, commandClazz, oneshot:boolean = false)
    {
        let commandHandlers = this._comandMap[eventType]
        if (!commandHandlers){
            commandHandlers = {}
            this._comandMap[eventType] = commandHandlers
        }
        let clazzName = commandClazz
        let handler:CommandEventHandler = commandHandlers[clazzName]
        if(handler){
            handler.isOneshot = oneshot
        }else{
            handler = new CommandEventHandler(this,eventType,commandClazz,oneshot)
            commandHandlers[clazzName] = handler
            this.addListener(eventType,[handler,handler.onCommandEvent])   
        }
    }

    public unmapEvent(eventType, commandClazz)
    {
        let commandHandlers = this._comandMap[eventType]
        if(!commandHandlers){
            return;
        }
        let clazzName = commandClazz
        let handler:CommandEventHandler = commandHandlers[clazzName]
        if(!handler){
            return;
        }
        this.removeListener(eventType,handler,handler.onCommandEvent)
    }

    public execute(commandClazz, event)
    {
        let commandInst = this.injector.instantiate(commandClazz);
        // let commandInst = self._injector:instantiate(commandClazz)
        if(!commandInst){
            throw new Error("Failed to instantiate the command class." + commandClazz);
        }
        // self:detainCommand(commandInst)
        commandInst.execute(event)
        // self.releaseCommand(commandInst)
    }

}


