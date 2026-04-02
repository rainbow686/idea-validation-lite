'use client'

import { useState } from 'react'

interface GeneratedIdea {
  title: string
  description: string
  industry: string
  targetUser: string
  painPoint: string
  revenueModel: string
  difficultyScore: number
}

interface IdeaGeneratorProps {
  onSelectIdea?: (idea: GeneratedIdea) => void
  onClose?: () => void
}

export default function IdeaGenerator({ onSelectIdea, onClose }: IdeaGeneratorProps) {
  const [industry, setIndustry] = useState('')
  const [investmentRange, setInvestmentRange] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([])
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError('')
    setIdeas([])

    try {
      const response = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: industry || undefined,
          investmentRange: investmentRange || undefined,
        }),
      })

      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setIdeas(data.data)
      } else {
        setError(data.error || '生成失败，请重试')
      }
    } catch (err) {
      console.error('Error generating ideas:', err)
      setError('网络错误，请检查网络连接')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectIdea = (idea: GeneratedIdea) => {
    onSelectIdea?.(idea)
  }

  const getDifficultyColor = (score: number) => {
    if (score <= 3) return 'text-emerald-500 bg-emerald-50'
    if (score <= 6) return 'text-yellow-500 bg-yellow-50'
    return 'text-red-500 bg-red-50'
  }

  const getDifficultyLabel = (score: number) => {
    if (score <= 3) return '容易'
    if (score <= 6) return '中等'
    return '困难'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">创意生成器</h2>
            <p className="text-sm text-gray-500">AI 驱动，发现优质创业机会</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {!ideas.length && (
            <div className="p-6">
              {/* Filters */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    行业偏好（可选）
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">不限</option>
                    <option value="AI/人工智能">AI/人工智能</option>
                    <option value="电商">电商</option>
                    <option value="教育">教育</option>
                    <option value="健康/医疗">健康/医疗</option>
                    <option value="金融/理财">金融/理财</option>
                    <option value="房地产">房地产</option>
                    <option value="餐饮/零售">餐饮/零售</option>
                    <option value="娱乐/内容">娱乐/内容</option>
                    <option value="企业服务">企业服务</option>
                    <option value="制造业">制造业</option>
                    <option value="农业">农业</option>
                    <option value="物流/供应链">物流/供应链</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    可投资金额范围（可选）
                  </label>
                  <select
                    value={investmentRange}
                    onChange={(e) => setInvestmentRange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">灵活</option>
                    <option value="< 5 万">¥5 万以下（副业级别）</option>
                    <option value="5-20 万">¥5-20 万（小本创业）</option>
                    <option value="20-50 万">¥20-50 万（小型创业）</option>
                    <option value="50-100 万">¥50-100 万（中型创业）</option>
                    <option value="> 100 万">¥100 万以上（规模创业）</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    正在生成创意...
                  </span>
                ) : (
                  '生成 10 个创业创意'
                )}
              </button>

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Ideas List */}
          {ideas.length > 0 && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  生成的创意（{ideas.length}个）
                </h3>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="text-sm text-emerald-500 hover:text-emerald-600 font-medium"
                >
                  重新生成
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {ideas.map((idea, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{idea.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(idea.difficultyScore)}`}
                      >
                        {getDifficultyLabel(idea.difficultyScore)} ({idea.difficultyScore})
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{idea.description}</p>

                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">行业</span>
                        <span className="text-gray-700">{idea.industry}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">用户</span>
                        <span className="text-gray-700">{idea.targetUser}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">痛点</span>
                        <span className="text-gray-700 line-clamp-1">{idea.painPoint}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">盈利</span>
                        <span className="text-gray-700">{idea.revenueModel}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectIdea(idea)}
                      className="mt-4 w-full px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
                    >
                      验证这个创意
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
