import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Mock Supabase
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        subscription: { unsubscribe: vi.fn() },
      }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}))

// Test component to access auth context
function TestComponent() {
  const { user, session, profile, credits, isLoading } = useAuth()
  return (
    <>
      <div data-testid="user">{user?.email || 'null'}</div>
      <div data-testid="session">{session ? 'logged-in' : 'logged-out'}</div>
      <div data-testid="credits">{credits}</div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
    </>
  )
}

describe('AuthContext', () => {
  it('should provide auth context with default values', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading').textContent).toBe('loaded')
    expect(screen.getByTestId('user').textContent).toBe('null')
    expect(screen.getByTestId('session').textContent).toBe('logged-out')
  })

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
})
