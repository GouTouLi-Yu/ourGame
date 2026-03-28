import DisposableObject from "../base/DisposableObject";
import { InjectionResult } from "./InjectionResult";
import { Injector } from "./Injector";

export class InjectionConfig extends DisposableObject {
    private _result: InjectionResult = null;

    static __createInstance(viewCreator) {
        // @ts-ignore
        let __inst = new InjectionConfig();
        __inst.initialize(viewCreator)
        return __inst;
    }

    constructor(result?: InjectionResult) {
        super();
        this.setResult(result);
    }

    public deleteMe() {
        if (this._result) {
            this._result.__dispose();
        }
    }

    public setResult(result: InjectionResult) {
        if (this._result && this._result.isValid) {
            this._result.__dispose();
        }
        this._result = result;
    }

    public getResponse(injector: Injector): any {
        if (this._result) {
            return this._result.getResponse(injector);
        }
        return null
    }

    public willRespond() {
        return this._result != null && this._result != undefined
    }

}


