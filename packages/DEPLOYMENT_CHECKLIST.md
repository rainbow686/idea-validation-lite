# Idea Validation Lite - 部署检查清单

## 部署前准备

### 1. 确认 GitHub 仓库
- [x] 代码已推送到 `https://github.com/rainbow686/idea-validation-lite`
- [x] 主分支：`main`

### 2. 环境变量准备

在部署前，确保以下密钥已准备好：

| 变量名 | 来源 | 格式示例 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → API Keys | `sb_publishable_xxx` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → API Keys | `sb_secret_xxx` |
| `ANTHROPIC_API_KEY` | DashScope / 通义千问控制台 | `sk-xxx` |
| `ANTHROPIC_BASE_URL` | DashScope 文档 | `https://coding.dashscope.aliyuncs.com/apps/anthropic` |
| `TAVILY_API_KEY` | Tavily Dashboard | `tvly-xxx` |

---

## 第一步：部署后端到 Render

### 1.1 创建 Render Web Service

1. 登录 [Render Dashboard](https://dashboard.render.com/)
2. 点击 **New +** → **Web Service**
3. 连接 GitHub 仓库：`rainbow686/idea-validation-lite`
4. 配置如下：

| 设置 | 值 |
|------|-----|
| **Name** | `idea-validation-api` |
| **Region** | Oregon (默认) |
| **Branch** | `main` |
| **Root Directory** | `packages/backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | Free |

### 1.2 配置环境变量

在 Render Dashboard 的 **Environment** 页面添加以下变量：

| Key | Value | 说明 |
|-----|-------|------|
| `NODE_ENV` | `production` | 生产环境标识 |
| `PORT` | `3000` | 服务端口 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_xxx` | Supabase 前端密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_xxx` | Supabase 后端密钥 |
| `ANTHROPIC_API_KEY` | `sk-xxx` | AI API 密钥 |
| `ANTHROPIC_BASE_URL` | `https://coding.dashscope.aliyuncs.com/apps/anthropic` | AI API 端点 |
| `TAVILY_API_KEY` | `tvly-xxx` | Tavily 搜索 API 密钥 |
| `NEXT_PUBLIC_APP_URL` | `https://idea-validation-lite.vercel.app` | 前端 URL（部署 Vercel 后更新） |
| `ALLOWED_ORIGINS` | `https://idea-validation-lite.vercel.app,http://localhost:3000` | CORS 允许的域名 |

### 1.3 等待部署完成

- 部署时间：约 3-5 分钟
- 部署完成后，记录 Render URL：`https://idea-validation-api.onrender.com`

### 1.4 测试后端

```bash
curl https://idea-validation-api.onrender.com/api/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2026-04-04T...",
  "service": "idea-validation-api"
}
```

---

## 第二步：部署前端到 Vercel

### 2.1 导入项目到 Vercel

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Add New...** → **Project**
3. 导入 GitHub 仓库：`rainbow686/idea-validation-lite`

### 2.2 配置项目设置

在 **Configure Project** 页面设置：

- **Root Directory**: 点击 **Edit** → 输入 `packages/frontend`

### 2.3 配置环境变量

在 Vercel 项目设置的 **Environment Variables** 页面添加：

| Key | Value | 说明 |
|-----|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_xxx` | Supabase 前端密钥 |
| `NEXT_PUBLIC_RENDER_API_URL` | `https://idea-validation-api.onrender.com` | 后端 Render URL |

> **重要**：将环境变量添加到所有环境（Production、Preview、Development）

### 2.4 部署

- 点击 **Deploy**
- 部署时间：约 2-3 分钟
- 部署完成后，记录 Vercel URL：`https://idea-validation-lite.vercel.app`

---

## 第三步：更新后端环境变量

前端部署完成后，返回 Render Dashboard 更新：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_APP_URL` | `https://idea-validation-lite.vercel.app` |
| `ALLOWED_ORIGINS` | `https://idea-validation-lite.vercel.app,http://localhost:3000` |

---

## 第四步：完整测试

### 4.1 测试首页
访问 Vercel URL，确认页面正常加载。

### 4.2 测试登录
1. 点击 **登录 / 注册**
2. 输入邮箱
3. 检查邮箱，点击 magic link
4. 确认成功登录

### 4.3 测试报告生成
1. 输入创业创意（例如："AI 健身教练"）
2. 点击 **Analyze Free**
3. 等待 60-90 秒
4. 确认报告正常显示

### 4.4 测试错误处理
1. 故意输入无效内容
2. 确认错误提示友好

---

## 故障排查

### 后端返回 404
- 检查 Render 的 Root Directory 是否为 `packages/backend`
- 检查环境变量是否正确
- 查看 Render 日志

### 前端无法连接后端
- 检查 `NEXT_PUBLIC_RENDER_API_URL` 是否正确
- 检查 CORS 配置（`ALLOWED_ORIGINS` 是否包含 Vercel 域名）
- 查看浏览器控制台网络请求

### 报告生成超时
- 检查 Tavily API 和 Anthropic API 密钥是否有效
- 查看 Render 日志，确认 AI 调用是否成功

### Supabase 认证失败
- 检查 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正确
- 检查 Supabase Dashboard 中的 RLS 策略

---

## 安全提醒

- ✅ API 密钥存储在 Render/Vercel Dashboard，不在代码中
- ✅ `.env.keys` 已在 `.gitignore` 中
- ✅ GitHub Secret Scanning 已启用
- ❌ 不要将密钥提交到 git
- ❌ 不要在代码中硬编码密钥

---

## 部署后的 URL

| 服务 | URL | 用途 |
|------|-----|------|
| 前端 | `https://idea-validation-lite.vercel.app` | 用户访问的应用 |
| 后端 | `https://idea-validation-api.onrender.com` | API 服务 |
| 数据库 | Supabase (私有) | 数据存储 |

---

**最后更新**: 2026-04-04
