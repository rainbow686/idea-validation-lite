'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface NewsletterSignupProps {
  variant?: 'inline' | 'modal' | 'footer'
  onSubscribe?: () => void
}

export default function NewsletterSignup({
  variant = 'inline',
  onSubscribe,
}: NewsletterSignupProps) {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // If user is logged in, use their email from profile
      const emailToUse = user?.email || email

      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          source: window.location.pathname,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubscribed(true)
        setEmail('')
        onSubscribe?.()
      } else {
        setError(data.error || '订阅失败，请稍后重试')
      }
    } catch {
      setError('订阅失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // Already subscribed state
  if (subscribed) {
    return (
      <div className={`text-center p-6 bg-green-50 rounded-xl border border-green-200 ${
        variant === 'footer' ? 'py-4' : ''
      }`}>
        <div className="text-3xl mb-2">✅</div>
        <h3 className="font-semibold text-green-800">订阅成功！</h3>
        <p className="text-sm text-green-600 mt-1">
          我们会在产品更新时第一时间通知你
        </p>
      </div>
    )
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📬</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            获取产品更新
          </h3>
          <p className="text-gray-600 text-sm">
            订阅我们的通讯，获取最新功能、创业洞察和独家优惠
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="输入你的邮箱"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '提交中...' : '免费订阅'}
          </button>
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
          <p className="text-xs text-gray-500 text-center">
            我们不会泄露你的邮箱，随时可以取消订阅
          </p>
        </form>
      </div>
    )
  }

  // Footer variant
  if (variant === 'footer') {
    return (
      <div className="border-t border-gray-200 pt-8 mt-12">
        <div className="max-w-md mx-auto text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📬 获取产品更新
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            订阅我们的通讯，获取最新功能和创业洞察
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="你的邮箱"
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '...' : '订阅'}
            </button>
          </form>
          {error && (
            <p className="text-xs text-red-600 mt-2">{error}</p>
          )}
        </div>
      </div>
    )
  }

  // Modal variant
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full">
      <button
        onClick={onSubscribe}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          别错过任何更新
        </h2>
        <p className="text-gray-600">
          订阅我们的通讯，获取：
        </p>
        <ul className="text-left text-sm text-gray-600 mt-4 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            新产品功能通知
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            创业洞察和最佳实践
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            独家优惠和折扣
          </li>
        </ul>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="输入你的邮箱"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '提交中...' : '免费订阅'}
        </button>
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}
        <p className="text-xs text-gray-500 text-center">
          我们不会泄露你的邮箱，随时可以取消订阅
        </p>
      </form>
    </div>
  )
}
