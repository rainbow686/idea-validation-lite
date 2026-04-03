import { describe, it, expect, vi, beforeEach } from '@testing-library/react'
import { render, screen, waitFor } from '@testing-library/react'
import ReportList from '@/components/dashboard/ReportList'

// Mock Supabase
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        subscription: { unsubscribe: vi.fn() },
      }),
    },
    from: vi.fn().mockImplementation(() => ({
      select: mockSelect.mockReturnThis(),
      eq: mockEq.mockReturnThis(),
      order: mockOrder.mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}))

// Mock useAuth
const mockUseAuth = vi.fn()
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('ReportList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockClear()
    mockEq.mockClear()
    mockOrder.mockClear()
  })

  it('should render loading state initially', async () => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' },
      session: null,
      profile: null,
      credits: 0,
      isLoading: false,
      refreshProfile: vi.fn(),
    })

    // Mock fetchReports to simulate loading
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          then: vi.fn(),
        }),
      }),
    })

    render(<ReportList />)

    // Should show skeleton loading state (animate-pulse class is present)
    const skeletonElements = screen.getAllByText('', { selector: '.animate-pulse' })
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('should render empty state when no reports', async () => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' },
      session: null,
      profile: null,
      credits: 0,
      isLoading: false,
      refreshProfile: vi.fn(),
    })

    // Mock successful fetch with empty results
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockImplementation((callback) => {
          // Simulate async resolution
          setTimeout(() => {
            callback({ data: [], error: null })
          }, 0)
          return { then: vi.fn() }
        }),
      }),
    })

    render(<ReportList />)

    // Wait for loading to complete and empty state to show
    await waitFor(() => {
      expect(screen.getByText('还没有报告')).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})
