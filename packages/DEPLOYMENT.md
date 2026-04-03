# Idea Validation Lite - 部署指南

## 项目结构

```
idea-validation-lite/
├── packages/
│   ├── frontend/     # Next.js 前端 → Vercel
│   └── backend/      # Express API → Render
├── docs/             # 项目文档
├── supabase/         # 数据库迁移
├── CLAUDE.md         # 项目配置
└── README.md         # 项目说明
```

## 架构说明

```
┌───────────────────────────────────────────────────────────┐
│  前端：Vercel Hobby (packages/frontend)                    │
│  - Next.js 14 App Router                                   │
│  - CDN 全球分发                                            │
│  - 100GB 带宽/月                                           │
└───────────────────────────────────────────────────────────┘
                            │
                            │ API 调用 (跨域请求)
                            │ fetch('https://xxx.onrender.com/api/*')
                            ▼
┌───────────────────────────────────────────────────────────┐
│  后端：Render Free (packages/backend)                      │
│  - Express API 服务器                                       │
│  - 无超时限制 (支持 60-90 秒 AI 报告生成)                       │
│  - 512MB 内存 / 750 小时/月                                 │
│  - CORS 配置允许 Vercel 域名访问                              │
└───────────────────────────────────────────────────────────┘
                            │
                            │ PostgreSQL
                            ▼
┌───────────────────────────────────────────────────────────┐
│  数据库：Supabase Free                                     │
│  - users (用户和 credits)                                   │
│  - reports (验证报告)                                       │
│  - credit_usage (credit 使用记录)                            │
│  - report_shares (分享链接)                                 │
└───────────────────────────────────────────────────────────┘
```

---

## 部署步骤

### 第一步：推送代码到 GitHub

#### 1.1 提交当前更改

```bash
cd /Users/sunbin/myclaude/idea-validation-lite

# 提交分离后的代码
git add packages/
git commit -m "feat: separate frontend and backend into packages"
```

#### 1.2 推送到 GitHub

```bash
git push origin main
```

---

### 第二步：部署后端到 Render

#### 2.1 在 Render Dashboard 创建服务

1. 登录 [Render Dashboard](https://dashboard.render.com/)
2. 点击 "New +" → "Web Service"
3. 连接 GitHub 仓库 `idea-validation-lite`
4. 配置如下：

| 设置 | 值 |
|------|-----|
| Name | `idea-validation-api` |
| Region | Oregon |
| Branch | main |
| **Root Directory** | `packages/backend` |
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start` |
| Instance Type | Free |

#### 2.2 配置环境变量

在 Render Dashboard 的 "Environment" 页面添加：

| Key | 说明 | 获取方式 |
|-----|------|----------|
| `NODE_ENV` | `production` | - |
| `ANTHROPIC_API_KEY` | AI API 密钥 | .env.keys 或 DashScope 控制台 |
| `ANTHROPIC_BASE_URL` | AI API 端点 | .env.keys |
| `TAVILY_API_KEY` | Tavily 搜索 API 密钥 | .env.keys 或 Tavily Dashboard |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | .env.keys |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 前端密钥 | .env.keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 后端密钥 | .env.keys |
| `NEXT_PUBLIC_APP_URL` | 前端 Vercel URL | Vercel 部署后获得 |
| `PORT` | `3000` | - |

> **安全提醒**：永远不要在文档、代码或 git 历史中存储真实的 API 密钥。所有密钥应存储在：
> - 本地：`.env.keys`（已在 .gitignore 中）
> - 生产：Vercel/Render Dashboard 的环境变量

#### 2.3 等待部署完成

部署大约需要 3-5 分钟。完成后记录你的 Render URL：
```
https://idea-validation-api.onrender.com
```

---

### 第三步：部署前端到 Vercel

#### 3.1 在 Vercel Dashboard 导入项目

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 导入 GitHub 仓库 `idea-validation-lite`

#### 3.2 配置项目设置

**重要**：在 "Configure Project" 页面设置：

- **Root Directory**: 点击 "Edit" → 输入 `packages/frontend`

#### 3.3 配置环境变量

在 Vercel 项目设置的 "Environment Variables" 页面添加：

| Key | 说明 | 获取方式 |
|-----|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | .env.keys |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 前端密钥 | .env.keys |
| `NEXT_PUBLIC_RENDER_API_URL` | 后端 Render URL | 第二步中获得的 URL |

> **重要**：将环境变量添加到所有环境（Production、Preview、Development）

#### 3.4 部署

点击 "Deploy"，等待部署完成（约 2-3 分钟）

---

## 第四步：测试验证

### 4.1 测试后端健康检查

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

### 4.2 测试前端

访问 Vercel 部署的 URL：
```
https://idea-validation-lite.vercel.app
```

### 4.3 测试完整登录和报告生成流程

1. 打开前端 URL
2. 点击 "登录 / 注册"
3. 输入邮箱，接收 magic link
4. 登录后，输入创业创意
5. 点击 "Analyze Free"
6. 等待 60-90 秒，查看报告

---

## 故障排查

### 后端返回 404

- 检查 Render 服务的 Root Directory 是否为 `packages/backend`
- 检查环境变量是否正确配置
- 查看 Render 部署日志

### 前端无法连接后端

- 检查 `NEXT_PUBLIC_RENDER_API_URL` 是否正确
- 检查 CORS 配置（`api-server.ts` 中需要包含 Vercel 域名）
- 查看浏览器控制台网络请求

### 报告生成超时

- 检查 Tavily API 和 Anthropic API 密钥是否有效
- 查看 Render 日志，确认 AI 调用是否成功

---

## 本地开发

### 同时运行前端和后端

**终端 1 - 后端：**
```bash
cd packages/backend
npm install
npm run dev
```

**终端 2 - 前端：**
```bash
cd packages/frontend
npm install
npm run dev
```

### 环境变量

**后端 `.env` (packages/backend/.env):**
```bash
# 从根目录复制 .env.keys 的内容
cp ../../.env.keys .env

# 或者手动创建，参考 ../../.env.example
```

**前端 `.env.local` (packages/frontend/.env.local):**
```bash
# 从根目录复制 .env.keys 的内容
cp ../../.env.keys .env.local

# 添加本地开发配置
NEXT_PUBLIC_RENDER_API_URL=http://localhost:3000
```

---

## 安全提醒

### 密钥存储位置

| 环境 | 存储位置 |
|------|----------|
| 本地开发 | `.env.keys`（已在 .gitignore 中） |
| Vercel | Dashboard → Settings → Environment Variables |
| Render | Dashboard → Environment |

### 永远不要

- ❌ 将 `.env.keys` 或任何包含密钥的文件提交到 git
- ❌ 在代码中硬编码密钥（使用 `process.env.*`）
- ❌ 在文档、截图、日志中显示完整密钥
- ❌ 通过不安全的渠道（即时消息、邮件明文）发送密钥

### 如果密钥泄露

1. **立即在对应平台撤销并重新生成密钥**
2. 更新所有环境的变量
3. 如果已提交到 git，使用 BFG Repo-Cleaner 清理历史

---

## 附录：环境变量清单

### 前端环境变量 (Vercel)

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 前端认证密钥 |
| `NEXT_PUBLIC_RENDER_API_URL` | ✅ | 后端 API 地址 |

### 后端环境变量 (Render)

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | ✅ | AI 报告生成 |
| `ANTHROPIC_BASE_URL` | ✅ | AI 服务提供商端点 |
| `TAVILY_API_KEY` | ✅ | 网络搜索 API |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | 数据库 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | 数据库前端密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | 数据库后端密钥 |
| `NEXT_PUBLIC_APP_URL` | ✅ | 前端 URL（用于 CORS） |
| `PORT` | ✅ | 服务端口（默认 3000） |
