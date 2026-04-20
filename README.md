# trojan-web

[trojan 管理程序](https://github.com/Jrohy/trojan) 的前端页面，提供用户管理、流量统计、访问分析、套餐购买等功能。

**技术栈：** Vue 3 · Element Plus · Vite · Pinia · Vue Router · Vue I18n · Axios · SCSS

---

## 目录

- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [项目结构](#项目结构)
- [页面与路由](#页面与路由)
- [权限控制](#权限控制)
- [后端接口](#后端接口)
- [访问统计与 Telegram 推送](#访问统计与-telegram-推送)
- [状态管理](#状态管理)
- [国际化](#国际化)
- [构建与部署](#构建与部署)

---

## 快速开始

**环境要求：** Node.js ≥ 18

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（见下方说明）
cp .env.development .env.local
# 编辑 .env.local，填写 VITE_API 等必要变量

# 3. 启动开发服务器（默认 http://127.0.0.1:8324）
npm run dev

# 4. 生产打包
npm run build
```

---

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `VITE_API` | ✅ | 后端 API 地址，开发时代理目标（如 `http://localhost:8081`） |
| `VITE_FREE_DOMAIN` | ❌ | 单个免费落地页专属域名，访问该域名时强制跳转 `/free` |
| `VITE_FREE_DOMAINS` | ❌ | 多个免费落地页域名，逗号分隔（与 `VITE_FREE_DOMAIN` 合并生效） |
| `VITE_TG_BOT_TOKEN` | ❌ | Telegram Bot Token，供后端读取用于每日推送 |
| `VITE_TG_CHAT_ID` | ❌ | Telegram 目标群组/频道 Chat ID |

**示例 `.env.local`：**

```env
VITE_API=http://your-backend:8081

VITE_FREE_DOMAIN=free.example.com
VITE_FREE_DOMAINS=landing1.example.com,landing2.example.com

VITE_TG_BOT_TOKEN=123456:ABCdef...
VITE_TG_CHAT_ID=-1001234567890
```

> `.env.local` 不会提交到 Git。`.env.development` / `.env.production` 为共享默认值，可以提交。

**代理规则（开发模式）：**

```
/api/*  →  VITE_API（去除 /api 前缀）
/ws/*   →  VITE_API（WebSocket，去除 /ws 前缀）
```

---

## 项目结构

```
trojan-web/
├── src/
│   ├── api/                    # 后端接口封装（axios）
│   │   ├── analytics.js        # 访问统计上报 & TG 日报触发
│   │   ├── common.js           # 通用接口（版本号、服务器信息、Clash 规则等）
│   │   ├── data.js             # 流量数据（配额设置、重置日）
│   │   ├── email.js            # 邮件验证码、订单生成、密码重置链接
│   │   ├── permission.js       # 登录 / 注册 / 初始化检查 / 密码重置
│   │   ├── track.js            # Telegram 点击行为追踪
│   │   ├── trojan.js           # trojan 服务控制（启停/更新/日志/域名切换）
│   │   └── user.js             # 用户增删改查 / 套餐 / 流量 / 到期日
│   │
│   ├── components/             # 公共组件（SvgIcon 等）
│   ├── icons/svg/              # SVG 图标源文件（svg-sprite 自动注册）
│   │
│   ├── lang/                   # 国际化
│   │   ├── zh.js               # 中文翻译
│   │   └── en.js               # 英文翻译
│   │
│   ├── router/
│   │   └── index.js            # 路由定义（Hash 模式）
│   │
│   ├── store/                  # Pinia 状态管理
│   │   ├── user.js             # token、isAdmin、login()、logout()
│   │   ├── app.js              # sidebar、language、device
│   │   └── settings.js         # loglevel、noerror、nprogress、dialogWidth
│   │
│   ├── styles/                 # 全局 SCSS 样式
│   │
│   ├── utils/
│   │   ├── request.js          # axios 实例（拦截器、token 注入、错误提示）
│   │   ├── common.js           # readableBytes / sleep / isExternal / isValidIP
│   │   ├── visitStats.js       # 前端访问采集（localStorage 存储，30天自动清理）
│   │   ├── dailyReport.js      # 每日 TG 日报调度（防重、调后端接口）
│   │   └── telegram.js         # 占位文件（TG 发送已移至后端处理）
│   │
│   ├── views/
│   │   ├── analytics/          # 访问统计分析页（管理员）
│   │   ├── dashboard/          # 仪表盘：服务器状态、流量概览（管理员）
│   │   ├── trojan/             # trojan 节点管理（管理员）
│   │   ├── user/
│   │   │   ├── index.vue       # 用户列表（管理员）
│   │   │   ├── info.vue        # 个人信息（普通用户）
│   │   │   ├── free.vue        # 免费落地页（公开）
│   │   │   ├── pay.vue         # 套餐支付（公开）
│   │   │   └── payException.vue
│   │   ├── login/
│   │   │   ├── login.vue       # 登录
│   │   │   ├── register.vue    # 注册
│   │   │   └── reset-password.vue  # 邮件重置密码
│   │   ├── layout/             # 整体布局（Navbar / Sidebar / AppMain）
│   │   └── errorPage/          # 404 页
│   │
│   ├── App.vue
│   └── main.js                 # 入口：路由守卫、访问统计钩子、app 挂载
│
├── .env.development            # 开发环境默认变量
├── .env.production             # 生产环境默认变量
├── vite.config.js
└── package.json
```

---

## 页面与路由

| 路径 | 页面 | 权限 | 说明 |
|------|------|------|------|
| `/dashboard` | 仪表盘 | 管理员 | CPU/内存/磁盘、VPN 运行状态、流量汇总、访问统计速览 |
| `/trojan` | 节点管理 | 管理员 | 启动/停止/重启/更新 trojan，设置日志等级、域名、类型切换 |
| `/user` | 用户列表 | 管理员 | 分页查询、添加/编辑/删除用户、设置配额与到期日、导入导出 CSV |
| `/analytics` | 访问统计 | 管理员 | 浏览量/访客/设备/浏览器/OS/来源/24h 分布/7日趋势，手动触发 TG 日报 |
| `/user/info` | 个人信息 | 普通用户 | 查看自己的流量、到期时间、节点信息、订阅链接 |
| `/free` | 免费落地页 | 公开 | 特定域名落地页，展示免费节点信息 |
| `/pay/:emailB64` | 套餐支付 | 公开 | 扫码支付套餐 |
| `/login` | 登录 | 公开 | 账号/邮箱 + 密码登录 |
| `/register` | 注册 | 公开 | 用户名 + 密码 + 邮箱验证码注册 |
| `/reset-password` | 重置密码 | 公开 | 通过邮件链接设置新密码 |

路由使用 **Hash 模式**（`createWebHashHistory`），无需服务器配置 history fallback。

---

## 权限控制

路由守卫在 `src/main.js` 的 `router.beforeEach` 中实现，逻辑如下：

```
请求路由
├── 是免费落地页专属域名？→ 强制跳转 /free
├── 是白名单路由？→ 直接放行
│     白名单：/login /register /reset-password /404 /free /pay/*
├── 有 token？
│   ├── 未设置 isAdmin → 调 loginUser API 验证（username === 'admin' 则为管理员）
│   ├── 是管理员
│   │   ├── 访问 /login 或 / → 跳转 /dashboard
│   │   └── 其余 → 放行
│   └── 是普通用户
│       ├── 访问 /login → 跳转 /user/info
│       ├── 路由 meta.isAdmin === true → 跳转 /user/info
│       └── 其余 → 放行
└── 无 token
    ├── 白名单路由 → 放行
    ├── 访问 / → 跳转 /free
    └── 其余 → 跳转 /login
```

侧边栏菜单根据 `isAdmin` 状态过滤路由，管理员看到全部菜单，普通用户只看到 `meta.isAdmin !== true` 的路由。

---

## 后端接口

所有请求经 `src/utils/request.js` 发出，生产环境 baseURL 为 `/`，开发环境通过 Vite 代理到 `VITE_API`。

### 认证 `/auth`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 登录，返回 token |
| POST | `/auth/register` | 注册新用户 |
| GET | `/auth/check` | 检查系统是否已初始化 |
| POST | `/auth/reset_pass` | 重置管理员密码（初始化时） |
| GET | `/auth/loginUser` | 验证当前 token，返回用户名（用于判断 isAdmin） |

### 用户 `/trojan/user`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/trojan/user/total` | 获取总用户数及流量汇总（timeout 30s） |
| GET | `/trojan/user` | 获取用户信息 |
| GET | `/trojan/user/check` | 获取当前登录用户详情 |
| GET | `/trojan/user/page` | 分页查询用户列表（`curPage` / `pageSize`） |
| POST | `/trojan/user` | 新增用户 |
| POST | `/trojan/user/update` | 更新用户信息 |
| DELETE | `/trojan/user?id=` | 删除用户 |
| POST | `/trojan/user/expire` | 设置用户到期日 |
| DELETE | `/trojan/user/expire?id=` | 取消用户到期日 |
| GET | `/trojan/user/free` | 获取免费节点信息 |

### 流量数据 `/trojan/data`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/trojan/data` | 设置用户流量配额 |
| DELETE | `/trojan/data?id=` | 清零用户流量数据 |
| GET | `/trojan/data/resetDay` | 获取流量重置日 |
| POST | `/trojan/data/resetDay` | 设置流量重置日（0 = 关闭） |

### Trojan 服务 `/trojan`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/trojan/start` | 启动 trojan |
| POST | `/trojan/stop` | 停止 trojan |
| POST | `/trojan/restart` | 重启 trojan |
| POST | `/trojan/update` | 更新 trojan 版本 |
| GET | `/trojan/loglevel` | 获取日志等级 |
| POST | `/trojan/loglevel` | 设置日志等级 |
| POST | `/trojan/domain` | 更新域名配置 |
| POST | `/trojan/switch` | 切换 trojan 类型（trojan-go / sing-box 等） |

### 通用 `/common`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/common/version` | 获取 trojan 版本号、运行时长 |
| GET | `/common/serverInfo` | 获取服务器实时信息（CPU/内存/磁盘/网速/负载） |
| POST | `/common/loginInfo` | 设置登录页标题 |
| GET | `/common/clashRules` | 获取 Clash 规则 |
| POST | `/common/clashRules` | 更新 Clash 规则 |
| DELETE | `/common/clashRules` | 重置 Clash 规则 |

### 邮件 `/trojan/user`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/trojan/user/send-code` | 发送邮箱验证码 |
| POST | `/trojan/user/generate-order` | 生成支付订单 |
| POST | `/trojan/user/order-status` | 查询订单状态 |
| POST | `/trojan/user/send-reset-password-link` | 发送密码重置邮件 |
| POST | `/trojan/user/reset-password-by-token` | 通过 token 设置新密码 |

### 追踪 `/track`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/track/telegram-click` | 记录 Telegram 频道点击事件 |

### 访问统计 `/analytics`（需后端实现）

| 方法 | 路径 | Body | 说明 |
|------|------|------|------|
| POST | `/analytics/visit` | `{ path, uuid, device, browser, os, referrer, isNew, hour }` | 接收单次访问数据 |
| POST | `/analytics/daily-report` | `{ date: "YYYY-MM-DD" }` | 汇总指定日期数据并发送 Telegram 日报 |

> 以上两个接口尚未实现时，前端会静默忽略错误，不影响正常使用。

---

## 访问统计与 Telegram 推送

### 数据采集

每次路由跳转（`router.afterEach`）触发 `trackPageView(path)`，在浏览器端采集并写入 `localStorage`：

| 数据项 | 说明 |
|--------|------|
| 页面浏览量 | 每个路径的访问次数 |
| 独立访客 | 基于 UUID（`visitor_uuid` key），每天去重 |
| 新/回访用户 | 首次访问为新访客（`returning_visitor` key 标记） |
| 设备类型 | `desktop` / `mobile` / `tablet`，每访客每天计一次 |
| 浏览器 | Chrome / Firefox / Safari / Edge / Opera / Other |
| 操作系统 | Windows / macOS / Android / iOS / Linux / Other |
| 24 小时分布 | 按小时（0–23）统计访问量 |
| 访问来源 | referrer 域名，直接访问记为 `direct` |

数据格式：每天一个 `localStorage` 条目，key 为 `vs_YYYY-MM-DD`，超过 30 天自动清理。

同时将采集数据 fire-and-forget 上报后端 `POST /analytics/visit`（后端未实现时静默忽略）。

### 每日 Telegram 日报

每次路由跳转时，`checkAndSendDailyReport()` 检查是否已发送昨日日报：

- 用 `last_tg_report_date`（localStorage）防止重复发送
- 调用后端 `POST /analytics/daily-report`，由后端汇总数据并通过 Telegram Bot 推送
- 失败时清除标记，下次导航时重试

### 分析页 `/analytics`

管理员专属，功能包括：

- **日期选择**：默认今日，可切换历史日期
- **汇总卡片**：页面浏览量 / 独立访客 / 新访客 / 回访用户
- **热门页面 Top 10**：按访问量排序的进度条
- **24 小时分布**：柱状图展示全天访问高峰
- **设备 / 浏览器 / OS / 来源**：进度条占比展示
- **近 7 天趋势**：PV + UV 双色柱图
- **手动发送日报**：点击按钮立即触发后端 TG 推送

### 配置 Telegram Bot

1. 向 `@BotFather` 发送 `/newbot`，按提示创建 Bot，获取 **Token**
2. 将 Bot 邀请进目标群组或频道，发一条任意消息
3. 访问 `https://api.telegram.org/bot<TOKEN>/getUpdates`，在响应中找到 `chat.id`，即 **Chat ID**
4. 将两个值填入 `.env.local`：

```env
VITE_TG_BOT_TOKEN=123456:ABCdef...
VITE_TG_CHAT_ID=-1001234567890
```

5. 后端读取这两个值，在收到 `POST /analytics/daily-report` 时调用 Telegram Bot API 发送消息

---

## 状态管理

使用 Pinia（`src/store/`），所有持久化数据存储在 `localStorage`。

### `useUserStore()`

| 属性/方法 | 说明 |
|-----------|------|
| `token` | JWT token，持久化 |
| `isAdmin` | 是否管理员（`username === 'admin'`） |
| `setToken(v)` | 更新 token 并同步 localStorage |
| `login()` | 调用 `/auth/loginUser` 验证 token，设置 isAdmin |
| `logout()` | 清除 token 和 isAdmin |

`login()` 响应码含义：`200` = 成功，`201` = 需强制登出并刷新页面。

### `useAppStore()`

| 属性/方法 | 说明 |
|-----------|------|
| `sidebar.opened` | 侧边栏展开状态，持久化 |
| `language` | 当前语言（`zh` / `en`），持久化 |
| `device` | `desktop` / `mobile` |
| `toggleSideBar()` | 切换侧边栏 |
| `setLanguage(lang)` | 切换语言 |

### `useSettingsStore()`

| 属性 | 默认值 | 说明 |
|------|--------|------|
| `loglevel` | `1` | trojan 日志等级 |
| `line` | `300` | 日志初始显示行数 |
| `type` | `'sing-box'` | 节点类型 |
| `docTitle` | `''` | 自定义登录页标题 |
| `dialogWidth` | `'25%'` | 弹窗宽度（响应式自动调整） |
| `nprogress` | `true` | 是否显示顶部进度条 |
| `noerror` | `false` | 是否屏蔽 500 错误提示 |

---

## 国际化

使用 Vue I18n v11，支持**中文**（`zh.js`）和**英文**（`en.js`），翻译文件在 `src/lang/`。

语言由 `appStore.language` 控制，持久化到 localStorage，可在 Navbar 中切换。

**新增路由时**，需在两个语言文件的 `route` 对象中添加对应 key，侧边栏标题通过 `$t('route.' + meta.title)` 渲染：

```js
// zh.js
route: {
  dashboard: '首页',
  trojan: '管理',
  user: '用户',
  analytics: '访问统计',  // ← 新增路由对应的 key
}
```

---

## 构建与部署

### 构建

```bash
npm run build
```

产物输出到 `dist/`，静态资源位于 `dist/static/`。

构建特性：

- **Terser 压缩**：自动移除所有 `console` 和 `debugger` 语句
- **代码分割**：按 `node_modules` 包名自动分 chunk，优化缓存命中率
- **Bundle 分析**：构建完成后自动打开 `rollup-plugin-visualizer` 体积报告
- **相对路径**：`base: './'`，支持部署在任意子路径

### 部署

将 `dist/` 目录内容部署到 Web 服务器，由后端服务（Go）统一提供静态文件服务。前端使用 Hash 路由，无需配置 history fallback。

### 开发服务器

```
地址：http://127.0.0.1:8324
代理：/api/* → VITE_API（自动去除前缀）
      /ws/*  → VITE_API（WebSocket）
```
