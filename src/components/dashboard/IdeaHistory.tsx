'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface Idea {
  id: string
  title: string
  description?: string
  industry?: string
  target_user?: string
  pain_point?: string
  revenue_model?: string
  difficulty_score?: number
  views?: number
  validations?: number
  created_at: string
  is_from_library?: boolean
}

interface FilterState {
  industry: string
  status: string
  search: string
}

const INDUSTRIES = [
  '全部',
  'SaaS',
  '电商',
  '教育',
  '医疗',
  '金融',
  '娱乐',
  '生产力',
  '社交',
  '其他',
]

export default function IdeaHistory() {
  const { user } = useAuth()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    industry: '全部',
    status: '全部',
    search: '',
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      fetchIdeas()
    }
  }, [user])

  const fetchIdeas = async () => {
    try {
      // Fetch from idea_library table (user's validated ideas)
      const { data: libraryData, error: libraryError } = await supabase
        .from('idea_library')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50)

      // Fetch from reports table (user's reports)
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('id, title, idea_text as description, created_at, metadata')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (libraryError) throw libraryError
      if (reportsError) throw reportsError

      // Combine and deduplicate ideas
      const libraryIdeas: Idea[] = (libraryData || []).map(idea => ({
        ...idea,
        is_from_library: true,
      }))

      const reportIdeas: Idea[] = (reportsData || []).map(report => ({
        id: report.id,
        title: report.title,
        description: report.description,
        created_at: report.created_at,
        is_from_library: false,
        // Extract additional info from metadata if available
        industry: (report.metadata as any)?.industry,
        views: (report.metadata as any)?.views || 0,
        validations: (report.metadata as any)?.validations || 0,
      }))

      // Merge and deduplicate by ID
      const allIdeas = [...libraryIdeas, ...reportIdeas]
      const uniqueIdeas = allIdeas.filter(
        (idea, index, self) => index === self.findIndex(i => i.id === idea.id)
      )

      setIdeas(uniqueIdeas)
    } catch (error) {
      console.error('Failed to fetch ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredIdeas = ideas.filter(idea => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        idea.title?.toLowerCase().includes(searchLower) ||
        idea.description?.toLowerCase().includes(searchLower) ||
        idea.industry?.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Industry filter
    if (filters.industry !== '全部' && idea.industry !== filters.industry) {
      return false
    }

    return true
  })

  const getStatusBadge = (idea: Idea) => {
    if (idea.is_from_library) {
      return 'bg-purple-100 text-purple-700'
    }
    return 'bg-blue-100 text-blue-700'
  }

  const getStatusLabel = (idea: Idea) => {
    return idea.is_from_library ? '创意库' : '已验证'
  }

  const getDifficultyColor = (score?: number) => {
    if (score === undefined || score === null) return 'text-gray-400'
    if (score >= 7) return 'text-red-600'
    if (score >= 4) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getDifficultyLabel = (score?: number) => {
    if (score === undefined || score === null) return '未知'
    if (score >= 7) return '困难'
    if (score >= 4) return '中等'
    return '简单'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <div className="text-6xl mb-4">💡</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有创意</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          开始探索创意库或生成你的第一个创业创意吧！
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/ideas"
            className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            探索创意库
          </Link>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            生成创意
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">创意历史</h2>
        <p className="text-sm text-gray-500 mt-1">
          共 {filteredIdeas.length} 个创意
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 搜索
            </label>
            <input
              type="text"
              placeholder="搜索创意标题、描述..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Industry Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ 行业
            </label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Stats Summary */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">{ideas.length}</span> 个创意
              {ideas.reduce((acc, idea) => acc + (idea.validations || 0), 0) > 0 && (
                <span className="ml-3">
                  · 累计验证 <span className="font-semibold text-green-600">{ideas.reduce((acc, idea) => acc + (idea.validations || 0), 0)}</span> 次
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid gap-4">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {idea.title || '未命名创意'}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(idea)}`}>
                    {getStatusLabel(idea)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {idea.description || idea.pain_point || '暂无描述'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {idea.industry && (
                    <span className="flex items-center gap-1 text-gray-500">
                      🏷️ {idea.industry}
                    </span>
                  )}
                  {idea.target_user && (
                    <span className="flex items-center gap-1 text-gray-500">
                      👥 {idea.target_user}
                    </span>
                  )}
                  {idea.revenue_model && (
                    <span className="flex items-center gap-1 text-gray-500">
                      💰 {idea.revenue_model}
                    </span>
                  )}
                  {idea.difficulty_score !== undefined && (
                    <span className={`flex items-center gap-1 font-medium ${getDifficultyColor(idea.difficulty_score)}`}>
                      📊 难度：{getDifficultyLabel(idea.difficulty_score)}
                    </span>
                  )}
                  <span className="text-gray-400">
                    {new Date(idea.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {idea.views !== undefined && idea.views > 0 && (
                    <span title="浏览量">👁️ {idea.views}</span>
                  )}
                  {idea.validations !== undefined && idea.validations > 0 && (
                    <span title="验证次数">✅ {idea.validations}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {idea.is_from_library ? (
                    <Link
                      href={`/ideas?id=${idea.id}`}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      查看
                    </Link>
                  ) : (
                    <Link
                      href={`/validated?id=${idea.id}`}
                      className="px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      查看报告
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State after filtering */}
      {filteredIdeas.length === 0 && ideas.length > 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">没有找到匹配的创意，请调整筛选条件</p>
          <button
            onClick={() => setFilters({ industry: '全部', status: '全部', search: '' })}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            清除筛选
          </button>
        </div>
      )}
    </div>
  )
}
