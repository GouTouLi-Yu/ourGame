
import { Node, NodeEventType } from "cc";
import DisposableObject from "../base/DisposableObject";
import Mediator from "../core/Mediator";

declare module 'cc' {
    interface Node {
        getViewName(): string
        mediator: Mediator
    }
}


/* module("legs") */
interface ViewInfo {
    mediatorClazz: string
    autoCreate: boolean
    autoRemove: boolean
}

export class MediatorMap extends DisposableObject {
    private _viewNameToMediatorMap: Map<string, ViewInfo>;
    private _registeredMediators: Map<Node, Mediator>;
    private _mediatorNameToViewListMap: Map<string, Array<Node>>;

    constructor(viewEventDispatcher, injector) {
        super();
        this.initialize(viewEventDispatcher, injector)
    }

    initialize(viewEventDispatcher, injector) {
        super.initialize()
        this.injector = injector
        this._viewNameToMediatorMap = new Map()
        this._registeredMediators = new Map()
        this._mediatorNameToViewListMap = new Map()
    }

    onEnterSomeView(view: Node) {
        if (view == null || view.getViewName == null) {
            return
        }
        var viewName: string = view.getViewName()
        var info: ViewInfo = this._viewNameToMediatorMap.get(viewName)
        if (info != null && info.autoCreate) {
            this.createMediator(view)
        }
    }

    onExitSomeView(view: Node) {
        if (view == null || view.getViewName == null) {
            return
        }
        var viewName = view.getViewName()
        var info: ViewInfo = this._viewNameToMediatorMap.get(viewName)
        if (info != null) {
            this.removeMediatorByView(view)

            var mediatorName = info.mediatorClazz
            this.removeViewFromViewListMap(mediatorName, view)
        }
    }

    cleanMediator(view: Node) {
        if (view == null || view.getViewName == null) {
            return
        }

        var viewName = view.getViewName()
        var info: ViewInfo = this._viewNameToMediatorMap.get(viewName)
        if (info != null) {
            this.removeMediatorByView(view)
            var mediatorName = info.mediatorClazz
            this.removeViewFromViewListMap(mediatorName, view)
        }
    }

    createMediator(viewComponent: Node) {
        if (viewComponent == null || viewComponent.getViewName == null) {
            return null
        }
        var viewName = viewComponent.getViewName()
        var info: ViewInfo = this._viewNameToMediatorMap.get(viewName)
        if (info != null) {
            var mediatorName = info.mediatorClazz
            var mediator: Mediator = this.injector.instantiate(mediatorName)
            if (mediator != null) {
                var scriptHandler = ((node) => {
                    node.off(NodeEventType.NODE_DESTROYED, scriptHandler, this)
                    this.onExitSomeView(node)
                }).bind(this)
                viewComponent.on(NodeEventType.NODE_DESTROYED, scriptHandler, this)
                this.registerMediator(viewComponent, mediator)

                this.addViewToViewListMap(mediatorName, viewComponent)
            }
            return mediator
        }
        return null
    }

    hasMapping(viewName: string) {
        var info = this._viewNameToMediatorMap.get(viewName)
        return info != null && info.mediatorClazz != null
    }

    hasMediator(mediator: Mediator) {
        return this.hasMediatorForView(mediator.getView())
    }

    getMediatorClazz(viewName: string) {
        var info = this._viewNameToMediatorMap.get(viewName)
        return info && info.mediatorClazz || null
    }

    hasMediatorForView(viewComponent: Node) {
        if (viewComponent == null) {
            return false
        }
        return this._registeredMediators.has(viewComponent)
    }

    mapView(viewName, mediatorClazz, autoCreate?, autoRemove?) {
        this._viewNameToMediatorMap.set(viewName, {
            mediatorClazz: mediatorClazz,
            autoCreate: autoCreate === false ? false : true,
            autoRemove: autoRemove === false ? false : true,
        })
    }

    unmapView(viewName) {
        this._viewNameToMediatorMap.delete(viewName)
    }

    registerMediator(viewComponent: Node, mediator: Mediator) {
        if (viewComponent == null || mediator == null) {
            return
        }
        if (this._registeredMediators.has(viewComponent)) {
            if (this._registeredMediators.get(viewComponent) == mediator) {
                return
            }
            this.removeMediatorByView(viewComponent)
        }
        mediator.setView(viewComponent)
        /* -- XXX `onRemove()/dispose()` should NOT be missed even if Lua error occurs */
        /* -- in `onRegister()`. */
        viewComponent.mediator = mediator
        this._registeredMediators.set(viewComponent, mediator)
        mediator.onRegister()
    }

    removeMediator(mediator: Mediator) {
        this.removeMediatorByView(mediator.getView())
    }

    removeMediatorByView(viewComponent: Node) {
        if (viewComponent == null) {
            return
        }
        var mediator = this._registeredMediators.get(viewComponent)
        if (mediator != null) {
            this._registeredMediators.delete(viewComponent)
            viewComponent.mediator = null
            mediator.onRemove()
            mediator.__dispose()
        }
    }

    retrieveMediator(viewComponent: Node): Mediator {
        if (viewComponent == null) {
            return null
        }
        return this._registeredMediators.get(viewComponent)
    }

    /* -------------------- ViewListMap start ----------------------------------------- */
    addViewToViewListMap(mediatorName, viewComponent) {
        if (this._mediatorNameToViewListMap.has(mediatorName) == false) {
            this._mediatorNameToViewListMap.set(mediatorName, [])
        }

        let viewList: Node[] = this._mediatorNameToViewListMap.get(mediatorName)
        viewList.push(viewComponent)
    }

    getViewListFromViewListMap(mediatorName: string): Node[] {
        return this._mediatorNameToViewListMap.get(mediatorName)
    }

    removeViewFromViewListMap(mediatorName: string, view: Node) {
        var viewList = this.getViewListFromViewListMap(mediatorName)
        if (viewList && viewList.length > 0) {
            for (var i = 0; i < viewList.length; i++) {
                if (viewList[i] == view) {
                    viewList.splice(i, 1)
                    break
                }
            }
        }
    }

    removeViewListFromViewListMap(mediatorName: string) {
        var viewList = this._mediatorNameToViewListMap.get(mediatorName)
        if (viewList) {
            viewList.splice(0)
        }
        // this._mediatorNameToViewListMap.set(mediatorName, [])
    }

    getViewListByViewName(viewName: string): Node[] {
        var info: ViewInfo = this._viewNameToMediatorMap.get(viewName)
        if (info) {
            var mediatorName = info.mediatorClazz
            return this.getViewListFromViewListMap(mediatorName)
        }
    }
}


