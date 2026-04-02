-- Migration: Add Credit System for Pay-per-use Model
-- Date: 2026-04-03
-- Description: Implements ¥9.9/次 credit system with payment tracking

-- ============================================
-- 1. Users Table Modifications
-- ============================================

-- Add credit columns to users table (assuming auth.users or public.users exists)
-- For Supabase Auth, we use a separate profiles table
ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS free_credits INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS paid_credits INTEGER DEFAULT 0;

-- If users table doesn't exist, create it with credits
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  free_credits INTEGER DEFAULT 3,
  paid_credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Payments Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,  -- Amount in cents (分)
  channel TEXT NOT NULL CHECK (channel IN ('alipay', 'wechat', 'stripe', 'bank_transfer')),
  credits INTEGER NOT NULL,  -- Credits purchased
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  transaction_id TEXT UNIQUE,  -- External transaction ID from payment provider
  metadata JSONB DEFAULT '{}',  -- Additional payment metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);

-- ============================================
-- 3. Credit Usage Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.credit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  credits_used INTEGER NOT NULL,
  report_id UUID,  -- References reports table if it exists
  action TEXT NOT NULL DEFAULT 'report_generation',  -- Type of credit usage
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_credit_usage_user_id ON public.credit_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_report_id ON public.credit_usage(report_id);

-- ============================================
-- 4. Reports Table (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  idea_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);

-- ============================================
-- 5. Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own credits"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Credit usage policies
CREATE POLICY "Users can view own credit usage"
  ON public.credit_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. Functions for Credit Management
-- ============================================

-- Function to get user's total available credits
CREATE OR REPLACE FUNCTION public.get_user_credits()
RETURNS TABLE (
  free_credits INTEGER,
  paid_credits INTEGER,
  total_credits INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.free_credits,
    u.paid_credits,
    u.free_credits + u.paid_credits AS total_credits
  FROM public.users u
  WHERE u.id = auth.uid();
END;
$$;

-- Function to consume credits
CREATE OR REPLACE FUNCTION public.consume_credits(credits_to_consume INTEGER, report_id UUID DEFAULT NULL)
RETURNS TABLE (success BOOLEAN, remaining_credits INTEGER, message TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_free_credits INTEGER;
  user_paid_credits INTEGER;
  remaining INTEGER;
BEGIN
  -- Get current credits
  SELECT u.free_credits, u.paid_credits
  INTO user_free_credits, user_paid_credits
  FROM public.users u
  WHERE u.id = auth.uid();

  -- Check if user has enough credits
  IF user_free_credits + user_paid_credits < credits_to_consume THEN
    RETURN QUERY SELECT FALSE, 0, 'Insufficient credits';
    RETURN;
  END IF;

  -- Consume free credits first, then paid credits
  IF user_free_credits >= credits_to_consume THEN
    user_free_credits := user_free_credits - credits_to_consume;
  ELSE
    remaining := credits_to_consume - user_free_credits;
    user_free_credits := 0;
    user_paid_credits := user_paid_credits - remaining;
  END IF;

  -- Update user credits
  UPDATE public.users
  SET free_credits = user_free_credits,
      paid_credits = user_paid_credits,
      updated_at = NOW()
  WHERE id = auth.uid();

  -- Record credit usage
  INSERT INTO public.credit_usage (user_id, credits_used, report_id, action)
  VALUES (auth.uid(), credits_to_consume, report_id, 'report_generation');

  RETURN QUERY SELECT TRUE, user_free_credits + user_paid_credits, 'Credits consumed successfully';
END;
$$;

-- Function to add credits (for webhook use)
CREATE OR REPLACE FUNCTION public.add_credits(target_user_id UUID, credits_to_add INTEGER, credit_type TEXT DEFAULT 'paid')
RETURNS TABLE (success BOOLEAN, new_total INTEGER)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Validate credit type
  IF credit_type NOT IN ('free', 'paid') THEN
    RETURN QUERY SELECT FALSE, 0;
    RETURN;
  END IF;

  -- Add credits
  IF credit_type = 'free' THEN
    UPDATE public.users
    SET free_credits = free_credits + credits_to_add,
        updated_at = NOW()
    WHERE id = target_user_id
    RETURNING free_credits + paid_credits INTO current_credits;
  ELSE
    UPDATE public.users
    SET paid_credits = paid_credits + credits_to_add,
        updated_at = NOW()
    WHERE id = target_user_id
    RETURNING free_credits + paid_credits INTO current_credits;
  END IF;

  RETURN QUERY SELECT TRUE, current_credits;
END;
$$;

-- ============================================
-- 7. Triggers for Updated At
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 8. Initial Data (Optional - for testing)
-- ============================================

-- Comment out in production
-- INSERT INTO public.users (id, email, free_credits, paid_credits)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 3, 0)
-- ON CONFLICT (id) DO NOTHING;
