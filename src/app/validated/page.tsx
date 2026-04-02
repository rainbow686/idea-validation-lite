'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http'))
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : ''
const supabaseAnonKey = typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : ''

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

interface ValidatedIdea {
  id: string
  title: string
  idea_text: string
  metadata: {
    overallScore: number
    executiveSummary?: string
    marketSize?: { tam?: string; sam?: string; som?: string }
    goNoGoRecommendation?: {
      recommendation: 'GO' | 'NO-GO' | 'CONDITIONAL'
      confidence: number
      rationale: string
    }
    targetAudience?: {
      primaryICP: string
    }
    revenueModelSuggestions?: Array<{
      model: string
      estimatedMRR: string
    }>
  }
  created_at: string
  is_public: boolean
  slug?: string
  view_count?: number
}

export default function ValidatedIdeasPage() {
  const [ideas, setIdeas] = useState<ValidatedIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'go' | 'high-score'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'score' | 'views'>('newest')

  useEffect(() => {
    fetchIdeas()
  }, [filter, sortBy])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchIdeas = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const query = supabase
        .from('reports')
        .select('id, title, idea_text, metadata, created_at, is_public, slug, view_count')
        .eq('is_public', true)

      // Apply filters
      if (filter === 'go') {
        // Will filter client-side for GO recommendations
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch ideas:', error)
        return
      }

      // Client-side filtering for GO recommendations
      let filteredData = data || []

      if (filter === 'go') {
        filteredData = filteredData.filter(idea =>
          idea.metadata?.goNoGoRecommendation?.recommendation === 'GO'
        )
      } else if (filter === 'high-score') {
        filteredData = filteredData.filter(idea =>
          (idea.metadata?.overallScore || 0) >= 70
        )
      }

      // Apply sorting
      filteredData.sort((a, b) => {
        switch (sortBy) {
          case 'score':
            return (b.metadata?.overallScore || 0) - (a.metadata?.overallScore || 0)
          case 'views':
            return (b.view_count || 0) - (a.view_count || 0)
          case 'newest':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
      })

      setIdeas(filteredData)
    } catch (err) {
      console.error('Error fetching ideas:', err)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getRecommendationBadge = (recommendation?: 'GO' | 'NO-GO' | 'CONDITIONAL') => {
    switch (recommendation) {
      case 'GO':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">✓ 建议执行</span>
      case 'CONDITIONAL':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">! 有条件通过</span>
      case 'NO-GO':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">✗ 不建议</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎯 公开验证池</h1>
              <p className="text-gray-600 mt-1">
                浏览已通过验证的创意，发现投资机会或获取灵感
              </p>
            </div>
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              开始验证
            </a>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
                label="全部"
              />
              <FilterButton
                active={filter === 'go'}
                onClick={() => setFilter('go')}
                label="建议执行"
                icon="✓"
              />
              <FilterButton
                active={filter === 'high-score'}
                onClick={() => setFilter('high-score')}
                label="高分项目"
                icon="🏆"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">排序:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">最新发布</option>
                <option value="score">分数最高</option>
                <option value="views">浏览最多</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="已验证创意" value={ideas.length} icon="💡" />
          <StatCard
            label="建议执行"
            value={ideas.filter(i => i.metadata?.goNoGoRecommendation?.recommendation === 'GO').length}
            icon="✓"
          />
          <StatCard
            label="平均分数"
            value={Math.round(ideas.reduce((acc, i) => acc + (i.metadata?.overallScore || 0), 0) / (ideas.length || 1))}
            icon="📊"
          />
        </div>

        {/* Ideas Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无公开的验证报告</h3>
            <p className="text-gray-600 mb-6">成为第一个分享你验证结果的人！</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              开始验证创意
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                getScoreColor={getScoreColor}
                getRecommendationBadge={getRecommendationBadge}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>© 2026 IdeaProof - AI 驱动的创意验证平台</p>
          <p className="mt-2">
            <a href="/" className="hover:text-gray-700">首页</a>
            {' - '}
            <a href="/pricing" className="hover:text-gray-700">价格</a>
            {' - '}
            <a href="/dashboard" className="hover:text-gray-700">仪表板</a>
          </p>
        </div>
      </footer>
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </button>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

function IdeaCard({
  idea,
  getScoreColor,
  getRecommendationBadge,
}: {
  idea: ValidatedIdea
  getScoreColor: (score: number) => string
  getRecommendationBadge: (rec?: 'GO' | 'NO-GO' | 'CONDITIONAL') => JSX.Element | null
}) {
  const score = idea.metadata?.overallScore || 0
  const recommendation = idea.metadata?.goNoGoRecommendation?.recommendation

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 flex-1">
          {idea.title}
        </h3>
        <div className={`ml-4 px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(score)}`}>
          {score}分
        </div>
      </div>

      {/* Recommendation */}
      <div className="mb-4">
        {getRecommendationBadge(recommendation)}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {idea.idea_text || idea.metadata?.executiveSummary?.substring(0, 150) || '暂无描述'}
      </p>

      {/* Market Size */}
      {idea.metadata?.marketSize && (idea.metadata.marketSize.tam || idea.metadata.marketSize.sam) && (
        <div className="mb-4 pb-4 border-b">
          <p className="text-xs text-gray-500 mb-2">市场规模</p>
          <div className="flex gap-4 text-sm">
            {idea.metadata.marketSize.tam && (
              <span className="text-gray-700">TAM: {idea.metadata.marketSize.tam}</span>
            )}
            {idea.metadata.marketSize.sam && (
              <span className="text-gray-700">SAM: {idea.metadata.marketSize.sam}</span>
            )}
          </div>
        </div>
      )}

      {/* Target Audience */}
      {idea.metadata?.targetAudience?.primaryICP && (
        <div className="mb-4 pb-4 border-b">
          <p className="text-xs text-gray-500 mb-2">目标用户</p>
          <p className="text-sm text-gray-700">{idea.metadata.targetAudience.primaryICP}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-gray-400">
          {new Date(idea.created_at).toLocaleDateString('zh-CN')}
        </span>
        {idea.slug ? (
          <a
            href={`/report/${idea.slug}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            查看报告 →
          </a>
        ) : (
          <span className="text-gray-400 text-sm">私密报告</span>
        )}
      </div>
    </div>
  )
}
