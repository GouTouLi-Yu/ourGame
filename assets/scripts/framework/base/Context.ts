/*
 * @Author: wangshuaihua@playcarb.com
 * @Date: 2023-03-22 10:41:50
 * @LastEditors: wangshuaihua@playcarb.com
 * @LastEditTime: 2023-03-22 20:01:14
 * @FilePath: \koscreator\assets\scripts\Playcrab\FrameWork\Base\Context.ts
 * @Description: File Description
 */

import { EventDispatcher } from "../event/EventDispatcher";
import { Injector } from "../injector/Injector";
import { CommandMap } from "../map/CommandMap";
import { MediatorMap } from "../map/MediatorMap";
import { ViewMap } from "../map/ViewMap";
import EventObject from "./EventObject";

export default class Context extends EventObject {

    protected _commandMap: CommandMap;
    public getCommandMap() { return this._commandMap; }

    protected _mediatorMap: MediatorMap;
    public getMediatorMap() { return this._mediatorMap; }

    protected _viewMap: ViewMap;
    public getViewMap() { return this._viewMap; }

    public constructor(injector: Injector, sharedEventDispatcher: EventDispatcher) {
        super();
        this.customInject(injector, sharedEventDispatcher);

        this._commandMap = new CommandMap(this.eventDispatcher, this.injector)

        this._viewMap = new ViewMap(injector)
        this._mediatorMap = new MediatorMap(null, injector)

        this.registerInjections(this.injector);
    }

    public deleteMe() {
        this.unregisterInjections(this.injector);
        if (this._commandMap) {
            this._commandMap.__dispose();
        }
        if (this._viewMap) {
            this._viewMap.__dispose();
        }
        if (this._mediatorMap) {
            this._mediatorMap.__dispose();
        }
        if (this.eventDispatcher) {
            this.eventDispatcher.__dispose();
        }
        if (this.injector) {
            this.injector.dispose();
        }
    }

    public registerInjections(injector: Injector) {
        injector.mapValue("SharedEventDispatcher", this.eventDispatcher);
        injector.mapValue("legs_contextCommandMap", this._commandMap);
        injector.mapValue("legs_contextViewMap", this._viewMap);
        injector.mapValue("legs_contextMediatorMap", this._mediatorMap);
    }

    public unregisterInjections(injector: Injector) {
        injector.unmap("SharedEventDispatcher")
        injector.unmap("legs_contextCommandMap")
        injector.unmap("legs_contextViewMap")
        injector.unmap("legs_contextMediatorMap")
    }

    /*
     * @description: The startup hook.Override this in your game
     */
    public startup() {

    }

    /*
    * @description: The shutdown hook..Override this in your game
    */
    public exit() {
        this.__dispose()
    }
}


