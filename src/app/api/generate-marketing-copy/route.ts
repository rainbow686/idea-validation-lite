import { NextRequest, NextResponse } from 'next/server'

interface MarketingCopy {
  elevatorPitch: string
  twitterCopy: string[]
  adHeadlines: string[]
  landingPageHeadlines: string[]
  taglines: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { ideaTitle, ideaDescription } = await request.json()

    if (!ideaTitle) {
      return NextResponse.json(
        { error: 'Idea title is required' },
        { status: 400 }
      )
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY

    if (!anthropicApiKey) {
      // 返回模拟数据
      return generateMockCopy(ideaTitle, ideaDescription || '')
    }

    const prompt = `
你是一位专业的营销文案专家，擅长为创业公司生成高转化率的营销文案。

**创意信息：**
- 标题：${ideaTitle}
- 描述：${ideaDescription || '暂无描述'}

请生成以下营销文案，只返回 JSON 格式，不要任何其他内容：

{
  "elevatorPitch": "一句话介绍（15-25 字，能在一部电梯时间内说完）",
  "twitterCopy": [
    "推文版本 1（140 字以内，带话题标签）",
    "推文版本 2（不同风格）",
    "推文版本 3（强调痛点）"
  ],
  "adHeadlines": [
    "广告标题 1（强调结果）",
    "广告标题 2（提出问题）",
    "广告标题 3（数字证明）",
    "广告标题 4（紧迫感）",
    "广告标题 5（对比式）"
  ],
  "landingPageHeadlines": [
    "主标题 1（价值主张清晰）",
    "主标题 2（痛点驱动）",
    "主标题 3（愿景式）"
  ],
  "taglines": [
    "品牌标语 1（简短有力）",
    "品牌标语 2（差异化）",
    "品牌标语 3（情感连接）"
  ]
}

要求：
1. 所有内容使用中文
2. elevatorPitch 必须在 25 字以内
3. Twitter 文案要符合微博/推特风格，可以有 emoji
4. 广告标题要有吸引力，符合 AIDA 原则
5. Landing Page 标题要清晰传达价值主张
6. 标语要简短、易记、有差异化
`

    const baseURL = process.env.ANTHROPIC_BASE_URL || 'https://coding.dashscope.aliyuncs.com/apps/anthropic'

    const response = await fetch(`${baseURL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anthropicApiKey}`,
        'anthropic-version': '2023-07-12',
      },
      body: JSON.stringify({
        model: 'qwen3.5-plus',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Anthropic API HTTP error: ${response.status} - ${errorText}`)
      return generateMockCopy(ideaTitle, ideaDescription || '')
    }

    const data = await response.json()

    // 解析响应
    let content = ''
    const contentArray = data.content || []
    for (const block of contentArray) {
      if (block.type === 'text' && block.text) {
        content = block.text
        break
      }
    }

    if (!content) {
      return generateMockCopy(ideaTitle, ideaDescription || '')
    }

    // 提取 JSON
    let jsonContent = content
    const markdownJsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    if (markdownJsonMatch) {
      jsonContent = markdownJsonMatch[1]
    } else {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonContent = jsonMatch[0]
      }
    }

    try {
      const parsed: MarketingCopy = JSON.parse(jsonContent)
      return NextResponse.json({ success: true, data: parsed })
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return generateMockCopy(ideaTitle, ideaDescription || '')
    }
  } catch (error) {
    console.error('Error generating marketing copy:', error)
    return NextResponse.json(
      { error: 'Failed to generate marketing copy: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

async function generateMockCopy(ideaTitle: string, _ideaDescription: string): Promise<NextResponse> {
  const mockData: MarketingCopy = {
    elevatorPitch: `为${ideaTitle.split(' ')[0] || '创业者'}打造的智能验证工具，120 秒内完成专业级市场分析`,
    twitterCopy: [
      `💡 有好创意但不知道是否可行？${ideaTitle} 帮你 120 秒内验证创业想法！\n\n✅ AI 驱动分析\n✅ 竞品对比\n✅ 市场洞察\n\n#创业 #产品验证 #AI`,
      `🚀 89% 的创业失败源于没有验证需求。别让好点子白费！\n\n${ideaTitle} - 你的私人创业分析师\n\n👉 立即体验 #startup #validation`,
      `😤 受够了花几周做市场调研？${ideaTitle} 用 AI 在 2 分钟内给你答案\n\n💰 只要￥9.99，比一杯咖啡还便宜\n\n#创业工具 #AI 分析`,
    ],
    adHeadlines: [
      '120 秒验证你的创业想法，准确率超过 90%',
      '你的创意值得验证吗？3 步获得答案',
      '89% 创业者跳过这步导致失败 - 别重蹈覆辙',
      '限时优惠：前 100 名用户首份报告免费',
      '比竞品便宜 10 倍，速度快 100 倍',
    ],
    landingPageHeadlines: [
      '用 AI 验证创业想法，120 秒获得专业级分析报告',
      '别再猜了 - 用数据验证你的创业假设',
      '从创意到验证，只需 120 秒',
    ],
    taglines: [
      '验证想法，成就创业',
      '让每个创意都有据可依',
      '创业不靠猜，验证见真章',
    ],
  }

  return NextResponse.json({ success: true, data: mockData })
}
