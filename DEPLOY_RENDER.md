# 部署到 Render

## 步骤 1 - 连接 GitHub

1. 访问 https://render.com 并登录
2. 点击 "New +" → "Web Service"
3. 选择 "Connect a repository"
4. 找到 `idea-validation-lite` 仓库并连接

## 步骤 2 - 配置服务

**基础配置**：
- Name: `idea-validation-api`
- Region: `Oregon` (美国西部)
- Branch: `main`
- Root Directory: 留空
- Runtime: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `node server.js`

**实例配置**：
- Plan: **Free**
- Instance Type: 默认即可

## 步骤 3 - 添加环境变量

**从 `.env.keys` 文件中复制以下变量**到 Render Dashboard 的 "Environment" 页面：

```
# AI
ANTHROPIC_API_KEY=<从 .env.keys 复制>
ANTHROPIC_BASE_URL=<从 .env.keys 复制>

# Tavily Search
TAVILY_API_KEY=<从 .env.keys 复制>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<从 .env.keys 复制>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<从 .env.keys 复制>
SUPABASE_SERVICE_ROLE_KEY=<从 .env.keys 复制>
```

**注意**：`.env.keys` 文件包含所有 API 密钥，仅限本地开发使用，**绝对不能上传到 GitHub**！

## 步骤 4 - 部署

1. 点击 "Create Web Service"
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后，你会获得一个 URL，例如：`https://idea-validation-api.onrender.com`

## 步骤 5 - 更新 Vercel 前端

前端需要调用 Render 的 API 而不是 Vercel：

1. 访问 Vercel Dashboard
2. 找到 `idea-validation-lite` 项目
3. 更新环境变量 `NEXT_PUBLIC_API_URL` 为 Render 的 URL
4. 重新部署前端

或者，更新 `src/app/page.tsx` 中的 API 调用 URL：

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://idea-validation-api.onrender.com'

const response = await fetch(`${API_URL}/api/generate-report`, {
  // ...
})
```

## 重要注意事项

### Render 免费层限制

1. **Sleep 模式**：15 分钟无请求后，实例会进入 sleep 状态
   - 下次请求需要 30-50 秒唤醒时间
   - 解决方案：使用 UptimeRobot 等工具每 10 分钟 ping 一次

2. **无超时限制**：Render 免费层没有 60 秒超时限制，适合我们的 AI 报告生成

3. **带宽限制**：每月 100GB 免费额度（对我们来说应该够用）

### 监控

- Dashboard 可以看到 CPU、内存、带宽使用情况
- 设置警报：当错误率 > 5% 时通知

## 本地测试

```bash
# 本地运行
npm run dev

# 本地测试 Render 配置
npm run build && node server.js
```

## 故障排查

### 构建失败
检查 Render 的 "Logs" 页面查看构建日志

### 运行时报错
检查 "Logs" 页面的运行时日志

### API 超时
检查网络延迟，可能需要优化 Tavily 搜索速度

## 成本估算

- **Render**: $0/月 (Free)
- **Vercel**: $0/月 (Hobby)
- **Supabase**: $0/月 (Free tier)
- **Tavily**: $0/月 (Dev key, 100 次/天)
- **Alibaba AI**: ¥0.02/千 tokens (约 ¥0.5/次报告)

**总计**: 约 ¥15-30/月 (主要是 AI 成本)
