import { NextRequest, NextResponse } from 'next/server'

interface GeneratedIdea {
  title: string
  description: string
  industry: string
  targetUser: string
  painPoint: string
  revenueModel: string
  difficultyScore: number
}

export async function POST(request: NextRequest) {
  try {
    const { industry, investmentRange } = await request.json()

    console.log('[Idea Generator] Generating ideas with:', { industry, investmentRange })

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    const baseURL = process.env.ANTHROPIC_BASE_URL || 'https://coding.dashscope.aliyuncs.com/apps/anthropic'

    if (!anthropicApiKey) {
      console.error('[Idea Generator] Missing ANTHROPIC_API_KEY')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const prompt = `你是一位专业的创业顾问，擅长发现市场机会和生成高质量的创业创意。

请生成 10 个创业创意，要求：
- 适合${industry ? `行业：${industry}` : '各个行业'}
- ${investmentRange ? `投资范围：${investmentRange}` : '投资规模灵活'}
- 每个创意都有真实的市场需求和商业价值
- 适合 1-3 人的小团队启动
- 有清晰的盈利模式

每个创意必须包含以下字段：
- title: 创意标题（简洁有力）
- description: 创意描述（1-2 句话）
- industry: 所属行业
- targetUser: 目标用户
- painPoint: 解决的痛点
- revenueModel: 盈利模式
- difficultyScore: 实施难度（1-10，1 最容易，10 最难）

以 JSON 数组格式返回，不要包含任何其他文字。格式示例：
[
  {
    "title": "创意标题",
    "description": "描述",
    "industry": "行业",
    "targetUser": "目标用户",
    "painPoint": "痛点",
    "revenueModel": "盈利模式",
    "difficultyScore": 5
  }
]`

    const response = await fetch(`${baseURL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anthropicApiKey}`,
        'anthropic-version': '2023-07-12',
      },
      body: JSON.stringify({
        model: 'qwen3.5-plus',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Idea Generator] API error:', response.status, errorText)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Parse content from response - handle Anthropic format with content array
    const contentArray = data.content || []
    let content = ''

    for (const block of contentArray) {
      if (block.type === 'text' && block.text) {
        content = block.text
        break
      }
    }

    if (!content && contentArray.length > 0) {
      content = contentArray[0].text || ''
    }

    if (!content) {
      console.error('[Idea Generator] No content in response')
      throw new Error('No content generated')
    }

    // Parse JSON from response
    let jsonContent = content
    const markdownJsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    if (markdownJsonMatch) {
      jsonContent = markdownJsonMatch[1]
    } else {
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        jsonContent = jsonMatch[0]
      }
    }

    try {
      const ideas: GeneratedIdea[] = JSON.parse(jsonContent)

      // Validate and ensure we have 10 ideas
      const validatedIdeas = ideas
        .filter(idea => idea.title && idea.description && idea.difficultyScore >= 1 && idea.difficultyScore <= 10)
        .map(idea => ({
          ...idea,
          difficultyScore: Math.max(1, Math.min(10, Number(idea.difficultyScore))),
        }))
        .slice(0, 10)

      console.log('[Idea Generator] Generated', validatedIdeas.length, 'ideas')

      return NextResponse.json({
        success: true,
        data: validatedIdeas,
      })
    } catch (parseError) {
      console.error('[Idea Generator] JSON parse error:', parseError)
      console.log('[Idea Generator] Raw content:', content.substring(0, 500))
      throw new Error('Failed to parse generated ideas')
    }
  } catch (error) {
    console.error('[Idea Generator] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate ideas' },
      { status: 500 }
    )
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Idea Generator API is running' })
}
