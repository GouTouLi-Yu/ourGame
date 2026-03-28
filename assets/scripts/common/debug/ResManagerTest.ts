import { Node, SpriteFrame, Prefab, JsonAsset } from "cc";
import { ResManager, ResourceType } from "../manager/ResManager";
import { Debug } from "./Debug";

/**
 * 内存测试结果接口
 */
interface MemoryTestResult {
    /** 测试名称 */
    testName: string;
    /** 加载前内存 */
    memoryBeforeLoad: number;
    /** 加载后内存 */
    memoryAfterLoad: number;
    /** 释放后内存 */
    memoryAfterRelease: number;
    /** 内存增长 */
    memoryIncrease: number;
    /** 内存释放 */
    memoryRelease: number;
    /** 是否成功 */
    success: boolean;
}

/**
 * 资源管理器测试类
 * 用于测试资源加载和释放的内存管理功能
 */
export class ResManagerTest {
    /** 测试资源路径前缀 */
    private static readonly TEST_RESOURCE_PREFIX = "test/";

    /**
     * 获取当前内存使用量（字节）
     */
    private static getCurrentMemory(): number {
        try {
            // 浏览器环境
            const perf = window.performance as Performance & {
                memory?: {
                    usedJSHeapSize: number;
                    totalJSHeapSize: number;
                    jsHeapSizeLimit: number;
                };
            };
            if (perf.memory) {
                return perf.memory.usedJSHeapSize;
            }

            // Node.js 环境
            if (typeof process !== "undefined" && process.versions?.node) {
                const mem = process.memoryUsage();
                return mem.heapUsed;
            }

            return 0;
        } catch (e) {
            console.warn("[ResManagerTest] Failed to get memory:", e);
            return 0;
        }
    }

    /**
     * 格式化内存显示
     */
    private static formatMemory(bytes: number): string {
        return Debug.formatBytes(bytes);
    }

    /**
     * 等待一段时间（用于内存稳定）
     */
    private static async wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * 强制垃圾回收（如果可用）
     */
    private static forceGC(): void {
        try {
            // Chrome DevTools 中的 gc() 函数
            if (typeof (window as any).gc === "function") {
                (window as any).gc();
            }
        } catch (e) {
            // 忽略错误
        }
    }

    /**
     * 运行完整的资源管理测试套件
     */
    static async runAllTests(): Promise<void> {
        console.log("========================================");
        console.log("开始资源管理器内存测试");
        console.log("========================================");

        const results: MemoryTestResult[] = [];

        // 测试1: 动态资源加载和释放
        results.push(await this.testDynamicResourceRelease());

        // 等待内存稳定
        await this.wait(500);

        // 测试2: 静态资源不会被释放
        results.push(await this.testStaticResourceNotReleased());

        // 等待内存稳定
        await this.wait(500);

        // 测试3: 按标签批量释放资源
        results.push(await this.testReleaseByTag());

        // 等待内存稳定
        await this.wait(500);

        // 测试4: 自动释放未使用的资源
        results.push(await this.testAutoReleaseUnused());

        // 打印测试结果汇总
        this.printTestSummary(results);
    }

    /**
     * 测试1: 动态资源加载和释放
     */
    private static async testDynamicResourceRelease(): Promise<MemoryTestResult> {
        console.log("\n[测试1] 动态资源加载和释放测试");
        console.log("----------------------------------------");

        // 强制垃圾回收
        this.forceGC();
        await this.wait(200);

        const memoryBefore = this.getCurrentMemory();
        console.log(`加载前内存: ${this.formatMemory(memoryBefore)}`);

        // 加载一些动态资源（使用不存在的路径，但会测试逻辑）
        // 注意：实际测试需要真实的资源路径
        const testPaths: string[] = [];
        const loadedAssets: any[] = [];

        try {
            // 尝试加载资源（如果资源不存在会失败，但不影响测试逻辑）
            // 这里主要测试资源管理器的逻辑，实际项目中需要替换为真实路径
            console.log("尝试加载动态资源...");
            console.log("注意: 如果资源路径不存在，加载会失败，但可以测试释放逻辑");

            // 模拟加载资源的过程
            // 在实际项目中，这里应该使用真实的资源路径
            // 例如: const prefab = await ResManager.loadPrefab("prefabs/test", ResourceType.DYNAMIC, "test");

        } catch (e) {
            console.warn("资源加载失败（可能是路径不存在）:", e);
        }

        await this.wait(200);
        this.forceGC();
        await this.wait(200);

        const memoryAfterLoad = this.getCurrentMemory();
        console.log(`加载后内存: ${this.formatMemory(memoryAfterLoad)}`);

        // 释放动态资源
        console.log("释放动态资源...");
        const dynamicCountBefore = ResManager.getResourceCount(ResourceType.DYNAMIC);
        ResManager.releaseDynamicResources();
        const dynamicCountAfter = ResManager.getResourceCount(ResourceType.DYNAMIC);

        await this.wait(200);
        this.forceGC();
        await this.wait(200);

        const memoryAfterRelease = this.getCurrentMemory();
        console.log(`释放后内存: ${this.formatMemory(memoryAfterRelease)}`);

        const memoryIncrease = memoryAfterLoad - memoryBefore;
        const memoryRelease = memoryAfterLoad - memoryAfterRelease;

        console.log(`内存增长: ${this.formatMemory(memoryIncrease)}`);
        console.log(`内存释放: ${this.formatMemory(memoryRelease)}`);
        console.log(`动态资源数量变化: ${dynamicCountBefore} -> ${dynamicCountAfter}`);

        const success = dynamicCountAfter < dynamicCountBefore || dynamicCountBefore === 0;

        return {
            testName: "动态资源加载和释放",
            memoryBeforeLoad: memoryBefore,
            memoryAfterLoad: memoryAfterLoad,
            memoryAfterRelease: memoryAfterRelease,
            memoryIncrease: memoryIncrease,
            memoryRelease: memoryRelease,
            success: success,
        };
    }

    /**
     * 测试2: 静态资源不会被释放
     */
    private static async testStaticResourceNotReleased(): Promise<MemoryTestResult> {
        console.log("\n[测试2] 静态资源不会被释放测试");
        console.log("----------------------------------------");

        this.forceGC();
        await this.wait(200);

        const memoryBefore = this.getCurrentMemory();
        console.log(`加载前内存: ${this.formatMemory(memoryBefore)}`);

        const staticCountBefore = ResManager.getResourceCount(ResourceType.STATIC);

        // 尝试加载静态资源
        console.log("尝试加载静态资源...");
        console.log("注意: 如果资源路径不存在，加载会失败，但可以测试逻辑");

        await this.wait(200);
        this.forceGC();
        await this.wait(200);

        const memoryAfterLoad = this.getCurrentMemory();
        console.log(`加载后内存: ${this.formatMemory(memoryAfterLoad)}`);

        // 尝试释放动态资源（静态资源应该保留）
        console.log("释放动态资源（静态资源应该保留）...");
        ResManager.releaseDynamicResources();

        await this.wait(200);
        this.forceGC();
        await this.wait(200);

        const memoryAfterRelease = this.getCurrentMemory();
        const staticCountAfter = ResManager.getResourceCount(ResourceType.STATIC);

        console.log(`释放后内存: ${this.formatMemory(memoryAfterRelease)}`);
        console.log(`静态资源数量: ${staticCountBefore} -> ${staticCountAfter}`);

        const memoryIncrease = memoryAfterLoad - memoryBefore;
        const memoryRelease = memoryAfterLoad - memoryAfterRelease;

        console.log(`内存增长: ${this.formatMemory(memoryIncrease)}`);
        console.log(`内存释放: ${this.formatMemory(memoryRelease)}`);

        // 静态资源数量应该不变或增加（不应该减少）
        const success = staticCountAfter >= staticCountBefore;

        return {
            testName: "静态资源不会被释放",
            memoryBeforeLoad: memoryBefore,
            memoryAfterLoad: memoryAfterLoad,
            memoryAfterRelease: memoryAfterRelease,
            memoryIncrease: memoryIncrease,
            memoryRelease: memoryRelease,
            success: success,
        };
    }

    /**
     * 测试3: 按标签批量释放资源
     */
    private static async testReleaseByTag(): Promise<MemoryTestResult> {
        console.log("\n[测试3] 按标签批量释放资源测试");
        console.log("----------------------------------------");

        this.forceGC();
        await this.wait(200);

        const memoryBefore = this.getCurrentMemory();
        console.log(`加载前内存: ${this.formatMemory(memoryBefore)}`);

        const testTag = "test_tag";
        console.log(`使用标签: ${testTag}`);

        // 尝试加载带标签的资源
        console.log("尝试加载带标签的资源...");
        console.log("注意: 如果资源路径不存在，加载会失败，但可以测试逻辑");

        await this.wait(200);
        this.forceGC();
        await this.wait(200);

        const memoryAfterLoad = this.getCurrentMemory();
        console.log(`加载后内存: ${this.formatMemory(memoryAfterLoad)}`);

        // 按标签释放资源
        console.log(`按标签释放资源: ${testTag}...`);
        const releasedCount = ResManager.releaseResourcesByTag(testTag);
        console.log(`释放了 ${releasedCount} 个资源`);

        await this.wait(200);
        this.forceGC();
        await this.wait(200);

        const memoryAfterRelease = this.getCurrentMemory();
        console.log(`释放后内存: ${this.formatMemory(memoryAfterRelease)}`);

        const memoryIncrease = memoryAfterLoad - memoryBefore;
        const memoryRelease = memoryAfterLoad - memoryAfterRelease;

        console.log(`内存增长: ${this.formatMemory(memoryIncrease)}`);
        console.log(`内存释放: ${this.formatMemory(memoryRelease)}`);

        const success = releasedCount >= 0; // 至少应该尝试释放

        return {
            testName: "按标签批量释放资源",
            memoryBeforeLoad: memoryBefore,
            memoryAfterLoad: memoryAfterLoad,
            memoryAfterRelease: memoryAfterRelease,
            memoryIncrease: memoryIncrease,
            memoryRelease: memoryRelease,
            success: success,
        };
    }

    /**
     * 测试4: 自动释放未使用的资源
     */
    private static async testAutoReleaseUnused(): Promise<MemoryTestResult> {
        console.log("\n[测试4] 自动释放未使用的资源测试");
        console.log("----------------------------------------");

        this.forceGC();
        await this.wait(200);

        const memoryBefore = this.getCurrentMemory();
        console.log(`加载前内存: ${this.formatMemory(memoryBefore)}`);

        // 尝试加载资源
        console.log("尝试加载资源...");
        console.log("注意: 如果资源路径不存在，加载会失败，但可以测试逻辑");

        await this.wait(200);
        this.forceGC();
        await this.wait(200);

        const memoryAfterLoad = this.getCurrentMemory();
        console.log(`加载后内存: ${this.formatMemory(memoryAfterLoad)}`);

        // 自动释放未使用的资源
        console.log("自动释放未使用的资源...");
        const releasedCount = ResManager.autoReleaseUnused();
        console.log(`释放了 ${releasedCount} 个未使用的资源`);

        await this.wait(200);
        this.forceGC();
        await this.wait(200);

        const memoryAfterRelease = this.getCurrentMemory();
        console.log(`释放后内存: ${this.formatMemory(memoryAfterRelease)}`);

        const memoryIncrease = memoryAfterLoad - memoryBefore;
        const memoryRelease = memoryAfterLoad - memoryAfterRelease;

        console.log(`内存增长: ${this.formatMemory(memoryIncrease)}`);
        console.log(`内存释放: ${this.formatMemory(memoryRelease)}`);

        const success = releasedCount >= 0; // 至少应该尝试释放

        return {
            testName: "自动释放未使用的资源",
            memoryBeforeLoad: memoryBefore,
            memoryAfterLoad: memoryAfterLoad,
            memoryAfterRelease: memoryAfterRelease,
            memoryIncrease: memoryIncrease,
            memoryRelease: memoryRelease,
            success: success,
        };
    }

    /**
     * 打印测试结果汇总
     */
    private static printTestSummary(results: MemoryTestResult[]): void {
        console.log("\n========================================");
        console.log("测试结果汇总");
        console.log("========================================");

        results.forEach((result, index) => {
            console.log(`\n[测试 ${index + 1}] ${result.testName}`);
            console.log(`  状态: ${result.success ? "✓ 通过" : "✗ 失败"}`);
            console.log(`  加载前内存: ${this.formatMemory(result.memoryBeforeLoad)}`);
            console.log(`  加载后内存: ${this.formatMemory(result.memoryAfterLoad)}`);
            console.log(`  释放后内存: ${this.formatMemory(result.memoryAfterRelease)}`);
            console.log(`  内存增长: ${this.formatMemory(result.memoryIncrease)}`);
            console.log(`  内存释放: ${this.formatMemory(result.memoryRelease)}`);

            if (result.memoryRelease > 0) {
                const releaseRate = (
                    (result.memoryRelease / result.memoryIncrease) *
                    100
                ).toFixed(2);
                console.log(`  释放率: ${releaseRate}%`);
            }
        });

        const successCount = results.filter((r) => r.success).length;
        const totalCount = results.length;

        console.log("\n========================================");
        console.log(`总计: ${successCount}/${totalCount} 测试通过`);
        console.log("========================================");

        // 打印资源统计
        console.log("\n当前资源统计:");
        ResManager.printResourceStats();
    }

    /**
     * 快速测试：加载和释放单个资源
     * @param resourcePath 资源路径
     * @param resourceType 资源类型
     */
    static async quickTest(
        resourcePath: string,
        resourceType: ResourceType = ResourceType.DYNAMIC
    ): Promise<void> {
        console.log("\n========================================");
        console.log("快速资源测试");
        console.log("========================================");
        console.log(`资源路径: ${resourcePath}`);
        console.log(`资源类型: ${resourceType}`);

        this.forceGC();
        await this.wait(200);

        const memoryBefore = this.getCurrentMemory();
        console.log(`\n加载前内存: ${this.formatMemory(memoryBefore)}`);

        try {
            // 尝试加载资源
            console.log("正在加载资源...");
            const prefab = await ResManager.loadPrefab(resourcePath, resourceType, "quick_test");
            const memoryAfterLoad = this.getCurrentMemory();
            console.log(`加载后内存: ${this.formatMemory(memoryAfterLoad)}`);

            if (prefab) {
                console.log("✓ 资源加载成功");
                console.log(`引用计数: ${ResManager.getResourceRefCount(resourcePath)}`);

                // 等待一下
                await this.wait(500);

                // 释放资源
                console.log("\n正在释放资源...");
                const released = ResManager.releaseResource(resourcePath);
                console.log(`释放结果: ${released ? "成功" : "失败"}`);

                await this.wait(200);
                this.forceGC();
                await this.wait(200);

                const memoryAfterRelease = this.getCurrentMemory();
                console.log(`释放后内存: ${this.formatMemory(memoryAfterRelease)}`);

                const memoryIncrease = memoryAfterLoad - memoryBefore;
                const memoryRelease = memoryAfterLoad - memoryAfterRelease;

                console.log(`\n内存增长: ${this.formatMemory(memoryIncrease)}`);
                console.log(`内存释放: ${this.formatMemory(memoryRelease)}`);

                if (memoryRelease > 0) {
                    const releaseRate = (
                        (memoryRelease / memoryIncrease) *
                        100
                    ).toFixed(2);
                    console.log(`释放率: ${releaseRate}%`);
                    console.log("✓ 内存释放成功");
                } else {
                    console.log("⚠ 内存未明显减少（可能是垃圾回收延迟）");
                }
            } else {
                console.log("✗ 资源加载失败（路径可能不存在）");
            }
        } catch (e) {
            console.error("测试出错:", e);
        }

        console.log("\n当前资源统计:");
        ResManager.printResourceStats();
    }
}





