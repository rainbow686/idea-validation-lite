import Stripe from 'stripe'

function getStripeInstance(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(apiKey, {
    apiVersion: '2026-03-25.dahlia',
  })
}

export const PRICING = {
  oneTime: {
    price: 999, // $9.99 in cents
    priceId: process.env.STRIPE_PRICE_ID_ONE_TIME,
  },
  monthly: {
    price: 2900, // $29/month in cents
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY,
    credits: 3, // 3 reports per month
  },
  pro: {
    price: 7900, // $79/month in cents
    priceId: process.env.STRIPE_PRICE_ID_PRO,
    credits: 10, // 10 reports per month
  },
}

export async function createCheckoutSession(
  priceType: string,
  email: string,
  baseUrl: string
): Promise<{ url: string }> {
  // For development without Stripe API key
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY not configured, using test mode')
    return { url: '/dashboard?test=payment_completed' }
  }

  const stripe = getStripeInstance()
  let priceId: string | undefined

  if (priceType === 'one_time') {
    priceId = PRICING.oneTime.priceId
  } else if (priceType === 'monthly') {
    priceId = PRICING.monthly.priceId
  } else if (priceType === 'pro') {
    priceId = PRICING.pro.priceId
  }

  if (!priceId) {
    throw new Error('Invalid price type')
  }

  const session = await stripe.checkout.sessions.create({
    mode: priceType === 'one_time' ? 'payment' : 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/`,
    customer_email: email,
    metadata: { price_type: priceType },
  })

  return { url: session.url || '/dashboard' }
}
