# CLAUDE.md

## 项目概述

trojan-web 是 [trojan 管理程序](https://github.com/Jrohy/trojan) 的前端页面，提供用户管理、流量统计、套餐购买等功能。

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
├── api/          # 接口封装（axios）
│   ├── common.js     # 通用接口
│   ├── data.js       # 数据统计
│   ├── email.js      # 邮件
│   ├── permission.js # 登录/权限
│   ├── track.js      # 流量追踪
│   ├── trojan.js     # trojan 节点管理
│   └── user.js       # 用户管理
├── components/   # 公共组件
├── icons/        # SVG 图标（svg-sprite）
├── lang/         # 国际化（中英双语，zh.js / en.js）
├── router/       # 路由（Hash 模式）
├── store/        # Pinia 状态管理
│   ├── user.js       # 用户状态（token、isAdmin）
│   ├── app.js
│   └── settings.js
├── styles/       # 全局 SCSS 样式
├── utils/        # 工具函数（request.js 等）
└── views/
    ├── dashboard/    # 仪表盘（管理员）
    ├── trojan/       # trojan 节点管理（管理员）
    ├── user/         # 用户相关页面
    │   ├── index.vue     # 用户列表（管理员）
    │   ├── info.vue      # 个人信息（普通用户）
    │   ├── free.vue      # 免费页面（独立域名落地页）
    │   ├── pay.vue       # 支付页面
    │   └── payException.vue
    ├── login/        # 登录/注册/邮箱验证
    ├── layout/       # 整体布局框架
    └── errorPage/    # 404 等错误页
```

## 路由与权限

- 路由使用 Hash 模式（`createWebHashHistory`）
- 路由守卫在 `src/main.js` 中实现，基于 `userStore.token` 和 `userStore.isAdmin`
- `isAdmin` 通过 API 响应中 `username === 'admin'` 判断
- 普通用户登录后跳转 `/user/info`，管理员跳转 `/`（dashboard）
- 公开路由白名单：`/login`、`/register`、`/verify-success`、`/verify-fail`、`/404`、`/free`、`/pay`
- 支持通过环境变量 `VITE_FREE_DOMAIN` / `VITE_FREE_DOMAINS` 配置特殊域名，访问该域名时强制跳转 `/free`

## 环境变量

在项目根目录创建 `.env` 或 `.env.local` 文件：

```env
VITE_API=http://your-backend-api          # 后端 API 地址（代理目标）
VITE_FREE_DOMAIN=free.example.com         # 单个免费落地页域名（可选）
VITE_FREE_DOMAINS=a.example.com,b.example.com  # 多个免费落地页域名，逗号分隔（可选）
```

开发时 `/api` 和 `/ws` 前缀均会被代理到 `VITE_API`，路径前缀会被自动去除。

## 状态管理

使用 Pinia（`src/store/`），token 持久化到 `localStorage`。

- `useUserStore()` — 核心用户状态，包含 `token`、`isAdmin`、`login()`、`logout()`
- `login()` 返回 code 200 表示成功，code 201 表示强制登出并刷新页面

## 国际化

使用 Vue I18n v11，支持中文（`zh.js`）和英文（`en.js`）。翻译文件位于 `src/lang/`。

## 构建说明

- 生产构建会自动开启 Terser 压缩并移除 `console` / `debugger`
- 打包产物按 `node_modules` 包名自动分 chunk
- 构建完成后会自动打开 bundle 体积分析（`rollup-plugin-visualizer`）
- 产物输出到 `dist/`，静态资源位于 `dist/static/`
