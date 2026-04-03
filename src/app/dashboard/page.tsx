'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthHeader from '@/components/AuthHeader'

export default function Dashboard() {
  const { user, isLoading, credits } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto" />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            IdeaValidation<span className="text-emerald-500">Lite</span> Dashboard
          </h1>
          <AuthHeader />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            欢迎回来
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-100">
              <div className="text-sm text-gray-600 mb-1">可用积分</div>
              <div className="text-3xl font-bold text-emerald-600">{credits}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">已生成报告</div>
              <div className="text-3xl font-bold text-blue-600">0</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
              <div className="text-sm text-gray-600 mb-1">会员状态</div>
              <div className="text-3xl font-bold text-purple-600">免费</div>
            </div>
          </div>
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-600 mb-4">你的验证报告将出现在这里</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
            >
              开始验证创意
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
