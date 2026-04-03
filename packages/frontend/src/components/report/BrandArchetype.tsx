'use client'

import { useState } from 'react'

interface BrandArchetypeProps {
  ideaTitle?: string
  ideaDescription?: string
  onArchetypeSelected?: (archetype: BrandArchetypeData) => void
}

interface BrandArchetypeData {
  name: string
  description: string
  characteristics: string[]
  brandVoice: string
  visualStyle: string
  examples: string[]
  doList: string[]
  dontList: string[]
}

const BRAND_ARCHETYPES: Record<string, BrandArchetypeData> = {
  hero: {
    name: '英雄 (Hero)',
    description: '通过勇气和行动克服困难，证明自己的价值',
    characteristics: ['勇敢', '坚韧', '自律', '成就导向'],
    brandVoice: '激励人心、直接有力、行动导向',
    visualStyle: '强烈对比、动态构图、英雄式视觉',
    examples: ['Nike - Just Do It', 'Under Armour', 'Red Bull'],
    doList: [
      '强调挑战和突破',
      '展示用户战胜困难的故事',
      '使用激励性语言和行动号召',
    ],
    dontList: [
      '避免被动或消极的语气',
      '不要过度承诺无法实现的转变',
      '避免说教式沟通',
    ],
  },
  sage: {
    name: '智者 (Sage)',
    description: '追求真理和智慧，帮助他人理解和洞察',
    characteristics: ['理性', '专业', '洞察深刻', '知识渊博'],
    brandVoice: '权威、客观、分析性强',
    visualStyle: '简洁专业、数据可视化、学术感',
    examples: ['Google', 'BBC', 'Harvard Business Review'],
    doList: [
      '提供深度分析和数据支持',
      '引用权威来源和专家观点',
      '使用清晰的结构化信息',
    ],
    dontList: [
      '避免情绪化或主观的表达',
      '不要使用未经验证的说法',
      '避免过度简化复杂问题',
    ],
  },
  creator: {
    name: '创造者 (Creator)',
    description: '创造独特价值，表达创新想象力',
    characteristics: ['创新', '想象力', '艺术性', '非传统'],
    brandVoice: '富有创意、启发性的、前瞻性',
    visualStyle: '独特美学、艺术感、实验性设计',
    examples: ['Apple', 'Adobe', 'Lego'],
    doList: [
      '展示创造过程和幕后故事',
      '鼓励用户表达创造力',
      '使用独特的视觉语言',
    ],
    dontList: [
      '避免模板化或公式化的内容',
      '不要跟随主流趋势',
      '避免缺乏原创性',
    ],
  },
  innocent: {
    name: '天真者 (Innocent)',
    description: '保持纯真乐观，传递简单快乐',
    characteristics: ['纯真', '乐观', '简单', '诚实'],
    brandVoice: '温暖、友好、积极向上',
    visualStyle: '明亮色彩、简洁设计、亲和力强',
    examples: ['Coca-Cola', 'Dove', 'Innocent Drinks'],
    doList: [
      '传递简单直接的快乐',
      '使用温暖亲切的语言',
      '强调纯净和真实',
    ],
    dontList: [
      '避免复杂或晦涩的信息',
      '不要使用讽刺或犬儒主义',
      '避免过度商业化的感觉',
    ],
  },
  explorer: {
    name: '探险家 (Explorer)',
    description: '追求自由和发现，突破边界',
    characteristics: ['独立', '冒险', '自由', '野心'],
    brandVoice: '激励探索、反传统、充满激情',
    visualStyle: '自然景观、广阔场景、冒险元素',
    examples: ['Jeep', 'The North Face', 'Patagonia'],
    doList: [
      '强调自由和独立精神',
      '展示未知领域的探索',
      '鼓励突破舒适区',
    ],
    dontList: [
      '避免限制或约束的感觉',
      '不要过于安全或保守',
      '避免从众的表达',
    ],
  },
  rebel: {
    name: '叛逆者 (Rebel)',
    description: '打破规则，挑战现状',
    characteristics: ['反叛', '激进', '真实', '不妥协'],
    brandVoice: '挑衅、直接、反建制',
    visualStyle: '粗犷、对比强烈、颠覆传统',
    examples: ['Harley-Davidson', 'Virgin', 'Glossier'],
    doList: [
      '挑战行业惯例',
      '使用大胆直接的表达',
      '站在弱者一边',
    ],
    dontList: [
      '避免迎合主流',
      '不要过于温和或妥协',
      '避免虚假的叛逆',
    ],
  },
  magician: {
    name: '魔法师 (Magician)',
    description: '实现梦想，创造奇迹转变',
    characteristics: ['愿景', '转变', '神秘', '影响力'],
    brandVoice: '启发式、富有想象力、充满可能',
    visualStyle: '梦幻效果、视觉奇观、 transformative',
    examples: ['Disney', 'Dyson', 'Tesla'],
    doList: [
      '展示转变的力量',
      '创造惊喜和奇迹感',
      '强调愿景和未来',
    ],
    dontList: [
      '避免平庸或可预测',
      '不要缺乏想象力',
      '避免过度承诺',
    ],
  },
  lover: {
    name: '情人 (Lover)',
    description: '追求亲密和愉悦，创造深度连接',
    characteristics: ['感性', '热情', '亲密', '享乐'],
    brandVoice: '感性、亲密、富有诱惑力',
    visualStyle: '温暖色调、亲密场景、感官体验',
    examples: ['Victoria\'s Secret', 'Godiva', 'Alfa Romeo'],
    doList: [
      '强调感官体验和愉悦',
      '创造情感连接',
      '使用感性的视觉和语言',
    ],
    dontList: [
      '避免冷漠或机械的感觉',
      '不要过于理性或功能导向',
      '避免缺乏情感温度',
    ],
  },
  caregiver: {
    name: '照顾者 (Caregiver)',
    description: '保护和关爱他人，无私奉献',
    characteristics: ['同情', '慷慨', '可靠', '温暖'],
    brandVoice: '温暖、支持性、保护性',
    visualStyle: '柔和色彩、关怀场景、家庭感',
    examples: ['Johnson & Johnson', 'Volvo', 'UNICEF'],
    doList: [
      '展示关怀和保护',
      '强调安全和可靠',
      '使用温暖的视觉语言',
    ],
    dontList: [
      '避免冷漠或自私的感觉',
      '不要过于强势或控制',
      '避免说教式关怀',
    ],
  },
  jester: {
    name: '小丑 (Jester)',
    description: '享受当下，带来欢乐',
    characteristics: ['幽默', '顽皮', '自发', '有趣'],
    brandVoice: '幽默、轻松、自嘲',
    visualStyle: '活泼色彩、趣味元素、轻松氛围',
    examples: ['Old Spice', 'Skittles', 'Dollar Shave Club'],
    doList: [
      '创造欢乐和笑声',
      '使用幽默和游戏化',
      '保持轻松不严肃',
    ],
    dontList: [
      '避免过于严肃或正式',
      '不要冒犯性幽默',
      '避免无聊的说教',
    ],
  },
  everyman: {
    name: '普通人 (Everyman)',
    description: '平易近人，代表大众',
    characteristics: ['接地气', '可靠', '谦逊', '归属感'],
    brandVoice: '友好、平等、真诚',
    visualStyle: '真实场景、普通人、生活化',
    examples: ['IKEA', 'Target', 'Southwest Airlines'],
    doList: [
      '强调共同经历和归属感',
      '使用平易近人的语言',
      '展示真实的使用场景',
    ],
    dontList: [
      '避免高高在上或精英主义',
      '不要过于奢华或排外',
      '避免虚假的亲民',
    ],
  },
  ruler: {
    name: '统治者 (Ruler)',
    description: '掌控局面，创造秩序和繁荣',
    characteristics: ['权威', '控制', '责任', '地位'],
    brandVoice: '权威、自信、排他性',
    visualStyle: '高端精致、权威符号、经典设计',
    examples: ['Mercedes-Benz', 'American Express', 'Rolex'],
    doList: [
      '展示领导力和权威',
      '强调品质和地位',
      '使用精致的视觉语言',
    ],
    dontList: [
      '避免显得傲慢或专横',
      '不要过于亲民失去权威感',
      '避免廉价的感覺',
    ],
  },
}

export default function BrandArchetype({
  ideaTitle = '',
  ideaDescription = '',
  onArchetypeSelected,
}: BrandArchetypeProps) {
  const [analyzedArchetype, setAnalyzedArchetype] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeArchetype = () => {
    setIsAnalyzing(true)

    // 基于创意描述进行简单匹配分析
    // 实际项目中可以调用 AI API 进行更精准的分析
    const description = (ideaTitle + ' ' + ideaDescription).toLowerCase()

    // 关键词匹配逻辑
    const archetypeKeywords: Record<string, string[]> = {
      hero: ['挑战', '突破', '运动', '健身', '竞技', '胜利', '坚持'],
      sage: ['知识', '学习', '教育', '研究', '分析', '数据', '智能'],
      creator: ['创造', '设计', '艺术', '创意', '工具', '制作', '表达'],
      innocent: ['简单', '快乐', '纯净', '天然', '友好', '温暖'],
      explorer: ['探索', '冒险', '旅行', '户外', '自由', '发现'],
      rebel: ['打破', '挑战', '颠覆', '革命', '反传统', '独立'],
      magician: ['转变', '奇迹', '未来', '科技', '魔法', '梦想'],
      lover: ['美学', '奢华', '感官', '体验', '精致', '享受'],
      caregiver: ['关怀', '保护', '安全', '健康', '家庭', '支持'],
      jester: ['有趣', '幽默', '娱乐', '游戏', '轻松', '欢乐'],
      everyman: ['大众', '日常', '实用', '平价', '社区', '归属'],
      ruler: ['领导', '高端', '精英', '权威', '成功', '地位'],
    }

    let bestMatch = 'everyman'
    let bestScore = 0

    Object.entries(archetypeKeywords).forEach(([key, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (description.includes(keyword.toLowerCase()) ? 1 : 0)
      }, 0)

      if (score > bestScore) {
        bestScore = score
        bestMatch = key
      }
    })

    // 如果没有明显匹配，默认使用创造者（适合创业工具）
    if (bestScore === 0) {
      bestMatch = 'creator'
    }

    setAnalyzedArchetype(bestMatch)

    if (onArchetypeSelected && BRAND_ARCHETYPES[bestMatch]) {
      onArchetypeSelected(BRAND_ARCHETYPES[bestMatch])
    }

    setIsAnalyzing(false)
  }

  const currentArchetype = analyzedArchetype ? BRAND_ARCHETYPES[analyzedArchetype] : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        品牌原型分析
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        基于 12 种经典品牌原型理论，分析您的创业创意最适合的品牌人格
      </p>

      {/* 分析按钮 */}
      {!analyzedArchetype && (
        <button
          onClick={analyzeArchetype}
          disabled={isAnalyzing || (!ideaTitle && !ideaDescription)}
          className="w-full md:w-auto px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? '分析中...' : 'AI 分析品牌原型'}
        </button>
      )}

      {/* 分析结果 */}
      {currentArchetype && (
        <div className="space-y-6">
          {/* 原型卡片 */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-purple-900">
                  {currentArchetype.name}
                </h4>
                <p className="text-sm text-purple-700 mt-1">
                  {currentArchetype.description}
                </p>
              </div>
              <button
                onClick={analyzeArchetype}
                disabled={isAnalyzing}
                className="text-sm text-purple-600 hover:text-purple-800 disabled:opacity-50"
              >
                重新分析
              </button>
            </div>

            {/* 特征标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {currentArchetype.characteristics.map((char, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/80 text-purple-800 text-sm rounded-full border border-purple-200"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* 品牌指南 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 品牌声音 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-2">品牌声音</h5>
              <p className="text-sm text-gray-700">{currentArchetype.brandVoice}</p>
            </div>

            {/* 视觉风格 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-2">视觉风格</h5>
              <p className="text-sm text-gray-700">{currentArchetype.visualStyle}</p>
            </div>
          </div>

          {/* 代表品牌 */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2">代表品牌</h5>
            <div className="flex flex-wrap gap-2">
              {currentArchetype.examples.map((example, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>

          {/* Do's and Don'ts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h5 className="text-sm font-semibold text-green-900 mb-3">建议做法</h5>
              <ul className="space-y-2">
                {currentArchetype.doList.map((item, index) => (
                  <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <h5 className="text-sm font-semibold text-red-900 mb-3">避免做法</h5>
              <ul className="space-y-2">
                {currentArchetype.dontList.map((item, index) => (
                  <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 应用场景 */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h5 className="text-sm font-semibold text-blue-900 mb-2">如何应用到此创意</h5>
            <p className="text-sm text-blue-800">
              基于 <strong>{currentArchetype.name}</strong> 原型，建议您的品牌在营销传播中强调{' '}
              <strong>{currentArchetype.characteristics.slice(0, 2).join(' 和 ')}</strong>{' '}
              的特质。使用 {currentArchetype.brandVoice.split('、')[0]} 的语气与用户沟通，
              视觉上采用 {currentArchetype.visualStyle.split('、')[0]} 的设计风格。
            </p>
          </div>
        </div>
      )}

      {/* 12 原型概览 */}
      {!analyzedArchetype && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">12 种品牌原型</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(BRAND_ARCHETYPES).map(([key, archetype]) => (
              <button
                key={key}
                onClick={() => {
                  setAnalyzedArchetype(key)
                  if (onArchetypeSelected) onArchetypeSelected(archetype)
                }}
                className="p-3 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {archetype.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
