import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripeInstance(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(apiKey, {
    apiVersion: '2026-03-25.dahlia',
  })
}

/**
 * POST /api/payment/create
 * Creates a payment session for purchasing credits
 *
 * Request body:
 * - amount: number (in cents)
 * - channel: 'stripe' | 'alipay' | 'wechat'
 * - credits: number (optional, calculated from amount if not provided)
 * - success_url: string (optional)
 *
 * Response:
 * - success: boolean
 * - paymentId: string
 * - url: string (for Stripe redirect)
 * - qrCode: string (for Alipay/WeChat)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, channel = 'stripe', credits, success_url } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    if (!['stripe', 'alipay', 'wechat'].includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid payment channel' },
        { status: 400 }
      )
    }

    // Calculate credits if not provided
    const creditsToGive = credits || Math.floor(amount / 999)
    if (creditsToGive <= 0) {
      return NextResponse.json(
        { error: 'Amount too low for purchasing credits' },
        { status: 400 }
      )
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current user from JWT token
    let userId: string | null = null
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (error || !user) {
        // For service-to-service calls without auth, we might allow it
        // In production, require proper auth
        console.warn('User authentication failed, proceeding without user context')
      } else {
        userId = user.id
      }
    }

    const baseUrl = success_url || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Handle Stripe payment
    if (channel === 'stripe') {
      const stripe = getStripeInstance()

      // Create a product for credits
      const product = await stripe.products.create({
        name: `Idea Validation Credits (${creditsToGive} credits)`,
        description: 'Pay-per-use credits for AI-powered idea validation reports',
      })

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: amount,
        currency: 'cny',
      })

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card', 'alipay'],
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&credits=${creditsToGive}`,
        cancel_url: `${baseUrl}/pricing?canceled=true`,
        metadata: {
          credits: creditsToGive.toString(),
          type: 'credit_purchase',
        },
        // Allow guest checkout, but link to user if authenticated
        customer_email: undefined,
        ...(userId ? { client_reference_id: userId } : {}),
      })

      // Create pending payment record if user is authenticated
      let paymentId = ''
      if (userId) {
        const { data: payment } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            amount,
            channel: 'stripe',
            credits: creditsToGive,
            status: 'pending',
            metadata: { stripe_session_id: session.id },
          })
          .select('id')
          .single()

        if (payment) {
          paymentId = payment.id
        }
      }

      return NextResponse.json({
        success: true,
        paymentId: paymentId || session.id,
        url: session.url,
        clientSecret: session.client_secret,
      })
    }

    // Handle Alipay/WeChat (placeholder for future implementation)
    // In production, integrate with Alipay/WeChat APIs
    if (channel === 'alipay' || channel === 'wechat') {
      // For now, return a placeholder response
      // In production, integrate with actual payment provider
      return NextResponse.json({
        success: true,
        paymentId: `pending_${channel}_${Date.now()}`,
        qrCode: 'data:image/png;base64,placeholder-qr-code',
        message: `${channel} payment integration coming soon`,
      })
    }

    return NextResponse.json(
      { error: 'Unsupported payment channel' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
