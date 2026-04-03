# Supabase Auth 配置检查清单

## ✅ 已完成配置

### 1. 前端配置
- [x] AuthProvider 已集成到 `src/app/layout.tsx`
- [x] LoginModal 组件：`src/components/auth/LoginModal.tsx`
- [x] AuthHeader 组件：`src/components/AuthHeader.tsx`
- [x] AuthContext：`src/contexts/AuthContext.tsx`
- [x] 首页已集成 AuthHeader

### 2. Supabase Auth 设置
- [x] 邮箱认证已启用 (`external.email: true`)
- [x] 用户注册已启用 (`disable_signup: false`)
- [x] 邮箱自动确认已禁用 (`mailer_autoconfirm: false`) - 需要邮件确认

### 3. 环境变量配置
```bash
# .env.keys 已配置
NEXT_PUBLIC_SUPABASE_URL=https://jcyexmffldsrbxkxnilg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 4. 数据库表
- [x] `users` 表已创建 (id, email, free_credits, paid_credits)
- [x] RLS 策略已配置

## ⚠️ 待验证配置

### 1. 邮件模板
需要在 Supabase Dashboard 配置：
1. 进入 Authentication → Email Templates
2. 配置 Magic Link 模板
3. 确认邮件主题和正文

**推荐配置**:
```
Subject: 登录 IdeaValidation Lite - 您的魔法链接

Body:
您好！

点击以下链接登录 IdeaValidation Lite：
{{ .ConfirmationURL }}

这个链接将在 15 分钟后过期。

如果您没有请求登录，可以忽略此邮件。

祝好，
IdeaValidation Lite 团队
```

### 2. 生产环境变量
需要在 Vercel 确认：
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY

## 测试步骤

### 1. 本地测试登录流程

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问 http://localhost:3000

# 3. 点击 "登录 / 注册" 按钮

# 4. 输入测试邮箱

# 5. 检查邮箱收到魔法链接

# 6. 点击链接，验证跳转到 /dashboard
```

### 2. 生产环境测试

1. 访问 https://idea-validation-lite.vercel.app
2. 点击 "登录 / 注册" 按钮
3. 输入邮箱
4. 检查邮箱
5. 点击魔法链接
6. 验证跳转到 dashboard

## 常见问题排查

### 问题 1：邮件未收到
**检查**:
1. Supabase Dashboard → Authentication → Email Templates
2. 确认 SMTP 配置正确
3. 检查垃圾邮件文件夹

### 问题 2：登录后 401 错误
**检查**:
1. 环境变量是否正确配置
2. AuthProvider 是否包裹应用
3. 浏览器控制台是否有 CORS 错误

### 问题 3：users 表查询失败
**检查**:
1. RLS 策略是否允许用户读取自己的数据
2. 用户是否在登录后自动创建 users 记录

## 下一步

1. ✅ Auth 配置已完成
2. ⏳ 测试登录流程（需要真实邮箱）
3. ⏳ 开发用户仪表盘
