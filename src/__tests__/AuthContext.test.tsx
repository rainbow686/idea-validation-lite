import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Mock Supabase client
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockUnsubscribe = vi.fn()
const mockSingle = vi.fn()

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: mockSingle,
  }),
}))

// Test component to access auth context
function TestComponent() {
  const { user, session, isLoading, credits } = useAuth()
  return (
    <div>
      <div data-testid="user">{user?.email || 'null'}</div>
      <div data-testid="session">{session ? 'logged-in' : 'logged-out'}</div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="credits">{credits}</div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide auth context with default values', async () => {
    // Mock initial session (null)
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })
    mockSingle.mockResolvedValue({ data: null, error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Should show loaded state
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded')
    })
    expect(screen.getByTestId('user').textContent).toBe('null')
    expect(screen.getByTestId('session').textContent).toBe('logged-out')
    expect(screen.getByTestId('credits').textContent).toBe('0')
  })

  it('should provide auth context with user session', async () => {
    // Mock authenticated session
    const mockSession = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    }
    mockGetSession.mockResolvedValue({ data: { session: mockSession } })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })
    mockSingle.mockResolvedValue({
      data: {
        id: 'test-user-id',
        email: 'test@example.com',
        free_credits: 3,
        paid_credits: 0,
      },
      error: null,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Should show logged in state
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded')
    })
    expect(screen.getByTestId('user').textContent).toBe('test@example.com')
    expect(screen.getByTestId('session').textContent).toBe('logged-in')
    expect(screen.getByTestId('credits').textContent).toBe('3')
  })

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Create a component that throws error when used outside AuthProvider
    function OutsideProvider() {
      try {
        useAuth()
        return <div>Should not render</div>
      } catch {
        return <div>Caught error</div>
      }
    }

    render(<OutsideProvider />)
    expect(screen.getByText('Caught error')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
