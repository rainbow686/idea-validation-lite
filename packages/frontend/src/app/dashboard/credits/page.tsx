'use client'

import CreditBalance from '@/components/dashboard/CreditBalance'
import Link from 'next/link'

export default function CreditsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Credits 管理</h1>
        <p className="text-sm text-gray-500 mt-1">查看和管理你的验证积分</p>
      </div>

      <CreditBalance />

      {/* How to Get Credits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">如何获取积分</h2>

        <div className="space-y-4">
          {/* New User Bonus */}
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="text-3xl">🎁</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">新用户奖励</h3>
              <p className="text-sm text-gray-600 mt-1">
                注册即送 <span className="font-semibold text-blue-600">2 次免费验证</span> 额度
              </p>
            </div>
            <span className="text-sm font-semibold text-blue-600">+2 积分</span>
          </div>

          {/* Invite Friends */}
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="text-3xl">👥</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">邀请好友</h3>
              <p className="text-sm text-gray-600 mt-1">
                邀请好友注册，好友获得 1 次验证，你获得 <span className="font-semibold text-green-600">2 次验证</span> 额度
              </p>
              <Link href="/dashboard/shares" className="text-sm text-green-600 hover:text-green-700 font-medium mt-1 inline-block">
                查看邀请统计 →
              </Link>
            </div>
            <span className="text-sm font-semibold text-green-600">+2 积分/人</span>
          </div>

          {/* Purchase */}
          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="text-3xl">💳</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">购买积分</h3>
              <p className="text-sm text-gray-600 mt-1">
                按需购买验证额度，永久有效
              </p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">单次购买</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">月度订阅</span>
              </div>
            </div>
            <Link
              href="/dashboard/credits/purchase"
              className="text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              购买 →
            </Link>
          </div>
        </div>
      </div>

      {/* Usage Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span>每次生成完整验证报告消耗 1 积分</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span>免费积分和付费积分都可以用于生成报告</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span>付费积分永久有效，无过期时间</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span>邀请获得的积分永久有效</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
