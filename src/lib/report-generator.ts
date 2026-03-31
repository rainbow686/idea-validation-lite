/**
 * Generate idea validation report using Google Search API + Claude
 */

export interface SearchResult {
  title: string
  snippet: string
  link: string
}

export interface ValidationReport {
  overallScore: number
  executiveSummary: string
  greenLights: string[]
  redFlags: string[]
  marketSize: {
    TAM: string
    SAM: string
    SOM: string
  }
  competitors: Array<{
    name: string
    description: string
    differentiation: string
  }>
  recommendations: string[]
  // P0 - Core validation enhancements
  swotAnalysis: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  targetAudience: {
    primaryICP: string
    demographics: string
    psychographics: string
    painPoints: string[]
  }
  goNoGoRecommendation: {
    recommendation: 'GO' | 'NO-GO' | 'CONDITIONAL'
    confidence: number
    rationale: string
    keyConditions?: string[]
  }
  riskMatrix: Array<{
    risk: string
    level: 'HIGH' | 'MEDIUM' | 'LOW'
    impact: 'HIGH' | 'MEDIUM' | 'LOW'
    likelihood: 'HIGH' | 'MEDIUM' | 'LOW'
    mitigation: string
  }>
  revenueModelSuggestions: Array<{
    model: string
    description: string
    pros: string[]
    cons: string[]
    estimatedMRR: string
  }>
}

export async function googleSearch(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

  if (!apiKey || !searchEngineId) {
    // Fallback to mock data for development
    console.warn('Google Search API not configured, using mock data')
    return mockSearchResults(query)
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=5`

  try {
    const response = await fetch(url)
    const data = await response.json()

    return (data.items || []).map((item: { title: string; snippet: string; link: string }) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
    }))
  } catch (error) {
    console.error('Google Search API error:', error)
    return mockSearchResults(query)
  }
}

function mockSearchResults(query: string): SearchResult[] {
  return [
    {
      title: `Market Research: ${query}`,
      snippet: `Market analysis for ${query}. Growing demand in this sector.`,
      link: 'https://example.com/market-research',
    },
    {
      title: `Competitors in ${query} space`,
      snippet: `Several players are addressing this market with varying approaches.`,
      link: 'https://example.com/competitors',
    },
  ]
}

export async function generateValidationReport(
  ideaTitle: string,
  ideaDescription: string
): Promise<ValidationReport> {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY

  if (!anthropicApiKey) {
    // Return mock report for development
    return mockReport(ideaTitle, ideaDescription)
  }

  // Search for market data
  const [marketSearch, competitorSearch, redditSearch] = await Promise.all([
    googleSearch(`market size ${ideaTitle} TAM SAM`),
    googleSearch(`competitors ${ideaTitle} alternative`),
    googleSearch(`reddit ${ideaTitle} pain point problem`),
  ])

  // Generate report using Claude
  const prompt = `
You are an expert startup analyst. Generate a validation report for this startup idea:

**Idea Title**: ${ideaTitle}
**Idea Description**: ${ideaDescription}

**Market Research Data**:
${JSON.stringify(marketSearch, null, 2)}

**Competitor Data**:
${JSON.stringify(competitorSearch, null, 2)}

**User Discussion Data**:
${JSON.stringify(redditSearch, null, 2)}

Generate a JSON report with this exact structure:
{
  "overallScore": number (0-100),
  "executiveSummary": string (2-3 paragraphs),
  "greenLights": string[] (3-5 positive signals),
  "redFlags": string[] (3-5 risks),
  "marketSize": {
    "TAM": string,
    "SAM": string,
    "SOM": string
  },
  "competitors": [{"name": string, "description": string, "differentiation": string}],
  "recommendations": string[] (3-5 actionable next steps),
  "swotAnalysis": {
    "strengths": string[],
    "weaknesses": string[],
    "opportunities": string[],
    "threats": string[]
  },
  "targetAudience": {
    "primaryICP": string,
    "demographics": string,
    "psychographics": string,
    "painPoints": string[]
  },
  "goNoGoRecommendation": {
    "recommendation": "GO" | "NO-GO" | "CONDITIONAL",
    "confidence": number (0-100),
    "rationale": string,
    "keyConditions": string[]
  },
  "riskMatrix": [{
    "risk": string,
    "level": "HIGH" | "MEDIUM" | "LOW",
    "impact": "HIGH" | "MEDIUM" | "LOW",
    "likelihood": "HIGH" | "MEDIUM" | "LOW",
    "mitigation": string
  }],
  "revenueModelSuggestions": [{
    "model": string,
    "description": string,
    "pros": string[],
    "cons": string[],
    "estimatedMRR": string
  }]
}

Be honest and critical. Return ONLY valid JSON, no markdown.
`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const content = data.content[0].text

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return mockReport(ideaTitle, ideaDescription)
  } catch (error) {
    console.error('Claude API error:', error)
    return mockReport(ideaTitle, ideaDescription)
  }
}

function mockReport(ideaTitle: string, ideaDescription: string): ValidationReport {
  return {
    overallScore: 72,
    executiveSummary: `This idea addresses a clear pain point in the market. ${ideaDescription} The market shows strong demand signals, though competition exists. Key differentiators will be critical for success.`,
    greenLights: [
      'Strong market demand based on search trends',
      'Clear problem-solution fit identified',
      'Low barrier to entry for initial launch',
      'Growing market segment with tailwinds',
    ],
    redFlags: [
      'Competitive landscape with established players',
      'Customer acquisition costs may be high',
      'Market timing uncertainty',
    ],
    marketSize: {
      TAM: '$10B+ (estimated)',
      SAM: '$500M (addressable)',
      SOM: '$50M (realistic Year 3)',
    },
    competitors: [
      {
        name: 'IdeaProof',
        description: 'AI-powered idea validation platform (€19-99/month)',
        differentiation: 'We focus on affordability ($9.99 one-time) and speed for solo founders',
      },
      {
        name: 'Competitor B',
        description: 'Market research tool for enterprises',
        differentiation: 'We are more specialized for solo founders and indie hackers',
      },
    ],
    recommendations: [
      'Start with a narrow niche (e.g., SaaS founders only)',
      'Build a waitlist before launching',
      'Create content marketing around idea validation',
      'Partner with startup accelerators for distribution',
    ],
    // P0 - Core validation enhancements
    swotAnalysis: {
      strengths: ['First-mover advantage in affordable validation', 'Lean operation with AI-first approach'],
      weaknesses: ['Limited brand recognition', 'Small marketing budget'],
      opportunities: ['Growing solo founder economy', 'Underserved market segment'],
      threats: ['Established competitors lowering prices', 'AI commoditization'],
    },
    targetAudience: {
      primaryICP: 'Solo founders and indie hackers validating their first SaaS idea',
      demographics: '25-45, technical background, $50k-150k income, urban areas',
      psychographics: 'Risk-tolerant, value speed over perfection, DIY mindset, active in online communities',
      painPoints: [
        'Cannot afford expensive validation services (€100+)',
        'Need quick answers before committing months of development',
        'Overwhelmed by complex market research tools',
      ],
    },
    goNoGoRecommendation: {
      recommendation: 'GO',
      confidence: 72,
      rationale: 'Market signals are positive, target segment is underserved, and the lean approach reduces downside risk. Proceed with a focused MVP.',
      keyConditions: [
        'Validate willingness to pay with 10+ customer interviews',
        'Build landing page and collect 100+ email signups',
        'Close 5-10 paying beta customers within 30 days',
      ],
    },
    riskMatrix: [
      {
        risk: 'Market saturation',
        level: 'MEDIUM',
        impact: 'HIGH',
        likelihood: 'MEDIUM',
        mitigation: 'Focus on underserved solo founder segment with pricing differentiation',
      },
      {
        risk: 'Low conversion rate',
        level: 'HIGH',
        impact: 'HIGH',
        likelihood: 'MEDIUM',
        mitigation: 'Implement freemium model with strong free tier to build trust',
      },
      {
        risk: 'API cost overrun',
        level: 'LOW',
        impact: 'MEDIUM',
        likelihood: 'LOW',
        mitigation: 'Implement usage caps and caching to control AI API costs',
      },
    ],
    revenueModelSuggestions: [
      {
        model: 'One-time payment',
        description: '$9.99 per validation report',
        pros: ['Low friction', 'Clear value proposition', 'No churn concerns'],
        cons: ['No recurring revenue', 'Need constant new customer acquisition'],
        estimatedMRR: '$2,000-5,000 (200-500 customers/month)',
      },
      {
        model: 'Subscription',
        description: '$29/month for 3 reports',
        pros: ['Recurring revenue', 'Higher LTV', 'Predictable income'],
        cons: ['Higher churn risk', 'Need continuous value delivery'],
        estimatedMRR: '$3,000-8,000 (100-300 subscribers)',
      },
      {
        model: 'Freemium + Upsell',
        description: 'Free basic report, $9.99 for premium',
        pros: ['Large top of funnel', 'Product-led growth', 'Viral potential'],
        cons: ['Low conversion rate (2-5%)', 'High infrastructure costs'],
        estimatedMRR: '$1,500-4,000 (depends on conversion)',
      },
    ],
  }
}
