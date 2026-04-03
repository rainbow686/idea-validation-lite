import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ReportList from '@/components/dashboard/ReportList'

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
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}))

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    session: null,
    profile: null,
    credits: 0,
    isLoading: false,
    refreshProfile: vi.fn(),
  }),
}))

describe('ReportList', () => {
  it('should render loading state initially', () => {
    render(<ReportList />)
    // The component should show skeleton loading state or header
    expect(screen.getByText(/我的报告/i)).toBeInTheDocument()
  })

  it('should render empty state when no reports', async () => {
    render(<ReportList />)

    await waitFor(() => {
      expect(screen.getByText('还没有报告')).toBeInTheDocument()
    })
  })
})
