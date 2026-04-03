'use client'

import { useAuth } from '@/contexts/AuthContext'
import ShareStats from '@/components/ShareStats'

export default function SharesPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">分享统计</h1>
        <p className="text-sm text-gray-500 mt-1">邀请好友，获得免费验证额度</p>
      </div>

      <ShareStats userId={user?.id} />

      {/* How Sharing Works */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">分享规则</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-emerald-600">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">生成你的专属邀请码</p>
              <p className="text-xs text-gray-500 mt-0.5">点击上方按钮生成你的专属邀请链接</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-emerald-600">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">分享你的验证报告</p>
              <p className="text-xs text-gray-500 mt-0.5">将你的创意验证报告分享到社交媒体</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-emerald-600">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">好友通过你的链接注册</p>
              <p className="text-xs text-gray-500 mt-0.5">好友获得 1 次免费验证，你获得 2 次验证额度</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-emerald-600">4</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">无上限累积</p>
              <p className="text-xs text-gray-500 mt-0.5">邀请人数无上限，最多可获得无限免费验证</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">分享建议</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-blue-500">•</span>
            <div>
              <p className="text-sm font-medium text-gray-900">微信朋友圈</p>
              <p className="text-xs text-gray-600 mt-0.5">分享你的验证报告到朋友圈，让更多创业者看到</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500">•</span>
            <div>
              <p className="text-sm font-medium text-gray-900">创业社群</p>
              <p className="text-xs text-gray-600 mt-0.5">在创业社群、投资人圈子分享你的验证结果</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500">•</span>
            <div>
              <p className="text-sm font-medium text-gray-900">微博/小红书</p>
              <p className="text-xs text-gray-600 mt-0.5">带上话题标签 #创业验证 #AI 工具，扩大影响力</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500">•</span>
            <div>
              <p className="text-sm font-medium text-gray-900">直接邀请</p>
              <p className="text-xs text-gray-600 mt-0.5">将邀请链接直接发送给有创业想法的朋友</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
