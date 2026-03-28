/*
 * @Author: wangshuaihua@playcarb.com
 * @Date: 2023-03-22 10:41:50
 * @LastEditors: wangshuaihua@playcarb.com
 * @LastEditTime: 2023-04-12 17:53:01
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\base\BaseObject.ts
 * @Description: File Description
 */
export default class BaseObject {
    
    private static _objectCount = 0;
    public static get objectCount() {
        return BaseObject._objectCount;
    }
    
    public constructor() {
        BaseObject._objectCount = BaseObject._objectCount + 1;
        // console.info("constructor:",this.constructor.name)
    }
    
    private _invalid: boolean = false;
    protected get invalid(): boolean {
        return this._invalid;
    }

    /*
     * @description: 初始化
     */    
    public initialize(...arg) {
        
    }

    /*
     * @description: 销毁，供外部调用
     */    
    public dispose() {
        if(this._invalid){
            console.error(this.constructor.name,"can not dispose repet!")
            throw new Error("");
            return
        }
        this._invalid = true;
        this.deleteMe();
        BaseObject._objectCount = BaseObject._objectCount - 1;
        // console.info("dispose:",this.constructor.name)
    }
    
    /*
     * @description: 供子类重写
     */
    protected deleteMe(){
        
    }
}


