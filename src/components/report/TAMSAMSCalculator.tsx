'use client'

import { useState } from 'react'

interface TAMSAMSCalculatorProps {
  initialData?: {
    TAM: string
    SAM: string
    SOM: string
  }
  onSave?: (data: { TAM: string; SAM: string; SOM: string }) => void
}

export default function TAMSAMSCalculator({
  initialData,
  onSave,
}: TAMSAMSCalculatorProps) {
  const [targetUsers, setTargetUsers] = useState<string>('')
  const [avgPrice, setAvgPrice] = useState<string>('')
  const [penetrationRate, setPenetrationRate] = useState<string>('1')
  const [calculatedData, setCalculatedData] = useState<{
    TAM: number
    SAM: number
    SOM: number
  } | null>(null)

  const calculateMarketSize = () => {
    const users = parseFloat(targetUsers) || 0
    const price = parseFloat(avgPrice) || 0
    const penetration = parseFloat(penetrationRate) || 1

    const TAM = users * price // 总市场
    const SAM = TAM * 0.3 // 假设可服务市场是总市场的 30%
    const SOM = SAM * (penetration / 100) // 可获得市场 = SAM × 渗透率

    setCalculatedData({ TAM, SAM, SOM })

    if (onSave) {
      onSave({
        TAM: formatCurrency(TAM),
        SAM: formatCurrency(SAM),
        SOM: formatCurrency(SOM),
      })
    }
  }

  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) {
      return `¥${(value / 1000000000).toFixed(2)}B`
    }
    if (value >= 1000000) {
      return `¥${(value / 1000000).toFixed(2)}M`
    }
    if (value >= 10000) {
      return `¥${(value / 10000).toFixed(2)}万`
    }
    return `¥${value.toFixed(2)}`
  }

  const maxValue = calculatedData
    ? Math.max(calculatedData.TAM, calculatedData.SAM, calculatedData.SOM)
    : 1

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        TAM / SAM / SOM 市场分析
      </h3>

      {/* 输入表单 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            目标用户总数
          </label>
          <input
            type="number"
            value={targetUsers}
            onChange={(e) => setTargetUsers(e.target.value)}
            placeholder="例如：1000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">例如：100 万潜在用户</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            平均客单价 (ARPU)
          </label>
          <input
            type="number"
            value={avgPrice}
            onChange={(e) => setAvgPrice(e.target.value)}
            placeholder="例如：9.99"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">每个用户平均支付金额</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            目标渗透率 (%)
          </label>
          <input
            type="number"
            value={penetrationRate}
            onChange={(e) => setPenetrationRate(e.target.value)}
            placeholder="例如：1"
            min="0.1"
            max="100"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">预计可获得的市场份额</p>
        </div>
      </div>

      <button
        onClick={calculateMarketSize}
        disabled={!targetUsers || !avgPrice}
        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        计算市场规模
      </button>

      {/* 可视化展示 */}
      {calculatedData && (
        <div className="mt-6 space-y-6">
          {/* 柱状图 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">市场规模对比</h4>

            {/* TAM */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">TAM (总可服务市场)</span>
                <span className="text-gray-600">{formatCurrency(calculatedData.TAM)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                  style={{ width: `${(calculatedData.TAM / maxValue) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                总可服务市场 - 所有潜在用户 × 客单价
              </p>
            </div>

            {/* SAM */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">SAM (可服务市场)</span>
                <span className="text-gray-600">{formatCurrency(calculatedData.SAM)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700"
                  style={{ width: `${(calculatedData.SAM / maxValue) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                可服务市场 - 实际可触达的细分市场 (假设 30%)
              </p>
            </div>

            {/* SOM */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">SOM (可获得市场)</span>
                <span className="text-gray-600">{formatCurrency(calculatedData.SOM)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-700"
                  style={{ width: `${(calculatedData.SOM / maxValue) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                可获得市场 - 预计 {penetrationRate}% 渗透率下的收入
              </p>
            </div>
          </div>

          {/* 三层圆环图 */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              {/* 外层 - TAM */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />

                {/* 中层 - SAM */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="8"
                  strokeDasharray="220"
                  strokeDashoffset={220 * 0.7}
                  strokeLinecap="round"
                />

                {/* 内层 - SOM */}
                <circle
                  cx="50"
                  cy="50"
                  r="25"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="25"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="8"
                  strokeDasharray="157"
                  strokeDashoffset={157 * (1 - penetrationRate / 100)}
                  strokeLinecap="round"
                />
              </svg>

              {/* 中心文字 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-gray-500">SOM</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(calculatedData.SOM)}
                </span>
              </div>
            </div>
          </div>

          {/* 图例 */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">TAM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-gray-600">SAM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-gray-600">SOM</span>
            </div>
          </div>

          {/* 分析建议 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">分析建议</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • TAM &gt; ¥10B：市场空间充足，适合规模化创业
              </li>
              <li>
                • SAM / TAM &gt; 20%：细分市场足够大，有明确切入点
              </li>
              <li>
                • SOM / SAM &gt; 5%：3 年内可获得的份额合理
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* 初始数据展示（如果有） */}
      {initialData && !calculatedData && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">TAM</div>
            <div className="text-xl font-bold text-blue-600">{initialData.TAM}</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">SAM</div>
            <div className="text-xl font-bold text-indigo-600">{initialData.SAM}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">SOM</div>
            <div className="text-xl font-bold text-purple-600">{initialData.SOM}</div>
          </div>
        </div>
      )}
    </div>
  )
}
