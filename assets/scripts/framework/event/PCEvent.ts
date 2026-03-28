export class PCEvent {
    private _eventType: number;
    private _payload;

    constructor(eventType: number, payload?) {
        this._eventType = eventType;
        this._payload = payload;
    }

    get eventType() { return this._eventType }
    public getEventType() {
        return this._eventType;
    }

    get payload() { return this._payload }
    public getPayload() {
        return this._payload;
    }
}

export class LuaEvent extends PCEvent {
    // private _eventType;
    // private _payload;

    constructor(eventType, payload?) {
        super(eventType, payload)
    }

    static __createInstance(eventType, payload = null): LuaEvent {
        // @ts-ignore
        return new LuaEvent(eventType, payload);

    }
}


