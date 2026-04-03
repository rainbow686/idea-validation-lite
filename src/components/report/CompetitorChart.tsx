'use client'

interface Competitor {
  name: string
  type: 'direct' | 'indirect'
  features?: string[]
  pricing?: string
  strengths?: string[]
  weaknesses?: string[]
  score?: number
}

interface CompetitorChartProps {
  competitors?: Competitor[]
  yourProduct?: {
    name: string
    features?: string[]
    pricing?: string
    score?: number
  }
}

export default function CompetitorChart({
  competitors = [],
  yourProduct,
}: CompetitorChartProps) {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无竞品数据
      </div>
    )
  }

  const directCompetitors = competitors.filter(c => c.type === 'direct')
  const indirectCompetitors = competitors.filter(c => c.type === 'indirect')

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="直接竞品"
          value={directCompetitors.length}
          icon="🔴"
          color="bg-red-50 text-red-700"
        />
        <StatCard
          label="间接竞品"
          value={indirectCompetitors.length}
          icon="🟡"
          color="bg-yellow-50 text-yellow-700"
        />
        <StatCard
          label="总竞品数"
          value={competitors.length}
          icon="📊"
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="你的排名"
          value={yourProduct?.score ? `#${getRank(competitors, yourProduct.score)}` : '-'}
          icon="🏆"
          color="bg-emerald-50 text-emerald-700"
        />
      </div>

      {/* Your Product Card */}
      {yourProduct && (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
              你
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{yourProduct.name || '你的产品'}</h3>
              {yourProduct.score && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">竞争力评分:</span>
                  <span className="text-lg font-bold text-emerald-600">{yourProduct.score}/100</span>
                </div>
              )}
            </div>
          </div>
          {yourProduct.features && yourProduct.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {yourProduct.features.slice(0, 5).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white rounded-md text-xs text-gray-700 border border-gray-200"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Direct Competitors */}
      {directCompetitors.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            直接竞品 ({directCompetitors.length})
          </h3>
          <div className="grid gap-3">
            {directCompetitors.map((competitor, index) => (
              <CompetitorCard key={index} competitor={competitor} />
            ))}
          </div>
        </section>
      )}

      {/* Indirect Competitors */}
      {indirectCompetitors.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            间接竞品 ({indirectCompetitors.length})
          </h3>
          <div className="grid gap-3">
            {indirectCompetitors.map((competitor, index) => (
              <CompetitorCard key={index} competitor={competitor} />
            ))}
          </div>
        </section>
      )}

      {/* Comparison Table */}
      {competitors.length > 0 && yourProduct && (
        <section className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">功能对比</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">功能</th>
                  <th className="text-center py-3 px-4 font-medium text-emerald-600 bg-emerald-50">
                    你的产品
                  </th>
                  {competitors.slice(0, 3).map((c, i) => (
                    <th key={i} className="text-center py-3 px-4 font-medium text-gray-600">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Pricing Row */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">定价</td>
                  <td className="py-3 px-4 text-center bg-emerald-50">
                    {yourProduct.pricing || '待定'}
                  </td>
                  {competitors.slice(0, 3).map((c, i) => (
                    <td key={i} className="py-3 px-4 text-center text-gray-600">
                      {c.pricing || '-'}
                    </td>
                  ))}
                </tr>
                {/* Features Rows */}
                {[0, 1, 2, 3, 4].map((index) => {
                  const allFeatures = new Set([
                    ...(yourProduct.features || []),
                    ...competitors.flatMap(c => c.features || []),
                  ])
                  const feature = Array.from(allFeatures)[index]
                  if (!feature) return null
                  return (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-700">{feature}</td>
                      <td className="py-3 px-4 text-center bg-emerald-50">
                        {yourProduct.features?.includes(feature) ? '✅' : '❌'}
                      </td>
                      {competitors.slice(0, 3).map((c, i) => (
                        <td key={i} className="py-3 px-4 text-center">
                          {c.features?.includes(feature) ? (
                            <span className="text-green-600">✅</span>
                          ) : (
                            <span className="text-gray-300">❌</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

function CompetitorCard({ competitor }: { competitor: Competitor }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
          {competitor.pricing && (
            <p className="text-sm text-gray-500 mt-1">{competitor.pricing}</p>
          )}
        </div>
        {competitor.score && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">评分:</span>
            <span className="text-lg font-bold text-gray-900">{competitor.score}</span>
          </div>
        )}
      </div>

      {/* Strengths */}
      {competitor.strengths && competitor.strengths.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-green-700 mb-1">优势</p>
          <ul className="space-y-1">
            {competitor.strengths.slice(0, 2).map((s, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-1">
                <span className="text-green-500 mt-0.5">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {competitor.weaknesses && competitor.weaknesses.length > 0 && (
        <div>
          <p className="text-xs font-medium text-red-700 mb-1">劣势</p>
          <ul className="space-y-1">
            {competitor.weaknesses.slice(0, 2).map((w, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-1">
                <span className="text-red-500 mt-0.5">-</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
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
  value: number | string
  icon: string
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

function getRank(competitors: Competitor[], yourScore: number): number {
  const scores = competitors
    .filter(c => c.score !== undefined)
    .map(c => c.score!)
    .filter(score => score > yourScore)
  return scores.length + 1
}
