'use client'

import { useState } from 'react'
import { useCredits } from '@/hooks/useCredits'
import { CREDIT_PURCHASE_OPTIONS } from '@/types/credit'

interface CreditPurchaseProps {
  onPurchaseComplete?: () => void
}

/**
 * CreditPurchase Component
 *
 * Displays:
 * - Current credit balance
 * - Purchase options (¥9.9/次，¥49/5 次，¥99/12 次)
 * - Payment history
 *
 * @example
 * ```tsx
 * <CreditPurchase onPurchaseComplete={() => refreshCredits()} />
 * ```
 */
export function CreditPurchase({ onPurchaseComplete }: CreditPurchaseProps) {
  const { credits, isLoading, payments } = useCredits()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [customCredits, setCustomCredits] = useState<number | null>(null)

  // Check for purchase completion after redirect
  if (typeof window !== 'undefined' && onPurchaseComplete) {
    const sessionComplete = sessionStorage.getItem('onPurchaseComplete')
    if (sessionComplete) {
      sessionStorage.removeItem('onPurchaseComplete')
      onPurchaseComplete()
    }
  }

  const handlePurchase = async (optionCredits: number, optionPrice: number) => {
    setIsPurchasing(true)
    setSelectedOption(optionCredits)

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: optionPrice,
          channel: 'stripe',
          credits: optionCredits,
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        // Store callback to be called after redirect back
        sessionStorage.setItem('onPurchaseComplete', 'true')
        window.location.href = data.url
      } else {
        console.error('Failed to create payment session')
        alert('支付创建失败，请重试')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('支付失败，请重试')
    } finally {
      setIsPurchasing(false)
      setSelectedOption(null)
    }
  }

  const handleCustomPurchase = async () => {
    if (!customCredits || customCredits < 1) {
      alert('请输入有效的额度数量')
      return
    }

    const price = customCredits * 999 // ¥9.9 per credit
    await handlePurchase(customCredits, price)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Credit Balance Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium opacity-90">可用额度</h2>
            <p className="text-4xl font-bold mt-1">
              {credits?.total_credits || 0} 次
            </p>
            <p className="text-sm mt-2 opacity-80">
              免费额度：{credits?.free_credits || 0} | 付费额度：{credits?.paid_credits || 0}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">每次报告消耗</p>
            <p className="text-2xl font-bold">1 额度</p>
          </div>
        </div>
      </div>

      {/* Purchase Options */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">选择套餐</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CREDIT_PURCHASE_OPTIONS.map((option) => (
            <div
              key={option.credits}
              className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
                selectedOption === option.credits
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              } ${option.popular ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
              onClick={() => handlePurchase(option.credits, option.price)}
            >
              {option.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  最受欢迎
                </span>
              )}
              <div className="text-center">
                <p className="text-gray-600 text-sm">{option.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ¥{(option.price / 100).toFixed(1)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ¥{(option.price / option.credits / 100).toFixed(2)}/次
                </p>
                <p className="text-emerald-600 font-medium mt-3">
                  {option.credits} 次额度
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">自定义额度</h3>
        <div className="flex gap-4">
          <input
            type="number"
            min="1"
            placeholder="输入额度数量"
            value={customCredits || ''}
            onChange={(e) => setCustomCredits(parseInt(e.target.value, 10) || null)}
            className="flex-1 rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          />
          <button
            onClick={handleCustomPurchase}
            disabled={!customCredits || customCredits < 1 || isPurchasing}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPurchasing ? '处理中...' : '购买'}
          </button>
        </div>
        {customCredits && (
          <p className="text-sm text-gray-500 mt-2">
            总价：¥{(customCredits * 9.99).toFixed(2)} (¥9.99/次)
          </p>
        )}
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">支付历史</h3>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">日期</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">额度</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">金额</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">渠道</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-emerald-600">
                      +{payment.credits} 次
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ¥{(payment.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                      {payment.channel}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    success: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  }

  const statusLabels: Record<string, string> = {
    pending: '处理中',
    success: '成功',
    failed: '失败',
    refunded: '已退款',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}>
      {statusLabels[status] || status}
    </span>
  )
}

export default CreditPurchase
