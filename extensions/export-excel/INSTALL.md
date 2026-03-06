# 安装说明

## 安装依赖

插件需要`xlsx`库来解析Excel文件。请在插件目录下运行以下命令安装：

```bash
cd tools/exportExcel
npm install xlsx
```

或者使用yarn：

```bash
cd tools/exportExcel
yarn add xlsx
```

## 验证安装

安装完成后，确保`node_modules`目录下存在`xlsx`模块。

## 使用插件

1. 重启Cocos Creator编辑器
2. 在菜单栏找到"一键导表"菜单项
3. 点击打开插件面板
4. 配置Excel文件路径
5. 点击"一键导表"按钮开始转换

## 故障排除

如果插件无法正常工作，请检查：

1. 是否已安装`xlsx`依赖
2. 插件目录结构是否完整
3. Cocos Creator版本是否支持扩展插件（需要3.x版本）
4. 查看编辑器控制台的错误信息

