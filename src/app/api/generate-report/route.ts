import { NextRequest, NextResponse } from 'next/server'
import { generateValidationReport } from '@/lib/report-generator'

export async function POST(request: NextRequest) {
  try {
    const { ideaTitle, ideaDescription } = await request.json()

    if (!ideaTitle) {
      return NextResponse.json(
        { error: 'Idea title is required' },
        { status: 400 }
      )
    }

    console.log('[API] Starting report generation for:', ideaTitle)

    // Generate the report synchronously (no timeout limit on Render)
    const report = await generateValidationReport(
      ideaTitle,
      ideaDescription || ''
    )

    console.log('[API] Report generated successfully, score:', report.overallScore)

    // Return the report with preview/paid structure
    return NextResponse.json({
      success: true,
      data: {
        // Preview data (free users see this)
        preview: {
          overallScore: report.overallScore,
          executiveSummary: report.executiveSummary,
          greenLightsCount: report.greenLights?.length || 0,
          competitorsCount: report.competitors?.length || report.competitiveLandscape?.directCompetitors?.length || 0,
          redFlagsCount: report.redFlags?.length || 0,
        },
        // Full data (paid users see this)
        full: report,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
