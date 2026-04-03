# Idea Validation Frontend

AI 驱动的创业创意验证平台前端。

## 技术栈

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- React PDF

## 目录结构

```
packages/frontend/
├── src/
│   ├── app/           # Next.js 页面和布局
│   ├── components/    # React 组件
│   ├── contexts/      # React Contexts (Auth)
│   ├── hooks/         # 自定义 Hooks
│   ├── lib/           # 客户端工具函数
│   └── types/         # TypeScript 类型
├── public/            # 静态资源
└── 配置文件
```

## 本地开发

从项目根目录：

```bash
cd packages/frontend
npm install
npm run dev
```

应用运行在 http://localhost:3000

## 环境变量

创建 `.env.local` 文件：

```bash
# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API (Render)
NEXT_PUBLIC_RENDER_API_URL=https://your-api.onrender.com
```

## 部署到 Vercel

1. 在 Vercel Dashboard 导入此仓库（`packages/frontend` 目录）
2. 设置 Root Directory 为 `packages/frontend`
3. 配置环境变量
4. 部署

## 测试

```bash
npm test
```
