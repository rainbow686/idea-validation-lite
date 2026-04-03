'use client'

import { useState } from 'react'

interface MarketingCopyProps {
  ideaTitle?: string
  ideaDescription?: string
}

interface MarketingCopyData {
  elevatorPitch: string
  twitterCopy: string[]
  adHeadlines: string[]
  landingPageHeadlines: string[]
  taglines: string[]
}

export default function MarketingCopy({
  ideaTitle = '',
  ideaDescription = '',
}: MarketingCopyProps) {
  const [copyData, setCopyData] = useState<MarketingCopyData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'elevator' | 'twitter' | 'ads' | 'landing' | 'taglines'>('elevator')
  const [regenerateCount, setRegenerateCount] = useState<Record<string, number>>({})

  const generateCopy = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-marketing-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaTitle, ideaDescription }),
      })

      if (response.ok) {
        const result = await response.json()
        setCopyData(result.data)
      }
    } catch (error) {
      console.error('Failed to generate marketing copy:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleRegenerate = async (section: string) => {
    // 简单实现：重新生成全部内容
    // 可以扩展为针对特定部分重新生成
    setRegenerateCount((prev) => ({ ...prev, [section]: (prev[section] || 0) + 1 }))
    await generateCopy()
  }

  if (!copyData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          营销文案生成器
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          AI 生成多种营销文案，包括一句话介绍、社交媒体文案、广告标题等
        </p>

        <button
          onClick={generateCopy}
          disabled={isGenerating || (!ideaTitle && !ideaDescription)}
          className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? '生成中...' : 'AI 生成营销文案'}
        </button>

        {/* 文案类型预览 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">一句话介绍</div>
            <div className="text-sm font-medium text-gray-900">Elevator Pitch</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">社交媒体</div>
            <div className="text-sm font-medium text-gray-900">Twitter / 微博</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">广告</div>
            <div className="text-sm font-medium text-gray-900">广告标题 (5 个)</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">落地页</div>
            <div className="text-sm font-medium text-gray-900">Landing Page 主标题</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">品牌</div>
            <div className="text-sm font-medium text-gray-900">品牌标语</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          营销文案生成器
        </h3>
        <button
          onClick={generateCopy}
          disabled={isGenerating}
          className="text-sm text-green-600 hover:text-green-800 disabled:opacity-50 font-medium"
        >
          {isGenerating ? '生成中...' : '重新生成'}
        </button>
      </div>

      {/* Tab 导航 */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
        <TabButton
          active={activeTab === 'elevator'}
          onClick={() => setActiveTab('elevator')}
        >
          一句话介绍
        </TabButton>
        <TabButton
          active={activeTab === 'twitter'}
          onClick={() => setActiveTab('twitter')}
        >
          社交媒体
        </TabButton>
        <TabButton
          active={activeTab === 'ads'}
          onClick={() => setActiveTab('ads')}
        >
          广告标题
        </TabButton>
        <TabButton
          active={activeTab === 'landing'}
          onClick={() => setActiveTab('landing')}
        >
          落地页
        </TabButton>
        <TabButton
          active={activeTab === 'taglines'}
          onClick={() => setActiveTab('taglines')}
        >
          品牌标语
        </TabButton>
      </div>

      {/* 内容区域 */}
      <div className="min-h-[200px]">
        {/* Elevator Pitch */}
        {activeTab === 'elevator' && (
          <CopySection
            title="一句话介绍 (Elevator Pitch)"
            description="在电梯相遇的 30 秒内向投资人介绍你的创意"
            copies={[copyData.elevatorPitch]}
            onCopy={copyToClipboard}
            onRegenerate={() => handleRegenerate('elevator')}
            regenerateCount={regenerateCount['elevator'] || 0}
          />
        )}

        {/* Twitter Copy */}
        {activeTab === 'twitter' && (
          <CopySection
            title="社交媒体文案"
            description="适合 Twitter / 微博 / 朋友圈分享"
            copies={copyData.twitterCopy}
            onCopy={copyToClipboard}
            onRegenerate={() => handleRegenerate('twitter')}
            regenerateCount={regenerateCount['twitter'] || 0}
          />
        )}

        {/* Ad Headlines */}
        {activeTab === 'ads' && (
          <CopySection
            title="广告标题"
            description="用于 SEM、信息流广告的吸引性标题"
            copies={copyData.adHeadlines}
            onCopy={copyToClipboard}
            onRegenerate={() => handleRegenerate('ads')}
            regenerateCount={regenerateCount['ads'] || 0}
          />
        )}

        {/* Landing Page Headlines */}
        {activeTab === 'landing' && (
          <CopySection
            title="Landing Page 主标题"
            description="网站落地页的核心标题，传达主要价值主张"
            copies={copyData.landingPageHeadlines}
            onCopy={copyToClipboard}
            onRegenerate={() => handleRegenerate('landing')}
            regenerateCount={regenerateCount['landing'] || 0}
          />
        )}

        {/* Taglines */}
        {activeTab === 'taglines' && (
          <CopySection
            title="品牌标语"
            description="简短有力的品牌口号，用于品牌传播"
            copies={copyData.taglines}
            onCopy={copyToClipboard}
            onRegenerate={() => handleRegenerate('taglines')}
            regenerateCount={regenerateCount['taglines'] || 0}
          />
        )}
      </div>

      {/* 使用建议 */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">使用建议</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 一句话介绍：用于融资 BP、产品页面、社交媒体简介</li>
          <li>• 社交媒体：配合产品截图或使用场景图发布</li>
          <li>• 广告标题：A/B 测试不同版本，找到转化率最高的</li>
          <li>• Landing Page：放在页面最上方，5 秒内传达价值</li>
          <li>• 品牌标语：用于 Logo 下方、邮件签名、名片等</li>
        </ul>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-green-100 text-green-800'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

function CopySection({
  title,
  description,
  copies,
  onCopy,
  onRegenerate,
  regenerateCount,
}: {
  title: string
  description: string
  copies: string[]
  onCopy: (text: string) => void
  onRegenerate: () => void
  regenerateCount: number
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (text: string, index: number) => {
    await onCopy(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <button
          onClick={onRegenerate}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          重新生成 ({regenerateCount})
        </button>
      </div>

      <div className="space-y-3">
        {copies.map((copy, index) => (
          <div
            key={index}
            className="relative group p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <p className="text-sm text-gray-800 pr-12">{copy}</p>
            <button
              onClick={() => handleCopy(copy, index)}
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
              title="复制"
            >
              {copiedIndex === index ? (
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
