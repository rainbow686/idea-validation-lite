import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { priceType, email } = await request.json()

    if (!priceType || !email) {
      return NextResponse.json(
        { error: 'Price type and email are required' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { url } = await createCheckoutSession(priceType, email, baseUrl)

    return NextResponse.json({
      success: true,
      url,
      testMode: url.includes('test'),
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
