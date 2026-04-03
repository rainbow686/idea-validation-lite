'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function CreditBalance() {
  const { profile } = useAuth()

  const freeCredits = profile?.free_credits || 0
  const paidCredits = profile?.paid_credits || 0
  const totalCredits = freeCredits + paidCredits

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">积分余额</h2>

      {/* Total Credits */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
        <div className="text-sm text-gray-600 mb-1">可用积分总额</div>
        <div className="text-4xl font-bold text-emerald-600">{totalCredits}</div>
      </div>

      {/* Credits Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="text-sm text-gray-600 mb-1">免费积分</div>
          <div className="text-2xl font-bold text-blue-600">{freeCredits}</div>
          <div className="text-xs text-blue-500 mt-1">新用户奖励 + 邀请获得</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">付费积分</div>
          <div className="text-2xl font-bold text-purple-600">{paidCredits}</div>
          <div className="text-xs text-purple-500 mt-1">购买获得</div>
        </div>
      </div>
    </div>
  )
}
