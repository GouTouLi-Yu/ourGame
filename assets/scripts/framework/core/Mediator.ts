/*
 * @Author: wangshuaihua@playcarb.com
 * @Date: 2023-03-22 10:41:50
 * @LastEditors: wangshuaihua@playcarb.com
 * @LastEditTime: 2023-03-31 17:49:40
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\core\Mediator.ts
 * @Description: File Description
 */
import { Node } from "cc";
import EventObject from "../base/EventObject";
import { Injector } from "../injector/Injector";
import { MediatorMap } from "../map/MediatorMap";

export enum EMediatorType {
    BaseView,
    AreaView,
    PopupView,
    ScenceView
}

export enum EAreaViewOenType {
    Push,
    Switch
}

export default class Mediator extends EventObject {
    public static MediatorType: EMediatorType = EMediatorType.BaseView;
    public static viewRes: string
    public static fullPath: string = ""
    public static isEmptyLayer: boolean = false

    protected _dismissed: boolean = false

    //[key: string]: any;

    protected _view: Node;
    protected _viewName: string;

    protected _mediatorMap: MediatorMap
    getMediatorMap() {
        return this._mediatorMap;
    }

    protected _viewMap
    getViewMap() {
        return this._viewMap;
    }

    constructor() {
        super();
    }

    public sysInject(injector: Injector) {
        super.sysInject(injector);
        this._mediatorMap = injector.getInstance("legs_contextMediatorMap");
    }

    public getView(): Node {
        return this._view;
    }

    get view() { return this._view }

    public getViewName() {
        return this._viewName
    }

    public setView(viewComponent: Node) {
        this._view = viewComponent;
        this._viewName = viewComponent?.getViewName?.()
    }

    public reinject(injector) {

    }

    public adjustLayout(targetFrame) {

    }

    /*
     * @description:初始化调用
     * @param {*}
     * @return {*}
     */
    public onRegister() {

    }

    // 移除舞台时调用
    public onRemove() {

    }

    // 数据初始化  在加入到场景之后
    public enterWithData(data?) {

    }

    public enterWithDelay() {

    }

    public dismiss(data?) {

    }
}


