
import BaseObject from "../base/BaseObject";
import { InjectionConfig } from "./InjectionConfig";
import { InjectSingletonResult, InjectValueResult } from "./InjectionResult";
import { ClassConfig } from "../../common/config/ClassConfig";

export class Injector extends BaseObject {

    private _parentInjector: Injector = null
    private _mappings = {};

    constructor(parentInjector: Injector = null) {
        super();
        this._parentInjector = parentInjector;
        this._mappings = {};
    }
    protected deleteMe() {
        for (const key in this._mappings) {
            if (Object.prototype.hasOwnProperty.call(this._mappings, key)) {
                const element: BaseObject = this._mappings[key];
                element.dispose();
            }
        }
    }

    private genRequestKey(classType, name: string | null | undefined = null) {
        if (!classType) {
            classType = "BaseObject";
        }
        let Key: string
        if (typeof (classType) == "string") {
            Key = classType;
        } else {
            Key = ClassConfig.getClassName(classType)
            if (!Key) {
                console.error("Can't find class by type '" + classType + "'")
            }
        }
        if (name) {
            Key = Key + "#" + name;
        }
        return Key
    }

    getInstance<T extends abstract new (...args: any) => any>(classType: T, name?: string | null | undefined): InstanceType<T>;
    getInstance(classType: string, name?: string | null | undefined): any;

    public getInstance<T extends abstract new (...args: any) => any>(classType: T | string, name: string | null | undefined = null): InstanceType<T> | any {
        let cfg = this._findInjectionConfigForRequest(classType, name, true)
        if (!cfg) {
            this.mapSingleton(classType, name)
            cfg = this._findInjectionConfigForRequest(classType, name, true)
        }
        if (!cfg) {
            return null;
        }
        return cfg.getResponse(this);
    }

    public getInstanceOnlyRead(classType, name: string | null | undefined = null) {
        let cfg = this._findInjectionConfigForRequest(classType, name, true)
        if (!cfg) {
            return null;
        }
        return cfg.getResponse(this);
    }

    public deleteInstance(clazz, named = null) {
        this._cleanInjectionConfigForRequest(clazz, named, true)
    }

    /**
     * @desc Perform an injection into an object, satisfying all it's dependencies.
     * @param target The object to inject into.
     */
    public injectInto(target) {
        target.sysInject?.(this);
        target.userInject?.(this);
    }

    public hasInstantiate(classType, ...arg): any {
        let clazz = classType
        if (typeof (classType) == "string") {
            clazz = ClassConfig.getClass(classType)
        }
        if (!clazz) {
            return false
        }
        return true
    }


    public instantiate(classType, ...arg): any {
        let obj = this._instantiate(classType, ...arg)
        if (obj) {
            this.injectInto(obj)
        }
        return obj;
    }

    private _instantiate(classType, ...arg) {
        let clazz = classType
        if (typeof (classType) == "string") {
            clazz = ClassConfig.getClass(classType)
        }
        if (!clazz) {
            throw new Error("Can't find class by name '" + classType + "'");
        }
        let obj = new clazz(...arg)
        obj.initialize?.(...arg)
        return obj
    }

    public hasMapping(clazz, named = null) {
        let cfg = this._findInjectionConfigForRequest(clazz, named, true)
        return cfg && cfg.willRespond()
    }

    public mapSingleton(whenAskedFor, named = null) {
        let cfg = this._getOrCreateMyownConfigForRequest(whenAskedFor, named)
        cfg.setResult(new InjectSingletonResult(whenAskedFor))
        return cfg
    }

    public mapValue(whenAskedFor, useValue, named = null) {
        let cfg = this._getOrCreateMyownConfigForRequest(whenAskedFor, named);
        cfg.setResult(new InjectValueResult(useValue/*, isCCObj*/))
        return cfg
    }


    public unmap(clazz, named = null) {
        let cfg = this._findInjectionConfigForRequest(clazz, named, false)
        if (cfg) {
            cfg.setResult(null)
        }
        this.deleteInstance(clazz, named)
    }

    public _findInjectionConfigForRequest(classType, named = null, searchParent = true) {
        let requestKey = this.genRequestKey(classType, named)

        return this._findInjectionConfigByKey(requestKey, searchParent)
    }

    private _findInjectionConfigByKey(requestKey, searchParent = true) {
        let cfg = this._mappings[requestKey];
        if (cfg) {
            return cfg
        }
        if (this._parentInjector && searchParent) {
            return this._parentInjector._findInjectionConfigByKey(requestKey, true)
        }
        return null
    }

    private _cleanInjectionConfigForRequest(classType, named = null, searchParent = true) {
        let requestKey = this.genRequestKey(classType, named)
        return this._cleanInjectionConfigByKey(requestKey, searchParent)
    }

    public _cleanInjectionConfigByKey(requestKey, searchParent = true) {
        let cfg = this._mappings[requestKey];
        if (cfg) {
            if (cfg.isValid) {
                cfg.dispose()
            }
            delete this._mappings[requestKey]
            return
        }
        if (this._parentInjector && searchParent) {
            return this._parentInjector._cleanInjectionConfigByKey(requestKey, true)
        }
        return
    }

    private _getOrCreateMyownConfigForRequest(classType, named = null) {
        let requestKey = this.genRequestKey(classType, named)
        let cfg = this._mappings[requestKey];
        if (!cfg) {
            cfg = new InjectionConfig(null);
            this._mappings[requestKey] = cfg
        }
        return cfg;
    }
}


