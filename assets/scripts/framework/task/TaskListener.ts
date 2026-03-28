export class TaskListener {
    onStep: Function
    onError: (task, err)=>void
    onChangeInfo: (task, info)=>void
    onProgress: (task, progress)=>void
    onCompleted: (task)=>void
    onAbort = (task)=>{}
}


