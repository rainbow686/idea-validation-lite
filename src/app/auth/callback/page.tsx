'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      setError('No verification code found')
      return
    }

    const exchangeCode = async () => {
      try {
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(sessionError.message)
          return
        }

        // Successfully logged in, redirect to dashboard
        router.push('/dashboard')
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Failed to complete login')
      }
    }

    exchangeCode()
  }, [searchParams, router, supabase.auth])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">登录失败</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              返回首页
            </button>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto" />
            <p className="mt-4 text-gray-600">登录中...</p>
          </>
        )}
      </div>
    </div>
  )
}
