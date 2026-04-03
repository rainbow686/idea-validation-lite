'use client'

interface ScoreChartProps {
  score: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  showBreakdown?: boolean
  breakdown?: {
    label: string
    value: number
  }[]
}

export default function ScoreChart({
  score,
  size = 'lg',
  showLabel = true,
  showBreakdown = false,
  breakdown = [],
}: ScoreChartProps) {
  const sizeConfig = {
    sm: { width: 60, strokeWidth: 6, fontSize: 'text-lg' },
    md: { width: 80, strokeWidth: 8, fontSize: 'text-xl' },
    lg: { width: 120, strokeWidth: 10, fontSize: 'text-3xl' },
    xl: { width: 160, strokeWidth: 12, fontSize: 'text-5xl' },
  }

  const { width, strokeWidth, fontSize } = sizeConfig[size]
  const radius = (width - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getScoreColor = (score: number) => {
    if (score >= 80) return { stroke: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600' }
    if (score >= 60) return { stroke: '#f59e0b', bg: 'bg-yellow-50', text: 'text-yellow-600' }
    if (score >= 40) return { stroke: '#f97316', bg: 'bg-orange-50', text: 'text-orange-600' }
    return { stroke: '#ef4444', bg: 'bg-red-50', text: 'text-red-600' }
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '强烈推荐'
    if (score >= 60) return '推荐'
    if (score >= 40) return '谨慎'
    return '不推荐'
  }

  const colors = getScoreColor(score)

  return (
    <div className="flex flex-col items-center">
      {/* Circular Progress */}
      <div className="relative" style={{ width, height: width }}>
        <svg
          width={width}
          height={width}
          className="transform -rotate-90"
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Background Circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress Circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${colors.text} ${fontSize}`}>
            {score}
          </span>
          {showLabel && size !== 'sm' && (
            <span className="text-xs text-gray-500 mt-0.5">/ 100</span>
          )}
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <div className={`mt-3 px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
          {getScoreLabel(score)}
        </div>
      )}

      {/* Breakdown */}
      {showBreakdown && breakdown.length > 0 && (
        <div className="mt-4 w-full space-y-2">
          {breakdown.map((item, index) => (
            <ScoreBar
              key={index}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ScoreBar({
  label,
  value,
}: {
  label: string
  value: number
}) {
  const colors = getScoreColor(value)

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-24 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            backgroundColor: colors.stroke,
          }}
        />
      </div>
      <span className={`text-sm font-medium w-10 text-right ${colors.text}`}>
        {value}
      </span>
    </div>
  )
}

function getScoreColor(score: number) {
  if (score >= 80) return { stroke: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600' }
  if (score >= 60) return { stroke: '#f59e0b', bg: 'bg-yellow-50', text: 'text-yellow-600' }
  if (score >= 40) return { stroke: '#f97316', bg: 'bg-orange-50', text: 'text-orange-600' }
  return { stroke: '#ef4444', bg: 'bg-red-50', text: 'text-red-600' }
}
