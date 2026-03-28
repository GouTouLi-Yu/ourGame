import {
    Asset,
    AssetManager,
    AudioClip,
    error,
    instantiate,
    isValid,
    JsonAsset,
    Node,
    Prefab,
    resources,
    Sprite,
    SpriteAtlas,
    SpriteFrame,
    Texture2D,
} from "cc";
import { Debug } from "../debug/Debug";

/**
 * 资源类型枚举
 */
export enum ResourceType {
    /** 静态资源 - 常驻内存，不会被自动释放 */
    STATIC = "static",
    /** 动态资源 - 可以被自动释放 */
    DYNAMIC = "dynamic",
    /** 持久化资源 - 配置等，不会被释放 */
    PERSISTENT = "persistent",
}

/**
 * 资源信息接口
 */
export interface ResourceInfo {
    /** 资源路径 */
    path: string;
    /** 资源类型 */
    type: ResourceType;
    /** 资源实例 */
    asset: Asset;
    /** 引用计数 */
    refCount: number;
    /** 加载时间戳 */
    loadTime: number;
    /** 资源标签（用于批量释放） */
    tag?: string;
}

/**
 * 内存统计信息
 */
export interface MemoryStats {
    /** 静态资源数量 */
    staticCount: number;
    /** 动态资源数量 */
    dynamicCount: number;
    /** 持久化资源数量 */
    persistentCount: number;
    /** 总资源数量 */
    totalCount: number;
    /** 总引用计数 */
    totalRefCount: number;
}

/**
 * 资源管理器
 * 负责游戏资源的加载、管理和释放
 */
export class ResManager {
    /** 统一管理的资源 Map（包含所有类型的资源信息） */
    private static _resources: Map<string, ResourceInfo> = new Map<string, ResourceInfo>();

    /**
     * 初始化资源管理器
     */
    static init(): void {
        this._resources.clear();
    }

    /**
     * 清除所有管理的资源（不包含持久化资源）
     */
    static clearAllAssets(): void {
        Debug.printMemoryUsage(
            "资源清理前，内存占用情况 -------------------------------------------------------------"
        );

        setTimeout(() => {
            this._clearAllAssets();
            Debug.printMemoryUsage(
                "资源清理后，内存占用情况 -------------------------------------------------------------"
            );
        }, 100);
    }

    /**
     * 释放所有动态资源
     */
    static releaseDynamicResources(): void {
        Debug.printMemoryUsage("释放动态资源前，内存占用情况");
        const resourcesToRelease: string[] = [];
        
        // 收集所有动态资源路径
        this._resources.forEach((info, path) => {
            if (info.type === ResourceType.DYNAMIC) {
                resourcesToRelease.push(path);
            }
        });

        // 释放资源
        resourcesToRelease.forEach((path) => {
            try {
                this.releaseResource(path);
            } catch (e) {
                console.error(`[ResManager] Error releasing dynamic resource ${path}:`, e);
            }
        });
        Debug.printMemoryUsage("释放动态资源后，内存占用情况");
    }

    /**
     * 释放指定资源
     * @param path 资源路径
     * @param force 是否强制释放（即使有引用）
     * @returns 是否释放成功
     */
    static releaseResource(path: string, force: boolean = false): boolean {
        if (!path) {
            console.warn("[ResManager] Release path is empty");
            return false;
        }

        const resourceInfo = this._resources.get(path);
        if (!resourceInfo) {
            console.warn(`[ResManager] Resource not found: ${path}`);
            return false;
        }

        // 检查是否为静态资源（静态资源由引擎自动管理，不允许手动释放）
        if (resourceInfo.type === ResourceType.STATIC) {
            if (force) {
                console.warn(`[ResManager] Force releasing static resource ${path}, this is not recommended`);
            } else {
                console.warn(`[ResManager] Cannot release static resource ${path}, it's managed by engine`);
                return false;
            }
        }

        // 持久化资源通常不释放，除非强制释放
        if (resourceInfo.type === ResourceType.PERSISTENT && !force) {
            console.warn(`[ResManager] Cannot release persistent resource ${path} without force flag`);
            return false;
        }

        // 检查引用计数
        if (!force && resourceInfo.refCount > 1) {
            console.warn(
                `[ResManager] Resource ${path} has refCount ${resourceInfo.refCount}, cannot release`
            );
            return false;
        }

        // 释放资源
        try {
            const asset = resourceInfo.asset;
            if (isValid(asset)) {
                // 强制释放时，先减少引用计数
                if (force) {
                    while (asset.refCount > 0) {
                        asset.decRef();
                    }
                } else {
                    asset.decRef();
                }

                if (asset.refCount <= 0) {
                    asset.destroy();
                }
            }

            // 从资源 Map 中移除
            this._resources.delete(path);

            return true;
        } catch (e) {
            console.error(`[ResManager] Error releasing resource ${path}:`, e);
            return false;
        }
    }

    /**
     * 按标签批量释放资源
     * @param tag 资源标签
     * @param force 是否强制释放
     * @returns 释放的资源数量
     */
    static releaseResourcesByTag(tag: string, force: boolean = false): number {
        if (!tag) {
            console.warn("[ResManager] Tag is empty");
            return 0;
        }

        let releasedCount = 0;
        const resourcesToRelease: string[] = [];

        // 收集需要释放的资源路径（静态资源不参与批量释放）
        this._resources.forEach((info, path) => {
            if (info.tag === tag) {
                // 静态资源不参与批量释放
                if (info.type === ResourceType.STATIC && !force) {
                    return;
                }
                // 持久化资源需要 force 标志
                if (info.type === ResourceType.PERSISTENT && !force) {
                    return;
                }
                resourcesToRelease.push(path);
            }
        });

        // 释放资源
        resourcesToRelease.forEach((path) => {
            if (this.releaseResource(path, force)) {
                releasedCount++;
            }
        });

        return releasedCount;
    }

    /**
     * 自动释放未使用的资源（引用计数为 0）
     * @returns 释放的资源数量
     */
    static autoReleaseUnused(): number {
        let releasedCount = 0;
        const resourcesToRelease: string[] = [];

        // 收集引用计数为 0 的动态资源（静态和持久化资源不自动释放）
        this._resources.forEach((info, path) => {
            if (info.type === ResourceType.DYNAMIC && info.refCount <= 0) {
                resourcesToRelease.push(path);
            }
        });

        // 释放资源
        resourcesToRelease.forEach((path) => {
            if (this.releaseResource(path, false)) {
                releasedCount++;
            }
        });

        return releasedCount;
    }

    /**
     * 强制释放指定资源（即使有引用）
     * @param path 资源路径
     * @returns 是否释放成功
     */
    static forceRelease(path: string): boolean {
        return this.releaseResource(path, true);
    }

    /**
     * 内部方法：清除所有资源
     */
    private static _clearAllAssets(): void {
        const resourcesToRelease: string[] = [];
        
        // 收集所有动态资源（静态和持久化资源不清理）
        this._resources.forEach((info, path) => {
            if (info.type === ResourceType.DYNAMIC) {
                resourcesToRelease.push(path);
            }
        });

        // 释放资源
        resourcesToRelease.forEach((path) => {
            try {
                this.releaseResource(path);
            } catch (e) {
                console.error(`[ResManager] Error releasing resource ${path}:`, e);
            }
        });

        // 释放无引用的资源
        const assets = AssetManager.instance.assets;
        const toDestroy: Array<{ key: string; asset: Asset }> = [];
        
        // 先收集需要销毁的资源
        assets.forEach((asset, key) => {
            if (asset.refCount <= 0) {
                toDestroy.push({ key, asset });
            }
        });

        // 然后统一销毁
        toDestroy.forEach(({ key, asset }) => {
            try {
                asset.destroy();
                // 如果destroy后需要从assets中移除
                assets.remove(key);
            } catch (e) {
                console.error(`[ResManager] Error destroying asset ${key}:`, e);
            }
        });
    }

    /**
     * 打印资源信息（调试用）
     */
    static printAssetInfo(): void {
        const assets = AssetManager.instance.assets;
        let assetCount = 0;
        assets.forEach(() => {
            assetCount++;
        });

        const staticCount = this.getResourceCount(ResourceType.STATIC);
        const dynamicCount = this.getResourceCount(ResourceType.DYNAMIC);
        const persistentCount = this.getResourceCount(ResourceType.PERSISTENT);

        console.log("========== 资源信息 ==========");
        assets.forEach((asset, key) => {
            console.log(`资源名: ${asset.name}, 引用计数: ${asset.refCount}`);
            console.log("------------------------------------");
        });
        console.log(`总资源数: ${assetCount}`);
        console.log(`管理资源数: ${this._resources.size}`);
        console.log(`静态资源数: ${staticCount} (由引擎自动管理)`);
        console.log(`动态资源数: ${dynamicCount}`);
        console.log(`持久化资源数: ${persistentCount}`);
    }

    /**
     * 获取资源引用计数
     * @param path 资源路径
     * @returns 引用计数，如果资源不存在返回 -1
     */
    static getResourceRefCount(path: string): number {
        if (!path) {
            return -1;
        }

        const resourceInfo = this._resources.get(path);
        if (resourceInfo) {
            return resourceInfo.asset.refCount;
        }

        return -1;
    }

    /**
     * 获取资源详细信息
     * @param path 资源路径
     * @returns ResourceInfo 或 null
     */
    static getResourceInfo(path: string): ResourceInfo | null {
        if (!path) {
            return null;
        }

        const resourceInfo = this._resources.get(path);
        if (resourceInfo) {
            // 更新引用计数
            resourceInfo.refCount = resourceInfo.asset.refCount;
            return resourceInfo;
        }

        return null;
    }

    /**
     * 获取内存统计信息
     * @returns MemoryStats
     */
    static getMemoryStats(): MemoryStats {
        let staticCount = 0;
        let dynamicCount = 0;
        let persistentCount = 0;
        let totalRefCount = 0;

        this._resources.forEach((info) => {
            if (info.type === ResourceType.STATIC) {
                staticCount++;
            } else if (info.type === ResourceType.DYNAMIC) {
                dynamicCount++;
            } else if (info.type === ResourceType.PERSISTENT) {
                persistentCount++;
            }
            totalRefCount += info.asset.refCount;
        });

        return {
            staticCount,
            dynamicCount,
            persistentCount,
            totalCount: staticCount + dynamicCount + persistentCount,
            totalRefCount,
        };
    }

    /**
     * 打印详细资源统计
     */
    static printResourceStats(): void {
        const stats = this.getMemoryStats();
        console.log("========== 资源统计 ==========");
        console.log(`静态资源数量: ${stats.staticCount}`);
        console.log(`动态资源数量: ${stats.dynamicCount}`);
        console.log(`持久化资源数量: ${stats.persistentCount}`);
        console.log(`总资源数量: ${stats.totalCount}`);
        console.log(`总引用计数: ${stats.totalRefCount}`);
        console.log("==============================");

        if (stats.staticCount > 0) {
            console.log("\n静态资源列表（由引擎自动管理）:");
            this._resources.forEach((info, path) => {
                if (info.type === ResourceType.STATIC) {
                    console.log(
                        `  ${path} - 引用计数: ${info.asset.refCount}, 标签: ${info.tag || "无"}`
                    );
                }
            });
        }

        if (stats.dynamicCount > 0) {
            console.log("\n动态资源列表:");
            this._resources.forEach((info, path) => {
                if (info.type === ResourceType.DYNAMIC) {
                    console.log(
                        `  ${path} - 引用计数: ${info.asset.refCount}, 标签: ${info.tag || "无"}`
                    );
                }
            });
        }

        if (stats.persistentCount > 0) {
            console.log("\n持久化资源列表:");
            this._resources.forEach((info, path) => {
                if (info.type === ResourceType.PERSISTENT) {
                    console.log(
                        `  ${path} - 引用计数: ${info.asset.refCount}, 标签: ${info.tag || "无"}`
                    );
                }
            });
        }
    }

    /**
     * 获取各类型资源数量
     * @param resourceType 资源类型
     * @returns 资源数量
     */
    static getResourceCount(resourceType?: ResourceType): number {
        if (!resourceType) {
            return this._resources.size;
        }

        let count = 0;
        this._resources.forEach((info) => {
            if (info.type === resourceType) {
                count++;
            }
        });
        return count;
    }

    /**
     * 加载预制体
     * @param path 资源路径
     * @param resourceType 资源类型（默认动态）
     * @param tag 资源标签（可选）
     * @returns 实例化后的节点
     */
    static async loadPrefab(
        path: string,
        resourceType: ResourceType = ResourceType.DYNAMIC,
        tag?: string
    ): Promise<Node | null> {
        if (!path) {
            error("[ResManager] Prefab path is empty");
            return null;
        }

        try {
            const prefab = await this.loadAsset<Prefab>(path, Prefab, resourceType, tag);
            if (!prefab) {
                error(`[ResManager] Prefab at ${path} is null`);
                return null;
            }

            const node = instantiate(prefab);
            if (!node) {
                this.releaseResource(path);
                error(`[ResManager] Failed to instantiate prefab at ${path}`);
                return null;
            }

            return node;
        } catch (err) {
            error(`[ResManager] Failed to load prefab at ${path}:`, err);
            return null;
        }
    }

    /**
     * 加载纹理并设置到Sprite组件
     * @param node 目标节点
     * @param path 资源路径
     * @param resourceType 资源类型（默认动态）
     * @param tag 资源标签（可选）
     */
    static async loadTexture(
        node: Node,
        path: string,
        resourceType: ResourceType = ResourceType.DYNAMIC,
        tag?: string
    ): Promise<void> {
        const spriteFramePath = path + "/spriteFrame";
        if (!node || !isValid(node)) {
            throw new Error("[ResManager] Invalid node");
        }

        const sprite = node.getComponent(Sprite);
        if (!sprite) {
            throw new Error(
                `[ResManager] Node "${node.name}" has no Sprite component`
            );
        }

        if (!path) {
            throw new Error("[ResManager] Texture path is empty");
        }

        try {
            const newSpriteFrame = await this.loadAsset<SpriteFrame>(
                spriteFramePath,
                SpriteFrame,
                resourceType,
                tag
            );
            if (!newSpriteFrame) {
                throw new Error("[ResManager] Loaded SpriteFrame is null");
            }

            const oldSpriteFrame = sprite.spriteFrame;
            sprite.spriteFrame = newSpriteFrame;

            // 管理新资源（使用唯一键）
            const newKey = `${spriteFramePath}_${node.uuid}`;
            const resourceInfo: ResourceInfo = {
                path: newKey,
                type: resourceType,
                asset: newSpriteFrame,
                refCount: newSpriteFrame.refCount,
                loadTime: Date.now(),
                tag: tag,
            };

            // 添加到统一的资源 Map
            this._resources.set(newKey, resourceInfo);

            // 释放旧资源
            if (oldSpriteFrame) {
                const oldKey = this.findAssetKeyByValue(oldSpriteFrame);
                if (oldKey) {
                    this.releaseResource(oldKey);
                }
            }
        } catch (err) {
            error(`[ResManager] Failed to load texture at ${path}:`, err);
            throw err;
        }
    }

    /**
     * 加载配置文件（不会被自动释放）
     * @param path 资源路径
     * @param tag 资源标签（可选）
     * @returns JsonAsset数组
     */
    static async loadConfig(path: string, tag?: string): Promise<JsonAsset[]> {
        if (!path) {
            throw new Error("[ResManager] Config path is empty");
        }

        try {
            const jsonAssets = await this.loadDir<JsonAsset>(
                path,
                JsonAsset,
                ResourceType.PERSISTENT,
                tag
            );
            return jsonAssets;
        } catch (err) {
            error(`[ResManager] Failed to load config at ${path}:`, err);
            throw err;
        }
    }

    /**
     * 加载音频资源
     * @param path 资源路径
     * @param resourceType 资源类型（默认动态）
     * @param tag 资源标签（可选）
     * @returns AudioClip
     */
    static async loadAudioClip(
        path: string,
        resourceType: ResourceType = ResourceType.DYNAMIC,
        tag?: string
    ): Promise<AudioClip | null> {
        if (!path) {
            error("[ResManager] AudioClip path is empty");
            return null;
        }

        try {
            const audioClip = await this.loadAsset<AudioClip>(
                path,
                AudioClip,
                resourceType,
                tag
            );
            return audioClip;
        } catch (err) {
            error(`[ResManager] Failed to load AudioClip at ${path}:`, err);
            return null;
        }
    }

    /**
     * 加载 2D 纹理
     * @param path 资源路径
     * @param resourceType 资源类型（默认动态）
     * @param tag 资源标签（可选）
     * @returns Texture2D
     */
    static async loadTexture2D(
        path: string,
        resourceType: ResourceType = ResourceType.DYNAMIC,
        tag?: string
    ): Promise<Texture2D | null> {
        if (!path) {
            error("[ResManager] Texture2D path is empty");
            return null;
        }

        try {
            const texture = await this.loadAsset<Texture2D>(
                path,
                Texture2D,
                resourceType,
                tag
            );
            return texture;
        } catch (err) {
            error(`[ResManager] Failed to load Texture2D at ${path}:`, err);
            return null;
        }
    }

    /**
     * 加载图集
     * @param path 资源路径
     * @param resourceType 资源类型（默认动态）
     * @param tag 资源标签（可选）
     * @returns SpriteAtlas
     */
    static async loadSpriteAtlas(
        path: string,
        resourceType: ResourceType = ResourceType.DYNAMIC,
        tag?: string
    ): Promise<SpriteAtlas | null> {
        if (!path) {
            error("[ResManager] SpriteAtlas path is empty");
            return null;
        }

        try {
            const atlas = await this.loadAsset<SpriteAtlas>(
                path,
                SpriteAtlas,
                resourceType,
                tag
            );
            return atlas;
        } catch (err) {
            error(`[ResManager] Failed to load SpriteAtlas at ${path}:`, err);
            return null;
        }
    }

    /**
     * 加载 Spine 动画资源
     * @param path 资源路径（需要包含 .json 或 .skel 扩展名）
     * @param resourceType 资源类型（默认动态）
     * @param tag 资源标签（可选）
     * @returns Spine 资源（sp.SkeletonData 类型）
     * @note 调用者需要传入正确的类型，例如：import { sp } from "cc"; ResManager.loadSpineWithType(path, sp.SkeletonData)
     */
    static async loadSpine(
        path: string,
        resourceType: ResourceType = ResourceType.DYNAMIC,
        tag?: string
    ): Promise<any | null> {
        if (!path) {
            error("[ResManager] Spine path is empty");
            return null;
        }

        // 使用 loadAssetWithType 方法，需要调用者传入类型
        error("[ResManager] loadSpine requires type parameter. Use loadAssetWithType instead.");
        return null;
    }

    /**
     * 使用指定类型加载资源（用于 Spine、DragonBones 等需要特殊类型的资源）
     * @param path 资源路径
     * @param type 资源类型类
     * @param resourceType 资源分类（静态/动态/持久化）
     * @param tag 资源标签（可选）
     * @returns Promise<T>
     */
    static async loadAssetWithType<T extends Asset>(
        path: string,
        type: typeof Asset,
        resourceType: ResourceType = ResourceType.DYNAMIC,
        tag?: string
    ): Promise<T | null> {
        if (!path) {
            error("[ResManager] Resource path is empty");
            return null;
        }

        try {
            const asset = await this.loadAsset<T>(path, type, resourceType, tag);
            return asset;
        } catch (err) {
            error(`[ResManager] Failed to load asset at ${path}:`, err);
            return null;
        }
    }

    /**
     * 加载 DragonBones 动画资源
     * @param path 资源路径（需要包含 .json 扩展名）
     * @param resourceType 资源类型（默认动态）
     * @param tag 资源标签（可选）
     * @returns DragonBones 资源（dragonBones.DragonBonesAsset 类型）
     * @note 调用者需要传入正确的类型，例如：import { dragonBones } from "cc"; ResManager.loadDragonBonesWithType(path, dragonBones.DragonBonesAsset)
     */
    static async loadDragonBones(
        path: string,
        resourceType: ResourceType = ResourceType.DYNAMIC,
        tag?: string
    ): Promise<any | null> {
        if (!path) {
            error("[ResManager] DragonBones path is empty");
            return null;
        }

        // 使用 loadAssetWithType 方法，需要调用者传入类型
        error("[ResManager] loadDragonBones requires type parameter. Use loadAssetWithType instead.");
        return null;
    }

    /**
     * 通用资源加载方法
     * @param path 资源路径
     * @param type 资源类型类
     * @param resourceType 资源分类（静态/动态/持久化）
     * @param tag 资源标签（可选）
     * @returns Promise<T>
     */
    private static loadAsset<T extends Asset>(
        path: string,
        type: typeof Asset,
        resourceType: ResourceType = ResourceType.DYNAMIC,
        tag?: string
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            resources.load(path, type, (err: Error | null, asset: T) => {
                if (err || !asset) {
                    reject(err || new Error(`Asset at ${path} is null`));
                    return;
                }
                asset.addRef();

                // 创建资源信息
                const resourceInfo: ResourceInfo = {
                    path: path,
                    type: resourceType,
                    asset: asset,
                    refCount: asset.refCount,
                    loadTime: Date.now(),
                    tag: tag,
                };

                // 添加到统一的资源 Map
                this._resources.set(path, resourceInfo);

                resolve(asset);
            });
        });
    }

    /**
     * 通用目录资源加载方法
     * @param path 资源路径
     * @param type 资源类型类
     * @param resourceType 资源分类（静态/动态/持久化）
     * @param tag 资源标签（可选）
     * @returns Promise<T[]>
     */
    private static loadDir<T extends Asset>(
        path: string,
        type: typeof Asset,
        resourceType: ResourceType = ResourceType.DYNAMIC,
        tag?: string
    ): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            resources.loadDir(path, type, (err: Error | null, assets: T[]) => {
                if (err || !assets) {
                    reject(err || new Error(`Assets at ${path} are null`));
                    return;
                }
                assets.forEach((asset) => {
                    asset.addRef();

                    // 创建资源信息（使用路径+资源名作为唯一键）
                    const assetPath = `${path}/${asset.name}`;
                    const resourceInfo: ResourceInfo = {
                        path: assetPath,
                        type: resourceType,
                        asset: asset,
                        refCount: asset.refCount,
                        loadTime: Date.now(),
                        tag: tag,
                    };

                    // 添加到统一的资源 Map
                    this._resources.set(assetPath, resourceInfo);
                });
                resolve(assets);
            });
        });
    }

    /**
     * 通过资源实例查找键名
     */
    private static findAssetKeyByValue(
        asset: Asset | null
    ): string | undefined {
        if (!asset || !isValid(asset)) return undefined;

        for (const [key, info] of this._resources.entries()) {
            if (info.asset === asset) return key;
        }
        return undefined;
    }
}

