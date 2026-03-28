import { assert, director } from "cc";
import { CustomTask } from "./CustomTask";
import { Task } from "./Task";
import { TaskListener } from "./TaskListener";

export class CompositeTask extends Task {
    protected _subTasks = new Array<Task>()
    protected _timeLimitation: number
    private _tickEntry: any;

    constructor() {
        super()
        this._timeLimitation = null
    }

    gettime() {
        return Date.now()
    }

    setTimeLimitation(milliseconds: number) {
        this._timeLimitation = milliseconds
    }

    addTask(task: Task) {
        task.parentTask = this
        this._subTasks.push(task)
    }

    calcTotalWeight() {
        let totalWeight = 0
        for (let i = 0; i < this._subTasks.length; i++) {
            totalWeight += this._subTasks[i].weight
        }
        return totalWeight
    }

    getCCScheduler() {
        return director.getScheduler()
    }

    scheduleScriptFunc(stepFunc) {
        return this.getCCScheduler().scheduleScriptFunc(this, stepFunc?.bind(this), 0, false)
    }

    unscheduleScriptEntry() {
        if (this._tickEntry != null) {
            this.getCCScheduler().unscheduleScriptEntry(this._tickEntry)
            this._tickEntry = null
        }
    }

    runStep(stepFunc) {
        if (this._isRunning) {
            stepFunc()
        }
        if (this._isRunning) {
            if (!this._tickEntry) {
                this._tickEntry = this.scheduleScriptFunc((dt) => { this.runStep(stepFunc) })
            }
        } else {
            this.unscheduleScriptEntry()
        }
    }

    breakTask() {
        this.unscheduleScriptEntry()
        super.breakTask()
    }
}

export class SequencialTask extends CompositeTask {
    private _currentTask: Task;
    private _progressEntry: number;

    start() {
        super.start()

        let interpolationWeight = 0
        let maxWeight = 0
        let completed = 0
        let totalWeight = 0
        let taskIndices = new Set<Task>()
        for (const task of this._subTasks) {
            totalWeight += task.weight
            taskIndices.add(task)
        }
        console.log("SequencialTask start", this._subTasks.length, totalWeight)

        this._currentTask = null
        let subListener = new TaskListener()
        let nextIndex = 0
        let step = () => {
            if (this._currentTask != null) {
                return
            }
            let t0 = this.gettime()
            while (nextIndex < this._subTasks.length) {
                if (!this._isRunning) {
                    return
                }
                let task = this._subTasks[nextIndex]
                nextIndex = nextIndex + 1
                this._currentTask = task
                task.setTaskListener(subListener)
                maxWeight = completed + task.weight
                task.start()
                if (task.isRunning()) {
                    break
                }
                if (this._timeLimitation != null) {
                    let t1 = this.gettime()
                    if (t1 - t0 >= this._timeLimitation) {
                        break
                    }
                }
            }
            if (nextIndex >= this._subTasks.length && this._currentTask == null) {
                this.unscheduleScriptProgressEntry()
                this.finish()
            }
        }

        let updateProgress = (task: Task, p: number) => {
            let p0 = (task.p || 0)
            task.p = p
            completed = completed + (p - p0) * task.weight
            interpolationWeight = completed
            this.reportProgress(completed / totalWeight)
            this.changeInfo(task.getProgressInfo(completed / totalWeight))
        }

        let markFinished = (task: Task) => {
            if (this._currentTask == null) {
                return
            }
            assert(task == this._currentTask)
            this._currentTask = null
            updateProgress(task, 1)
        }

        let parentTask = this
        subListener.onProgress = (task: Task, p: number) => {
            updateProgress(task, p)
        }
        subListener.onError = (task: Task, err: any) => {
            this.breakTask()
            markFinished(task)
            this.reportError(err)
        }
        subListener.onCompleted = (task: Task) => {
            markFinished(task)
        }

        if (this._progressEntry == null) {
            this._progressEntry = this.scheduleScriptFunc(() => {
                if (!this._currentTask) {
                    return
                }
                let task = this._currentTask
                let addPer = (1 - task.p) * task.weight * 0.03
                interpolationWeight = interpolationWeight == 0 ? completed : interpolationWeight
                interpolationWeight += addPer
                interpolationWeight = Math.min(interpolationWeight, maxWeight)
                this.reportProgress(interpolationWeight / totalWeight)
            })
        }
        this.runStep(step)
    }

    unscheduleScriptProgressEntry() {
        if (this._progressEntry != null) {
            this.getCCScheduler().unscheduleScriptEntry(this._progressEntry)
            this._progressEntry = null
        }
    }

    breakTask() {
        this._currentTask?.abort()
        this._currentTask = null
        this.unscheduleScriptProgressEntry()
        super.breakTask()
    }
}

export class ListTask extends CompositeTask {

}

export class ParallelTask extends CompositeTask {
    private _runningTasks = new Set<Task>()
    start() {
        super.start()

        let completed = 0
        let totalWeight = 0
        let taskIndices = new Set<Task>()
        for (const task of this._subTasks) {
            totalWeight += task.weight
            taskIndices.add(task)
        }
        console.log("ParallelTask start", this._subTasks.length, totalWeight)
        this._runningTasks.clear()

        let oldCompleted = null
        let subListener = new TaskListener()
        let nextIndex = 0
        let step = () => {
            let t0 = this.gettime()
            while (nextIndex < this._subTasks.length) {
                if (!this._isRunning) {
                    return
                }
                let task = this._subTasks[nextIndex]
                nextIndex++
                this._runningTasks.add(task)
                task.setTaskListener(subListener)
                task.start()
                if (this._timeLimitation != null) {
                    let t1 = this.gettime()
                    if (t1 - t0 >= this._timeLimitation) {
                        break
                    }
                }
            }
            if (oldCompleted != completed) {
                oldCompleted = completed
                let progress = (totalWeight == 0 ? 1 : completed / totalWeight)
                this.reportProgress(Math.max(0, Math.min(1, progress)))
            }
            if (nextIndex >= this._subTasks.length && this._runningTasks.size == 0) {
                this.finish()
            }
        }
        let updateProgress = (task, p) => {
            completed = completed + (p + task.p) * task.weight
        }
        let markFinished = ((task) => {
            this._runningTasks.delete(task)
            updateProgress(task, 1)
        }).bind(this)

        subListener.onProgress = updateProgress
        subListener.onError = (task, error) => {
            markFinished(task)
        }
        subListener.onCompleted = (task) => {
            markFinished(task)
        }
        this.runStep(step.bind(this))
    }

    breakTask() {
        this._runningTasks.forEach((info, task) => { task.abort() })
        this._runningTasks.clear()
        super.breakTask()
    }
}


