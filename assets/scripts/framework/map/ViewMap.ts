import { Node, NodeEventType, Prefab, error, warn } from "cc";
import DisposableObject from "../base/DisposableObject";

type SyncCreateFunc = () => Node
type AsyncCreateFunc = () => Promise<Node>

interface IViewCreator {
    creator: SyncCreateFunc | AsyncCreateFunc;
    isAsync: boolean;
    layerName?: string;
}

export class ViewMap extends DisposableObject {

    _viewMap = new Map<string, IViewCreator>()
    constructor(injector) {
        super();
        this.sysInject(injector)
    }

    mapViewToCreator(viewName: string, viewCreator: SyncCreateFunc) {
        this._viewMap.set(viewName, { creator: viewCreator, isAsync: false })
    }

    mapViewToRes(viewName: string, resId: string, layerName?: string) {
        // 简化版本：需要在实际使用时实现资源加载逻辑
        this._viewMap.set(viewName, {
            creator: function () {
                return Promise.resolve(null as Node)
            },
            isAsync: true,
            layerName: layerName
        })
    }

    unmapView(viewName: string) {
        this._viewMap.delete(viewName)
    }

    hasView(viewName: string): boolean {
        return this._viewMap.has(viewName)
    }

    getViewLayerName(viewName: string): string {
        let creator = this._viewMap.get(viewName);
        return creator?.layerName
    }

    createView(viewName: string): Promise<Node> {
        let creator = this._viewMap.get(viewName);
        if (!creator) {
            return Promise.reject(new Error(`View ${viewName} not found`))
        }
        let createPromise
        if (creator.isAsync) {
            createPromise = creator.creator()
        } else {
            createPromise = new Promise<Node>(resolve => resolve(creator.creator()))
        }
        createPromise.then((result: Node) => {
            this._afterViewCreated(result, viewName)
            return result
        }).catch(function (e) { error(e) });

        return createPromise
    }

    createViewSync(viewName: string): Node {
        let result = null
        let creator = this._viewMap.get(viewName);
        if (!creator) {
            warn("View not found: " + viewName)
            return null
        }
        if (creator.isAsync) {
            warn("you are trying to create an async view syncly, viewName: " + viewName, "make sure it's just an empty view")
            result = null
        } else {
            result = creator.creator()
        }
        if (result) {
            this._afterViewCreated(result, viewName)
        }
        return result
    }

    private _afterViewCreated(view: Node, viewName: string) {
        if (!view) return
        view.getViewName = (): string => viewName
        const mediatorMap = this.getInjector().getInstance("legs_contextMediatorMap")
        if (mediatorMap) {
            mediatorMap.createMediator(view)
        }
    }
}


