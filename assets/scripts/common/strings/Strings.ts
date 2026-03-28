import { stringsMap } from "./StringConstants";
import { ConfigReader } from "../ConfigReader/ConfigReader";

/**
 * 字符串管理器
 * 提供多语言支持和字符串模板解析
 */
export class Strings {
    /**
     * 获取字符串
     * @param str 字符串键
     * @param data 模板数据（可选）
     * @returns 解析后的字符串
     */
    static get(str: string, data?: Record<string, any>): string {
        // 可以从配置表获取翻译
        // str = ConfigReader.getDataByIdAndKey("Translate", str, "text");
        
        // 从字符串映射表获取
        let result = stringsMap[str];
        
        // 如果映射表中没有，返回原字符串
        if (!result) {
            console.warn(`[Strings] String key "${str}" not found in stringsMap`);
            result = str;
        }

        // 解析模板
        return this.parseTemplate(result, data);
    }

    /**
     * 动态解析模板字符串
     * 支持 ${variableName} 格式的变量替换
     * @param text 模板文本
     * @param variables 变量对象
     * @returns 解析后的字符串
     */
    private static parseTemplate(
        text: string,
        variables?: Record<string, any>
    ): string {
        if (!variables) {
            return text;
        }

        return text.replace(/\$\{(\w+)\}/g, (match, p1) => {
            // 检查变量是否存在
            if (variables.hasOwnProperty(p1)) {
                return String(variables[p1]); // 转为字符串
            }
            return match; // 不匹配的保持原样
        });
    }

    /**
     * 格式化字符串（支持多个参数）
     * @param str 字符串键
     * @param ...args 参数列表
     * @returns 格式化后的字符串
     */
    static format(str: string, ...args: any[]): string {
        let result = stringsMap[str] || str;
        args.forEach((arg, index) => {
            result = result.replace(`{${index}}`, String(arg));
        });
        return result;
    }
}

