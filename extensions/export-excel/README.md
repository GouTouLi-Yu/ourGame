# 一键导表插件

Cocos Creator扩展插件，用于将Excel文件自动转换为JSON数据。

## 功能特性

- ✅ 自动检测Excel文件改动（基于文件修改时间和哈希值）
- ✅ 增量更新，只处理有改动的文件
- ✅ 支持多Sheet Excel文件
- ✅ 支持相同表名的多个Excel文件合并
- ✅ 完善的错误提示（中文，明确指出行列位置）
- ✅ 支持多种数据类型：number, number[], string, string[], json, jsonArr

## Excel格式规范

### 行结构

| 行号 | 说明 | 必填 |
|------|------|------|
| 第1行 | 注释行（不参与转换）<br>- A列：表名（必填）<br>- 某列填`$$`：该列不参与转换 | 是 |
| 第2行 | 数据类型定义 | 是 |
| 第3行 | 字段名（变量名）<br>- B列必须是`id` | 是 |
| 第4行+ | 数据行<br>- A列：标记列（不参与转换）<br>- 必须有`start`和`end`标记 | 是 |

### 数据类型

| Excel填写 | TypeScript类型 | 说明 |
|-----------|----------------|------|
| `number` | `number` | 整数或小数 |
| `number[]` | `number[]` | 数字数组，如：`1,2,3` |
| `string` | `string` | 字符串 |
| `string[]` | `string[]` | 字符串数组，如：`a,b,c` |
| `json` | `Object` | JSON对象，必须严格JSON格式 |
| `jsonArr` | `Object[]` | JSON数组 |

### 示例

```
A列        B列      C列        D列
cardConfig 卡牌ID   卡牌名称   配置信息
           number   string     json
           id       name       config
start
           1001     英雄1      {"hp":100,"atk":50}
           1002     英雄2      {"hp":120,"atk":60}
end
```

## 使用方法

1. **配置Excel路径**
   - 打开插件面板（菜单：一键导表）
   - 在"Excel文件路径"输入框中填写Excel文件所在目录
   - 或点击"选择文件夹"按钮选择目录

2. **一键导表**
   - 点击"一键导表"按钮
   - 插件会自动检测改动的Excel文件
   - 删除对应的JSON文件
   - 重新生成JSON文件到`assets/config`目录

## 输出格式

生成的JSON文件格式：

```json
{
  "cardConfig": {
    "hero_001": {
      "id": "hero_001",
      "name": "英雄1",
      "config": {...}
    },
    "hero_002": {
      "id": "hero_002",
      "name": "英雄2",
      "config": {...}
    }
  }
}
```

## 错误提示

插件会检测以下错误并给出中文提示：

- ❌ 缺少表名：`[文件: xxx.xlsx] 第1行A列未填写表名，请填写表名`
- ❌ 缺少id字段：`[文件: xxx.xlsx] Sheet: xxx 第3行B列必须填写"id"字段`
- ❌ 缺少start/end：`[文件: xxx.xlsx] Sheet: xxx A列中未找到"start"或"end"标记`
- ❌ JSON格式错误：`[文件: xxx.xlsx] Sheet: xxx 第X行第Y列(json字段) JSON格式错误：具体错误信息`
- ❌ 数据类型错误：`[文件: xxx.xlsx] Sheet: xxx 第X行第Y列(字段名) 数据类型错误：期望number，实际为"abc"`

## 注意事项

1. Excel文件路径配置保存在`tools/exportExcel/settings.json`
2. 文件改动缓存保存在`tools/exportExcel/cache/fileCache.json`
3. 生成的JSON文件保存在`assets/config`目录
4. 相同表名的多个Excel文件数据会合并（相同id会合并对象）
5. 如果Excel文件有错误，不会生成JSON文件

## 依赖

- `xlsx`: Excel文件解析库（需要安装）
- Node.js内置模块：`fs`, `path`, `crypto`

## 安装依赖

在插件目录下运行：

```bash
npm install xlsx
```

## 开发

插件目录结构：

```
tools/exportExcel/
├── package.json          # 插件配置
├── main.js              # 主入口
├── panel.js              # 面板逻辑
├── panel.html            # 面板UI
├── settings.json         # 配置文件
├── lib/
│   ├── configManager.js  # 配置管理
│   ├── fileWatcher.js    # 文件改动检测
│   ├── excelParser.js    # Excel解析
│   └── errorHandler.js   # 错误处理
└── cache/
    └── fileCache.json    # 文件缓存
```

