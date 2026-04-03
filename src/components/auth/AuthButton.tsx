'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import LoginModal from './LoginModal'

export default function AuthButton() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    setIsLoading(false)
  }

  // Note: User session is managed by AuthContext at the app level
  // This component just provides the UI for login/logout actions
  return (
    <>
      <button
        onClick={handleSignOut}
        disabled={isLoading}
        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 transition-colors"
      >
        {isLoading ? '退出中...' : '退出登录'}
      </button>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}

// Export a trigger function for opening login modal from other components
export function useAuthButton() {
  const [isOpen, setIsOpen] = useState(false)

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }
}
