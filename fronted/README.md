# JobHub 校园求职 · 前端拆分版（HTML / JS 分离）

学生求职平台前端，**零后端依赖**：无框架、无构建工具、无 npm 包。

本目录（`front/`）是 **HTML 与 JS 分离** 的版本——每个页面的逻辑都拆到独立的
`js/pages/*.js` 文件中，HTML 只保留结构与一行脚本引用。功能与上层 `frontend/` 目录
（内联脚本版）完全一致，可独立打开运行。

所有"接口"由 `js/api.js` 统一封装，当前走 `js/mock.js` 的 localStorage 模拟层
（带网络延迟与业务错误码），后端接口就绪后改一个开关即可切换真实接口。

## 快速开始

直接用浏览器打开任一页面即可（双击 `index.html` 或 `login.html`，`file://` 协议下完整可用）：

| 页面 | 说明 |
|---|---|
| `login.html` | 登录 / 注册（含前端校验、错误提示、登录态保持） |
| `index.html` | 首页 + 岗位列表（搜索、分页、三态） |
| `job-detail.html?id=j01` | 岗位详情（收藏 / 投递 / 带入简历优化） |
| `applications.html` | 我的投递（收藏列表 + 投递记录 + 状态修改） |
| `profile.html` | 个人资料（回填、保存三态反馈） |
| `resume-editor.html` | 简历编辑（分模块表单 + AI 生成/优化模拟） |
| `resume-preview.html` | A4 简历预览 / 打印（另存为 PDF） |

**演示账号**：`user / 123456`（预置了示例简历与资料）、`admin / 123456`；也可自行注册新账号。

> 页面通过 CDN 加载 Tailwind 与 Font Awesome（需要联网才有完整视觉效果）；
> 离线打开时核心布局由 `css/style.css` 兜底，页面不会散架。

## 功能一览

1. **登录 / 注册**：静态表单 + 前端校验（必填、长度）+ 业务错误提示（重复用户名、密码错）；
   登录成功跳首页（或 `?redirect=` 原页面）；未登录访问受限页自动跳登录（401 处理）；刷新保持登录态。
2. **首页 + 岗位列表**：公共导航（登录前/后两态）+ 页脚；岗位卡片（公司、岗位、城市、薪资、关键词）；
   关键词搜索（岗位/公司/城市/标签）、上一页/下一页分页、无结果空状态；加载中 / 出错（可重试）。
3. **岗位详情**：URL 读取 `id`；收藏 / 取消收藏；"用这个岗位优化简历"带 `jobId` 跳简历页；重复投递有业务提示。
4. **我的投递**：收藏列表 + 投递记录两块；投递状态下拉可修改（选项来自接口 `/statuses`，状态文字不写死）；均有空状态引导。
5. **个人资料**：读取回填 → 保存 → 刷新不丢（localStorage）；保存中 / 成功 / 失败三种反馈。
6. **简历编辑**：基本信息 / 教育 / 项目（动态增删行）/ 技能分模块表单；长中文与换行原样保存；
   AI 区：生成 / 优化（带岗位上下文）、加载中、错误提示 + 重试、结果展示、复制（Clipboard API + execCommand 降级）、
   "填入"需用户确认（有内容时弹确认框），**AI 结果绝不自动覆盖原文**；模拟结果有明确标注。
7. **简历预览 / 打印**：A4 版式渲染；`css/print.css` 定义 `@page` A4 页边距、`@media print` 隐藏导航与按钮、
   分节防截断（`break-inside: avoid`）；Chrome / Edge 打印对话框选"另存为 PDF"。

## 目录结构（HTML / JS 分离）

```
front/
├── login.html  index.html  job-detail.html  applications.html
├── profile.html  resume-editor.html  resume-preview.html
├── css/
│   ├── style.css     全局样式（布局、组件，离线兜底）
│   └── print.css     打印样式（@page / @media print）
└── js/
    ├── api.js        统一请求封装（前缀、Cookie、错误码、401 跳登录）
    ├── mock.js       Mock 数据 + localStorage 模拟接口层
    ├── common.js     导航 / 页脚 / 登录检查 / toast / 防重复点击等公共工具
    └── pages/        各页面专属逻辑（与 HTML 一一对应）
        ├── index.js
        ├── job-detail.js
        ├── applications.js
        ├── login.js
        ├── profile.js
        ├── resume-editor.js
        └── resume-preview.js
```

### 脚本引用约定

每个页面底部按固定顺序引入公共脚本与自身逻辑：

```html
<script src="js/mock.js"></script>      <!-- 模拟接口层 -->
<script src="js/api.js"></script>       <!-- 请求封装 -->
<script src="js/common.js"></script>    <!-- 公共组件 -->
<script src="js/pages/index.js"></script> <!-- 当前页面逻辑 -->
```

## 如何切换到真实接口

1. 打开 `js/api.js`，把 `API_CONFIG.useMock` 改为 `false`；
2. 按需修改 `API_CONFIG.baseURL`（接口前缀）；
3. 前端会以 `fetch + credentials:'include'`（带 Cookie）请求后端，
   统一响应约定 `{ code, message, data }`（code=0 成功，401 自动跳登录），
   接口路径与参数见 `js/mock.js` 中 `MockAPI.handle` 的路由表，与后端契约一致。

## 数据说明

- 岗位数据是写死的示例 JSON（15 个校招/实习岗位），位于 `js/mock.js` 的 `JOBS`；
- 用户、资料、收藏、投递、简历存在浏览器 localStorage（键名前缀 `jobhub_`），仅演示用；
- 状态文字（岗位状态、投递状态）一律来自接口数据，页面不写死。
