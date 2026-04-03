import { NextRequest, NextResponse } from 'next/server'

const RENDER_API_URL = 'https://idea-validation-lite.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${RENDER_API_URL}/api/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    // Return PDF as binary
    const pdfBuffer = await response.arrayBuffer()
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="validation-report.pdf"',
      },
    })
  } catch (error) {
    console.error('Generate PDF API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
