'use client'

import { useState, useEffect } from 'react'

interface ShareStatsProps {
  userId?: string
}

interface InviteStats {
  inviteCode: string | null
  inviteUrl: string | null
  stats: {
    totalInvites: number
    creditsEarned: number
    joinDate: string | null
    recentClaims: Array<{ claimedAt: string }>
  }
}

export default function ShareStats({ userId }: ShareStatsProps) {
  const [inviteStats, setInviteStats] = useState<InviteStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchStats()
    } else {
      // Load from localStorage for non-authenticated users
      loadLocalStats()
    }
  }, [userId])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats' }),
      })

      const data = await response.json()
      if (data.success) {
        setInviteStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch invite stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLocalStats = () => {
    // For non-authenticated users, load from localStorage
    const localCode = localStorage.getItem('invite_code')
    const localStats = localStorage.getItem('invite_stats')

    if (localCode && localStats) {
      setInviteStats({
        inviteCode: localCode,
        inviteUrl: `${window.location.origin}?ref=${localCode}`,
        stats: JSON.parse(localStats),
      })
    }
    setLoading(false)
  }

  const generateInviteCode = async () => {
    setGeneratingCode(true)
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      })

      const data = await response.json()
      if (data.success) {
        setInviteStats({
          inviteCode: data.inviteCode,
          inviteUrl: data.inviteUrl,
          stats: {
            totalInvites: 0,
            creditsEarned: 0,
            joinDate: new Date().toISOString(),
            recentClaims: [],
          },
        })

        // Save to localStorage for non-authenticated users
        localStorage.setItem('invite_code', data.inviteCode)
        localStorage.setItem('invite_stats', JSON.stringify({
          totalInvites: 0,
          creditsEarned: 0,
        }))
      }
    } catch (error) {
      console.error('Failed to generate invite code:', error)
    } finally {
      setGeneratingCode(false)
    }
  }

  const copyInviteUrl = async () => {
    if (!inviteStats?.inviteUrl) return

    await navigator.clipboard.writeText(inviteStats.inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">邀请统计</h2>
        <p className="text-sm text-gray-500 mt-1">邀请好友，获得免费验证额度</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="已邀请"
          value={inviteStats?.stats.totalInvites || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          label="获得额度"
          value={inviteStats?.stats.creditsEarned || 0}
          icon="🎁"
          color="green"
        />
        <StatCard
          label="剩余额度"
          value={0}
          icon="💳"
          color="purple"
        />
      </div>

      {/* Invite Code Section */}
      {!inviteStats?.inviteCode ? (
        <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <p className="text-gray-600 mb-4">生成你的专属邀请码，开始赚取免费额度</p>
          <button
            onClick={generateInviteCode}
            disabled={generatingCode}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {generatingCode ? '生成中...' : '生成邀请码'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Invite URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              你的邀请链接
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteStats.inviteUrl || ''}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm truncate"
              />
              <button
                onClick={copyInviteUrl}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition whitespace-nowrap"
              >
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>

          {/* Invite Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              你的邀请码
            </label>
            <div className="flex items-center gap-4">
              <code className="px-4 py-3 bg-gray-100 rounded-xl text-lg font-mono text-gray-900">
                {inviteStats.inviteCode}
              </code>
              <button
                onClick={copyInviteUrl}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                复制链接
              </button>
            </div>
          </div>

          {/* Reward Info */}
          <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎁</span>
              <div>
                <p className="text-sm font-medium text-green-900">奖励规则</p>
                <ul className="text-xs text-green-700 mt-1 space-y-1">
                  <li>• 好友通过你的链接注册，获得 1 次免费验证</li>
                  <li>• 你获得 2 次免费验证额度</li>
                  <li>• 邀请人数无上限</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Claims */}
          {inviteStats.stats.recentClaims && inviteStats.stats.recentClaims.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">最近邀请</h3>
              <div className="space-y-2">
                {inviteStats.stats.recentClaims.slice(0, 5).map((claim, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        ✓
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">新用户通过你的链接注册</p>
                        <p className="text-xs text-gray-500">
                          {new Date(claim.claimedAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-600">+2 额度</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share Tips */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-3">分享建议</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">•</span>
            <span>将验证报告分享到微信朋友圈、微博等社交平台</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">•</span>
            <span>在创业社群、投资人朋友圈分享你的验证结果</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">•</span>
            <span>将邀请链接发送给有创业想法的朋友</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: string
  color: 'blue' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="text-center p-4 bg-gray-50 rounded-xl">
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl font-bold ${colorClasses[color].split(' ')[1]}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}
