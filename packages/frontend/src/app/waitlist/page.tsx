import { Metadata } from 'next'
import NewsletterSignup from '@/components/NewsletterSignup'

export const metadata: Metadata = {
  title: '加入等待列表 - IdeaProof',
  description: 'IdeaProof 即将上线！加入等待列表，第一时间体验 AI 驱动的创业创意验证工具，获取早期优惠。',
}

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b border-white/50 backdrop-blur-sm bg-white/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IdeaProof
          </a>
          <nav className="flex items-center gap-6">
            <a href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              定价
            </a>
            <a href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              首页
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-gray-700">产品开发中 · 即将上线</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            用 AI 验证你的
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              下一个伟大创意
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            IdeaProof 是一款 AI 驱动的创业创意验证工具，帮你在投入时间和资金之前，
            评估市场规模、分析竞品、识别风险。
          </p>

          {/* CTA */}
          <div className="max-w-md mx-auto">
            <NewsletterSignup variant="inline" />
          </div>

          <p className="text-sm text-gray-500 mt-4">
            🎁 早期用户将获得 <span className="font-semibold text-purple-600">5 次免费验证</span> 额度
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <FeatureCard
            icon="📊"
            title="深度市场分析"
            description="AI 自动分析 TAM/SAM/SOM，帮你理解市场规模和增长潜力"
          />
          <FeatureCard
            icon="🔍"
            title="竞品情报"
            description="识别直接和间接竞品，分析他们的优劣势和市场定位"
          />
          <FeatureCard
            icon="✅"
            title="风险识别"
            description="发现潜在的市场风险、技术风险和竞争风险，提前规避"
          />
          <FeatureCard
            icon="🎯"
            title="目标用户画像"
            description="精准定义目标用户群体，了解他们的痛点和需求"
          />
          <FeatureCard
            icon="💰"
            title="商业模式建议"
            description="基于市场数据推荐最适合的定价策略和收入模式"
          />
          <FeatureCard
            icon="📄"
            title="PDF 报告"
            description="生成专业的验证报告，可分享给团队、投资人和合作伙伴"
          />
        </div>

        {/* How It Works */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            工作原理
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <StepCard
              number="01"
              title="输入创意"
              description="用几句话描述你的创业想法"
            />
            <StepCard
              number="02"
              title="AI 分析"
              description="Claude AI 分析市场、竞品和风险"
            />
            <StepCard
              number="03"
              title="获取报告"
              description="收到详细的验证报告和评分"
            />
            <StepCard
              number="04"
              title="决策"
              description="根据数据决定是否继续推进"
            />
          </div>
        </section>

        {/* Social Proof */}
        <section className="mt-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              为什么需要 IdeaProof？
            </h2>
            <p className="text-gray-600">
              根据 CB Insights 数据，42% 的创业失败源于没有市场需求
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              stat="42%"
              label="创业因无市场需求失败"
              source="CB Insights"
            />
            <StatCard
              stat="¥50 万+"
              label="平均创业初期投入"
              source="创业调研"
            />
            <StatCard
              stat="¥9.9"
              label="IdeaProof 验证成本"
              source="我们的定价"
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            常见问题
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <FaqItem
              question="IdeaProof 什么时候上线？"
              answer="我们预计在 2026 年 4 月中旬正式上线。加入等待列表后，我们会在产品上线时第一时间邮件通知你。"
            />
            <FaqItem
              question="等待列表有什么福利？"
              answer="早期用户将获得 5 次免费验证额度（正常为 3 次），以及产品上线后的首月 8 折优惠。"
            />
            <FaqItem
              question="验证一次需要多少钱？"
              answer="单次验证价格为¥9.9，我们也提供月度套餐和团队套餐，性价比更高。"
            />
            <FaqItem
              question="AI 分析的准确度如何？"
              answer="IdeaProof 使用 Claude 最新模型，结合 Google Search 实时数据，准确度在测试中达到 85%+。但请注意，这不能替代专业的市场调研。"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/50 bg-white/30 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">
              © 2026 IdeaProof. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm">
                定价
              </a>
              <a href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                首页
              </a>
              <a href="mailto:hi@ideaproof.ai" className="text-gray-600 hover:text-gray-900 text-sm">
                联系我们
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

function StatCard({
  stat,
  label,
  source,
}: {
  stat: string
  label: string
  source?: string
}) {
  return (
    <div className="text-center p-4">
      <div className="text-3xl font-bold text-gray-900 mb-2">{stat}</div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      {source && <div className="text-xs text-gray-400">来源：{source}</div>}
    </div>
  )
}

function FaqItem({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-3">{question}</h3>
      <p className="text-gray-600 text-sm">{answer}</p>
    </div>
  )
}
