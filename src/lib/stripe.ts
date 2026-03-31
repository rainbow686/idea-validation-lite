import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

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
