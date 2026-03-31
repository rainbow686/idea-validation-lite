import { NextRequest, NextResponse } from 'next/server'
import { generateValidationReport } from '@/lib/report-generator'
import { generatePDF } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const { ideaTitle, ideaDescription } = await request.json()

    if (!ideaTitle) {
      return NextResponse.json(
        { error: 'Idea title is required' },
        { status: 400 }
      )
    }

    // Generate the full report
    const report = await generateValidationReport(ideaTitle, ideaDescription || '')

    // Generate PDF
    const pdfBlob = await generatePDF(ideaTitle, report)

    // Convert blob to base64 for response
    const arrayBuffer = await pdfBlob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    return NextResponse.json({
      success: true,
      pdf: base64,
      report,
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
