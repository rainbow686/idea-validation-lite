import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CreditBalance from '@/components/dashboard/CreditBalance'

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    profile: null,
  }),
}))

describe('CreditBalance', () => {
  it('should render zero credits when no profile', () => {
    render(<CreditBalance />)

    expect(screen.getByText('积分余额')).toBeInTheDocument()
    expect(screen.getByText('可用积分总额')).toBeInTheDocument()
  })

  it('should display correct labels', () => {
    render(<CreditBalance />)

    expect(screen.getByText('免费积分')).toBeInTheDocument()
    expect(screen.getByText('付费积分')).toBeInTheDocument()
  })
})
