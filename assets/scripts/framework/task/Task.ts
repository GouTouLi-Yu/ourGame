export enum TaskState {
    Begin = 1,
    Run = 2,
    Finished = 3,
    Error = 4,
    Abort = 5,
}

export class Task {
    protected _state: TaskState
    protected _listener: any
    protected _isRunning: boolean
    protected _progress
    private _weight: number = 1
    get weight() { return this._weight }
    set weight(__newVal: number) { this._weight = __newVal }
    private _p: number = 0
    get p() { return this._p }
    set p(__newVal: number) { this._p = __newVal }

    public parentTask
    getProgress() {
        return this._progress
    }

    constructor(weight?) {
        this._weight = weight ?? 1
        this._progress = 0
        this._state = TaskState.Begin
        this._isRunning = false
    }

    setTaskListener(listener) {
        this._listener = listener
    }

    reportProgress(progress) {
        this._progress = progress
        if (this._listener) {
            this._listener.onProgress?.(this, progress)
        }
    }

    reportStep(step, maxStep) {
        if (this._listener && this._listener.onStep) {
            this._listener.onStep(this, step, maxStep)
        }
    }

    changeInfo(info) {
        if (info == null) {
            return
        }

        if (this._listener && this._listener.onChangeInfo) {
            this._listener.onChangeInfo(this, info)
        }
    }

    breakTask() {
        this._isRunning = false
    }

    reportError(err) {
        this._state = TaskState.Error
        if (this._listener) {
            this._listener.onError(this, err)
        }
    }

    start() {
        this._isRunning = true
        this._progress = 0
        this._state = TaskState.Run
    }

    finish() {
        if (!this._isRunning) {
            return
        }
        this._state = TaskState.Finished
        this._isRunning = false
        if (this._listener) {
            this._listener.onCompleted(this)
        }
    }

    isRunning() {
        return this._isRunning
    }

    abort() {
        if (!this._isRunning) {
            return
        }
        this.breakTask()
        this._state = TaskState.Abort
        if (this._listener) {
            this._listener.onAbort(this)
        }
    }

    getTipsInfo() {
        if (this._state == TaskState.Begin) {
            return this.getStartInfo()
        } else if (this._state == TaskState.Run) {
            return this.getProgressInfo()
        } else if (this._state == TaskState.Finished) {
            return this.getFinishInfo()
        } else if (this._state == TaskState.Error) {
            return this.getErrorInfo()
        } else if (this._state == TaskState.Abort) {
            return this.getErrorInfo()
        }
    }

    getStartInfo() {
        return null
    }

    getProgressInfo(p?) {
        return null
    }

    getFinishInfo() {
        return null
    }

    getErrorInfo() {
        return null
    }
}


