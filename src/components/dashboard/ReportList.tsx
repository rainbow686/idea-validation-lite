'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { CardSkeleton } from '@/components/Skeleton'

interface Report {
  id: string
  title: string
  idea_text: string
  overall_score?: number
  status: string
  created_at: string
  slug?: string
}

export default function ReportList() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user])

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id, title, idea_text, overall_score, status, created_at, slug')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      preview: 'bg-blue-100 text-blue-700',
      paid: 'bg-emerald-100 text-emerald-700',
      completed: 'bg-emerald-100 text-emerald-700',
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: '草稿',
      preview: '预览中',
      paid: '已解锁',
      completed: '已完成',
    }
    return labels[status] || status
  }

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return 'text-gray-400'
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有报告</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          开始生成你的第一个创业创意验证报告吧！AI 将帮你分析市场规模、竞品、风险等关键因素。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
        >
          开始验证创意
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">我的报告</h2>
        <p className="text-sm text-gray-500 mt-1">
          已生成 {reports.length} 份报告
        </p>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {report.title || '未命名报告'}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {report.idea_text}
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className={`px-2.5 py-1 rounded-full font-medium ${getStatusBadge(report.status)}`}>
                    {getStatusLabel(report.status)}
                  </span>
                  <span className="text-gray-500">
                    {new Date(report.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className={`text-2xl font-bold ${getScoreColor(report.overall_score)}`}>
                  {report.overall_score !== undefined && report.overall_score !== null ? (
                    `${report.overall_score}分`
                  ) : (
                    <span className="text-sm text-gray-400">未评分</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {report.slug ? (
                    <Link
                      href={`/report/${report.slug}`}
                      className="px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      查看
                    </Link>
                  ) : (
                    <Link
                      href={`/validated?id=${report.id}`}
                      className="px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      查看
                    </Link>
                  )}
                  <button
                    onClick={() => window.open(`/api/generate-pdf?id=${report.id}`, '_blank')}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    下载 PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
