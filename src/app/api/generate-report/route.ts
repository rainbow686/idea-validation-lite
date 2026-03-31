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

    // Generate the report
    const report = await generateValidationReport(
      ideaTitle,
      ideaDescription || ''
    )

    // Return the report with preview/paid structure
    return NextResponse.json({
      success: true,
      data: {
        // Preview data (free users see this)
        preview: {
          overallScore: report.overallScore,
          executiveSummary: report.executiveSummary,
          greenLightsCount: report.greenLights.length,
          competitorsCount: report.competitors.length,
          redFlagsCount: report.redFlags.length,
        },
        // Full data (paid users see this)
        full: report,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
