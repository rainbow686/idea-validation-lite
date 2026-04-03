---
name: 易错点与修复记录
description: Idea Validation Lite 开发中遇到的常见错误和解决方案
type: reference
---

# 易错点与修复记录 (Troubleshooting Guide)

本文档记录开发过程中遇到的关键错误、根本原因和解决方案，避免重复踩坑。

---

## 2026-04-03: Render API 部署 - TypeScript 模块路径解析错误

**错误现象**:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/opt/render/project/src/dist/src/lib/report-generator' 
imported from /opt/render/project/src/dist/api-server.js
```

**根本原因**:
1. `tsconfig.server.json` 使用 `moduleResolution: "node"` 但 Node.js 22 使用 ESM 模块解析
2. TypeScript 编译后导入路径缺少 `.js` 扩展名
3. CommonJS 输出格式与 ESM 运行时不兼容

**错误配置**:
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node"
  }
}
```

**正确配置**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

**导入路径修正**:
```typescript
// ❌ 错误 - 缺少 .js 扩展名
import { generateValidationReport } from './src/lib/report-generator'

// ✅ 正确 - 添加 .js 扩展名
import { generateValidationReport } from './src/lib/report-generator.js'
```

**验证步骤**:
1. 运行 `npm run build:api` 确认编译成功
2. 检查 `dist/api-server.js` 中的导入路径包含 `.js`
3. 本地测试 `node dist/api-server.js` (需要环境变量)
4. 推送到 GitHub 触发 Render 自动部署
5. 访问 `https://idea-validation-lite.onrender.com/api/health` 验证

**记忆位置**: `~/.claude/worktrees/feature-complete-launch/memory/troubleshooting-guide.md`

---

## 2026-04-03: Render 环境变量配置

**错误现象**:
- Render 部署持续 `build_failed` 状态
- 环境变量 API 端点行为不一致

**关键发现**:
1. Render API 的环境变量端点有多种：
   - `PATCH /services/{id}/env-vars` - 批量更新（可能不工作）
   - `PUT /services/{id}/env-vars/{key}` - 单个更新（可靠）
2. 服务配置更新需要通过 `PATCH /services/{id}` 并嵌套 `serviceDetails.envSpecificDetails`

**正确配置方式**:
```bash
# 更新构建命令
curl -X PATCH "https://api.render.com/v1/services/{serviceId}" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceDetails": {
      "envSpecificDetails": {
        "buildCommand": "npm install --include=dev && npm run build:api",
        "startCommand": "npm run start:api"
      }
    }
  }'

# 设置环境变量 (逐个)
curl -X PUT "https://api.render.com/v1/services/{serviceId}/env-vars/KEY_NAME" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value": "your-value"}'
```

**Render 服务信息**:
- Service ID: `srv-d77ajcpaae7s73bq643g`
- Dashboard: https://dashboard.render.com/web/srv-d77ajcpaae7s73bq643g
- API Key: `rnd_AH0fZpf3rcmQeCRk1MCnhQAZGi8l`

**记忆位置**: `memory/deployment_config.md`

---

## 2026-04-03: Supabase Auth URL 配置

**错误现象**:
- 魔法链接登录后重定向到 `http://localhost:3000/?code=xxx`
- 生产环境登录失败

**配置位置**:
Supabase Dashboard → Authentication → Providers → Email → URL configuration

**必需配置**:
- Site URL: `https://idea-validation-lite.vercel.app`
- Redirect URLs:
  - `https://idea-validation-lite.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

**前端回调处理**:
- 登录时动态生成 `redirectTo`:
  ```typescript
  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : '/auth/callback'
  ```
- 创建 `/auth/callback` 页面处理 code exchange

**记忆位置**: `memory/deployment_config.md`

---

## 2026-04-03: LoginModal 定位问题（被 header 遮挡）

**错误现象**:
- 登录模态框的邮箱输入框被顶部 header 遮挡
- 增加 z-index 无效
- 使用 margin-top 调整位置仍然不对

**修复历程**:

**尝试 1** (ac1d0a8): 增加 z-index
```tsx
// ❌ 无效 - z-index 不是问题
<div className="fixed inset-0 z-[99999] flex items-center justify-center mt-32">
```

**尝试 2** (3bc4597): 改为 items-start + padding-top
```tsx
// ⚠️ 部分改善 - 但仍然不够
<div className="fixed inset-0 z-[99999] flex items-start justify-center p-4 pt-32">
```

**尝试 3** (963fcd5): 增加 padding-top 到 160px
```tsx
// ✅ 完全修复
<div className="fixed inset-0 z-[99999] flex items-start justify-center p-4 pt-40">
```

**根本原因**:
1. `flex items-center` 使模态框在视口垂直居中，导致 modal 顶部进入 header 区域
2. `mt-32` 在 flex 布局中被解释为相对于容器中心的位置，不是从顶部开始计算
3. 正确做法：使用 `items-start` 让 modal 从顶部开始，然后用 `padding-top` 向下推

**关键点**:
- 使用 `z-[99999]` 确保最高层级
- 使用 `flex items-start` 而不是`items-center`
- 使用 `pt-40` (160px) 从顶部向下推，而不是`mt-32`
- 添加 `p-4` 防止移动端贴边

**验证**:
- 生产 URL: https://idea-validation-lite.vercel.app
- 点击首页"验证创意"按钮 → 模态框完全显示，邮箱输入框不被遮挡

**记忆位置**: 
- 代码：`src/components/auth/LoginModal.tsx:55`
- 部署配置：`deployment_config.md`

---

## 开发规范总结

### 1. TypeScript 编译配置
- 始终使用 `module: "NodeNext"` 和 `moduleResolution: "NodeNext"`
- 导入路径必须包含 `.js` 扩展名（即使源文件是 `.ts`）
- 编译后检查输出文件确认路径正确

### 2. 部署配置
- Render 环境变量通过 API 或 Dashboard 配置
- 构建命令和启动命令必须匹配 package.json scripts
- 部署失败先查看日志，不要盲目重试

### 3. 认证配置
- Supabase Auth URL 必须在 Dashboard 手动配置
- 前端动态生成 redirect URL
- 创建专门的 callback 页面处理认证

### 4. 代码提交
- 每次修复后本地验证再推送
- Commit 信息描述问题而非解决方案
- 推送后检查 CI/CD 状态

---

## 文档维护

**更新频率**: 每次遇到新错误时更新
**负责人**: 开发团队
**存储位置**: `.claude/worktrees/feature-complete-launch/memory/troubleshooting-guide.md`
**记忆索引**: `MEMORY.md` 中记录此文档路径
