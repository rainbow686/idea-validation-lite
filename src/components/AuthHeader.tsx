'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './auth/LoginModal'

export default function AuthHeader() {
  const { user, credits } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  return (
    <>
      {user ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <span className="text-sm font-medium text-gray-700">{user.email}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              {credits} 积分
            </span>
          </div>
          <a
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
          >
            仪表盘
          </a>
        </div>
      ) : (
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
        >
          登录 / 注册
        </button>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}
