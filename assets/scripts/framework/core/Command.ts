
import DisposableObject from "../base/DisposableObject";
import { PCEvent } from "../event/PCEvent";

export default class Command extends DisposableObject {
    constructor() {
        super();
    }

    /**
     * Execute the command
     */
    public execute(event:PCEvent) {
        throw new Error("please override me!");
    }

}


