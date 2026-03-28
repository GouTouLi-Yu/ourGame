/**
 * Excel解析核心模块
 */
const XLSX = require('xlsx');
const path = require('path');
const ErrorHandler = require('./errorHandler');

class ExcelParser {
    constructor() {
        this.errorHandler = new ErrorHandler();
    }

    /**
     * 将列号转换为字母（1 -> A, 2 -> B, ...）
     */
    columnToLetter(col) {
        let temp, letter = '';
        while (col > 0) {
            temp = (col - 1) % 26;
            letter = String.fromCharCode(temp + 65) + letter;
            col = (col - temp - 1) / 26;
        }
        return letter;
    }

    /**
     * 将字母转换为列号（A -> 1, B -> 2, ...）
     */
    letterToColumn(letter) {
        let column = 0;
        for (let i = 0; i < letter.length; i++) {
            column = column * 26 + (letter.charCodeAt(i) - 64);
        }
        return column;
    }

    /**
     * 获取单元格值
     */
    getCellValue(sheet, row, col) {
        const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 });
        const cell = sheet[cellAddress];
        if (!cell) return null;
        return cell.v;
    }

    /**
     * 解析number类型
     */
    parseNumber(value, fileName, sheetName, row, col, fieldName) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const num = parseFloat(value);
        if (isNaN(num)) {
            this.errorHandler.addDataTypeError(fileName, sheetName, row, col, fieldName, 'number', value);
            return null;
        }
        return num;
    }

    /**
     * 解析number[]类型
     */
    parseNumberArray(value, fileName, sheetName, row, col, fieldName) {
        if (value === null || value === undefined || value === '') {
            return [];
        }
        const str = String(value).trim();
        if (!str) {
            return [];
        }
        const parts = str.split(',');
        const result = [];
        for (const part of parts) {
            const num = parseFloat(part.trim());
            if (isNaN(num)) {
                this.errorHandler.addArrayFormatError(fileName, sheetName, row, col, fieldName, 'number[]');
                return [];
            }
            result.push(num);
        }
        return result;
    }

    /**
     * 解析string类型
     */
    parseString(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value);
    }

    /**
     * 解析string[]类型
     */
    parseStringArray(value) {
        if (value === null || value === undefined || value === '') {
            return [];
        }
        const str = String(value).trim();
        if (!str) {
            return [];
        }
        return str.split(',').map(s => s.trim());
    }

    /**
     * 解析json类型
     */
    parseJson(value, fileName, sheetName, row, col, fieldName) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const str = String(value).trim();
        if (!str) {
            return null;
        }
        try {
            return JSON.parse(str);
        } catch (error) {
            this.errorHandler.addJsonFormatError(fileName, sheetName, row, col, fieldName, error.message);
            return null;
        }
    }

    /**
     * 解析jsonArr类型
     */
    parseJsonArray(value, fileName, sheetName, row, col, fieldName) {
        if (value === null || value === undefined || value === '') {
            return [];
        }
        const str = String(value).trim();
        if (!str) {
            return [];
        }
        try {
            const parsed = JSON.parse(str);
            if (Array.isArray(parsed)) {
                return parsed;
            } else {
                this.errorHandler.addArrayFormatError(fileName, sheetName, row, col, fieldName, 'jsonArr');
                return [];
            }
        } catch (error) {
            this.errorHandler.addJsonFormatError(fileName, sheetName, row, col, fieldName, error.message);
            return [];
        }
    }

    /**
     * 根据数据类型解析值
     */
    parseValueByType(value, dataType, fileName, sheetName, row, col, fieldName) {
        switch (dataType) {
            case 'number':
                return this.parseNumber(value, fileName, sheetName, row, col, fieldName);
            case 'number[]':
                return this.parseNumberArray(value, fileName, sheetName, row, col, fieldName);
            case 'string':
                return this.parseString(value);
            case 'string[]':
                return this.parseStringArray(value);
            case 'json':
                return this.parseJson(value, fileName, sheetName, row, col, fieldName);
            case 'jsonArr':
                return this.parseJsonArray(value, fileName, sheetName, row, col, fieldName);
            default:
                this.errorHandler.addError(fileName, sheetName, row, col, fieldName, `未知的数据类型: ${dataType}`);
                return null;
        }
    }

    /**
     * 解析单个Sheet
     */
    parseSheet(workbook, sheetName, fileName) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
            return null;
        }

        // 获取Sheet范围
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
        const maxRow = range.e.r + 1;
        const maxCol = range.e.c + 1;

        // 验证第1行A列是否有表名
        const tableName = this.getCellValue(sheet, 1, 1);
        if (!tableName || String(tableName).trim() === '') {
            this.errorHandler.addMissingTableNameError(fileName);
            return null;
        }

        // 验证第3行B列是否为id
        const idField = this.getCellValue(sheet, 3, 2);
        if (!idField || String(idField).trim().toLowerCase() !== 'id') {
            this.errorHandler.addMissingIdError(fileName, sheetName);
            return null;
        }

        // 读取第1行，找出标记$$的列
        const excludedCols = new Set();
        excludedCols.add(1); // A列不参与转换
        for (let col = 1; col <= maxCol; col++) {
            const value = this.getCellValue(sheet, 1, col);
            if (value && String(value).trim() === '$$') {
                excludedCols.add(col);
            }
        }

        // 读取第2行（数据类型）
        const dataTypes = {};
        for (let col = 2; col <= maxCol; col++) {
            if (!excludedCols.has(col)) {
                const dataType = this.getCellValue(sheet, 2, col);
                if (dataType) {
                    dataTypes[col] = String(dataType).trim();
                }
            }
        }

        // 读取第3行（字段名）
        const fieldNames = {};
        for (let col = 2; col <= maxCol; col++) {
            if (!excludedCols.has(col)) {
                const fieldName = this.getCellValue(sheet, 3, col);
                if (fieldName) {
                    fieldNames[col] = String(fieldName).trim();
                }
            }
        }

        // 解析数据（从第4行开始到最后一行）
        const data = {};
        for (let row = 4; row <= maxRow; row++) {
            const idValue = this.getCellValue(sheet, row, 2);
            if (!idValue || String(idValue).trim() === '') {
                continue; // 跳过没有id的行
            }

            const id = String(idValue).trim();
            const rowData = { id: id };

            for (let col = 2; col <= maxCol; col++) {
                if (excludedCols.has(col)) {
                    continue;
                }

                const fieldName = fieldNames[col];
                const dataType = dataTypes[col];
                if (!fieldName || !dataType) {
                    continue;
                }

                const cellValue = this.getCellValue(sheet, row, col);
                const parsedValue = this.parseValueByType(cellValue, dataType, fileName, sheetName, row, col, fieldName);
                
                if (fieldName !== 'id') {
                    rowData[fieldName] = parsedValue;
                }
            }

            data[id] = rowData;
        }

        return {
            tableName: String(tableName).trim(),
            data: data
        };
    }

    /**
     * 解析Excel文件
     */
    parseExcel(filePath) {
        this.errorHandler.clear();

        try {
            const workbook = XLSX.readFile(filePath);
            const sheetNames = workbook.SheetNames;
            const fileName = path.basename(filePath);

            if (sheetNames.length === 0) {
                this.errorHandler.addError(fileName, '', 0, '', '', 'Excel文件没有Sheet');
                return { success: false, data: null, errors: this.errorHandler.getAllErrors() };
            }

            // 解析所有Sheet
            const allData = {};
            let tableName = null;

            for (const sheetName of sheetNames) {
                const result = this.parseSheet(workbook, sheetName, fileName);
                if (result) {
                    if (!tableName) {
                        tableName = result.tableName;
                    }
                    // 合并数据（相同id合并）
                    for (const id in result.data) {
                        if (allData[id]) {
                            // 合并对象
                            allData[id] = { ...allData[id], ...result.data[id] };
                        } else {
                            allData[id] = result.data[id];
                        }
                    }
                }
            }

            if (!tableName) {
                this.errorHandler.addMissingTableNameError(fileName);
                return { success: false, data: null, errors: this.errorHandler.getAllErrors() };
            }

            if (this.errorHandler.hasErrors()) {
                return { success: false, data: null, errors: this.errorHandler.getAllErrors() };
            }

            return {
                success: true,
                tableName: tableName,
                data: allData,
                errors: []
            };
        } catch (error) {
            const fileName = path.basename(filePath);
            this.errorHandler.addError(fileName, '', 0, '', '', `解析Excel文件失败: ${error.message}`);
            return { success: false, data: null, errors: this.errorHandler.getAllErrors() };
        }
    }
}

module.exports = ExcelParser;

