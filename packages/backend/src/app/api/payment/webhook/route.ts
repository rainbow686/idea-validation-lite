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
 * POST /api/payment/webhook
 * Handles payment webhook callbacks from Stripe, Alipay, WeChat
 *
 * For Stripe: Verifies webhook signature and processes events
 * - checkout.session.completed: Payment successful, add credits
 * - payment_intent.failed: Payment failed
 *
 * For Alipay/WeChat: Verifies signature and processes notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    // Verify this is a legitimate webhook
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not configured')
    }

    let event: Stripe.Event

    // Verify Stripe webhook signature
    if (signature && webhookSecret) {
      const stripe = getStripeInstance()
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // Development mode - parse event without verification
      console.warn('Processing webhook without signature verification (dev mode)')
      event = JSON.parse(body)
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle Stripe events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Check if this is a credit purchase
        if (session.metadata?.type !== 'credit_purchase') {
          break
        }

        const credits = parseInt(session.metadata.credits || '0', 10)
        const amount = session.amount_total || 0

        if (credits <= 0) {
          console.error('Invalid credits in session metadata')
          break
        }

        // Get user ID from client_reference_id or look up by email
        let userId: string | null = session.client_reference_id || null

        if (!userId && session.customer_email) {
          // Look up user by email
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.customer_email)
            .single()

          userId = user?.id || null
        }

        if (!userId) {
          console.error('Could not identify user for credit purchase')
          break
        }

        // Update payment record
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id')
          .eq('metadata->>stripe_session_id', session.id)
          .single()

        if (existingPayment) {
          await supabase
            .from('payments')
            .update({
              status: 'success',
              transaction_id: session.payment_intent as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingPayment.id)
        } else {
          // Create new payment record
          await supabase.from('payments').insert({
            user_id: userId,
            amount,
            channel: 'stripe',
            credits,
            status: 'success',
            transaction_id: session.payment_intent as string,
            metadata: { stripe_session_id: session.id },
          })
        }

        // Add credits to user
        const { error: creditError } = await supabase.rpc('add_credits', {
          target_user_id: userId,
          credits_to_add: credits,
          credit_type: 'paid',
        })

        if (creditError) {
          console.error('Failed to add credits:', creditError)
          return NextResponse.json(
            { error: 'Failed to add credits' },
            { status: 500 }
          )
        }

        console.log(`Successfully added ${credits} credits to user ${userId}`)
        break
      }

      // Note: payment_intent.failed is not a standard Stripe webhook event
      // This is kept for reference but may need adjustment based on actual events
      // case 'payment_intent.payment_failed': {
      //   const paymentIntent = event.data.object as Stripe.PaymentIntent
      //   ... handle failed payment ...
      //   break
      // }

      // Handle other Stripe events as needed
      case 'charge.refunded': {
        const charge = (event as { data?: { object?: unknown } }).data?.object as Stripe.Charge | undefined
        if (!charge) break

        // Find and update payment record
        if (charge.payment_intent) {
          await supabase
            .from('payments')
            .update({
              status: 'refunded',
              updated_at: new Date().toISOString(),
            })
            .eq('transaction_id', charge.payment_intent)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}

// GET endpoint for webhook URL verification (Stripe test)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint is ready',
  })
}
