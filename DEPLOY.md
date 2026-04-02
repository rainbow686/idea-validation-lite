# 部署架构说明

## 架构概览

```
                    用户访问
                      │
                      ▼
        ┌─────────────────────────┐
        │   前端：Vercel Hobby    │
        │   https://idea-validation-lite.vercel.app  │
        │   - CDN 全球分发          │
        │   - 静态资源缓存         │
        └─────────────────────────┘
                      │
                      │ API 调用
                      ▼
        ┌─────────────────────────┐
        │   后端：Render Free     │
        │   https://idea-validation-api.onrender.com  │
        │   - 无超时限制           │
        │   - AI 报告生成 (60-90 秒) │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │   数据库：Supabase      │
        │   - 用户数据存储         │
        │   - 报告存储             │
        └─────────────────────────┘
```

## 为什么分离部署？

| 考量 | 前端 (Vercel) | 后端 (Render) |
|------|--------------|---------------|
| **专长** | CDN 静态资源分发 | 长时间运行任务 |
| **超时限制** | N/A (静态) | 无限制 |
| **免费额度** | 100GB 带宽/月 | 512MB 内存 + 750 小时/月 |
| **适用场景** | 前端页面 | AI 报告生成 |

---

## 部署步骤

### 第一步：部署后端到 Render

1. 访问 https://render.com 并登录

2. 点击 **"New +"** → **"Web Service"**

3. 连接仓库：`rainbow686/idea-validation-lite`

4. 配置服务：

   | 字段 | 值 |
   |------|-----|
   | Name | `idea-validation-api` |
   | Region | `Oregon` |
   | Branch | `main` |
   | Root Directory | 留空 |
   | Runtime | `Node` |
   | Build Command | `npm install && npm run build` |
   | Start Command | `node server.js` |
   | Plan | **Free** |

5. 添加环境变量：

   ```
   NODE_ENV=production
   ANTHROPIC_API_KEY=sk-sp-REDACTED
   ANTHROPIC_BASE_URL=https://coding.dashscope.aliyuncs.com/apps/anthropic
   TAVILY_API_KEY=tvly-REDACTED
   NEXT_PUBLIC_SUPABASE_URL=https://jcyexmffldsrbxkxnilg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<从 Supabase 获取>
   SUPABASE_SERVICE_ROLE_KEY=<从 Supabase 获取>
   ```

6. 点击 **"Create Web Service"**，等待 2-3 分钟

7. 部署成功后，复制你的 Render URL，例如：
   ```
   https://idea-validation-api.onrender.com
   ```

---

### 第二步：部署前端到 Vercel

1. 访问 https://vercel.com 并登录

2. 点击 **"Add New Project"**

3. 导入仓库：`rainbow686/idea-validation-lite`

4. 配置构建：

   | 字段 | 值 |
   |------|-----|
   | Framework Preset | Next.js |
   | Root Directory | 留空 |
   | Build Command | `npm run build` |
   | Output Directory | `.next` |

5. **重要**：添加环境变量 `NEXT_PUBLIC_RENDER_API_URL`

   - Key: `NEXT_PUBLIC_RENDER_API_URL`
   - Value: `https://idea-validation-api.onrender.com` (你的 Render URL)
   - Environment: 勾选 **Production**

6. 点击 **"Deploy"**

7. 部署成功后，你的前端 URL 是：
   ```
   https://idea-validation-lite.vercel.app
   ```

---

### 第三步：测试完整流程

1. 访问 Vercel 前端 URL
2. 填写一个创业想法
3. 点击 "Analyze Free"
4. 等待 60-90 秒
5. 应该看到完整的报告

---

## 环境变量说明

### 前端 (Vercel)
| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_RENDER_API_URL` | 后端 API 地址 |

### 后端 (Render)
| 变量 | 说明 |
|------|------|
| `ANTHROPIC_API_KEY` | Alibaba Cloud AI API Key |
| `ANTHROPIC_BASE_URL` | Alibaba Cloud AI Base URL |
| `TAVILY_API_KEY` | Tavily Search API Key |
| `NEXT_PUBLIC_SUPABASE_*` | Supabase 数据库配置 |
| `STRIPE_*` | Stripe 支付配置 (可选) |

---

## CORS 配置

后端已配置 CORS，允许以下域名访问：

- `https://idea-validation-lite.vercel.app` (生产)
- `http://localhost:3000` (本地开发)

如果需要添加新域名，编辑 `src/middleware.ts`。

---

## 成本估算

| 服务 | 费用 | 说明 |
|------|------|------|
| Vercel | $0/月 | Hobby 计划 |
| Render | $0/月 | Free 计划 |
| Supabase | $0/月 | Free tier (500MB) |
| Tavily | $0/月 | Dev key (100 次/天) |
| Alibaba AI | ¥0.5/次 | 约 ¥0.02/千 tokens |

**月度总成本**: ¥15-50（取决于使用量）

---

## 故障排查

### 前端调用 API 失败
- 检查 `NEXT_PUBLIC_RENDER_API_URL` 是否正确
- 检查 Render 服务是否正在运行
- 查看浏览器控制台 CORS 错误

### Render 服务 Sleep
- 免费层 15 分钟无请求会 sleep
- 首次请求需要 30-50 秒唤醒
- 解决：用 UptimeRobot 每 10 分钟 ping 一次

### API 超时
- 检查 Tavily API 响应速度
- 检查 Alibaba AI API 是否正常

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（前后端一起）
npm run dev

# 访问 http://localhost:3000
# API 调用会自动路由到 localhost:3000/api/*
```
