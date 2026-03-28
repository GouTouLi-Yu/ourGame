
import { EventDispatcher, EventListener } from "./EventDispatcher";

export class EventMap {
    private _dispatcher: EventDispatcher = null;

    private _events = {};

    constructor(dispatcher: EventDispatcher) {
        this._dispatcher = dispatcher;
    }

    private getEventListener(eventType, target, fun: Function) {
        let existing = this._events[eventType];
        if (existing) {
            for (var i = existing.length - 1; i >= 0; i--) {
                let Listener: EventListener = existing[i];
                if (Listener.callthis == target && Listener.fun == fun) {
                    return Listener;
                }
            }
        }
        return null;
    }

    private createEventListener(eventType, target, fun: Function) {
        if (this.getEventListener(eventType, target, fun)) {
            return null;
        }
        let eventListener = new EventListener();
        eventListener.fun = fun;
        eventListener.beDelete = false;
        eventListener.callthis = target
        return eventListener;
    }

    public addEventListener(eventType, target, fun: Function, prepend: boolean = false): boolean {
        let listener = this.createEventListener(eventType, target, fun);
        if (!listener) {
            return false;
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
        this._dispatcher.addEventListener(eventType, listener, prepend)
        return true;
    }

    public removeEventListener(eventType, target, fun: Function) {
        let listener = this.getEventListener(eventType, target, fun)
        if (!listener) {
            return;
        }
        const list = this._events[eventType];
        if (!list) {
            return;
        }
        for (var i = list.length - 1; i >= 0; i--) {
            if (list[i] === listener) {
                list.splice(i, 1)
                this._dispatcher.removeEventListener(eventType, listener);
                break;
            }
        }
    }

    public removeAllEventListener() {
        for (const eventType in this._events) {
            const list = this._events[eventType];
            for (var i = list.length - 1; i >= 0; i--) {
                let Listener = list[i];
                this._dispatcher.removeEventListener(eventType, Listener);
            }
        }
        this._events = {}
    }

}


