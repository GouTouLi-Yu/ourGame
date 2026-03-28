
import DisposableObject from "../base/DisposableObject"
import {Injector} from "./Injector"

export class InjectionResult extends DisposableObject{
    constructor() {
        super();
    }

    public getResponse(injector:Injector)
    {
        throw new Error("must override me!");
    }
    
}

export class InjectClassResult extends InjectionResult{
    private _responseType;
    constructor(responseType) {
        super();
        this._responseType = responseType;
    }

    public getResponse(injector:Injector)
    {
        if (!this._responseType){
            return null
        }
        return injector.getInstance(this._responseType);
    }
}

export class InjectSingletonResult extends InjectionResult{
    private _responseType;
    private _responseInstance;
    constructor(responseType) {
        super();
        this._responseType = responseType;
    }

    public getResponse(injector:Injector)
    {
        if(this._responseInstance){
            return this._responseInstance;
        }
        if(!this._responseType){
            return null
        }
        this._responseInstance = injector.instantiate(this._responseType);
        return this._responseInstance;
    }
}

export class InjectValueResult extends InjectionResult{
    private _value;
    constructor(object) {
        super();
        this._value = object;
    }

    public deleteMe()
    {
        
    }
    
    public getResponse(injector:Injector)
    {
        return this._value;
    }
}


