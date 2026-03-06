/**
 * 文件改动检测模块
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileWatcher {
    constructor() {
        this.cachePath = path.join(__dirname, '../cache/fileCache.json');
        this.cache = this.loadCache();
    }

    /**
     * 加载缓存
     */
    loadCache() {
        try {
            if (fs.existsSync(this.cachePath)) {
                const content = fs.readFileSync(this.cachePath, 'utf-8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.error('加载缓存失败:', error);
        }
        return {
            excelFiles: {},
            jsonFiles: {}
        };
    }

    /**
     * 保存缓存
     */
    saveCache() {
        try {
            fs.writeFileSync(this.cachePath, JSON.stringify(this.cache, null, 2), 'utf-8');
            return true;
        } catch (error) {
            console.error('保存缓存失败:', error);
            return false;
        }
    }

    /**
     * 计算文件哈希值
     */
    calculateHash(filePath) {
        try {
            const content = fs.readFileSync(filePath);
            return crypto.createHash('md5').update(content).digest('hex');
        } catch (error) {
            console.error('计算文件哈希失败:', error);
            return null;
        }
    }

    /**
     * 获取文件修改时间
     */
    getFileMtime(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.mtime.getTime();
        } catch (error) {
            console.error('获取文件修改时间失败:', error);
            return 0;
        }
    }

    /**
     * 检查Excel文件是否有改动
     */
    checkExcelChanged(filePath) {
        if (!fs.existsSync(filePath)) {
            return { changed: false, reason: '文件不存在' };
        }

        const mtime = this.getFileMtime(filePath);
        const hash = this.calculateHash(filePath);
        const cached = this.cache.excelFiles[filePath];

        if (!cached) {
            // 新文件
            return { changed: true, reason: '新文件' };
        }

        if (cached.mtime !== mtime || cached.hash !== hash) {
            return { changed: true, reason: '文件已修改' };
        }

        return { changed: false, reason: '未改动' };
    }

    /**
     * 更新Excel文件缓存
     */
    updateExcelCache(filePath, tableName) {
        const mtime = this.getFileMtime(filePath);
        const hash = this.calculateHash(filePath);
        
        this.cache.excelFiles[filePath] = {
            mtime: mtime,
            hash: hash,
            tableName: tableName
        };
        
        this.saveCache();
    }

    /**
     * 检查JSON文件是否有改动
     */
    checkJsonChanged(jsonPath) {
        if (!fs.existsSync(jsonPath)) {
            return { changed: false, reason: '文件不存在' };
        }

        const mtime = this.getFileMtime(jsonPath);
        const hash = this.calculateHash(jsonPath);
        const cached = this.cache.jsonFiles[jsonPath];

        if (!cached) {
            return { changed: true, reason: '新文件' };
        }

        if (cached.mtime !== mtime || cached.hash !== hash) {
            return { changed: true, reason: '文件已修改' };
        }

        return { changed: false, reason: '未改动' };
    }

    /**
     * 更新JSON文件缓存
     */
    updateJsonCache(jsonPath, tableNames) {
        const mtime = this.getFileMtime(jsonPath);
        const hash = this.calculateHash(jsonPath);
        
        this.cache.jsonFiles[jsonPath] = {
            mtime: mtime,
            hash: hash,
            tableNames: tableNames
        };
        
        this.saveCache();
    }

    /**
     * 获取所有Excel文件
     */
    getAllExcelFiles(excelLocation) {
        const files = [];
        
        try {
            if (!fs.existsSync(excelLocation)) {
                console.warn(`路径不存在: ${excelLocation}`);
                return files;
            }

            const items = fs.readdirSync(excelLocation);
            
            for (const item of items) {
                const fullPath = path.join(excelLocation, item);
                const stats = fs.statSync(fullPath);
                
                if (stats.isFile() && (item.endsWith('.xlsx') || item.endsWith('.xls'))) {
                    files.push(fullPath);
                } else if (stats.isDirectory()) {
                    // 递归查找子目录
                    const subFiles = this.getAllExcelFiles(fullPath);
                    files.push(...subFiles);
                }
            }
        } catch (error) {
            console.error('读取Excel文件列表失败:', error);
        }
        
        return files;
    }

    /**
     * 检测所有有改动的Excel文件
     */
    detectChangedFiles(excelLocation) {
        const changedFiles = [];
        const allFiles = this.getAllExcelFiles(excelLocation);
        
        for (const filePath of allFiles) {
            const result = this.checkExcelChanged(filePath);
            if (result.changed) {
                changedFiles.push(filePath);
            }
        }
        
        return changedFiles;
    }
}

module.exports = FileWatcher;

