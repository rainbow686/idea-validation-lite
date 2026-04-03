import { NextRequest, NextResponse } from 'next/server'

const RENDER_API_URL = 'https://idea-validation-lite.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ideaTitle, ideaDescription, userId } = body

    // Forward to Render backend - this handles the long-running AI report generation
    const response = await fetch(`${RENDER_API_URL}/api/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaTitle, ideaDescription, userId }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Generate report API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
