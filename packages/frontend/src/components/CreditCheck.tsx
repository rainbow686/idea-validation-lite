'use client'

import { useCredits } from '@/hooks/useCredits'
import { useCallback } from 'react'
import React from 'react'

interface CreditCheckProps {
  requiredCredits?: number
  onConfirm: () => Promise<boolean>
  children: React.ReactNode
}

/**
 * CreditCheck Component
 *
 * Wraps actions that require credits. Automatically checks balance
 * and prompts for purchase if insufficient.
 *
 * @example
 * ```tsx
 * <CreditCheck requiredCredits={1} onConfirm={handleGenerateReport}>
 *   <button>生成报告</button>
 * </CreditCheck>
 * ```
 */
export function CreditCheck({ requiredCredits = 1, onConfirm, children }: CreditCheckProps) {
  const { credits, consumeCredits, refreshCredits } = useCredits()

  const handleClick = useCallback(async () => {
    // Check if user has enough credits
    if (!credits || credits.total_credits < requiredCredits) {
      // Redirect to purchase page
      const confirmPurchase = confirm(
        `额度不足！您需要 ${requiredCredits} 个额度，但当前只有 ${credits?.total_credits || 0} 个。` +
        '是否前往购买？(¥9.9/次)'
      )
      if (confirmPurchase) {
        window.location.href = '/pricing'
      }
      return
    }

    // Consume credits
    const result = await consumeCredits(requiredCredits)
    if (!result.success) {
      alert(`额度消耗失败：${result.message}`)
      return
    }

    // Execute the action
    const shouldProceed = await onConfirm()
    if (shouldProceed) {
      await refreshCredits()
    }
  }, [credits, consumeCredits, refreshCredits, requiredCredits, onConfirm])

  // Clone children and attach onClick handler
  const childWithClick = useCallback(() => {
    const child = React.Children.only(children as React.ReactElement)
    return React.cloneElement(child, {
      onClick: handleClick,
    } as React.Attributes)
  }, [children, handleClick])

  return (
    <>
      {childWithClick()}
    </>
  )
}

/**
 * CreditBalance Component
 *
 * Displays current credit balance in a compact format
 */
export function CreditBalance() {
  const { credits, isLoading } = useCredits()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
        <span>加载中...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
        {credits?.total_credits || 0} 额度
      </span>
    </div>
  )
}

/**
 * InsufficientCreditsAlert Component
 *
 * Shows an alert when user doesn't have enough credits
 */
export function InsufficientCreditsAlert({ required = 1 }: { required?: number }) {
  const { credits } = useCredits()

  if (!credits || credits.total_credits >= required) {
    return null
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-yellow-900">额度不足</h4>
          <p className="text-sm text-yellow-700 mt-1">
            您需要 {required} 个额度来执行此操作，但当前只有 {credits.total_credits} 个额度。
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            购买额度 →
          </a>
        </div>
      </div>
    </div>
  )
}

export default CreditCheck
