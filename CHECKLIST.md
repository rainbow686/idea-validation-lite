# 部署检查清单

## ✅ 代码已准备好

- [x] API 配置支持分离部署
- [x] CORS 中间件已配置
- [x] 部署文档已更新

---

## 📋 你需要做的事

### 1. 部署后端到 Render

1. 访问 https://render.com 并登录

2. 点击 **"New +"** → **"Web Service"**

3. 连接仓库：**`rainbow686/idea-validation-lite`**

4. 配置：

   | 字段 | 值 |
   |------|-----|
   | Name | `idea-validation-api` |
   | Region | `Oregon` |
   | Branch | `main` |
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
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<你的 key>
   SUPABASE_SERVICE_ROLE_KEY=<你的 key>
   ```

6. 点击 **"Create Web Service"**

7. 等待部署完成（2-3 分钟），复制你的 URL：
   ```
   https://idea-validation-api.onrender.com
   ```

---

### 2. 部署前端到 Vercel

1. 访问 https://vercel.com/dashboard

2. 找到 `idea-validation-lite` 项目（或新建）

3. 点击 **"Settings"** → **"Environment Variables"**

4. 添加新变量：

   | Key | Value | Environment |
   |-----|-------|-------------|
   | `NEXT_PUBLIC_RENDER_API_URL` | `https://idea-validation-api.onrender.com` | Production |

5. 点击 **"Save"**

6. 返回 **"Deployments"**，点击 **"Redeploy"**

---

### 3. 测试

1. 访问 Vercel URL: `https://idea-validation-lite.vercel.app`

2. 填写一个创业想法

3. 点击 "Analyze Free"

4. 等待 60-90 秒

5. 应该看到完整的报告

---

## ⚠️ 注意事项

### Render 免费层 Sleep 问题

- 15 分钟无请求会 sleep
- 首次请求需要 30-50 秒唤醒 + 60-90 秒生成 = 90-140 秒
- 解决：UptimeRobot 每 10 分钟 ping 一次

### 第一次部署可能失败

检查 Render Logs：
- Dashboard → Logs
- 常见错误：环境变量缺失、依赖安装失败

---

## 💰 成本

| 服务 | 费用 |
|------|------|
| Vercel | $0 |
| Render | $0 |
| Supabase | $0 |
| Tavily | $0 |
| Alibaba AI | ¥0.5/次 |

**总计**: ¥15-50/月
