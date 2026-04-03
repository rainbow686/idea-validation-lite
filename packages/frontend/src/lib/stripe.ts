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

// CNY Pricing for China market
export const PRICING = {
  // Pay-per-use credits
  credits: {
    single: {
      credits: 1,
      price: 999,  // ¥9.9 in cents
      priceId: process.env.STRIPE_PRICE_ID_CREDIT_1,
    },
    pack5: {
      credits: 5,
      price: 4900,  // ¥49 in cents
      priceId: process.env.STRIPE_PRICE_ID_CREDIT_5,
    },
    pack12: {
      credits: 12,
      price: 9900,  // ¥99 in cents (save ¥20)
      priceId: process.env.STRIPE_PRICE_ID_CREDIT_12,
    },
  },
  // Legacy subscription plans (kept for compatibility)
  oneTime: {
    price: 999,  // $9.99 in cents
    priceId: process.env.STRIPE_PRICE_ID_ONE_TIME,
  },
  monthly: {
    price: 2900,  // $29/month in cents
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY,
    credits: 3,  // 3 reports per month
  },
  pro: {
    price: 7900,  // $79/month in cents
    priceId: process.env.STRIPE_PRICE_ID_PRO,
    credits: 10,  // 10 reports per month
  },
}

/**
 * Get price ID for credit purchase
 */
export function getCreditPriceId(credits: number): string | undefined {
  if (credits === 1) return PRICING.credits.single.priceId
  if (credits === 5) return PRICING.credits.pack5.priceId
  if (credits === 12) return PRICING.credits.pack12.priceId
  // For custom amounts, return null to create dynamic price
  return undefined
}

/**
 * Calculate credits from amount
 */
export function calculateCreditsFromAmount(amount: number): number {
  // ¥9.9 = 1 credit
  return Math.floor(amount / 999)
}

/**
 * Create a checkout session for credit purchase
 */
export async function createCreditCheckoutSession(
  credits: number,
  amount: number,
  baseUrl: string,
  userId?: string
): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripeInstance()

  // Check if we have a predefined price
  const priceId = getCreditPriceId(credits)

  let price: Stripe.Price

  if (priceId) {
    // Use predefined price
    price = await stripe.prices.retrieve(priceId)
  } else {
    // Create dynamic product and price for custom amounts
    const product = await stripe.products.create({
      name: `Idea Validation Credits (${credits} credits)`,
      description: 'Pay-per-use credits for AI-powered idea validation reports',
    })

    price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency: 'cny',
    })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'alipay'],
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&credits=${credits}`,
    cancel_url: `${baseUrl}/pricing?canceled=true`,
    metadata: {
      credits: credits.toString(),
      type: 'credit_purchase',
    },
    ...(userId ? { client_reference_id: userId } : {}),
  })

  return {
    url: session.url || '/pricing',
    sessionId: session.id,
  }
}

/**
 * Legacy function - kept for compatibility
 */
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
