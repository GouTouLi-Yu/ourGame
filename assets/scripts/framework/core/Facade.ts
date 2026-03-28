/*
 * @Author: wangshuaihua@playcarb.com
 * @Date: 2023-03-22 10:41:50
 * @LastEditors: wangshuaihua@playcarb.com
 * @LastEditTime: 2023-03-22 21:30:36
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\core\Facade.ts
 * @Description: File Description
 */

import EventObject from "../base/EventObject";

export default abstract class Facade extends EventObject {
    constructor(...args: any) {
        super();
    }

    // 注意：这个方法需要在子类中实现，因为需要访问具体的 Game 实例
    // public static getInstance<T extends abstract new (...args: any) => any>(this: T): InstanceType<T> {
    //     // 需要在具体的 Game 类中实现
    //     throw new Error("Must be implemented in subclass");
    // }
}


