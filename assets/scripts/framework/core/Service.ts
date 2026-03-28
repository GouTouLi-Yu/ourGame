/*
 * @Author: wangshuaihua@playcarb.com
 * @Date: 2023-03-22 10:41:50
 * @LastEditors: wangshuaihua@playcarb.com
 * @LastEditTime: 2025-07-18 16:13:58
 * @FilePath: \koscreator\assets\scripts\playcrab\framework\core\Service.ts
 * @Description: File Description
 */

import EventObject from "../base/EventObject";
import { Injector } from "../injector/Injector";
import { IS_SERVER_DELETE_FLAG, SERVER_DELETE_FLAG } from './EnumType';

export let NetConst = 0

export default class Service extends EventObject {

    static NET_OK_CODE = 0;
    static OPTYPE_LOGIN = 1001
    static OPTYPE_SYNCDIFF = 1011

    initialize() {
        super.initialize();

    }

    protected userInject(injector: Injector) {
        // 子类可以重写此方法来注入依赖
    }

    /* -- 处理diff数据 */
    processingDiff(response) {
        /* -- body */
        var diff = response.d
        var del = response.del
        /* -- 不需要record数据 */
        /* --if diff then diff.record = nil end */
        var delArr = []
        function getDelData(path, _table, arr) {
            /* -- body */
            for (let k in _table) {
                var nowPath
                if (path == null) {
                    nowPath = k
                } else {
                    nowPath = path + "." + k
                }

                let v = _table[k]
                if (IS_SERVER_DELETE_FLAG(v)) {
                    _table[k] = null
                    arr.push(nowPath)
                } else if (typeof v === 'object' && v !== null) {
                    getDelData(nowPath, v, arr)
                }
            }
        }
        getDelData(null, diff, delArr)
        if (delArr.length > 0) {
            if (response.del == null) {
                response.del = <any>{}
            }

            for (let i in delArr) {
                // TableUtil.setValueByPath(response.del, delArr[i], SERVER_DELETE_FLAG)
                // 简化版本：直接设置
                response.del[delArr[i]] = SERVER_DELETE_FLAG
            }
        }

        // 简化处理逻辑
        var needDiff = false
        if (del && Object.keys(del).length > 0) {
            needDiff = true
        }
        if (needDiff == false && diff && Object.keys(diff).length > 0) {
            needDiff = true
        }
        return needDiff
    }
}


