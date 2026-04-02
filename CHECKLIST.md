# Render 部署检查清单

## ✅ 已完成

- [x] 创建 render.yaml 配置文件
- [x] 创建 server.js 自定义服务器
- [x] 更新 next.config.mjs 为 standalone 模式
- [x] 恢复同步 API route（无超时限制）
- [x] 配置前端 API URL 自动切换
- [x] 创建部署文档

## 📋 你需要做的事情

### 1. 创建 Render 账号

1. 访问 https://render.com
2. 用 GitHub 账号登录（推荐）或邮箱注册

### 2. 创建 Web Service

1. 点击 **"New +"** → **"Web Service"**
2. **"Connect a repository"**
3. 找到 `idea-validation-lite` 仓库，点击 **"Connect"**

### 3. 配置服务

按以下填写：

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
| Auto-Deploy | ✅ On |

点击 **"Advanced"** 展开更多选项：
- Instance Type: 默认
- Docker: 不选

### 4. 添加环境变量

点击 **"Environment"** 标签，添加以下变量：

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `ANTHROPIC_API_KEY` | `sk-sp-REDACTED` |
| `ANTHROPIC_BASE_URL` | `https://coding.dashscope.aliyuncs.com/apps/anthropic` |
| `TAVILY_API_KEY` | `tvly-REDACTED` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jcyexmffldsrbxkxnilg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | （从 Supabase Dashboard 获取） |
| `SUPABASE_SERVICE_ROLE_KEY` | （从 Supabase Dashboard 获取） |

### 5. 创建服务

点击 **"Create Web Service"**

等待 2-3 分钟构建完成。

### 6. 测试 API

构建完成后，你会看到一个 URL，例如：
```
https://idea-validation-api-xxxx.onrender.com
```

测试 API：
```bash
curl -X POST https://your-render-url.onrender.com/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{"ideaTitle":"测试咖啡","ideaDescription":"帮助咖啡店主"}'
```

应该返回一个 JSON 响应（可能需要 60-90 秒）。

### 7. 更新 Vercel 前端

1. 访问 Vercel Dashboard: https://vercel.com/dashboard
2. 找到 `idea-validation-lite` 项目
3. 点击 **"Settings"** → **"Environment Variables"**
4. 添加新变量：
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-render-url.onrender.com`
   - Environments: 勾选 Production
5. 点击 **"Save"**
6. 重新部署：点击 **"Deployments"** → **"Redeploy"**

### 8. 测试完整流程

1. 访问 Vercel 生产 URL: https://idea-validation-lite.vercel.app
2. 填写一个创业想法
3. 点击 "Analyze Free"
4. 等待 60-90 秒
5. 应该看到完整的报告

## ⚠️ 重要提示

### Render 免费层 Sleep 问题

Render 免费层在 15 分钟无请求后会进入 sleep 状态。

**解决方案 1**（推荐）：使用 UptimeRobot 保持唤醒
1. 访问 https://uptimerobot.com
2. 创建新 monitor
3. Type: HTTP(s)
4. URL: `https://your-render-url.onrender.com/api/generate-report`
5. Method: POST
6. Interval: 10 minutes
7. POST data: `{"ideaTitle":"health-check","ideaDescription":"ping"}`

**解决方案 2**：升级到 Starter 计划 ($7/月)

### 首次请求慢

由于 sleep 机制，首次请求可能需要 30-50 秒唤醒 + 60-90 秒生成 = 90-140 秒

这是正常的，后续请求会恢复正常速度（60-90 秒）。

## 💰 成本估算

| 服务 | 费用 |
|------|------|
| Render | $0/月 (Free) |
| Vercel | $0/月 (Hobby) |
| Supabase | $0/月 (Free tier) |
| Tavily | $0/月 (Dev key) |
| Alibaba AI | 约 ¥0.5/次 |

**总计**: 约 ¥15-50/月（取决于使用量）

## 🎉 完成！

现在你的应用已经部署到 Render，可以享受无超时限制的 API 服务了！

---

## 故障排查

### 构建失败
- 检查 Render Logs: Dashboard → Logs
- 确认 node_modules 已正确安装

### 500 错误
- 检查环境变量是否正确配置
- 检查 ANTHROPIC_API_KEY 是否有效

### 超时
- 检查 Tavily API 是否响应慢
- 考虑减少搜索次数优化速度

### 找不到 API
- 确认 API_BASE_URL 配置正确
- 检查 CORS 设置
