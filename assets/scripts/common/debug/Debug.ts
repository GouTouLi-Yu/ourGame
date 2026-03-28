/**
 * 调试工具类
 * 提供调试相关的功能，如内存监控、日志等
 */
export class Debug {
    private static _isDebugMode: boolean = true;

    /**
     * 设置调试模式
     * @param enabled 是否启用调试模式
     */
    static setDebugMode(enabled: boolean): void {
        this._isDebugMode = enabled;
    }

    /**
     * 获取是否处于调试模式
     */
    static get isDebugMode(): boolean {
        return this._isDebugMode;
    }

    /**
     * 打印内存使用情况
     * @param label 标签
     */
    static printMemoryUsage(label: string = "Memory usage"): void {
        if (!this._isDebugMode) {
            return;
        }

        try {
            // Node.js 环境
            if (typeof process !== "undefined" && process.versions?.node) {
                const mem = process.memoryUsage();
                console.log(`[${label}] Node.js Memory:
  RSS: ${this.formatBytes(mem.rss)}
  HeapTotal: ${this.formatBytes(mem.heapTotal)}
  HeapUsed: ${this.formatBytes(mem.heapUsed)}
  External: ${this.formatBytes(mem.external)}`);
                return;
            }

            // 浏览器环境（Chrome）
            const perf = window.performance as Performance & {
                memory?: {
                    usedJSHeapSize: number;
                    totalJSHeapSize: number;
                    jsHeapSizeLimit: number;
                };
            };
            if (perf.memory) {
                console.log(`[${label}] Browser Memory:
  Used: ${this.formatBytes(perf.memory.usedJSHeapSize)}
  Total: ${this.formatBytes(perf.memory.totalJSHeapSize)}
  Limit: ${this.formatBytes(perf.memory.jsHeapSizeLimit)}`);
                return;
            }

            console.warn(`[${label}] Memory API not available`);
        } catch (e) {
            console.error(`[Debug] Memory check failed:`, e);
        }
    }

    /**
     * 格式化字节显示
     * @param bytes 字节数
     * @returns 格式化后的字符串
     */
    static formatBytes(bytes: number): string {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    /**
     * 打印对象信息（调试用）
     * @param obj 对象
     * @param label 标签
     */
    static printObject(obj: any, label: string = "Object"): void {
        if (!this._isDebugMode) {
            return;
        }
        console.log(`[${label}]`, obj);
    }

    /**
     * 打印警告信息
     * @param message 消息
     * @param ...args 额外参数
     */
    static warn(message: string, ...args: any[]): void {
        if (!this._isDebugMode) {
            return;
        }
        console.warn(`[Debug] ${message}`, ...args);
    }

    /**
     * 打印错误信息
     * @param message 消息
     * @param ...args 额外参数
     */
    static error(message: string, ...args: any[]): void {
        console.error(`[Debug] ${message}`, ...args);
    }

    /**
     * 打印信息
     * @param message 消息
     * @param ...args 额外参数
     */
    static log(message: string, ...args: any[]): void {
        if (!this._isDebugMode) {
            return;
        }
        console.log(`[Debug] ${message}`, ...args);
    }

    /**
     * 性能计时开始
     * @param label 标签
     */
    static time(label: string): void {
        if (!this._isDebugMode) {
            return;
        }
        console.time(`[Debug] ${label}`);
    }

    /**
     * 性能计时结束
     * @param label 标签
     */
    static timeEnd(label: string): void {
        if (!this._isDebugMode) {
            return;
        }
        console.timeEnd(`[Debug] ${label}`);
    }
}

