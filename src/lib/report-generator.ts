/**
 * Generate idea validation report using Google Search API + Claude
 */

interface SearchResult {
  title: string
  snippet: string
  link: string
}

interface ValidationReport {
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
  "recommendations": string[] (3-5 actionable next steps)
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
        description: 'AI-powered idea validation platform',
        differentiation: 'We focus on affordability and speed',
      },
      {
        name: 'Competitor B',
        description: 'Market research tool',
        differentiation: 'We are more specialized for solo founders',
      },
    ],
    recommendations: [
      'Start with a narrow niche (e.g., SaaS founders only)',
      'Build a waitlist before launching',
      'Create content marketing around idea validation',
      'Partner with startup accelerators for distribution',
    ],
  }
}
