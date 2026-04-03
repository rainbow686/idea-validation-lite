# Idea Validation Backend

AI 驱动的创业创意验证 API 服务。

## 技术栈

- Node.js + Express
- TypeScript
- Tavily Search API（市场研究）
- Claude API（AI 分析）
- Supabase（数据库）

## 目录结构

```
packages/backend/
├── src/
│   ├── app/api/       # API routes
│   └── lib/           # 服务端工具（report-generator）
├── api-server.ts      # Express 服务器入口
├── render.yaml        # Render 部署配置
└── 配置文件
```

## 本地开发

从项目根目录：

```bash
cd packages/backend
npm install
npm run dev
```

服务运行在 http://localhost:3000

## 环境变量

创建 `.env` 文件：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI API
ANTHROPIC_API_KEY=your-api-key
ANTHROPIC_BASE_URL=https://your-anthropic-endpoint

# Tavily Search
TAVILY_API_KEY=your-tavily-key

# App config
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
PORT=3000
```

## API 端点

- `GET /api/health` - 健康检查
- `POST /api/generate-report` - 生成创意验证报告（60-90 秒）
- `POST /api/generate-ideas` - 生成创业创意

## 部署到 Render

1. 在 Render Dashboard 创建 Web Service
2. 连接此仓库
3. 设置 Root Directory 为 `packages/backend`
4. 配置环境变量
5. 部署

Build Command: `cd packages/backend && npm install && npm run build`
Start Command: `cd packages/backend && npm run start`

## 测试

```bash
npm test
```
