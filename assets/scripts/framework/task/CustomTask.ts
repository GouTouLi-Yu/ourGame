/** 
 * @Author: liuyitong@ourpalm.com
 * @Date: 2023-07-14 16:42:29
 * @LastEditors: liuyitong@ourpalm.com
 * @LastEditTime: 2023-08-04 19:07:34
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\task\CustomTask.ts
 * @Description: File description
 */
import { Task } from "./Task";

export class CustomTask extends Task {
    private _taskFunc: Function;
    private _abortFunc: Function;

    constructor(weight, func, abort?) {
        super(weight);
        this._taskFunc = func;
        this._abortFunc = abort;
    }

    start() {
        super.start();
        this.reportProgress(0);
        let r = this._taskFunc(this);
        if (!r || !r.length) {
            return
        }
        
        if (r.length > 1 && r[1]) {
            this.reportProgress(1);
            this.finish();
        } else {
            this.reportError(r[0]);
        }
    }

    abort() {
        if (!this.isRunning()) {
            return
        }
        if (this._abortFunc) {
            this._abortFunc();
        }
        super.abort();
    }
}


export class CustomTaskCreateTask extends Task {
    private _taskFunc: Function;
    private _abortFunc: Function;

    constructor(weight, func, abort?) {
        super(weight);
        this._taskFunc = func;
        this._abortFunc = abort;
    }

    start() {
        super.start();
        this.reportProgress(0);

        let r = this._taskFunc(this);
        if (!r || !r.length) {
            return
        }

        if (r.length > 1 && r[1]) {
            this.reportProgress(1);
            this.finish();
        } else {
            this.reportError(r[0]);
        }
    }

    abort() {
        if (!this.isRunning()) {
            return
        }
        if (this._abortFunc) {
            this._abortFunc();
        }
        super.abort();
    }
}


