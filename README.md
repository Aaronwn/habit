# 习惯打卡微信小程序

一款基于微信云开发的习惯打卡小程序，帮助用户养成良好习惯，记录和追踪每日习惯养成情况。

## 功能特性

### 核心功能
- ✅ **习惯管理**：创建、编辑、删除习惯，支持自定义图标和颜色
- ✅ **每日打卡**：记录完成状态、完成数量和备注信息
- ✅ **数据统计**：连续打卡天数、总打卡次数、打卡率统计
- ✅ **历史记录**：查看所有打卡历史，支持编辑修改
- ✅ **周报月报**：按周/月查看打卡统计数据

### 技术特点
- 🎯 **微信云开发**：无需搭建服务器，开发快速
- 📱 **原生小程序**：性能优异，体验流畅
- 🎨 **精美UI**：现代化设计，简洁易用
- 🔒 **数据安全**：用户数据隔离，权限严格控制

## 技术栈

- **前端**：微信小程序原生框架
- **后端**：微信云开发
  - 云函数：业务逻辑处理
  - 云数据库：数据存储（MongoDB）
  - 云存储：图片资源存储（未来扩展）

## 项目结构

```
habit/
├── miniprogram/              # 小程序前端
│   ├── pages/                # 页面
│   │   ├── index/            # 首页（习惯列表）
│   │   ├── stats/            # 统计页面
│   │   ├── mine/             # 我的页面
│   │   ├── checkin/          # 打卡页面
│   │   ├── habit/            # 添加/编辑习惯
│   │   └── history/          # 打卡历史
│   ├── components/           # 组件
│   │   ├── habit-card/       # 习惯卡片
│   │   ├── calendar/         # 日历组件
│   │   ├── stats-card/       # 统计卡片
│   │   └── chart/            # 图表组件
│   ├── utils/                # 工具类
│   │   ├── api.js            # API封装
│   │   ├── date.js           # 日期处理
│   │   ├── constants.js      # 常量定义
│   │   └── storage.js        # 本地存储
│   ├── styles/               # 全局样式
│   ├── app.js                # 小程序入口
│   ├── app.json              # 全局配置
│   └── app.wxss              # 全局样式
├── cloudfunctions/           # 云函数
│   ├── login/                # 用户登录
│   ├── createHabit/          # 创建习惯
│   ├── updateHabit/          # 更新习惯
│   ├── deleteHabit/          # 删除习惯
│   ├── getHabits/            # 获取习惯列表
│   ├── checkIn/              # 打卡
│   ├── getCheckIns/          # 获取打卡记录
│   ├── getStats/             # 获取统计数据
│   └── calculateStreak/      # 计算连续天数
├── database/                 # 数据库配置
│   └── collections.json      # 集合定义
├── docs/                     # 文档
├── project.config.json       # 项目配置
└── README.md                 # 项目说明
```

## 快速开始

### 环境要求

- 微信开发者工具（最新版本）
- 微信小程序账号
- 微信云开发环境

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd habit
```

2. **配置小程序APPID**

打开 `project.config.json`，将 `appid` 替换为你的小程序APPID：

```json
{
  "appid": "your-appid-here"
}
```

3. **配置云开发环境ID**

在微信开发者工具中：
- 点击「云开发」按钮
- 创建云开发环境
- 复制环境ID

修改 `miniprogram/app.js`，替换云开发环境ID：

```javascript
globalData: {
  cloudEnvId: 'your-cloud-env-id' // 替换为你的云开发环境ID
}
```

同时修改 `miniprogram/utils/constants.js`：

```javascript
const CLOUD_ENV_ID = 'your-cloud-env-id'
```

4. **创建数据库集合**

在云开发控制台创建以下集合：
- `users`（用户表）
- `habits`（习惯表）
- `check_ins`（打卡记录表）

详细的集合结构和索引配置见 `database/collections.json`

5. **上传云函数**

在微信开发者工具中：
- 右键 `cloudfunctions` 下的每个云函数目录
- 选择「上传并部署：云端安装依赖」

需要上传的云函数：
- login
- getHabits
- createHabit
- updateHabit
- deleteHabit
- checkIn
- getCheckIns
- getStats
- calculateStreak

6. **运行项目**

- 在微信开发者工具中点击「编译」
- 小程序应该可以正常运行了

## 数据库设计

### users（用户表）
存储用户基本信息和设置

### habits（习惯表）
存储用户创建的习惯，支持自定义图标、颜色、描述、目标值等

### check_ins（打卡记录表）
存储每日打卡记录，包含完成状态、数量、备注等信息

详细的数据库设计见 `database/collections.json`

## 开发指南

### 添加新页面

1. 在 `miniprogram/pages/` 下创建页面目录
2. 创建 `.js`, `.json`, `.wxml`, `.wxss` 四个文件
3. 在 `app.json` 的 `pages` 数组中注册页面

### 添加新组件

1. 在 `miniprogram/components/` 下创建组件目录
2. 创建 `.js`, `.json`, `.wxml`, `.wxss` 四个文件
3. 在 `.json` 中设置 `"component": true`
4. 在使用页面的 `.json` 中引入组件

### 添加新云函数

1. 在 `cloudfunctions/` 下创建云函数目录
2. 创建 `index.js` 和 `package.json`
3. 在 `miniprogram/utils/api.js` 中添加调用方法
4. 上传并部署云函数

## 部署上线

### 1. 准备工作

- 完成所有功能开发和测试
- 准备小程序图标和启动页
- 准备隐私政策和用户协议
- 设置合理的服务器域名

### 2. 上传代码

在微信开发者工具中：
- 点击「上传」按钮
- 填写版本号和项目备注
- 提交审核

### 3. 提交审核

在微信公众平台：
- 进入「版本管理」
- 选择开发版本
- 填写审核信息
- 提交审核

### 4. 发布上线

审核通过后，在「版本管理」中点击「发布」即可上线

## 开源协议

MIT License

## 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。


