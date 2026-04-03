# 用户认证和仪表盘功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成 Idea Validation Lite 2.0 的用户认证系统和用户仪表盘核心功能

**Architecture:** 基于已有的 Supabase Auth 和数据库表结构，扩展前端组件和 API 路由

**Tech Stack:** 
- 前端：Next.js 14 App Router + TypeScript + Tailwind CSS
- 认证：Supabase Auth (Email Provider, 魔法链接)
- 数据库：Supabase PostgreSQL (已有 users, reports, credit_usage 等表)
- 图表：recharts

---

## 前置检查

**已有资源**：
- `src/contexts/AuthContext.tsx` - AuthContext 已存在
- `src/components/auth/LoginModal.tsx` - 登录模态框已存在
- `src/components/AuthHeader.tsx` - 认证头部组件已存在
- `src/app/dashboard/page.tsx` - 仪表盘页面已存在
- `src/app/auth/callback/page.tsx` - Auth 回调页面已存在
- Supabase 数据库表：users, reports, credit_usage

**需要验证**：
- Supabase Auth 配置（邮箱 + 魔法链接）
- RLS 策略是否正确配置
- 环境变量是否正确

---

## Task 1: 用户登录/注册（Supabase Auth）- P0 阻塞

**Files:**
- 修改：`src/contexts/AuthContext.tsx`
- 修改：`src/components/auth/LoginModal.tsx`
- 修改：`src/app/auth/callback/page.tsx`
- 测试：`src/contexts/__tests__/AuthContext.test.tsx`

**目标**：完成用户邮箱魔法链接登录/注册流程

- [ ] **Step 1: 编写 AuthContext 测试**

```typescript
// src/contexts/__tests__/AuthContext.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { createClient } from '@supabase/supabase-js'

jest.mock('@supabase/supabase-js')

describe('AuthContext', () => {
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
  
  beforeEach(() => {
    mockCreateClient.mockReturnValue({
      auth: {
        signInWithOtp: jest.fn().mockResolvedValue({ error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: {} } }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    } as any)
  })

  it('should provide auth context', async () => {
    const TestComponent = () => {
      const { user, isLoading } = useAuth()
      return <div data-testid="auth-status">{isLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated'}</div>
    }

    render(<AuthProvider><TestComponent /></AuthProvider>)
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated')
    })
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

```bash
npm test -- src/contexts/__tests__/AuthContext.test.tsx
```
Expected: FAIL (AuthContext 需要导出 useAuth)

- [ ] **Step 3: 完善 AuthContext**

```typescript
// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signInWithOtp: (email: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 获取初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // 监听 auth 变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithOtp = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) console.error('Error refreshing user:', error)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signInWithOtp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

- [ ] **Step 4: 完善 LoginModal 组件**

```typescript
// src/components/auth/LoginModal.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signInWithOtp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error } = await signInWithOtp(email)
    
    if (error) {
      setError(error.message)
    } else {
      setIsSent(true)
    }
    setIsLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">登录 / 注册</h2>
        <p className="text-gray-600 mb-6">输入邮箱，我们将发送魔法链接给您</p>

        {isSent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">检查邮箱</h3>
            <p className="text-gray-600 mb-4">我们已发送魔法链接到 <strong>{email}</strong></p>
            <button
              onClick={() => { setIsSent(false); setEmail('') }}
              className="text-emerald-500 hover:text-emerald-600 text-sm font-medium"
            >
              使用其他邮箱
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4"
              required
            />
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '发送中...' : '发送魔法链接'}
            </button>
          </form>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 完善 Auth 回调页面**

```typescript
// src/app/auth/callback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.slice(1))
    
    const errorDescription = params.get('error_description')
    if (errorDescription) {
      setError(errorDescription)
      return
    }

    // 处理 PKCE 码或 access_token
    supabase.auth.getSession().then(({ error }) => {
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">认证失败</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg"
          >
            返回首页
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在登录...</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: 提交**

```bash
git add src/contexts/AuthContext.tsx src/components/auth/LoginModal.tsx src/app/auth/callback/page.tsx
git commit -m "feat: complete Supabase Auth integration with email magic links"
```

---

## Task 2: 用户仪表盘 - P1

**Files:**
- 修改：`src/app/dashboard/page.tsx`
- 创建：`src/components/dashboard/ReportHistory.tsx`
- 创建：`src/components/dashboard/CreditsCard.tsx`
- 测试：`src/components/dashboard/__tests__/CreditsCard.test.tsx`

**目标**：展示用户历史报告和 credits 余额

- [ ] **Step 1: 编写 CreditsCard 测试**

```typescript
// src/components/dashboard/__tests__/CreditsCard.test.tsx
import { render, screen } from '@testing-library/react'
import { CreditsCard } from '../CreditsCard'

describe('CreditsCard', () => {
  it('should display free and paid credits', () => {
    render(<CreditsCard freeCredits={3} paidCredits={5} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument() // total
  })

  it('should show upgrade prompt when no credits', () => {
    render(<CreditsCard freeCredits={0} paidCredits={0} />)
    expect(screen.getByText(/充值/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 实现 CreditsCard 组件**

```typescript
// src/components/dashboard/CreditsCard.tsx
'use client'

interface CreditsCardProps {
  freeCredits: number
  paidCredits: number
}

export function CreditsCard({ freeCredits, paidCredits }: CreditsCardProps) {
  const total = freeCredits + paidCredits

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-500">
      <h3 className="text-sm font-medium text-emerald-800 mb-4">Credits 余额</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-600">{freeCredits}</div>
          <div className="text-xs text-emerald-700 mt-1">免费点数</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-teal-600">{paidCredits}</div>
          <div className="text-xs text-teal-700 mt-1">付费点数</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-900">{total}</div>
          <div className="text-xs text-emerald-700 mt-1">总计</div>
        </div>
      </div>

      {total === 0 ? (
        <button className="w-full px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition">
          充值 Credits
        </button>
      ) : (
        <p className="text-sm text-emerald-700">每个报告消耗 1 个点数</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: 实现 ReportHistory 组件**

```typescript
// src/components/dashboard/ReportHistory.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Report {
  id: string
  idea: string
  industry: string
  overall_score: number
  created_at: string
}

export function ReportHistory() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    supabase
      .from('reports')
      .select('id, idea, industry, overall_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Error fetching reports:', error)
        else setReports(data || [])
        setIsLoading(false)
      })
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无报告</h3>
        <p className="text-gray-600 mb-4">创建你的第一个创业想法验证报告</p>
        <Link href="/" className="inline-block px-6 py-2 bg-emerald-500 text-white rounded-lg">
          开始验证
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Link
          key={report.id}
          href={`/report/${report.id}`}
          className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 truncate">{report.idea}</h4>
              <p className="text-sm text-gray-500 mt-1">{report.industry}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-bold ${
                report.overall_score >= 70 ? 'text-emerald-500' :
                report.overall_score >= 40 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {report.overall_score}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(report.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: 更新仪表盘页面**

```typescript
// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { CreditsCard } from '@/components/dashboard/CreditsCard'
import { ReportHistory } from '@/components/dashboard/ReportHistory'
import { AuthHeader } from '@/components/AuthHeader'

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [credits, setCredits] = useState({ free_credits: 0, paid_credits: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (user) {
      supabase
        .from('users')
        .select('free_credits, paid_credits')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) console.error('Error fetching credits:', error)
          else if (data) setCredits(data)
          setIsLoading(false)
        })
    }
  }, [user, authLoading, router])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">仪表盘</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1">
            <CreditsCard freeCredits={credits.free_credits} paidCredits={credits.paid_credits} />
          </div>
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
              <div className="grid grid-cols-2 gap-4">
                <a href="/" className="p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
                  <div className="text-emerald-600 font-medium">生成新报告</div>
                </a>
                <a href="/ideas" className="p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition">
                  <div className="text-teal-600 font-medium">创意库</div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">历史报告</h2>
          <ReportHistory />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 5: 提交**

```bash
git add src/components/dashboard/CreditsCard.tsx src/components/dashboard/ReportHistory.tsx src/app/dashboard/page.tsx
git commit -m "feat: add user dashboard with credits and report history"
```

---

## Task 3: 报告分享链接 - P1

**Files:**
- 创建：`src/app/share/[slug]/page.tsx`
- 创建：`src/app/api/share/route.ts`
- 修改：`src/app/report/[slug]/page.tsx`
- 测试：`src/app/api/share/__tests__/route.test.ts`

**目标**：生成公开分享报告的短链接

- [ ] **Step 1: 编写分享 API 测试**

```typescript
// src/app/api/share/__tests__/route.test.ts
import { POST } from '../route'

describe('POST /api/share', () => {
  it('should create a shareable link for a report', async () => {
    const req = new Request('http://localhost/api/share', {
      method: 'POST',
      body: JSON.stringify({ reportId: 'test-id' }),
    })
    
    // Mock auth and database
    const response = await POST(req)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.shareUrl).toContain('/share/')
  })
})
```

- [ ] **Step 2: 实现分享 API**

```typescript
// src/app/api/share/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

export async function POST(request: NextRequest) {
  try {
    const { reportId } = await request.json()
    
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Generate short slug
    const slug = nanoid()

    // Create share record
    const { error } = await supabase
      .from('report_shares')
      .insert({
        report_id: reportId,
        slug,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })

    if (error) throw error

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${slug}`

    return NextResponse.json({ shareUrl, slug })
  } catch (error) {
    console.error('Error creating share link:', error)
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }
}
```

- [ ] **Step 3: 实现分享页面**

```typescript
// src/app/share/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ReportView } from '@/components/report/ReportView'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SharePageProps {
  params: { slug: string }
}

export default async function SharePage({ params }: SharePageProps) {
  // Find share by slug
  const { data: share, error: shareError } = await supabase
    .from('report_shares')
    .select('report_id, expires_at')
    .eq('slug', params.slug)
    .single()

  if (shareError || !share) {
    notFound()
  }

  // Check if expired
  if (new Date(share.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">分享链接已过期</h1>
          <p className="text-gray-600">此分享链接已失效，请请求新的分享链接</p>
        </div>
      </div>
    )
  }

  // Get report
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', share.report_id)
    .single()

  if (reportError || !report) {
    notFound()
  }

  return <ReportView report={report} isShare />
}
```

- [ ] **Step 4: 在报告页面添加分享按钮**

```typescript
// 在 src/app/report/[slug]/page.tsx 中添加分享按钮
<button
  onClick={async () => {
    const res = await fetch('/api/share', {
      method: 'POST',
      body: JSON.stringify({ reportId: report.id }),
    })
    const data = await res.json()
    await navigator.clipboard.writeText(data.shareUrl)
    alert('分享链接已复制到剪贴板!')
  }}
  className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
>
  分享报告
</button>
```

- [ ] **Step 5: 提交**

```bash
git add src/app/share/[slug]/page.tsx src/app/api/share/route.ts
git commit -m "feat: add report sharing with short links"
```

---

## Task 4: 创意历史列表 - P1

**Files:**
- 创建：`src/app/ideas/page.tsx`
- 创建：`src/components/ideas/IdeaList.tsx`
- 创建：`src/components/ideas/IdeaCard.tsx`
- 测试：`src/components/ideas/__tests__/IdeaCard.test.tsx`

**目标**：展示用户生成过的所有创意记录

---

## Task 5: 可视化评分卡片 - P1

**Files:**
- 创建：`src/components/report/ScoreCard.tsx`
- 创建：`src/components/report/ScoreRadar.tsx`
- 安装：`npm install recharts`
- 测试：`src/components/report/__tests__/ScoreCard.test.tsx`

**目标**：用雷达图展示分数

---

## Task 6: 竞品对比图表 - P1

**Files:**
- 创建：`src/components/report/CompetitorChart.tsx`
- 修改：`src/app/report/[slug]/page.tsx`
- 测试：`src/components/report/__tests__/CompetitorChart.test.tsx`

**目标**：可视化对比竞品数据

---

## 数据库迁移（如果需要）

**Files:**
- 创建：`supabase/migrations/YYYYMMDD_add_report_shares.sql`

```sql
-- 创建报告分享表
CREATE TABLE IF NOT EXISTS report_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_report_shares_slug ON report_shares(slug);
CREATE INDEX idx_report_shares_expires ON report_shares(expires_at);

-- RLS 策略
ALTER TABLE report_shares ENABLE ROW LEVEL SECURITY;

-- 任何人都可以查看有效的分享
CREATE POLICY "Anyone can view valid shares" ON report_shares
  FOR SELECT USING (
    expires_at > NOW()
  );

-- 只有认证用户可以创建分享
CREATE POLICY "Auth users can create shares" ON report_shares
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
  );
```
