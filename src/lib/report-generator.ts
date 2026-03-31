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
    strengths?: string[]
    weaknesses?: string[]
  }>
  recommendations: string[]
  // Market trends
  marketTrends?: Array<{
    trend: string
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
    description: string
  }>
  // Customer validation
  customerValidation?: {
    problemSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    problemEvidence: string[]
    willingnessToPay: 'HIGH' | 'MEDIUM' | 'LOW'
    suggestedPricePoint: string
    earlyAdopterProfile: string
  }
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
    behaviorPatterns?: string[]
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
    implementationSteps?: string[]
  }>
  // NEW: Financial projections
  financialProjections?: {
    year1Revenue: string
    year2Revenue: string
    year3Revenue: string
    keyAssumptions: string[]
    breakEvenTimeline: string
    capitalRequired: string
  }
  // NEW: MVP Roadmap
  mvpRoadmap?: {
    phase1: { name: string; timeline: string; features: string[]; goal: string }
    phase2: { name: string; timeline: string; features: string[]; goal: string }
    phase3: { name: string; timeline: string; features: string[]; goal: string }
  }
  // NEW: Go-to-Market Strategy
  goToMarketStrategy?: {
    positioning: string
    channels: Array<{
      channel: string
      rationale: string
      expectedCAC: string
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
    }>
    launchStrategy: string
  }
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
You are an expert startup analyst with 20+ years of experience evaluating startups for Y Combinator and top VCs. Generate a COMPREHENSIVE, DEEP validation report for this startup idea.

**Idea Title**: ${ideaTitle}
**Idea Description**: ${ideaDescription}

**Market Research Data**:
${JSON.stringify(marketSearch, null, 2)}

**Competitor Data**:
${JSON.stringify(competitorSearch, null, 2)}

**User Discussion Data**:
${JSON.stringify(redditSearch, null, 2)}

CRITICAL REQUIREMENTS:
1. Be SPECIFIC - avoid generic advice. Use concrete numbers, names, and data points.
2. Be CRITICAL - identify real risks and challenges, not just positive feedback.
3. Be ACTIONABLE - every recommendation should have clear next steps.
4. Be DEEP - each section should have 5-7 detailed points, not surface-level observations.
5. Use DATA - reference market size, growth rates, and industry benchmarks where possible.

Generate a JSON report with this EXACT structure:
{
  "overallScore": number (0-100, be honest and critical),
  "executiveSummary": string (4-5 detailed paragraphs covering: problem, solution, market opportunity, competitive landscape, key risks, and final recommendation),
  "greenLights": string[] (5-7 specific positive signals with data/explanation),
  "redFlags": string[] (5-7 specific risks with severity explanation),
  "marketSize": {
    "TAM": string (with calculation methodology and source),
    "SAM": string (with segmentation logic),
    "SOM": string (with realistic market share assumptions)
  },
  "competitors": [
    {
      "name": string (real company names if known),
      "description": string (detailed - what they do, funding, positioning),
      "differentiation": string (specific how this idea can differentiate),
      "strengths": string[],
      "weaknesses": string[]
    }
  ],
  "marketTrends": [
    {
      "trend": string,
      "impact": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
      "description": string (detailed explanation with data)
    }
  ],
  "customerValidation": {
    "problemSeverity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    "problemEvidence": string[] (quotes or data from Reddit/user discussions),
    "willingnessToPay": "HIGH" | "MEDIUM" | "LOW",
    "suggestedPricePoint": string,
    "earlyAdopterProfile": string (detailed description)
  },
  "recommendations": string[] (7-10 specific, actionable steps with priority order),
  "swotAnalysis": {
    "strengths": string[] (5-7 items, specific to this idea),
    "weaknesses": string[] (5-7 items, honest assessment),
    "opportunities": string[] (5-7 items, market tailwinds),
    "threats": string[] (5-7 items, competitive and market risks)
  },
  "targetAudience": {
    "primaryICP": string (detailed persona with name, role, company size, industry),
    "demographics": string (age, income, location, education, job title),
    "psychographics": string (values, motivations, fears, aspirations),
    "painPoints": string[] (5-7 specific pains with context),
    "behaviorPatterns": string[] (where they hang out, what they read, buying behavior)
  },
  "goNoGoRecommendation": {
    "recommendation": "GO" | "NO-GO" | "CONDITIONAL",
    "confidence": number (0-100),
    "rationale": string (3-4 detailed paragraphs explaining the reasoning),
    "keyConditions": string[] (5-7 specific milestones to achieve)
  },
  "riskMatrix": [
    {
      "risk": string,
      "level": "HIGH" | "MEDIUM" | "LOW",
      "impact": "HIGH" | "MEDIUM" | "LOW",
      "likelihood": "HIGH" | "MEDIUM" | "LOW",
      "mitigation": string (specific, actionable mitigation strategy)
    }
  ],
  "revenueModelSuggestions": [
    {
      "model": string,
      "description": string (detailed explanation),
      "pros": string[] (3-4 items),
      "cons": string[] (3-4 items),
      "estimatedMRR": string,
      "implementationSteps": string[] (3-5 steps to implement)
    }
  ],
  "financialProjections": {
    "year1Revenue": string,
    "year2Revenue": string,
    "year3Revenue": string,
    "keyAssumptions": string[],
    "breakEvenTimeline": string,
    "capitalRequired": string
  },
  "mvpRoadmap": {
    "phase1": {
      "name": string,
      "timeline": string,
      "features": string[],
      "goal": string
    },
    "phase2": {
      "name": string,
      "timeline": string,
      "features": string[],
      "goal": string
    },
    "phase3": {
      "name": string,
      "timeline": string,
      "features": string[],
      "goal": string
    }
  },
  "goToMarketStrategy": {
    "positioning": string (one paragraph positioning statement),
    "channels": [
      {
        "channel": string,
        "rationale": string,
        "expectedCAC": string,
        "priority": "HIGH" | "MEDIUM" | "LOW"
      }
    ],
    "launchStrategy": string (detailed pre-launch, launch, post-launch plan)
  }
}

Return ONLY valid JSON, no markdown formatting. Make every section SUBSTANTIAL and SPECIFIC.
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
    executiveSummary: `This idea addresses a clear pain point in the ${ideaTitle.split(' ')[0] || 'startup'} market. ${ideaDescription}

Our analysis shows strong demand signals with the total addressable market growing at 15% CAGR. The problem is validated through extensive user discussions on Reddit and industry forums where founders consistently mention frustration with existing solutions.

However, the competitive landscape is crowded with established players like IdeaProof (€19-99/month) and traditional market research firms. Success will require clear differentiation through pricing ($9.99 one-time vs subscription), speed (120s analysis), and focus on the underserved solo founder segment.

Key success factors include: (1) building trust through free preview, (2) demonstrating ROI through detailed case studies, (3) leveraging community-led growth through IndieHackers and Twitter. The lean approach reduces capital requirements but demands exceptional execution on distribution.

Final assessment: Market opportunity is real but execution risk is high. Recommend proceeding with focused MVP targeting solo SaaS founders, validating willingness-to-pay with 10+ paying beta customers before scaling.`,
    greenLights: [
      'Strong market demand: 500+ monthly searches for "validate startup idea" with 25% YoY growth',
      'Clear problem-solution fit: 78% of founders skip validation, leading to 89% failure rate',
      'Low barrier to entry: AI-first approach enables 120s turnaround vs industry standard 2-3 days',
      'Growing market segment: Solo founder economy up 37% since 2020 (10M+ globally)',
      'Pricing arbitrage: $9.99 one-time vs €19-99/month creates 10x affordability advantage',
      'Community tailwinds: IndieHackers, Product Hunt, Twitter provide organic distribution channels',
      'Validated willingness-to-pay: Competitors doing $100k+ MRR proves market exists',
    ],
    redFlags: [
      'Competitive saturation: 15+ validation tools ranging from free to $500/month',
      'Customer acquisition costs: Paid channels (Google/FB) averaging $50-150 per customer',
      'Low conversion risk: Free-to-paid conversion typically 2-5% in this category',
      'AI commoditization: Barrier to entry decreasing as AI APIs become cheaper/ubiquitous',
      'Trust deficit: New entrants must overcome skepticism about AI-generated reports',
      'Churn concerns: One-time payment model requires constant new customer acquisition',
      'Market timing: AI hype peak may create unrealistic expectations about capabilities',
    ],
    marketSize: {
      TAM: '$12.5B - Global market research and analysis software (Grand View Research 2024)',
      SAM: '$850M - Online business validation and planning tools for SMB/startups',
      SOM: '$42M Year 3 - Assuming 5% capture of SAM with $9.99 one-time + $29/month mix',
    },
    competitors: [
      {
        name: 'IdeaProof',
        description: 'AI-powered idea validation platform (€19-99/month, 10k+ users, founded 2022). Offers brand strategy, marketing suite, 9 free calculators. 4.8/5 rating.',
        differentiation: 'We focus on affordability ($9.99 one-time) and speed for solo founders. They target established startups with bigger budgets.',
        strengths: ['Comprehensive feature set', 'Strong brand', 'Free calculator matrix'],
        weaknesses: ['Expensive for solo founders', 'Complex UI', 'Subscription-only pricing'],
      },
      {
        name: 'Upmetrics',
        description: 'Business plan software with AI capabilities ($16.58/month). 500k+ users. Focus on traditional business planning.',
        differentiation: 'We are faster (120s vs hours), cheaper, and validation-focused vs their document-generation approach.',
        strengths: ['Established player', 'Template library', 'Financial projections'],
        weaknesses: ['Slower', 'Generic templates', 'Less AI-driven insights'],
      },
      {
        name: 'Enloop',
        description: 'Automated business plan generation ($19.95/month). Older platform with dated UX.',
        differentiation: 'Modern UX, validation-first approach, transparent scoring vs their generic plan generation.',
        strengths: ['First-mover advantage', 'SEO presence', 'Industry partnerships'],
        weaknesses: ['Dated product', 'Poor UX', 'Limited AI capabilities'],
      },
    ],
    marketTrends: [
      {
        trend: 'AI-First Business Tools Explosion',
        impact: 'POSITIVE',
        description: '2024-2026 saw 400% increase in AI-powered business tools. Validates market readiness but increases competition. Key opportunity: differentiate through specialization vs horizontal AI tools.',
      },
      {
        trend: 'Solo Founder Economy Boom',
        impact: 'POSITIVE',
        description: '10M+ solo founders globally (up from 7.3M in 2020). $100B+ collective revenue. Underserved by traditional enterprise tools. Perfect ICP for our product.',
      },
      {
        trend: 'Subscription Fatigue',
        impact: 'POSITIVE',
        description: '67% of SMBs cutting SaaS subscriptions in 2025. One-time pricing ($9.99) positioned as alternative to monthly commitments. Competitive advantage vs IdeaProof subscription model.',
      },
      {
        trend: 'Validation Before Building Movement',
        impact: 'POSITIVE',
        description: 'YC, a16z, and top VCs now mandate validation before funding. "Build less, validate more" philosophy mainstream. Tailwind for adoption.',
      },
      {
        trend: 'AI Quality Concerns',
        impact: 'NEGATIVE',
        description: 'Growing skepticism about AI-generated business advice. 45% of founders report "generic, useless" outputs. Must demonstrate superior quality to overcome bias.',
      },
      {
        trend: 'Google Algorithm Updates (SGE)',
        impact: 'NEGATIVE',
        description: 'Search Generative Experience may reduce organic traffic to how-to/validation content. Risk to content marketing strategy. Mitigation: community-led growth.',
      },
    ],
    customerValidation: {
      problemSeverity: 'HIGH',
      problemEvidence: [
        '"Spent 6 months building my SaaS only to find zero demand. Wish I had validated first." - r/SaaS',
        '"How do you validate an idea before building?" 250+ comments, r/startups weekly thread',
        '"Failed my first startup because no one wanted it. Now I validate everything with $500 in ads first." - IndieHackers',
      ],
      willingnessToPay: 'MEDIUM',
      suggestedPricePoint: '$9.99 one-time or $29/month (3 reports)',
      earlyAdopterProfile: 'Technical solo founders (25-40) building first SaaS. Active on Twitter/IndieHackers. Previously failed due to no market validation. Income $80k-200k. Values speed over perfection. Skeptical but curious about AI.',
    },
    recommendations: [
      '[WEEK 1-2] Build waitlist landing page with clear value prop. Run $200 Google Ads to validate CTR and signup rate. Target: 100+ signups, 5%+ CTR.',
      '[WEEK 3-4] Recruit 10 beta users from waitlist. Offer lifetime free access for detailed feedback. Conduct 1-hour interviews to understand decision criteria.',
      '[WEEK 5-6] Launch on Product Hunt with special PH pricing ($4.99 first report). Target: Top 5 Product of Day, 50+ paying customers.',
      '[MONTH 2] Build distribution partnerships: IndieHackers sponsor, YC Startup School community posts, Twitter influencer affiliates.',
      '[MONTH 3] Implement freemium: Free basic report (score + summary) to build trust. $9.99 unlock for full analysis. Target 5%+ conversion.',
      '[MONTH 4] Launch content engine: 2x weekly Twitter threads, 1x monthly deep-dive case studies, guest posts on popular startup blogs.',
      '[MONTH 5] Expand to adjacent use cases: Existing startup pivots, intrapreneur validation, accelerator portfolio screening.',
      '[MONTH 6] Build moat: Proprietary dataset from 1000+ validations, case studies, testimonials, comparison pages vs competitors.',
      '[ONGOING] Monitor unit economics: Target CAC <$30, LTV >$60 (one-time + 20% repeat rate). Kill channels that don\'t meet targets.',
      '[ONGOING] Weekly product iteration based on user feedback. Ship 2-3 improvements per week. Public changelog for transparency.',
    ],
    // P0 - Core validation enhancements
    swotAnalysis: {
      strengths: [
        'First-mover advantage in affordable validation segment ($9.99 vs €19-99)',
        'AI-first architecture enables 120s turnaround (10x faster than competitors)',
        'Lean operation: No VC pressure, profitability-focused, rapid iteration',
        'Modern UX: Built with Next.js 14 vs competitors\' legacy tech stacks',
        'Transparent scoring: Clear methodology vs black-box alternatives',
        'Community credibility: Founder actively building in public on Twitter',
        'Flexible pricing: One-time + subscription options vs subscription-only',
      ],
      weaknesses: [
        'Zero brand recognition vs established players (IdeaProof 10k+ users)',
        'Limited marketing budget: Cannot compete on paid acquisition initially',
        'No proprietary data: AI outputs only as good as search results provided',
        'Small team: Likely solo founder vs competitors with 10+ person teams',
        'No funding: Bootstrap constraints vs VC-backed growth acceleration',
        'Limited feature set: Missing calculators, brand tools, marketing suite',
        'No enterprise features: Single user focus vs team collaboration',
      ],
      opportunities: [
        'Solo founder economy growing 37%: 10M+ potential users globally',
        'YC and top accelerators emphasizing validation: Institutional tailwind',
        'AI skepticism creating quality differentiation opportunity',
        'Subscription fatigue: One-time pricing as competitive advantage',
        'Underserved markets: Non-US founders, non-English validation',
        'Community partnerships: Accelerators, co-working spaces, startup communities',
        'Adjacent use cases: Corporate innovation, student entrepreneurs, consultants',
      ],
      threats: [
        'IdeaProof or competitors launching budget tier to compete on price',
        'AI API costs increasing: Margins compressed if pricing pressure continues',
        'Google SGE reducing organic search traffic to validation content',
        'New entrants with lower prices ($5 or free using open-source models)',
        'Economic downturn reducing founder spending on validation tools',
        'Platform risk: Twitter/IndieHackers algorithm changes reducing organic reach',
        'Regulatory: AI disclosure requirements, business advice liability concerns',
      ],
    },
    targetAudience: {
      primaryICP: 'Alex, 32, software engineer at Big Tech. Saving 2 years to build first SaaS. Previously failed due to no market validation. Income $180k, savings $100k. Risk-tolerant but financially constrained vs VC-backed founders.',
      demographics: '25-45 years old, 70% male / 30% female, technical background (engineers, product managers), $80k-200k income, urban areas (SF, NYC, London, Berlin, Bangalore), 80% US/Europe, 20% other.',
      psychographics: 'Rational decision-makers who value data over intuition. Skeptical of hype but open to AI if ROI is clear. Time-poor (full-time job), need quick answers. DIY mindset but recognize knowledge gaps. Active in online communities, trust peer recommendations over marketing. Motivated by financial independence, fear of wasting years building something nobody wants.',
      painPoints: [
        'Cannot afford expensive validation services (€100+/month) while saving for runway',
        'Overwhelmed by complex market research tools designed for enterprises',
        'Previous failure due to skipping validation - traumatized, now hyper-cautious',
        'Imposter syndrome: "Do I have what it takes?" Seeks external validation',
        'Analysis paralysis: Too much conflicting advice online, needs clear framework',
        'Time pressure: Burning savings, need to validate fast or return to job',
        'Trust issues: Skeptical of AI, coaches, gurus - been burned before',
      ],
      behaviorPatterns: [
        'Hangs out: r/SaaS, r/startups, IndieHackers, Twitter (#buildinpublic), YC Startup School forum',
        'Reads: Paul Graham essays, The Mom Test, Lean Startup, Stratechery, Lenny\'s Newsletter',
        'Buys based on: Peer recommendations, transparent pricing, free trial results',
        'Rejects: Sales calls, opaque pricing, long contracts, enterprise features',
      ],
    },
    goNoGoRecommendation: {
      recommendation: 'GO',
      confidence: 72,
      rationale: `Market signals are strongly positive. The solo founder segment is large (10M+), growing (37% since 2020), and underserved by existing solutions priced at €19-99/month. Our $9.99 one-time pricing creates a 10x affordability advantage that should drive initial adoption.

The problem is validated through extensive user discussions where founders consistently express regret about not validating earlier. Competitors are proving willingness-to-pay at higher price points, creating a pricing umbrella we can exploit.

However, execution risk is REAL. This is not a "build it and they will come" market. Success requires: (1) exceptional product quality that overcomes AI skepticism, (2) community-led growth strategy since we can't outspend competitors on ads, (3) rapid iteration based on user feedback, (4) content engine that builds organic reach over 6-12 months.

The lean approach reduces downside risk. Initial investment is time vs capital. If we achieve 500 customers in 6 months ($5k revenue), we validate the business and can reinvest in growth. If we fail to find traction, we've invested 6 months of nights/weekends vs $100k+ in failed startup.

Key insight: We're not selling validation reports. We're selling CONFIDENCE before commitment. The emotional value (avoiding another failed startup) far exceeds the functional value (PDF report). Marketing should lead with this insight.`,
      keyConditions: [
        'Validate willingness-to-pay: 10+ paying beta customers at $9.99 within 30 days (not just "interesting" feedback)',
        'Build landing page: Achieve 5%+ visitor-to-signup rate with $200 Google Ads test (proves value prop resonates)',
        'Product Hunt launch: Top 5 Product of Day, 50+ paying customers in first week (proves launch strategy)',
        'Unit economics: CAC <$30, 5%+ free-to-paid conversion (proves scalable acquisition)',
        'Product quality: 80%+ of beta users rate report "useful" or "very useful" in post-purchase survey',
        'Repeat/referral rate: 20%+ of customers either return for second report or refer a friend (proves satisfaction)',
        'Founder commitment: Ability to invest 20+ hours/week for 6 months while maintaining day job',
      ],
    },
    riskMatrix: [
      {
        risk: 'Market saturation - 15+ competitors ranging from free to $500/month',
        level: 'MEDIUM',
        impact: 'HIGH',
        likelihood: 'MEDIUM',
        mitigation: 'Focus positioning on underserved solo founder segment with pricing differentiation ($9.99 one-time). Avoid head-to-head competition with enterprise players. Lead with "built for founders like you" messaging vs feature comparisons.',
      },
      {
        risk: 'Low conversion rate - Free users don\'t upgrade to paid',
        level: 'HIGH',
        impact: 'HIGH',
        likelihood: 'MEDIUM',
        mitigation: 'Implement freemium with STRONG free tier (real value, not teaser). Free preview shows score + summary - enough to prove quality, not enough to satisfy curiosity. A/B test pricing page, add urgency (limited-time discount), showcase testimonials prominently.',
      },
      {
        risk: 'High CAC - Paid channels too expensive for bootstrap budget',
        level: 'MEDIUM',
        impact: 'HIGH',
        likelihood: 'HIGH',
        mitigation: 'Double down on community-led growth: (1) Build in public on Twitter, (2) Active IndieHackers presence, (3) Guest posts on startup blogs, (4) Partner with micro-influencers (revenue share vs upfront), (5) SEO for long-tail keywords competitors ignore.',
      },
      {
        risk: 'AI quality concerns - Reports too generic, damaging reputation',
        level: 'HIGH',
        impact: 'HIGH',
        likelihood: 'LOW',
        mitigation: 'Invest heavily in prompt engineering (this is the moat). Use search-augmented generation with real market data. Implement quality scoring - if AI confidence is low, say so honestly. Collect and showcase specific examples where reports were accurate/valuable.',
      },
      {
        risk: 'Competitor response - IdeaProof launches $9.99 tier',
        level: 'LOW',
        impact: 'HIGH',
        likelihood: 'LOW',
        mitigation: 'Speed is our advantage. They have existing revenue (€19-99/month) to protect. Price war hurts them more than us. Build brand loyalty through community engagement. First-mover advantage in solo founder segment creates switching costs.',
      },
      {
        risk: 'API cost overrun - AI costs exceed revenue at $9.99 price',
        level: 'LOW',
        impact: 'MEDIUM',
        likelihood: 'LOW',
        mitigation: 'Model costs per report: ~$0.50-1.50 in API calls. At $9.99, gross margin 85%+. Implement caching (same idea shouldn\'t trigger new searches). Add rate limits. For subscription, limit to 3 reports/month at $29 tier.',
      },
      {
        risk: 'Founder burnout - Solo founder trying to build while working FT',
        level: 'MEDIUM',
        impact: 'MEDIUM',
        likelihood: 'MEDIUM',
        mitigation: 'Set realistic timeline: 6 months to meaningful revenue, 2 years to replace FT income. Protect nights/weekends for deep work. Outsource non-core tasks early (design, content) even if marginally profitable. Join founder community for accountability.',
      },
    ],
    revenueModelSuggestions: [
      {
        model: 'One-time payment',
        description: '$9.99 per validation report. No subscription required. Pay-per-use model similar to buying a book or course.',
        pros: [
          'Lowest friction - easier to get first purchase than subscription',
          'Clear value prop - "less than lunch" positioning',
          'No churn concerns - customers don\'t feel locked in',
          'Higher conversion rate from free users (5%+ vs 2% for subscription)',
        ],
        cons: [
          'No recurring revenue - LBO business model, constantly acquiring new customers',
          'Lower LTV - One-time buyer worth $9.99 vs subscriber worth $58+ (2 months avg)',
          'Revenue volatility - Harder to predict monthly revenue',
          'Less investor appeal - MRR metrics are standard for SaaS valuations',
        ],
        estimatedMRR: '$2,000-8,000 (200-800 customers/month at $9.99)',
        implementationSteps: [
          'Implement Stripe Checkout for one-time payments',
          'Create product page emphasizing "$9.99 < dinner" comparison',
          'Add urgency: "Limited-time launch pricing" for first 100 customers',
          'Implement email sequence for repeat purchases (validate another idea)',
        ],
      },
      {
        model: 'Subscription (Pro tier)',
        description: '$29/month for 3 validation reports per month. Resets monthly. Target: Serial entrepreneurs and small studios validating multiple ideas.',
        pros: [
          'Recurring revenue - Predictable MRR for planning and fundraising',
          'Higher LTV - Avg subscriber stays 2-3 months = $58-87 vs $9.99 one-time',
          'Better unit economics - Can afford higher CAC for subscribers',
          'Investor-friendly - Standard SaaS metrics apply',
        ],
        cons: [
          'Higher churn - Solo founders validate 1-2 ideas then cancel',
          'Subscription fatigue - Another monthly charge to manage',
          'Smaller TAM - Only serial entrepreneurs find value vs all founders',
          'Support burden - Subscribers expect ongoing value and features',
        ],
        estimatedMRR: '$3,000-12,000 (100-400 subscribers, assuming 8-12% monthly churn)',
        implementationSteps: [
          'Implement Stripe Billing for subscription management',
          'Add usage tracking (3 reports/month limit)',
          'Build subscriber dashboard showing usage and renewal date',
          'Create retention emails: "You have 1 report left this month"',
        ],
      },
      {
        model: 'Freemium + Upsell',
        description: 'Free basic report (score + executive summary + 1 green/red flag). $9.99 to unlock full report with all sections, PDF download, and unlimited views.',
        pros: [
          'Largest top of funnel - Removes all friction to try',
          'Product-led growth - Users experience value before paying',
          'Viral potential - Free users share reports, driving organic acquisition',
          'Data moat - Free tier generates data to improve AI quality',
        ],
        cons: [
          'Low conversion rate - Industry standard 2-5% free-to-paid',
          'High infrastructure costs - AI API costs for free users who never convert',
          'Free user support burden - Can be 80%+ of support tickets',
          'Complex product decisions - What to include in free vs paid?',
        ],
        estimatedMRR: '$1,500-6,000 (1,000-3,000 free users, 2-5% conversion at $9.99)',
        implementationSteps: [
          'Implement user accounts (Supabase Auth)',
          'Build free report preview (read-only, limited sections)',
          'Add paywall modal after user engages with free report',
          'Implement usage caps (1 free report per email address)',
        ],
      },
      {
        model: 'Hybrid (Recommended)',
        description: 'Combine all three: Free preview (no account required), $9.99 one-time unlock, $29/month for 3 reports. Let users self-select into appropriate tier.',
        pros: [
          'Captures all segments - One-time buyers, subscribers, free users',
          'Optimizes for LTV - Users can upgrade as needs grow',
          'Reduces risk - Not dependent on single pricing model',
          'Data-driven optimization - Can shift emphasis based on what converts',
        ],
        cons: [
          'Complex pricing page - More cognitive load for visitors',
          'Cannibalization risk - Some subscribers would have paid one-time',
          'Operational complexity - Managing multiple pricing tiers',
          'A/B testing overhead - Need to optimize multiple conversion funnels',
        ],
        estimatedMRR: '$4,000-15,000 (mix of one-time + subscription, 500-1,500 customers/month)',
        implementationSteps: [
          'Build pricing page with 3 tiers clearly differentiated',
          'Implement both Stripe Checkout (one-time) and Billing (subscription)',
          'Add analytics to track which tier converts best from which traffic source',
          'Plan to deprecate underperforming tier after 3 months of data',
        ],
      },
    ],
    financialProjections: {
      year1Revenue: '$48,000 (avg $4k/month by month 12, ramping from $500/month in month 1)',
      year2Revenue: '$180,000 (avg $15k/month, compounding growth from content and word-of-mouth)',
      year3Revenue: '$420,000 (avg $35k/month, potential hire of first employee, expand to adjacent products)',
      keyAssumptions: [
        'Month 1-3: 50-100 customers/month (launch novelty, founder audience)',
        'Month 4-6: 200-400 customers/month (Product Hunt, early content SEO)',
        'Month 7-12: 400-800 customers/month (compound growth, partnerships)',
        'Pricing: 80% one-time ($9.99), 20% subscription ($29/month)',
        'Conversion: 3% website visitor to customer (industry average for PLG)',
        'Churn: 12% monthly for subscription tier (industry average)',
        'No major competitor price wars or market disruptions',
      ],
      breakEvenTimeline: 'Month 4-6 (assuming $500/month fixed costs: hosting, APIs, domains, tools). Break-even defined as monthly revenue > monthly expenses. Founder time not included in expenses.',
      capitalRequired: '$2,000 initial (incorporation, design, initial API costs, domain/tools). Ongoing: $500-2,000/month depending on usage. Revenue should fund growth by month 4. No external funding required or recommended at this stage.',
    },
    mvpRoadmap: {
      phase1: {
        name: 'Validation MVP',
        timeline: 'Week 1-4',
        features: [
          'Landing page with email capture',
          'Basic report generation (score + summary + 3 green/red flags)',
          'Stripe one-time payment ($9.99)',
          'PDF download (basic formatting)',
          'Manual Google Search API integration',
        ],
        goal: 'Validate willingness-to-pay with 10+ paying beta customers. Prove core value prop: "AI can generate useful validation in 120s."',
      },
      phase2: {
        name: 'Growth MVP',
        timeline: 'Month 2-3',
        features: [
          'Full report (all P0 sections: SWOT, ICP, GO/NO-GO, Risk Matrix, Revenue Models)',
          'Subscription option ($29/month)',
          'User accounts (save report history)',
          'Enhanced PDF (3-page professional formatting)',
          'Product Hunt launch infrastructure',
          'Basic analytics (conversion tracking)',
        ],
        goal: 'Achieve 100+ paying customers, 5%+ free-to-paid conversion. Validate Product Hunt launch strategy. Establish baseline unit economics.',
      },
      phase3: {
        name: 'Scale MVP',
        timeline: 'Month 4-6',
        features: [
          'Freemium tier (free basic report)',
          'Enhanced AI (search-augmented with real market data)',
          'Comparison pages (vs IdeaProof, vs Upmetrics)',
          'Affiliate program (20% commission)',
          'Content engine (2x weekly Twitter, 1x monthly case studies)',
          'Partnership integrations (co-working spaces, accelerators)',
        ],
        goal: 'Achieve $10k MRR, prove scalable acquisition channels (CAC < $30). Build moat through proprietary data and community relationships.',
      },
    },
    goToMarketStrategy: {
      positioning: 'For solo founders who need to validate their startup idea before quitting their job, IdeaValidationLite is the AI-powered validation tool that delivers investor-ready reports in 120 seconds. Unlike expensive alternatives (€19-99/month) designed for funded startups, we offer affordable one-time pricing ($9.99) and are built specifically for the underserved solo founder economy.',
      channels: [
        {
          channel: 'Twitter / X (Build in Public)',
          rationale: 'Founder already has audience. #buildinpublic community highly engaged. Competitors successfully using this channel. Low cost, high time investment.',
          expectedCAC: '$0 (time investment only)',
          priority: 'HIGH',
        },
        {
          channel: 'IndieHackers',
          rationale: 'Exact ICP concentration. 50k+ active solo founders. Founder-friendly culture. Products like this successfully launched here.',
          expectedCAC: '$0 (community participation)',
          priority: 'HIGH',
        },
        {
          channel: 'Product Hunt',
          rationale: 'Launch multiplier effect. 50k+ daily visitors, heavily weighted to early adopters. Top 5 products get 500+ customers day-of.',
          expectedCAC: '$0 (but requires relationship building pre-launch)',
          priority: 'HIGH',
        },
        {
          channel: 'Content SEO',
          rationale: 'Long-term moat. "Validate startup idea" = 500+ monthly searches, commercial intent. 6-12 month play, not immediate.',
          expectedCAC: '$0 (time investment, compound returns)',
          priority: 'MEDIUM',
        },
        {
          channel: 'Paid Ads (Google/FB)',
          rationale: 'Scalable if unit economics work. Test with $200-500/month. Kill if CAC > $30.',
          expectedCAC: '$50-150 (highly variable, test to validate)',
          priority: 'LOW',
        },
        {
          channel: 'Partnerships (Accelerators)',
          rationale: 'YC, Techstars, etc. have 1000s of startups. Offer free tier for portfolio. Potential for 100+ customers per partnership.',
          expectedCAC: '$0 (but requires outreach and relationship building)',
          priority: 'MEDIUM',
        },
      ],
      launchStrategy: `PRE-LAUNCH (Week 1-3):
- Build waitlist landing page with clear value prop
- Share journey on Twitter daily (followers growth = launch audience)
- DM 50+ IndieHackers/PH friends for launch day support
- Create launch assets: demo video, screenshots, testimonials from beta users

LAUNCH DAY (Week 4 - Product Hunt):
- Publish at 12:01 AM PT for maximum day visibility
- Mobilize Twitter/IndieHackers network for upvotes in first 3 hours
- Respond to EVERY comment within 30 minutes
- Offer PH-exclusive pricing ($4.99 first report, 48-hour window)
- Target: Top 5 Product of Day, 50+ customers, 500+ upvotes

POST-LAUNCH (Month 2-6):
- Convert PH traffic to email subscribers (80% won't buy day-of)
- Email sequence: Day 1 thank you, Day 3 case study, Day 7 limited discount
- Retargeting ads for cart abandoners
- Collect and showcase testimonials from PH customers
- Begin content engine: 2x weekly Twitter threads, 1x monthly deep-dives
- Outreach to 10 accelerators for partnership discussions`,
    },
  }
}
