import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '热门创意榜单 - IdeaProof',
  description: '探索最受欢迎的创业创意，看看其他人都在验证什么想法。按浏览量和验证数排序。',
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface Idea {
  id: string
  title: string
  description?: string
  industry?: string
  target_user?: string
  pain_point?: string
  revenue_model?: string
  difficulty_score?: number
  views: number
  validations: number
  created_at: string
}

export default async function PopularPage() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Fetch popular ideas sorted by views and validations
  const { data: ideas, error } = await supabase
    .from('idea_library')
    .select('*')
    .eq('is_public', true)
    .order('validations', { ascending: false })
    .order('views', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch popular ideas:', error)
  }

  const popularIdeas: Idea[] = (data || []) as Idea[]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IdeaProof
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/ideas" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              创意库
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              定价
            </Link>
            <Link href="/waitlist" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              加入等待列表
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            热门创意榜单
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            探索最受欢迎的创业创意，看看其他人都在验证什么想法。
            也许能找到你的下一个灵感！
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            icon="💡"
            value={popularIdeas.length.toString()}
            label="热门创意"
          />
          <StatCard
            icon="👁️"
            value={formatNumber(popularIdeas.reduce((acc, idea) => acc + idea.views, 0))}
            label="总浏览量"
          />
          <StatCard
            icon="✅"
            value={formatNumber(popularIdeas.reduce((acc, idea) => acc + idea.validations, 0))}
            label="总验证数"
          />
        </div>

        {/* Sort Tabs (visual only, sorting is done server-side) */}
        <div className="flex items-center gap-2 mb-6">
          <TabButton active>🔥 热门</TabButton>
          <TabButton>👁️ 浏览最多</TabButton>
          <TabButton>✅ 验证最多</TabButton>
          <TabButton>🆕 最新</TabButton>
        </div>

        {/* Ideas List */}
        {popularIdeas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              还没有热门创意
            </h3>
            <p className="text-gray-500 mb-6">
              成为第一个分享创意的人！
            </p>
            <Link
              href="/ideas"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              探索创意库
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {popularIdeas.map((idea, index) => (
              <IdeaCard key={idea.id} idea={idea} rank={index + 1} />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <section className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            有创意想验证？
          </h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            用 AI 快速验证你的创业想法，获取市场大小、竞品分析、风险评估等专业报告。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100"
            >
              开始验证
            </Link>
            <Link
              href="/waitlist"
              className="inline-block px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400"
            >
              加入等待列表
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">
              © 2026 IdeaProof. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                首页
              </Link>
              <Link href="/ideas" className="text-gray-600 hover:text-gray-900 text-sm">
                创意库
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm">
                定价
              </Link>
              <Link href="/waitlist" className="text-gray-600 hover:text-gray-900 text-sm">
                等待列表
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function IdeaCard({ idea, rank }: { idea: Idea; rank: number }) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900'
    if (rank === 2) return 'bg-gray-300 text-gray-700'
    if (rank === 3) return 'bg-orange-400 text-orange-900'
    return 'bg-gray-100 text-gray-600'
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Rank */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getRankBadge(rank)}`}>
          {rank}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {idea.title}
            </h3>
            {idea.industry && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                {idea.industry}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {idea.description || idea.pain_point || '暂无描述'}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {idea.target_user && (
              <span>👥 {idea.target_user}</span>
            )}
            {idea.revenue_model && (
              <span>💰 {idea.revenue_model}</span>
            )}
            {idea.difficulty_score !== undefined && (
              <span className={getDifficultyColor(idea.difficulty_score)}>
                📊 难度：{getDifficultyLabel(idea.difficulty_score)}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-gray-500" title="浏览量">
              👁️ {formatNumber(idea.views)}
            </span>
            <span className="flex items-center gap-1 text-gray-500" title="验证数">
              ✅ {formatNumber(idea.validations)}
            </span>
          </div>
          <Link
            href={`/ideas?id=${idea.id}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            查看详情
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string
  value: string
  label: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function TabButton({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
