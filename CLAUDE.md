# CLAUDE.md

## 项目概述

trojan-web 是 [trojan 管理程序](https://github.com/Jrohy/trojan) 的前端页面，提供用户管理、流量统计、访问分析、套餐购买等功能。

技术栈：Vue 3 + Element Plus + Vite + Pinia + Vue Router + Vue I18n

## 常用命令

```bash
# 安装依赖
npm install

# 开发模式启动（默认端口 8324）
npm run dev

# 生产打包
npm run build
```

## 项目结构

```
src/
├── api/              # 接口封装（axios）
│   ├── analytics.js      # 访问统计上报 & TG 日报触发
│   ├── common.js         # 通用接口（版本、服务器信息等）
│   ├── data.js           # 流量数据（配额、重置日）
│   ├── email.js          # 邮件验证、密码重置
│   ├── permission.js     # 登录/注册/权限检查
│   ├── track.js          # Telegram 点击追踪
│   ├── trojan.js         # trojan 节点管理（启停/更新/域名）
│   └── user.js           # 用户管理（增删改查/套餐/流量）
├── components/       # 公共组件
├── icons/            # SVG 图标（svg-sprite）
├── lang/             # 国际化（中英双语，zh.js / en.js）
├── router/           # 路由（Hash 模式）
├── store/            # Pinia 状态管理
│   ├── user.js           # 用户状态（token、isAdmin）
│   ├── app.js            # 应用状态（sidebar、language、device）
│   └── settings.js       # 系统设置（loglevel、noerror 等）
├── styles/           # 全局 SCSS 样式
├── utils/            # 工具函数
│   ├── request.js        # axios 封装（拦截器、token 注入、错误处理）
│   ├── common.js         # 通用工具（readableBytes、isExternal 等）
│   ├── visitStats.js     # 前端访问统计（localStorage，含设备/浏览器/小时分布）
│   ├── dailyReport.js    # 每日统计报告调度（调用后端触发 TG 推送）
│   └── telegram.js       # 占位文件（TG 发送已移至后端）
└── views/
    ├── analytics/    # 访问统计分析页（管理员）
    ├── dashboard/    # 仪表盘（管理员）
    ├── trojan/       # trojan 节点管理（管理员）
    ├── user/         # 用户相关页面
    │   ├── index.vue     # 用户列表（管理员）
    │   ├── info.vue      # 个人信息（普通用户）
    │   ├── free.vue      # 免费页面（独立域名落地页）
    │   ├── pay.vue       # 支付页面
    │   └── payException.vue
    ├── login/        # 登录/注册/邮箱验证/密码重置
    ├── layout/       # 整体布局框架（Navbar、Sidebar、AppMain）
    └── errorPage/    # 404 等错误页
```

## 路由与权限

- 路由使用 Hash 模式（`createWebHashHistory`）
- 路由守卫在 `src/main.js` 中实现，基于 `userStore.token` 和 `userStore.isAdmin`
- `isAdmin` 通过 API 响应中 `username === 'admin'` 判断
- 普通用户登录后跳转 `/user/info`，管理员跳转 `/dashboard`
- 公开路由白名单：`/login`、`/register`、`/reset-password`、`/404`、`/free`、`/pay`
- 支持通过环境变量 `VITE_FREE_DOMAIN` / `VITE_FREE_DOMAINS` 配置特殊域名，访问该域名时强制跳转 `/free`

### 路由一览

| 路径 | 组件 | 权限 |
|------|------|------|
| `/dashboard` | `views/dashboard/index` | `isAdmin: true` |
| `/trojan` | `views/trojan/index` | `isAdmin: true` |
| `/user` | `views/user/index` | `isAdmin: true` |
| `/analytics` | `views/analytics/index` | `isAdmin: true` |
| `/user/info` | `views/user/info` | `isAdmin: false`（普通用户） |
| `/free` | `views/user/free` | 公开 |
| `/pay/:emailB64` | `views/user/pay` | 公开 |
| `/login` `/register` `/reset-password` | — | 公开 |

## 环境变量

在项目根目录创建 `.env.local` 文件（不提交）：

```env
VITE_API=http://your-backend-api          # 后端 API 地址（代理目标）
VITE_FREE_DOMAIN=free.example.com         # 单个免费落地页域名（可选）
VITE_FREE_DOMAINS=a.example.com,b.example.com  # 多个免费落地页域名，逗号分隔（可选）
VITE_TG_BOT_TOKEN=                        # Telegram Bot Token（可选，供后端参考）
VITE_TG_CHAT_ID=                          # Telegram Chat ID（可选，供后端参考）
```

开发时 `/api` 和 `/ws` 前缀均代理到 `VITE_API`，路径前缀自动去除。

## 状态管理

使用 Pinia（`src/store/`），token 持久化到 `localStorage`。

- `useUserStore()` — 核心用户状态，包含 `token`、`isAdmin`、`login()`、`logout()`
- `login()` 返回 code 200 表示成功，code 201 表示强制登出并刷新页面
- `useAppStore()` — sidebar 开关、language、device 类型
- `useSettingsStore()` — loglevel、noerror、nprogress、dialogWidth 等 UI 设置

## 访问统计（Analytics）

### 前端采集（`src/utils/visitStats.js`）

每次路由跳转（`router.afterEach`）触发 `trackPageView(path)`，采集并写入 `localStorage`：

- 页面浏览量（按路径计数）
- 独立访客（UUID，`visitor_uuid` localStorage key）
- 新/回访用户（`returning_visitor` localStorage key）
- 设备类型：`desktop` / `mobile` / `tablet`
- 浏览器：Chrome / Firefox / Safari / Edge / Opera / Other
- 操作系统：Windows / macOS / Android / iOS / Linux / Other
- 24 小时分布（按小时索引 0–23）
- 访问来源（referrer 域名，无来源记为 `direct`）

数据按天存储，key 格式 `vs_YYYY-MM-DD`，自动清理 30 天前数据。

同时 fire-and-forget 调用 `POST /analytics/visit` 上报后端（后端未实现时静默忽略）。

### 每日 TG 日报（`src/utils/dailyReport.js`）

每次路由跳转时检查是否需要发送昨日日报：

- 用 `last_tg_report_date` localStorage key 防止重复发送
- 调用 `POST /analytics/daily-report` 让后端汇总数据并推送 Telegram

### 分析页（`src/views/analytics/index.vue`）

管理员专属 `/analytics` 页面，功能：

- 日期选择（默认今日，可查历史）
- 汇总卡片：浏览量、独立访客、新访客、回访用户
- 热门页面 Top 10
- 24 小时访问分布柱图
- 设备 / 浏览器 / OS / 来源占比条
- 近 7 天趋势双色柱图（PV + UV）
- 手动「发送日报」按钮

### 后端需实现的接口

```
POST /analytics/visit
  Body: { path, uuid, device, browser, os, referrer, isNew, hour }

POST /analytics/daily-report
  Body: { date: "YYYY-MM-DD" }
  作用: 汇总该日数据并通过 Telegram Bot 发送统计报告
```

## 国际化

使用 Vue I18n v11，支持中文（`zh.js`）和英文（`en.js`）。翻译文件位于 `src/lang/`。

侧边栏菜单标题通过 `$t('route.' + meta.title)` 查找，新增路由时需在两个语言文件的 `route` 对象中添加对应 key。

## 构建说明

- 生产构建会自动开启 Terser 压缩并移除 `console` / `debugger`
- 打包产物按 `node_modules` 包名自动分 chunk
- 构建完成后会自动打开 bundle 体积分析（`rollup-plugin-visualizer`）
- 产物输出到 `dist/`，静态资源位于 `dist/static/`
