/*
 * @Author: wangshuaihua@playcarb.com
 * @Date: 2023-03-22 10:41:50
 * @LastEditors: wangshuaihua@playcarb.com
 * @LastEditTime: 2023-04-07 16:55:14
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\base\Singleton.ts
 * @Description: File Description
 */

import DisposableObject from "./DisposableObject";

export default class Singleton extends DisposableObject {

    private static _instanceMap = {}
    public static getInstance<T>(): T {
        var Name = this.name;
        console.log("T.name", this.name)
        let instance = this._instanceMap[Name];
        if (!instance) {
            instance = new this();
            instance.initialize();
            this._instanceMap[Name] = instance;
        }
        return instance;
    }

    public constructor() {
        super();
    }

}


