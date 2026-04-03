import { NextRequest, NextResponse } from 'next/server'
import { generateValidationReport } from '@/lib/report-generator'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

/**
 * POST /api/generate-report
 *
 * Generates a validation report after checking and consuming user credits
 *
 * Flow:
 * 1. Verify user authentication
 * 2. Check user has enough credits (1 credit per report)
 * 3. Consume credits
 * 4. Generate report
 * 5. Save report to database
 *
 * Returns:
 * - 401: Not authenticated
 * - 402: Insufficient credits
 * - 500: Generation failed
 */
export async function POST(request: NextRequest) {
  try {
    const { ideaTitle, ideaDescription } = await request.json()

    if (!ideaTitle) {
      return NextResponse.json(
        { error: 'Idea title is required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase not configured, generating report without credit check')
      // Fallback: generate without credit tracking
      return generateReportWithoutCredits(ideaTitle, ideaDescription)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    let userId: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (error || !user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      userId = user.id
    }

    // If no user ID, require authentication
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to generate reports.' },
        { status: 401 }
      )
    }

    // Check user credits
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('free_credits, paid_credits')
      .eq('id', userId)
      .single()

    if (fetchError || !userData) {
      // User doesn't exist, create with default free credits
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: authHeader ? '' : '', // Will be populated from auth
          free_credits: 3,
          paid_credits: 0,
        })
        .select()
        .single()

      if (!newUser) {
        return NextResponse.json(
          { error: 'Failed to initialize user account' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'User account initialized with 3 free credits',
        credits: { free: 3, paid: 0, total: 3 },
      })
    }

    const totalCredits = (userData.free_credits || 0) + (userData.paid_credits || 0)

    // Check if user has enough credits (1 credit per report)
    if (totalCredits < 1) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          code: 'PAYMENT_REQUIRED',
          message: 'You need 1 credit to generate a report. Each report costs ¥9.9 (1 credit).',
          currentCredits: totalCredits,
          requiredCredits: 1,
        },
        { status: 402 }
      )
    }

    console.log('[API] User has enough credits. Free:', userData.free_credits, 'Paid:', userData.paid_credits)

    // Consume credits (1 credit per report)
    const { data: consumeResult, error: consumeError } = await supabase
      .rpc('consume_credits', {
        credits_to_consume: 1,
        report_id: null, // Will update with actual report ID
      })
      .single() as { data: { success: boolean; remaining_credits: number; message: string } | null; error: unknown }

    if (consumeError || !consumeResult?.success) {
      console.error('Failed to consume credits:', consumeError)
      return NextResponse.json(
        { error: 'Failed to consume credits. Please try again.' },
        { status: 500 }
      )
    }

    console.log('[API] Credits consumed. Remaining:', consumeResult.remaining_credits)

    // Generate the report
    console.log('[API] Starting report generation for:', ideaTitle)
    const report = await generateValidationReport(ideaTitle, ideaDescription || '')
    console.log('[API] Report generated successfully, score:', report.overallScore)

    // Save report to database
    const { data: savedReport, error: saveError } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        title: ideaTitle,
        idea_text: ideaDescription || '',
        status: 'completed',
        metadata: report as unknown as Record<string, unknown>,
      })
      .select('id')
      .single()

    if (saveError) {
      console.error('Failed to save report:', saveError)
      // Continue anyway - report is still valid
    }

    // Update credit_usage with report_id if report was saved
    if (savedReport?.id) {
      await supabase
        .from('credit_usage')
        .update({ report_id: savedReport.id })
        .eq('report_id', null)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)

      // Auto-generate SEO page for public sharing (optional)
      // This creates an anonymous public version for SEO purposes
      try {
        const slug = ideaTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 60)

        await supabase
          .from('reports')
          .update({ slug })
          .eq('id', savedReport.id)

        // Trigger SEO page generation in background
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL || BASE_URL}/api/seo/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ideaTitle,
            ideaDescription,
            reportData: report,
          }),
        }).catch(err => console.error('Failed to generate SEO page:', err))
      } catch (seoError) {
        console.error('Failed to setup SEO page:', seoError)
        // Non-critical, continue with normal flow
      }
    }

    // Return the report with preview/paid structure
    return NextResponse.json({
      success: true,
      data: {
        preview: {
          overallScore: report.overallScore,
          executiveSummary: report.executiveSummary,
          greenLightsCount: report.greenLights?.length || 0,
          competitorsCount: report.competitors?.length || report.competitiveLandscape?.directCompetitors?.length || 0,
          redFlagsCount: report.redFlags?.length || 0,
        },
        full: report,
      },
      credits: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remaining: (consumeResult as any).remaining_credits,
        used: 1,
      },
      reportId: savedReport?.id,
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

// Fallback for when Supabase is not configured
async function generateReportWithoutCredits(ideaTitle: string, ideaDescription: string) {
  const report = await generateValidationReport(ideaTitle, ideaDescription || '')

  return NextResponse.json({
    success: true,
    data: {
      preview: {
        overallScore: report.overallScore,
        executiveSummary: report.executiveSummary,
        greenLightsCount: report.greenLights?.length || 0,
        competitorsCount: report.competitors?.length || report.competitiveLandscape?.directCompetitors?.length || 0,
        redFlagsCount: report.redFlags?.length || 0,
      },
      full: report,
    },
    warning: 'Credit system not configured. Report generated without credit tracking.',
  })
}
