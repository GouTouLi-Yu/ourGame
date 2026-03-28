import DisposableObject from "../base/DisposableObject";

class Internal {
    constructor() {

    }
}

export class EventListener {
    constructor() {
    }
    public fun: Function;
    public beDelete: boolean = false;
    public callthis: any;
}

export class EventDispatcher extends DisposableObject {

    private static _dispatcherList = {}
    public static getEventDispatcher(dispatcherGroup): EventDispatcher {
        if (EventDispatcher._dispatcherList[dispatcherGroup]) {
            return EventDispatcher._dispatcherList[dispatcherGroup];
        }
        let dispatcher = new EventDispatcher(new Internal(), dispatcherGroup);
        EventDispatcher._dispatcherList[dispatcherGroup] = dispatcher;
        return dispatcher
    }

    private _events = {};
    private _dispatcherGroup;
    public constructor(internal: Internal, dispatcherGroup) {
        super();
        if (!internal) {
            console.error("EventDispatcher can not instantiation by new function!")
        }
        this._dispatcherGroup = dispatcherGroup;
    }

    public deleteMe() {
        this._events = {};
        delete EventDispatcher._dispatcherList[this._dispatcherGroup]
    }

    public addEventListener(eventType, listener: EventListener, prepend: boolean = false) {
        if (!this.isValid) {
            return;
        }
        let existing = this._events[eventType];
        if (!existing) {
            existing = []
            this._events[eventType] = existing;
        }
        if (prepend) {
            existing.unshift(listener);
        } else {
            existing.push(listener);
        }
    }

    public removeEventListener(eventType, listener: EventListener) {
        if (!this.isValid) {
            return;
        }
        const list = this._events[eventType];
        for (var i = list.length - 1; i >= 0; i--) {
            if (list[i] === listener) {
                listener.beDelete = true;
                list.splice(i, 1)
                break;
            }
        }
    }

    public dispatchEvent(eventType, ...args) {
        if (!this.isValid) {
            return;
        }
        const list = this._events[eventType];
        if (!list) {
            return false;
        }

        const len = list.length;
        const listeners = this.arrayClone(list, len);
        for (var i = 0; i < len; ++i) {
            if (listeners[i].beDelete == false) {
                if (listeners[i].callthis != null) {
                    listeners[i].fun.call(listeners[i].callthis, args[0])
                } else {
                    listeners[i].fun(args[0])
                }
            } else {
                console.warn("Event is remove By DispatchEvent! eventType:", eventType)
            }
        }
        return true;
    }

    private arrayClone(arr, n) {
        const copy = new Array(n);
        for (var i = 0; i < n; ++i) {
            copy[i] = arr[i];
        }
        return copy;
    }
}


