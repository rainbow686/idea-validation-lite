---
name: 前后端分离部署架构
description: Idea Validation Lite 采用前后端分离部署：前端 Vercel + 后端 Render + 数据库 Supabase
type: project
---

**部署架构**:
- 前端：Vercel Hobby (免费) - https://idea-validation-lite.vercel.app
- 后端：Render Free (免费) - https://idea-validation-api.onrender.com
- 数据库：Supabase Free - https://jcyexmffldsrbxkxnilg.supabase.co

**API 配置**:
- `NEXT_PUBLIC_RENDER_API_URL=https://idea-validation-api.onrender.com`
- 前端通过 fetch('https://idea-validation-api.onrender.com/api/xxx') 调用后端

**关键配置**:
- Supabase Auth Site URL: `https://idea-validation-lite.vercel.app`
- Supabase Auth Redirect URLs: `https://idea-validation-lite.vercel.app/auth/callback`

**为什么分离部署**:
- Vercel: CDN 静态资源加速，前端页面加载快
- Render: 无超时限制，可运行 60-90 秒 AI 报告生成任务
- 两者免费额度都够用，零成本启动

**如何修复 Render 部署失败**:
1. 登录 Render Dashboard: https://dashboard.render.com
2. 找到 idea-validation-api 服务
3. 查看部署日志
4. 重新部署或修复环境变量

---
name: Supabase 项目配置
description: Idea Validation Lite 的 Supabase 项目信息和 API Keys
type: reference
---

**Project**: jcyexmffldsrbxkxnilg
**Dashboard**: https://supabase.com/dashboard/project/jcyexmffldsrbxkxnilg

**API Keys** (存储在 .env.keys):
- `NEXT_PUBLIC_SUPABASE_URL=https://jcyexmffldsrbxkxnilg.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...` (anon 角色)
- `SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...` (service_role 角色，可绕过 RLS)

**Auth 配置**:
- Site URL: `https://idea-validation-lite.vercel.app`
- Redirect URLs: `https://idea-validation-lite.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
- 邮箱魔法链接登录

**如何配置 Supabase Auth URL**:
1. 登录 Supabase Dashboard: https://supabase.com/dashboard/project/jcyexmffldsrbxkxnilg
2. 进入 Authentication → Providers → Email
3. 在 "URL configuration" 中设置：
   - Site URL: `https://idea-validation-lite.vercel.app`
   - Redirect URLs (每行一个):
     - `https://idea-validation-lite.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`
4. 保存配置

**数据库表**:
- users (id, email, free_credits, paid_credits, stripe_customer_id)
- reports (id, user_id, title, idea_text, overall_score, status, metadata, slug)
- credit_usage (id, user_id, credits_used, report_id, payment_intent_id)
- invite_codes (id, code, user_id, created_at)

---
name: 生产环境部署配置
description: Vercel 和生产环境配置信息
type: reference
---

**Vercel 项目**: idea-validation-lite
**生产 URL**: https://idea-validation-lite.vercel.app
**Dashboard**: https://vercel.com/rainbow686s-projects/idea-validation-lite

**必需的环境变量** (Vercel Dashboard 配置):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_RENDER_API_URL=https://idea-validation-lite.onrender.com`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_BASE_URL`
- `TAVILY_API_KEY`
- `NEXT_PUBLIC_APP_URL=https://idea-validation-lite.vercel.app`

**部署命令**:
- 推送到 GitHub 后自动触发 Vercel 部署
- 无需手动执行 vercel CLI 命令

**测试验证**:
- 首页加载：curl https://idea-validation-lite.vercel.app → HTTP 200
- API 测试：curl https://idea-validation-lite.onrender.com/api/health → HTTP 200

---
name: Render 后端服务配置
description: Render API 服务和部署配置信息
type: reference
---

**Render 服务信息**:
- 服务 ID: `srv-d77ajcpaae7s73bq643g`
- 服务名称：`idea-validation-lite`
- 部署 URL: https://idea-validation-lite.onrender.com
- Dashboard: https://dashboard.render.com/web/srv-d77ajcpaae7s73bq643g
- 环境 ID: `evm-d77ajctm5p6s73ae7e1g`
- 区域：oregon
- 计划：free
- 分支：main
- 自动部署：yes

**API 配置**:
- API Key: `rnd_AH0fZpf3rcmQeCRk1MCnhQAZGi8l`
- MCP 配置：`~/.render-mcp/config.json`

**必需的环境变量** (Render Dashboard 配置):
- `NODE_ENV=production`
- `ANTHROPIC_API_KEY=sk-sp-REDACTED`
- `ANTHROPIC_BASE_URL=https://coding.dashscope.aliyuncs.com/apps/anthropic`
- `TAVILY_API_KEY=tvly-REDACTED`
- `NEXT_PUBLIC_SUPABASE_URL=https://jcyexmffldsrbxkxnilg.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeWV4bWZmbGRzcmJ4a3huaWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzMzODEsImV4cCI6MjA5MDUwOTM4MX0.qf11dCNmQfDEwFOuoCzuD7Ub9oiFGTZ7u2FNO42-494`
- `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeWV4bWZmbGRzcmJ4a3huaWxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQyMjU5OCwiZXhwIjoyMDU4OTk4NTk4fQ.vN7qc4KvOPEI7PqDCKF8uGqRrCqKqcJkE8P6lRrU6LpB`
- `NEXT_PUBLIC_APP_URL=https://idea-validation-lite.vercel.app`

**构建配置**:
- 构建命令：`npm install --include=dev && npm run build:api`
- 启动命令：`npm run start:api`
- 配置文件：`render.yaml`

**API 操作**:
- 列出服务：`curl https://api.render.com/v1/services -H "Authorization: Bearer $RENDER_API_KEY"`
- 获取部署日志：`curl https://api.render.com/v1/services/{serviceId}/deploys -H "Authorization: Bearer $RENDER_API_KEY"`
- 配置环境变量：`curl https://api.render.com/v1/services/{serviceId}/env-vars -H "Authorization: Bearer $RENDER_API_KEY" -X PUT -d '{...}'`

**当前状态**: 部署成功 🎉

**修复记录** (2026-04-03):

1. **TypeScript 模块路径解析错误**
   - 问题：TypeScript 编译后模块路径解析错误
   - 原因：`tsconfig.server.json` 使用 `moduleResolution: "node"` 但未正确处理 ESM 路径
   - 解决：改用 `moduleResolution: "NodeNext"` 和 `module: "NodeNext"`，导入路径添加 `.js` 扩展名
   - 提交：120777d - "fix: Update tsconfig for NodeNext module resolution"
   - 参考：`~/.claude/memory/typescript-nodenext-config.md`

2. **LoginModal 被 header 遮挡**
   - 问题：登录模态框的邮箱输入框被顶部 header 遮挡
   - 原因：`flex items-center` 使模态框垂直居中，`mt-32` margin 在 flex 布局中被解释为相对于容器中心的位置，导致输入框区域上移进入 header 区域
   - 修复历程：
     - ac1d0a8: 增加 z-index 到 99999，mt-32 → 无效
     - 3bc4597: items-center → items-start, mt-32 → pt-32 → 部分改善
     - 963fcd5: pt-32 → pt-40 (160px) → 完全修复
   - 最终代码：`src/components/auth/LoginModal.tsx:55`
     ```tsx
     <div className="fixed inset-0 z-[99999] flex items-start justify-center p-4 pt-40">
     ```
   - 预防：当使用 fixed 定位和 z-index 时，优先使用 `items-start` + `padding-top` 而不是`items-center` + `margin-top`
   - 验证：生产 URL https://idea-validation-lite.vercel.app - 登录按钮点击后模态框完全显示

---

## 易错点文档

**完整故障排除指南**: [`troubleshooting-guide.md`](./troubleshooting-guide.md)

该文档包含：
- TypeScript 模块路径解析错误（Render 部署）
- Render 环境变量配置方法
- Supabase Auth URL 配置步骤
- LoginModal 定位问题修复
- 开发规范总结

**记忆位置**: `.claude/worktrees/feature-complete-launch/memory/troubleshooting-guide.md`
