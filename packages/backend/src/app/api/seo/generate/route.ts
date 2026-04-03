import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/seo/generate
 *
 * Generates SEO-optimized content for a validation report
 * and publishes it as a public page.
 *
 * Accepts:
 * - ideaTitle: string
 * - reportData: object (the generated validation report)
 *
 * Returns:
 * - slug: string (for URL)
 * - seoPage: object (created SEO page data)
 */
export async function POST(request: NextRequest) {
  try {
    const { ideaTitle, reportData } = await request.json()

    if (!ideaTitle || !reportData) {
      return NextResponse.json(
        { error: 'ideaTitle and reportData are required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase not configured')
      return NextResponse.json(
        { error: 'Server configuration error: Supabase credentials missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate SEO content using AI
    const seoContent = await generateSeoContent(ideaTitle, reportData)

    // Generate unique slug
    const slug = generateSlug(ideaTitle)

    // Check if report exists and update it
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingReport) {
      // Update existing report
      await supabase
        .from('reports')
        .update({
          is_public: true,
          metadata: {
            ...(reportData as Record<string, unknown>),
            seo: seoContent,
          },
        })
        .eq('id', existingReport.id)
    } else {
      // Find the most recent report with this title and update it
      const { data: recentReport } = await supabase
        .from('reports')
        .select('id')
        .eq('title', ideaTitle)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (recentReport) {
        await supabase
          .from('reports')
          .update({
            is_public: true,
            slug,
            metadata: {
              ...(reportData as Record<string, unknown>),
              seo: seoContent,
            },
          })
          .eq('id', recentReport.id)
      }
    }

    // Create or update SEO page
    const { data: seoPage, error: seoError } = await supabase
      .from('seo_pages')
      .upsert({
        title: seoContent.metaTitle,
        slug,
        content: seoContent.content,
        meta_title: seoContent.metaTitle,
        meta_description: seoContent.metaDescription,
        keywords: seoContent.keywords,
        status: 'published',
      }, {
        onConflict: 'slug',
      })
      .select()
      .single()

    if (seoError) {
      console.error('Failed to create SEO page:', seoError)
      return NextResponse.json(
        { error: 'Failed to create SEO page' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      slug,
      seoPage,
      message: 'SEO page published successfully',
    })
  } catch (error) {
    console.error('Error generating SEO content:', error)
    return NextResponse.json(
      { error: 'Failed to generate SEO content: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

/**
 * Generate SEO-optimized content using AI
 */
async function generateSeoContent(ideaTitle: string, reportData: unknown) {
  // Extract key information from report
  const report = reportData as {
    executiveSummary?: string
    marketSize?: { tam?: string; sam?: string; som?: string }
    targetAudience?: { primary?: string }
    competitors?: Array<{ name?: string }>
    greenLights?: Array<{ title?: string }>
    redFlags?: Array<{ title?: string }>
    overallScore?: number
  }

  // Generate keywords from title
  const baseKeywords = ideaTitle
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5)

  const industryKeywords = ['startup validation', 'business idea', 'market analysis', 'feasibility study']
  const longTailKeywords = [
    `how to validate ${ideaTitle.toLowerCase()}`,
    `${ideaTitle.toLowerCase()} market research`,
    `is ${ideaTitle.toLowerCase()} a good business idea`,
    `${ideaTitle.toLowerCase()} competitor analysis`,
  ]

  const keywords = [...baseKeywords, ...industryKeywords, ...longTailKeywords].slice(0, 15)

  // Generate meta title (max 60 chars)
  const metaTitle = `${ideaTitle} - AI Startup Validation Report | IdeaProof`

  // Generate meta description (max 160 chars)
  const summary = report.executiveSummary || ''
  const metaDescription = summary
    .replace(/\n/g, ' ')
    .substring(0, 155)
    .trim() + (summary.length > 155 ? '...' : '')

  // Generate SEO content body
  const content = generateSeoContentBody(ideaTitle, report)

  return {
    metaTitle,
    metaDescription,
    keywords,
    content,
  }
}

/**
 * Generate SEO-optimized content body
 */
function generateSeoContentBody(ideaTitle: string, report: {
  executiveSummary?: string
  marketSize?: { tam?: string; sam?: string; som?: string }
  targetAudience?: { primary?: string }
  competitors?: Array<{ name?: string }>
  greenLights?: Array<{ title?: string }>
  redFlags?: Array<{ title?: string }>
  overallScore?: number
}): string {
  const score = report.overallScore || 0
  const scoreText = score >= 70 ? 'Strong' : score >= 40 ? 'Moderate' : 'Needs Work'

  return `
## Executive Summary

${report.executiveSummary || 'This AI-powered validation report analyzes the business potential of ' + ideaTitle + '. Our comprehensive analysis examines market size, competition, risks, and growth opportunities.'}

## Validation Score: ${score}/100 (${scoreText})

Our AI analysis has evaluated ${ideaTitle} across multiple dimensions including market opportunity, competitive landscape, execution feasibility, and growth potential.

## Market Opportunity

${report.marketSize?.tam ? `**Total Addressable Market (TAM):** ${report.marketSize.tam}` : ''}
${report.marketSize?.sam ? `**Serviceable Available Market (SAM):** ${report.marketSize.sam}` : ''}
${report.marketSize?.som ? `**Serviceable Obtainable Market (SOM):** ${report.marketSize.som}` : ''}

${report.targetAudience?.primary ? `**Primary Target Audience:** ${report.targetAudience.primary}` : ''}

## Key Strengths (Green Lights)

${report.greenLights?.map(gl => `- **${gl.title}**: ${gl.title}`).join('\n') || 'Analysis in progress'}

## Potential Risks (Red Flags)

${report.redFlags?.map(rf => `- **${rf.title}**: ${rf.title}`).join('\n') || 'No critical risks identified'}

## Competitive Landscape

${report.competitors && report.competitors.length > 0
    ? `Key competitors in the ${ideaTitle} space include:\n\n` +
      report.competitors.slice(0, 5).map(c => `- ${c.name}`).join('\n')
    : 'Market analysis ongoing'}

## About This Report

This validation report was generated by IdeaProof's AI-powered startup validation engine. We analyze thousands of data points to provide founders with actionable insights before they invest time and money into building their product.

**Methodology:** Our AI analyzes market size, competitive dynamics, customer pain points, business model viability, and execution risks to provide a comprehensive go/no-go recommendation.

---

*Generated by [IdeaProof](/) - AI-powered startup validation. Get your own investor-ready report in minutes.*
`.trim()
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60)
}
