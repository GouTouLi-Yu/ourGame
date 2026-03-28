/** 
 * @Author: liuyitong@ourpalm.com
 * @Date: 2023-08-04 19:55:57
 * @LastEditors: liuyitong@ourpalm.com
 * @LastEditTime: 2024-02-20 20:21:33
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\task\TaskBuilder.ts
 * @Description: File description
 */
import { CompositeTask, ParallelTask, SequencialTask } from "./CompositeTask";
import { CustomTask } from "./CustomTask";
import { Task } from "./Task";

/** 
 * @description: 任务内容
 * @return {*}
 */
export interface CTaskContext {
    /** 顺序 */
    SEQUENCE: (timeLimit: number) => void
    /** 并行 */
    PARALLEL: (timeLimit: number) => void
    /** 结束 */
    END: () => void
    /** 任务 */
    ADDTASK: (task: Task) => void
    /** 延迟任务 单位秒 默认0.5秒 */
    ADDDELAYTASK: (time?: number) => void
    /** 任务 */
    compTaskStack: CompositeTask[]
}

export class TaskBuilder {

    constructor() {
    }

    buildSequencialTask(taskSource: (ctx: CTaskContext) => void): SequencialTask {
        let compTaskStack = [];
        let finalTask = new SequencialTask();
        compTaskStack.push(finalTask);
        taskSource(this.setupBuildContext(compTaskStack));
        return finalTask;
    }

    buildParalelTask(taskSource: (ctx: CTaskContext) => void): ParallelTask {
        const compTaskStack = [];
        const finalTask = new ParallelTask();
        compTaskStack.push(finalTask);
        taskSource(this.setupBuildContext(compTaskStack));
        return finalTask;
    }

    setupBuildContext(compTaskStack: CompositeTask[]): CTaskContext {
        let ctx = {
            SEQUENCE: (timeLimit: number) => {
                let task = new SequencialTask();
                task.setTimeLimitation(timeLimit);
                ctx.compTaskStack.push(task);
            },
            PARALLEL: (timeLimit: number) => {
                let task = new ParallelTask();
                task.setTimeLimitation(timeLimit);
                ctx.compTaskStack.push(task);
            },
            END: () => {
                let topTask = ctx.compTaskStack.pop();
                if (!topTask) { return; }
                let parentTask = ctx.compTaskStack[ctx.compTaskStack.length - 1];
                topTask.weight = topTask.calcTotalWeight()
                parentTask?.addTask(topTask);
            },
            ADDTASK: (task: Task) => {
                ctx.compTaskStack[ctx.compTaskStack.length - 1]?.addTask(task);
            },
            ADDDELAYTASK: (time = 0.5) => {
                // 简化版本：需要在实际使用时实现延迟逻辑
                const delaytask = new CustomTask(1, task => {
                    setTimeout(() => {
                        task.finish()
                    }, time * 1000);
                })
                ctx.compTaskStack[ctx.compTaskStack.length - 1]?.addTask(delaytask);
            },
            compTaskStack: compTaskStack
        };
        return ctx;
    }

}


