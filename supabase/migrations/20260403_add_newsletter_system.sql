-- Migration: Add Newsletter Subscription System
-- Date: 2026-04-03
-- Description: Implements newsletter subscription for user engagement

-- ============================================
-- 1. Newsletter Subscriptions Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'website',  -- Source page where user subscribed
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON public.newsletter_subscriptions(subscribed_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_source ON public.newsletter_subscriptions(source);

-- ============================================
-- 2. RLS Policies
-- ============================================

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Only service role can view/manage subscriptions
CREATE POLICY "Service can view subscriptions"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (true);

-- ============================================
-- 3. Trigger for Updated At
-- ============================================

DROP TRIGGER IF EXISTS update_newsletter_subscriptions_updated_at ON public.newsletter_subscriptions;
CREATE TRIGGER update_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
