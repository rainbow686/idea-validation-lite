'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { UserCredits, CreditUsage, Payment } from '@/types/credit'

interface UseCreditsReturn {
  credits: UserCredits | null
  isLoading: boolean
  error: string | null
  refreshCredits: () => Promise<void>
  consumeCredits: (amount: number, reportId?: string) => Promise<{ success: boolean; remaining: number; message: string }>
  payments: Payment[]
  usageHistory: CreditUsage[]
}

/**
 * Hook for managing user credits
 *
 * Features:
 * - Fetch current credit balance
 * - Consume credits for report generation
 * - View payment history
 * - View credit usage history
 *
 * @example
 * ```tsx
 * const { credits, consumeCredits, isLoading } = useCredits()
 *
 * if (!credits || credits.total_credits < 1) {
 *   return <PurchaseCreditsPrompt />
 * }
 *
 * const handleGenerate = async () => {
 *   const result = await consumeCredits(1)
 *   if (result.success) {
 *     // Generate report
 *   }
 * }
 * ```
 */
export function useCredits(): UseCreditsReturn {
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [usageHistory, setUsageHistory] = useState<CreditUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch current user's credits
  const refreshCredits = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get user credits using RPC function
      const { data, error: creditsError } = await supabase
        .rpc('get_user_credits')
        .single()

      if (creditsError) {
        // If RPC fails, try direct query
        const { data: userData } = await supabase
          .from('users')
          .select('free_credits, paid_credits')
          .single()

        if (userData) {
          setCredits({
            free_credits: userData.free_credits || 0,
            paid_credits: userData.paid_credits || 0,
            total_credits: (userData.free_credits || 0) + (userData.paid_credits || 0),
          })
        } else {
          // User doesn't exist yet, initialize with default free credits
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // Create user record with default credits
            await supabase.from('users').insert({
              id: user.id,
              email: user.email || '',
              free_credits: 3,
              paid_credits: 0,
            })

            setCredits({
              free_credits: 3,
              paid_credits: 0,
              total_credits: 3,
            })
          }
        }
      } else if (data) {
        const creditData = data as { free_credits: number; paid_credits: number; total_credits: number }
        setCredits({
          free_credits: creditData.free_credits || 0,
          paid_credits: creditData.paid_credits || 0,
          total_credits: creditData.total_credits || 0,
        })
      }

      // Fetch payment history
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (paymentsData) {
        setPayments(paymentsData)
      }

      // Fetch credit usage history
      const { data: usageData } = await supabase
        .from('credit_usage')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (usageData) {
        setUsageHistory(usageData)
      }

    } catch (err) {
      console.error('Failed to fetch credits:', err)
      setError(err instanceof Error ? err.message : 'Failed to load credits')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Consume credits for an action
  const consumeCredits = useCallback(async (
    amount: number,
    reportId?: string
  ): Promise<{ success: boolean; remaining: number; message: string }> => {
    try {
      const { data, error: consumeError } = await supabase
        .rpc('consume_credits', {
          credits_to_consume: amount,
          report_id: reportId,
        })
        .single()

      const typedData = data as { success: boolean; remaining_credits: number; message: string } | null

      if (consumeError || !typedData) {
        return {
          success: false,
          remaining: credits?.total_credits || 0,
          message: consumeError?.message || 'Failed to consume credits',
        }
      }

      // Update local state
      setCredits(prev => prev ? {
        ...prev,
        total_credits: typedData.remaining_credits,
        // The RPC handles deducting from free credits first
        free_credits: Math.max(0, prev.free_credits - amount),
        paid_credits: typedData.remaining_credits - Math.max(0, prev.free_credits - amount),
      } : null)

      return {
        success: typedData.success,
        remaining: typedData.remaining_credits,
        message: typedData.message,
      }
    } catch (err) {
      console.error('Credit consumption error:', err)
      return {
        success: false,
        remaining: credits?.total_credits || 0,
        message: err instanceof Error ? err.message : 'Failed to consume credits',
      }
    }
  }, [supabase, credits])

  // Initial fetch
  useEffect(() => {
    refreshCredits()
  }, [refreshCredits])

  return {
    credits,
    isLoading,
    error,
    refreshCredits,
    consumeCredits,
    payments,
    usageHistory,
  }
}

/**
 * Check if user has enough credits
 */
export function hasEnoughCredits(credits: UserCredits | null | undefined, required: number): boolean {
  if (!credits) return false
  return credits.total_credits >= required
}

/**
 * Format credits display
 */
export function formatCredits(credits: number): string {
  return credits.toString()
}

/**
 * Get credit source to use (free credits first)
 */
export function getCreditSource(credits: UserCredits | null | undefined, required: number): {
  fromFree: number
  fromPaid: number
} {
  if (!credits) {
    return { fromFree: 0, fromPaid: 0 }
  }

  const fromFree = Math.min(credits.free_credits, required)
  const remaining = required - fromFree
  const fromPaid = Math.min(credits.paid_credits, remaining)

  return { fromFree, fromPaid }
}
