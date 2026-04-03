import { NextRequest, NextResponse } from 'next/server'

const RENDER_API_URL = 'https://idea-validation-lite.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceType, email } = body

    const response = await fetch(`${RENDER_API_URL}/api/stripe/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceType, email }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Stripe checkout API error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
