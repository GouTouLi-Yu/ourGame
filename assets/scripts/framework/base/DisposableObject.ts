/*
 * @Author: wangshuaihua@playcarb.com
 * @Date: 2023-03-22 10:41:50
 * @LastEditors: wangshuaihua@playcarb.com
 * @LastEditTime: 2024-03-19 18:00:28
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\base\DisposableObject.ts
 * @Description: File Description
 */
import { Injector } from "../injector/Injector";
export default class DisposableObject {
    private static _objectCount = 0;
    public static get objectCount() {
        return DisposableObject._objectCount;
    }

    public getInjector(): Injector {
        return this._injector;
    }

    private _injector: Injector;
    public get injector(): Injector {
        return this._injector;
    }
    public set injector(value: Injector) {
        this._injector = value;
    }

    public constructor() {
        DisposableObject._objectCount = DisposableObject._objectCount + 1;
        // console.info("constructor:",this.constructor.name)
    }


    private _isValid: boolean = true;
    /**
    * @zh
    * 表示该对象是否可用（被 destroy 后将不可用）。<br>
    * @default true
    * ```
    */
    public get isValid(): boolean {
        return this._isValid;
    }

    /*
     * @description: 初始化
     */
    public initialize(..._any: any) {

    }

    /*
     * @description: 销毁，供外部调用
     */
    public __dispose() {
        if (!this._isValid) {
            console.error(this.constructor.name, "can not dispose repet!")
            throw new Error("");
        }
        this._isValid = false;
        this._dispose();
        this.deleteMe();
        DisposableObject._objectCount = DisposableObject._objectCount - 1;
        // console.info("dispose:",this.constructor.name)
    }

    private dispose() {
        this.__dispose()
    }

    protected _dispose() {

    }

    /*
     * @description: 供子类重写
     */
    protected deleteMe() {

    }

    /**
     * sysInject
     */
    public sysInject(injector: Injector) {
        this._injector = injector;
    }

    /*
     * @description: 初始化注入供子类重写
     */
    protected userInject(_injector: Injector) {

    }
}


