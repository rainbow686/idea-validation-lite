import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/share/generate-poster
 *
 * Generates a shareable poster image for a validation report
 *
 * Returns a data URL of the poster image that can be:
 * - Downloaded directly
 * - Shared on social media
 * - Used in email/PDF
 */
export async function POST(request: NextRequest) {
  try {
    const { reportData, ideaTitle, score } = await request.json()

    if (!ideaTitle || !reportData) {
      return NextResponse.json(
        { error: 'Idea title and report data are required' },
        { status: 400 }
      )
    }

    // Generate HTML for the poster
    const posterHtml = generatePosterHtml({
      ideaTitle,
      score: score || reportData.overallScore,
      executiveSummary: reportData.executiveSummary,
      greenLights: reportData.greenLights?.slice(0, 3) || [],
      redFlags: reportData.redFlags?.slice(0, 2) || [],
      marketSize: reportData.marketSize,
    })

    // Return HTML that can be rendered client-side with html2canvas
    // This is more reliable than server-side image generation
    return NextResponse.json({
      success: true,
      html: posterHtml,
      // Also return a simple SVG version for quick preview
      svg: generateSimpleSvgPoster({ ideaTitle, score: score || reportData.overallScore }),
    })
  } catch (error) {
    console.error('Error generating poster:', error)
    return NextResponse.json(
      { error: 'Failed to generate poster: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

function generatePosterHtml(data: {
  ideaTitle: string
  score: number
  executiveSummary: string
  greenLights: (string | { title?: string; description?: string })[]
  redFlags: (string | { title?: string; description?: string })[]
  marketSize?: { TAM?: string; SAM?: string; SOM?: string } | { tam?: string; sam?: string; som?: string }
}) {
  const { ideaTitle, score, greenLights, redFlags, marketSize } = data

  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const scoreLabel = score >= 70 ? '强烈推荐' : score >= 40 ? '值得探索' : '需谨慎'

  // Normalize marketSize to lowercase keys
  const normalizedMarketSize = marketSize ? {
    tam: (marketSize as Record<string, string>).tam || (marketSize as Record<string, string>).TAM,
    sam: (marketSize as Record<string, string>).sam || (marketSize as Record<string, string>).SAM,
    som: (marketSize as Record<string, string>).som || (marketSize as Record<string, string>).SOM,
  } : undefined

  // Helper to get text from string or object
  const getText = (item: string | { title?: string; description?: string }) => {
    if (typeof item === 'string') return item
    return item.title || item.description || ''
  }

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IdeaProof - ${ideaTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="width: 800px; height: 1000px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; box-sizing: border-box;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 24px; border-radius: 20px; color: white; font-size: 14px; margin-bottom: 16px;">
        🚀 IdeaProof 创意验证报告
      </div>
    </div>

    <!-- Title -->
    <h1 style="color: white; font-size: 32px; text-align: center; margin: 0 0 30px 0; line-height: 1.3; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
      ${ideaTitle}
    </h1>

    <!-- Score Card -->
    <div style="background: white; border-radius: 20px; padding: 30px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); margin-bottom: 24px;">
      <div style="font-size: 72px; font-weight: bold; color: ${scoreColor}; line-height: 1;">
        ${score}
      </div>
      <div style="font-size: 18px; color: #6b7280; margin-top: 8px;">
        验证分数 / 100
      </div>
      <div style="display: inline-block; background: ${scoreColor}; color: white; padding: 6px 16px; border-radius: 12px; font-size: 14px; margin-top: 16px;">
        ${scoreLabel}
      </div>
    </div>

    <!-- Market Size (if available) -->
    ${normalizedMarketSize?.tam || normalizedMarketSize?.sam || normalizedMarketSize?.som ? `
    <div style="background: rgba(255,255,255,0.15); border-radius: 16px; padding: 20px; margin-bottom: 24px; backdrop-filter: blur(10px);">
      <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 12px; font-weight: 500;">市场规模</div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        ${normalizedMarketSize.tam ? `
        <div style="text-align: center;">
          <div style="color: rgba(255,255,255,0.7); font-size: 12px;">TAM</div>
          <div style="color: white; font-size: 16px; font-weight: 600; margin-top: 4px;">${normalizedMarketSize.tam}</div>
        </div>` : ''}
        ${normalizedMarketSize.sam ? `
        <div style="text-align: center;">
          <div style="color: rgba(255,255,255,0.7); font-size: 12px;">SAM</div>
          <div style="color: white; font-size: 16px; font-weight: 600; margin-top: 4px;">${normalizedMarketSize.sam}</div>
        </div>` : ''}
        ${normalizedMarketSize.som ? `
        <div style="text-align: center;">
          <div style="color: rgba(255,255,255,0.7); font-size: 12px;">SOM</div>
          <div style="color: white; font-size: 16px; font-weight: 600; margin-top: 4px;">${normalizedMarketSize.som}</div>
        </div>` : ''}
      </div>
    </div>
    ` : ''}

    <!-- Green Lights -->
    ${greenLights.length > 0 ? `
    <div style="background: rgba(255,255,255,0.15); border-radius: 16px; padding: 20px; margin-bottom: 24px; backdrop-filter: blur(10px);">
      <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 12px; font-weight: 500;">
        ✓ 核心优势
      </div>
      <div style="space-y: 12px;">
        ${greenLights.map(gl => `
        <div style="background: rgba(16,185,129,0.2); border-radius: 12px; padding: 12px; margin-bottom: 8px;">
          <div style="color: white; font-size: 14px; font-weight: 500;">${getText(gl)}</div>
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Red Flags (if any) -->
    ${redFlags.length > 0 ? `
    <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin-bottom: 24px; backdrop-filter: blur(10px);">
      <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 12px; font-weight: 500;">
        ! 需关注风险
      </div>
      <div style="space-y: 12px;">
        ${redFlags.map(rf => `
        <div style="background: rgba(239,68,68,0.2); border-radius: 12px; padding: 12px; margin-bottom: 8px;">
          <div style="color: white; font-size: 14px; font-weight: 500;">${getText(rf)}</div>
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="text-align: center; margin-top: auto; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
      <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 8px;">
        扫描二维码，查看完整报告
      </div>
      <div style="display: inline-block; background: white; padding: 12px; border-radius: 12px;">
        <div style="width: 80px; height: 80px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px; text-align: center;">
          [二维码]
        </div>
      </div>
      <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 12px;">
        idea-validation-lite.vercel.app
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function generateSimpleSvgPoster(data: { ideaTitle: string; score: number }) {
  const { ideaTitle, score } = data
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const scoreLabel = score >= 70 ? '强烈推荐' : score >= 40 ? '值得探索' : '需谨慎'

  return `
<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bg)"/>

  <!-- Header -->
  <text x="400" y="80" text-anchor="middle" fill="white" font-size="24" font-weight="bold">🚀 IdeaProof 创意验证报告</text>

  <!-- Title (truncated if too long) -->
  <text x="400" y="140" text-anchor="middle" fill="white" font-size="36" font-weight="bold">
    ${ideaTitle.length > 30 ? ideaTitle.substring(0, 30) + '...' : ideaTitle}
  </text>

  <!-- Score Circle -->
  <circle cx="400" cy="280" r="100" fill="white" opacity="0.2"/>
  <circle cx="400" cy="280" r="90" fill="white"/>
  <text x="400" y="270" text-anchor="middle" fill="${scoreColor}" font-size="64" font-weight="bold">${score}</text>
  <text x="400" y="300" text-anchor="middle" fill="#6b7280" font-size="16">验证分数 / 100</text>

  <!-- Score Badge -->
  <rect x="320" y="320" width="160" height="36" rx="18" fill="${scoreColor}"/>
  <text x="400" y="344" text-anchor="middle" fill="white" font-size="16">${scoreLabel}</text>

  <!-- Footer -->
  <text x="400" y="920" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="16">idea-validation-lite.vercel.app</text>
</svg>
  `.trim()
}
