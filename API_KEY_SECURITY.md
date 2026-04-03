# API 密钥安全管理规范

## 核心原则

**永远不要将 API 密钥提交到 git** - 这是最重要的安全规则。

## 密钥存储规则

### 1. 本地开发环境

使用 `.env.keys` 文件存储所有 API 密钥（已在 `.gitignore` 中）：

```bash
# .env.keys - 不要提交到 git!
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-api-key
ANTHROPIC_BASE_URL=your-base-url
TAVILY_API_KEY=your-api-key
NEXT_PUBLIC_RENDER_API_URL=https://your-app.onrender.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 2. 生产环境

**Vercel**: 在 Dashboard → Settings → Environment Variables 中配置
- 必须配置到所有环境（Production、Preview、Development）
- 不要使用 CLI 的 `--yes` 参数（有 bug）
- 推荐：直接在 Dashboard 手动配置

**Render**: 在 Dashboard → Environment 中配置
- 使用 Render API 或 Dashboard 配置
- 不要将密钥写在 `render.yaml` 中

### 3. 文档中的密钥引用

**错误示例** - 永远不要这样做：
```markdown
- `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...`  ❌ 硬编码密钥（旧 JWT 格式）
- `SUPABASE_SERVICE_ROLE_KEY=sb_secret_RZZ4VK...`  ❌ 硬编码密钥（新 Secret key 格式）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_2zsf...` ❌ 硬编码密钥
- `ANTHROPIC_API_KEY=sk-sp-REDACTED...`  ❌ 硬编码密钥
```

**正确示例** - 应该这样做：
```markdown
- `SUPABASE_SERVICE_ROLE_KEY` - 存储在 .env.keys，用于后端服务  ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 存储在 .env.keys，用于前端  ✅
- `ANTHROPIC_API_KEY` - 在 Vercel/Render Dashboard 配置  ✅
```

**密钥格式说明**（2026-04-03 迁移后）：
| 密钥 | 旧格式 (JWT) | 新格式 (推荐) |
|------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIs...` | `sb_secret_...` |

### 4. 代码中的密钥引用

**错误示例** - 永远不要硬编码：
```typescript
const supabase = createClient(
  'https://jcyexmffldsrbxkxnilg.supabase.co',  // ❌ 硬编码 URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'     // ❌ 硬编码密钥
)
```

**正确示例** - 使用环境变量：
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,         // ✅ 环境变量
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!     // ✅ 环境变量
)
```

## 密钥轮换检查清单

如果怀疑密钥泄露，立即执行以下步骤：

### 1. Supabase
- [ ] 登录 Supabase Dashboard
- [ ] Settings → API
- [ ] 点击 "Regenerate" 生成新的 service_role_key
- [ ] 点击 "Regenerate" 生成新的 anon_key
- [ ] 更新 Vercel、Render 和本地 .env.keys

### 2. Anthropic/DashScope
- [ ] 登录 DashScope 控制台
- [ ] API Key 管理
- [ ] 删除旧密钥
- [ ] 创建新密钥
- [ ] 更新 Vercel、Render 和本地 .env.keys

### 3. Tavily
- [ ] 登录 Tavily Dashboard
- [ ] API Key 设置
- [ ] 生成新密钥
- [ ] 更新 Vercel、Render 和本地 .env.keys

### 4. Render
- [ ] 登录 Render Dashboard
- [ ] Account → API Keys
- [ ] 撤销旧密钥
- [ ] 生成新密钥
- [ ] 更新本地 ~/.render-mcp/config.json

## Git 历史清理

如果密钥已被提交到 git 历史：

1. **立即轮换密钥**（见上方检查清单）
2. **从历史中移除**（仅在密钥轮换后）：
   ```bash
   # 使用 BFG Repo-Cleaner 或 git-filter-repo
   # 示例：删除所有包含密钥的文件
   java -jar bfg.jar --delete-files .env.keys  my-repo.git
   ```
3. **强制推送**（需要团队协作）：
   ```bash
   git push --force
   ```

## 检查清单 - 提交前

在 `git commit` 或 `git push` 之前：

- [ ] 检查 `.gitignore` 包含 `.env.keys` 和其他敏感文件
- [ ] 运行 `git status` 确认没有 `.env*` 文件被暂存
- [ ] 运行 `git diff --cached` 查看将要提交的内容
- [ ] 运行秘密扫描工具（GitHub Secret Scanning、git-secrets 等）

## 项目特定的密钥

本项目使用以下密钥（存储位置）：

| 密钥名 | 用途 | 存储位置 | 格式前缀 |
|--------|------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | .env.keys, Vercel, Render | `https://...supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 前端认证 | .env.keys, Vercel, Render | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 后端操作 | .env.keys, Render | `sb_secret_...` |
| `ANTHROPIC_API_KEY` | AI 报告生成 | .env.keys, Vercel, Render | `sk-sp-...` |
| `ANTHROPIC_BASE_URL` | AI 服务提供商 | .env.keys, Vercel, Render | URL |
| `TAVILY_API_KEY` | 网络搜索 | .env.keys, Vercel, Render | `tvly-...` |
| `RENDER_API_KEY` | Render 部署 | ~/.render-mcp/config.json | `rnd_...` |

**密钥格式说明**：
- 2026-04-03 迁移到新的 Supabase 密钥格式（`sb_publishable_` 和 `sb_secret_`）
- 旧的 JWT 格式密钥（`eyJhbGciOiJIUzI1NiIs...`）已停用

---

**最后更新**: 2026-04-03
**安全事件**: 密钥泄露修复 - 提交 9d85015
