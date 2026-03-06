# 故障排除指南

## 问题：菜单中没有显示"一键导表"

### 可能的原因和解决方法：

1. **插件未正确加载**
   - 检查 `tools/exportExcel/package.json` 文件是否存在且格式正确
   - 重启 Cocos Creator 编辑器
   - 查看编辑器控制台是否有错误信息

2. **菜单路径问题**
   - 菜单应该出现在：**扩展 > 一键导表**
   - 如果仍然看不到，尝试以下方法：
     - 检查菜单栏是否有"扩展"菜单
     - 尝试在菜单栏搜索"一键导表"

3. **插件目录位置**
   - 确保插件位于：`项目根目录/tools/exportExcel/`
   - 检查目录结构是否完整：
     ```
     tools/exportExcel/
     ├── package.json
     ├── main.js
     ├── panel.js
     ├── panel.html
     ├── lib/
     └── cache/
     ```

4. **手动打开面板**
   - 如果菜单不显示，可以尝试在编辑器控制台运行：
     ```javascript
     Editor.Panel.open('export-excel.panel');
     ```

5. **检查插件注册**
   - 打开编辑器控制台（F12 或 视图 > 开发者工具）
   - 查看是否有"一键导表插件已加载"的日志
   - 如果没有，说明插件未正确加载

6. **Cocos Creator 版本**
   - 确保使用的是 Cocos Creator 3.x 版本
   - 扩展插件功能在 3.0+ 版本中可用

## 问题：点击菜单后面板不显示

1. **检查 panel.html 和 panel.js 文件**
   - 确保文件存在且路径正确
   - 检查文件是否有语法错误

2. **查看控制台错误**
   - 打开开发者工具查看是否有 JavaScript 错误

3. **检查面板配置**
   - 确保 `package.json` 中的 `panel` 配置正确

## 问题：依赖库未安装

如果提示找不到 `xlsx` 模块：

1. 在插件目录下安装依赖：
   ```bash
   cd tools/exportExcel
   npm install xlsx
   ```

2. 重启编辑器

## 其他问题

如果遇到其他问题，请：
1. 查看编辑器控制台的错误信息
2. 检查 `tools/exportExcel/cache/fileCache.json` 文件是否可写
3. 确保 Excel 文件路径配置正确

