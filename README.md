# 双色球历史数据收集器 (Lottery History)

[![Daily Update](https://github.com/gudaoxuri/lottery_history/actions/workflows/daily-update.yml/badge.svg)](https://github.com/gudaoxuri/lottery_history/actions/workflows/daily-update.yml)

_NOTE: 本项目主体代码由AI生成，人工修正及复核。_

这个项目用于自动抓取和维护中国福利彩票双色球的历史开奖数据。数据每天自动更新，保持最新状态。

## 项目特点

- 自动从官方网站抓取双色球开奖数据
- 智能合并新旧数据，避免重复记录
- 支持按期号排序
- 数据以JSON格式存储，方便其他应用程序使用
- 使用GitHub Actions实现自动每日更新

## 数据格式

数据保存在 `data/ssq.json` 文件中，每条记录包含以下字段：

```json
{
  "issueNumber": "2023001",  // 期号
  "redBalls": [1, 7, 9, 16, 18, 29],  // 红球号码
  "blueBall": 7,  // 蓝球号码
  "drawDate": "2023-01-01"  // 开奖日期
}
```

## 如何使用

### 直接使用数据

您可以直接引用GitHub上的原始数据文件：

```
https://raw.githubusercontent.com/gudaoxuri/lottery_history/main/data/ssq.json
```

### 本地运行

1. 克隆此仓库：

```bash
git clone https://github.com/gudaoxuri/lottery_history.git
cd lottery_history
```

2. 安装依赖：

```bash
pnpm install
```

3. 运行数据更新程序：

```bash
pnpm start
```

## 开发相关

### 技术栈

- TypeScript
- Node.js
- axios (用于HTTP请求)
- cheerio (用于HTML解析)

### 目录结构

```
lottery_history/
├── data/             # 存放生成的数据文件
│   └── ssq.json      # 双色球历史数据
├── src/              # 源代码目录
│   ├── index.ts      # 入口文件
│   ├── ssq.ts        # 双色球数据抓取逻辑
│   ├── types/        # 类型定义
│   │   └── record.ts # 数据记录类型定义
│   └── utils/        # 工具函数
├── package.json      # 项目配置
└── tsconfig.json     # TypeScript配置
```

### 贡献代码

1. Fork 这个仓库
2. 创建您的特性分支：`git checkout -b my-new-feature`
3. 提交您的更改：`git commit -am 'Add some feature'`
4. 推送到分支：`git push origin my-new-feature`
5. 提交Pull Request

## 许可证

本项目采用 MIT 许可证，详情请参阅 [LICENSE](LICENSE) 文件。

---

数据来源: [500.com](https://datachart.500.com/ssq/history/newinc/history.php)