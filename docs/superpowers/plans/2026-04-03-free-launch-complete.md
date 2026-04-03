# Idea Validation Lite 2.0 - 免费版上线完整功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成除支付外所有核心功能的开发、测试和部署，确保用户可以注册、生成报告、查看历史、分享报告

**Architecture:** 
- 使用 Supabase Auth 处理用户认证（邮箱 + 魔法链接）
- 用户数据自动同步到 public.users 表（触发器）
- 报告关联到 auth.uid()
- 仪表盘展示用户历史报告和 credits

**Tech Stack:** 
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase Auth (Email Provider)
- Supabase PostgreSQL (已有 users, reports, credit_usage 等表)
- @react-pdf/renderer (PDF 生成)

---

## 开发阶段总览

### Phase 1: 用户认证系统 (P0 - 阻塞上线)
- Task 1: 数据库迁移 - Auth 触发器和 RLS 策略
- Task 2: 登录/注册组件开发
- Task 3: 认证 Hook 和上下文
- Task 4: 集成到现有流程

### Phase 2: 用户仪表盘 (P1)
- Task 5: 仪表盘页面框架
- Task 6: 历史报告列表
- Task 7: Credits 管理组件
- Task 8: 分享统计组件

### Phase 3: 报告功能增强 (P1)
- Task 9: 报告分享链接生成
- Task 10: 创意历史列表
- Task 11: 可视化评分卡片
- Task 12: 竞品对比图表

### Phase 4: 增长功能 (P2/P3)
- Task 13: 邮件订阅组件
- Task 14: 等待列表
- Task 15: TAM/SAM/SOM 计算器
- Task 16: 推荐排名榜单

### Phase 5: 技术债务 (TD)
- Task 17: 错误边界处理
- Task 18: 加载骨架屏
- Task 19: 单元测试框架

### Phase 6: 测试和部署
- Task 20: 端到端测试
- Task 21: Review Army 审查
- Task 22: 部署配置
- Task 23: 生产健康检查

---

## Phase 1: 用户认证系统 (P0 - 阻塞上线)

### Task 1: 数据库迁移 - Auth 触发器和 RLS 策略

**Files:**
- Create: `supabase/migrations/20260403_add_auth_trigger.sql`
- Test: 直接执行 SQL 验证

- [ ] **Step 1: 创建迁移文件**

```sql
-- 创建函数：当新用户注册时自动创建 public.users 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, free_credits, paid_credits, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    3,  -- 免费 3 个 credit
    0,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 确保 RLS 启用
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 策略：用户只能查看自己的数据
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- 策略：用户只能更新自己的数据
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- 策略：允许触发器插入
DROP POLICY IF EXISTS "Service can insert users" ON public.users;
CREATE POLICY "Service can insert users" ON public.users
  FOR INSERT
  WITH CHECK (true);
```

- [ ] **Step 2: 应用迁移**

```bash
# 使用 Supabase CLI 或 Dashboard 执行
npx supabase db push
```

Expected: 触发器创建成功，RLS 策略配置完成

- [ ] **Step 3: 验证触发器**

```sql
-- 检查触发器是否存在
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

Expected: 返回一行数据

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260403_add_auth_trigger.sql
git commit -m "feat(auth): add Supabase Auth trigger and RLS policies"
```

---

### Task 2: 登录/注册组件开发

**Files:**
- Create: `src/components/auth/LoginModal.tsx`
- Create: `src/components/auth/AuthButton.tsx`
- Create: `src/components/auth/index.ts`

- [ ] **Step 1: 创建 LoginModal.tsx**

```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { X } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
    })
    
    if (error) {
      alert(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          登录 / 注册
        </h2>
        <p className="text-gray-600 mb-6">
          输入邮箱，我们将发送魔法链接给你
        </p>

        {sent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700">
            已发送！请检查邮箱 {email}
            <br />
            点击邮件中的链接即可登录
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50"
            >
              {loading ? '发送中...' : '发送魔法链接'}
            </button>
          </form>
        )}

        <p className="text-xs text-gray-500 mt-4 text-center">
          登录即表示同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 AuthButton.tsx**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { LoginModal } from './LoginModal'

export function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [showLogin, setShowLogin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          退出
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        className="px-6 py-2 bg-white border-2 border-emerald-200 text-emerald-600 rounded-xl font-semibold hover:border-emerald-300 hover:bg-emerald-50"
      >
        登录
      </button>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  )
}
```

- [ ] **Step 3: 创建 index.ts**

```tsx
export { LoginModal } from './LoginModal'
export { AuthButton } from './AuthButton'
```

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/
git commit -m "feat(auth): add login modal and auth button components"
```

---

### Task 3: 认证 Hook 和上下文

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: 创建 AuthContext.tsx**

```tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  credits: {
    free: number
    paid: number
  } | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  credits: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState<{ free: number; paid: number } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (user) {
      supabase
        .from('users')
        .select('free_credits, paid_credits')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setCredits({ free: data.free_credits, paid: data.paid_credits })
          }
        })
    }
  }, [user, supabase])

  return (
    <AuthContext.Provider value={{ user, session, loading, credits }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

- [ ] **Step 2: 修改 layout.tsx 添加 AuthProvider**

```tsx
// 在 layout.tsx 中导入并包裹 AuthProvider
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/contexts/AuthContext.tsx src/hooks/useAuth.ts src/app/layout.tsx
git commit -m "feat(auth): add AuthContext and useAuth hook"
```

---

### Task 4: 集成到现有流程

**Files:**
- Modify: `src/app/page.tsx` (Landing Page)
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/api/generate-report/route.ts`

- [ ] **Step 1: 在 Landing Page 添加登录按钮**

```tsx
// src/app/page.tsx - 在 header 中添加
import { AuthButton } from '@/components/auth'

// 在 Hero 区域添加登录按钮
<AuthButton />
```

- [ ] **Step 2: 在 Dashboard 添加认证检查**

```tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>加载中...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <h1>欢迎，{user.email}</h1>
      {/* 仪表盘内容 */}
    </div>
  )
}
```

- [ ] **Step 3: 在 API 中添加认证检查**

```ts
// src/app/api/generate-report/route.ts
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 从 Authorization header 获取用户
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  if (!user) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }

  // 检查用户 credits
  const { data: userData } = await supabase
    .from('users')
    .select('free_credits, paid_credits')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.free_credits <= 0 && userData.paid_credits <= 0)) {
    return Response.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  // ... 继续生成报告
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/dashboard/page.tsx src/app/api/generate-report/route.ts
git commit -m "feat(auth): integrate authentication into existing flows"
```

---

## Phase 2: 用户仪表盘 (P1)

### Task 5: 仪表盘页面框架

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Create: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: 创建 Dashboard 布局**

```tsx
// src/app/dashboard/layout.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Home, FileText, CreditCard, Share2, Settings } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center px-4 text-emerald-600">
                <Home className="w-5 h-5 mr-2" />
                返回主页
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 侧边栏 */}
          <div className="space-y-2">
            <NavItem icon={FileText} label="我的报告" href="/dashboard" active />
            <NavItem icon={CreditCard} label="Credits" href="/dashboard/credits" />
            <NavItem icon={Share2} label="分享统计" href="/dashboard/shares" />
            <NavItem icon={Settings} label="设置" href="/dashboard/settings" />
          </div>

          {/* 主内容区 */}
          <div className="md:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, href, active }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
        active
          ? 'bg-emerald-50 text-emerald-600'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/
git commit -m "feat(dashboard): add dashboard layout with navigation"
```

---

### Task 6: 历史报告列表

**Files:**
- Create: `src/components/dashboard/ReportList.tsx`
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: 创建 ReportList 组件**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { FileText, ExternalLink, Download } from 'lucide-react'
import Link from 'next/link'

interface Report {
  id: string
  idea_title: string
  overall_score: number
  status: string
  created_at: string
  slug: string
}

export function ReportList() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setReports(data || [])
          setLoading(false)
        })
    }
  }, [user, supabase])

  if (loading) {
    return <div className="space-y-4">加载中...</div>
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无报告</h3>
        <p className="text-gray-600 mb-6">开始生成你的第一个创业创意验证报告吧！</p>
        <Link href="/" className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold">
          验证创意
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">我的报告</h2>
      {reports.map((report) => (
        <div
          key={report.id}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {report.idea_title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>分数：{report.overall_score || 'N/A'}</span>
                <span>状态：{report.status}</span>
                <span>创建：{new Date(report.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/report/${report.slug}`}
                className="p-2 text-gray-600 hover:text-emerald-600"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
              <Link
                href={`/api/generate-pdf?id=${report.id}`}
                className="p-2 text-gray-600 hover:text-emerald-600"
              >
                <Download className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: 在 Dashboard 页面使用**

```tsx
// src/app/dashboard/page.tsx
import { ReportList } from '@/components/dashboard/ReportList'

export default function DashboardPage() {
  return <ReportList />
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/ReportList.tsx src/app/dashboard/page.tsx
git commit -m "feat(dashboard): add report list component"
```

---

### Task 7: Credits 管理组件

**Files:**
- Create: `src/components/dashboard/CreditBalance.tsx`
- Create: `src/app/dashboard/credits/page.tsx`

- [ ] **Step 1: 创建 CreditBalance 组件**

```tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { CreditCard, Plus } from 'lucide-react'

export function CreditBalance() {
  const { credits, user } = useAuth()

  if (!user) return null

  const total = (credits?.free || 0) + (credits?.paid || 0)

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-100 text-sm mb-1">可用 Credits</p>
          <p className="text-4xl font-bold">{total}</p>
          <p className="text-emerald-100 text-sm mt-2">
            免费：{credits?.free || 0} | 付费：{credits?.paid || 0}
          </p>
        </div>
        <CreditCard className="w-24 h-24 opacity-20" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 Credits 页面**

```tsx
// src/app/dashboard/credits/page.tsx
'use client'

import { CreditBalance } from '@/components/dashboard/CreditBalance'
import { useAuth } from '@/contexts/AuthContext'

export default function CreditsPage() {
  const { credits } = useAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Credits 管理</h1>
      <CreditBalance />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">如何获取 Credits</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">新用户奖励</h3>
              <p className="text-gray-600">注册即送 3 个免费 credits</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">邀请好友</h3>
              <p className="text-gray-600">每邀请一位好友注册，获得 1 个 credit</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">购买 Credits</h3>
              <p className="text-gray-600">¥9.9/次，¥99/月（12 次）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/CreditBalance.tsx src/app/dashboard/credits/page.tsx
git commit -m "feat(dashboard): add credits management page"
```

---

### Task 8: 分享统计组件

**Files:**
- Create: `src/components/dashboard/ShareStats.tsx`
- Create: `src/app/dashboard/shares/page.tsx`

- [ ] **Step 1: 创建 ShareStats 组件**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Share2, Users, Award } from 'lucide-react'

export function ShareStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalShares: 0,
    inviteCount: 0,
    creditsEarned: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      Promise.all([
        supabase.from('share_analytics').select('id').eq('user_id', user.id),
        supabase.from('invite_claims').select('id').eq('inviter_id', user.id),
      ]).then(([shares, invites]) => {
        setStats({
          totalShares: shares.data?.length || 0,
          inviteCount: invites.data?.length || 0,
          creditsEarned: (invites.data?.length || 0) * 1,
        })
        setLoading(false)
      })
    }
  }, [user, supabase])

  if (loading) return <div>加载中...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={Share2}
        label="分享次数"
        value={stats.totalShares}
        color="from-blue-500 to-cyan-500"
      />
      <StatCard
        icon={Users}
        label="邀请人数"
        value={stats.inviteCount}
        color="from-emerald-500 to-teal-500"
      />
      <StatCard
        icon={Award}
        label="获得 Credits"
        value={stats.creditsEarned}
        color="from-amber-500 to-orange-500"
      />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className={`bg-gradient-to-r ${color} rounded-2xl p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon className="w-12 h-12 opacity-30" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 Shares 页面**

```tsx
// src/app/dashboard/shares/page.tsx
'use client'

import { ShareStats } from '@/components/dashboard/ShareStats'

export default function SharesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">分享统计</h1>
      <ShareStats />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/ShareStats.tsx src/app/dashboard/shares/page.tsx
git commit -m "feat(dashboard): add share statistics page"
```

---

## Phase 3: 报告功能增强 (P1)

### Task 9: 报告分享链接生成

**Files:**
- Create: `src/app/api/share/create/route.ts`
- Modify: `src/components/ShareModal.tsx`

（详细步骤省略，按照相同模式继续...）

---

## Phase 4: 增长功能 (P2/P3)

### Task 13: 邮件订阅组件

### Task 14: 等待列表

### Task 15: TAM/SAM/SOM 计算器

### Task 16: 推荐排名榜单

---

## Phase 5: 技术债务 (TD)

### Task 17: 错误边界处理

### Task 18: 加载骨架屏

### Task 19: 单元测试框架

---

## Phase 6: 测试和部署

### Task 20: 端到端测试

### Task 21: Review Army 审查

### Task 22: 部署配置

### Task 23: 生产健康检查

---

## 完成标准

- [ ] 所有 Phase 1-4 功能完成
- [ ] 所有测试通过
- [ ] Review Army 审查完成，P0 问题已修复
- [ ] 部署到生产环境
- [ ] 生产健康检查通过

---

**创建日期**: 2026-04-03  
**最后更新**: 2026-04-03  
**预计总工时**: ~20 小时（子代理驱动可压缩至 2-3 小时）
