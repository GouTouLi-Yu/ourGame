/*
 * @Author: wangshuaihua@playcarb.com
 * @Date: 2023-03-22 10:41:50
 * @LastEditors: wangshuaihua@playcarb.com
 * @LastEditTime: 2023-03-30 20:59:50
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\base\Game.ts
 * @Description: File Description
 */
import { EventDispatcher } from "../event/EventDispatcher";
import { Injector } from "../injector/Injector";
import Context from "./Context";
import EventObject from "./EventObject";

export default class Game extends EventObject {
    public static _instance: Game;
    public static getInstance() {
        return this._instance
    }

    public static getInjector() {
        return this._instance.injector
    }

    private _context: Context;
    public get context(): Context {
        return this._context;
    }
    public set context(value: Context) {
        this._context = value;
    }

    constructor() {
        super();
        Game._instance = this;
    }

    public startup() {
        let injector = new Injector()
        this.injector = injector;
        let context = this.setup(injector);
        if (!context) {
            console.warn("Failed to create user game context. Using default `GameContext`.")
            let eventDispatcher = EventDispatcher.getEventDispatcher("kos");
            context = new Context(injector, eventDispatcher);
        }
        this._context = context;
        this.run();
    }

    /*
     * @description: 子类重写
     */
    protected setup(injector: Injector): Context {
        return null;
    }

    public run() {
        this._context.startup()
    }

    public exit() {
        if (this._context) {
            this._context.exit();
        }
        Game._instance = null
        this.__dispose();
    }
}


