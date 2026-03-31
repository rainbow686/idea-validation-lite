import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICING } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { priceType, email } = await request.json()

    if (!priceType || !email) {
      return NextResponse.json(
        { error: 'Price type and email are required' },
        { status: 400 }
      )
    }

    // Get the price ID based on type
    let priceId: string | undefined
    let isSubscription = false

    if (priceType === 'one_time') {
      priceId = PRICING.oneTime.priceId
    } else if (priceType === 'monthly') {
      priceId = PRICING.monthly.priceId
      isSubscription = true
    } else if (priceType === 'pro') {
      priceId = PRICING.pro.priceId
      isSubscription = true
    } else {
      return NextResponse.json(
        { error: 'Invalid price type' },
        { status: 400 }
      )
    }

    // For development, use a test mode
    if (!priceId) {
      console.warn('Stripe price ID not configured, using test mode')
      return NextResponse.json({
        success: true,
        url: '/dashboard?test=payment_completed',
        testMode: true,
      })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      customer_email: email,
      metadata: {
        price_type: priceType,
      },
    })

    return NextResponse.json({
      success: true,
      url: session.url,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
