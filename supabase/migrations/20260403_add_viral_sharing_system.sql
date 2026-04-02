-- Migration: Add Viral Sharing System
-- Date: 2026-04-03
-- Description: Implements invite codes, invite tracking, and share analytics

-- ============================================
-- 1. Invite Codes Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  claimed_by UUID[] DEFAULT '{}',  -- Array of user IDs who have claimed this code
  claimed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_user_id ON public.invite_codes(user_id);

-- ============================================
-- 2. Invite Claims Table (for analytics)
-- ============================================

CREATE TABLE IF NOT EXISTS public.invite_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT NOT NULL REFERENCES public.invite_codes(code) ON DELETE CASCADE,
  inviter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  claimer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  credits_awarded INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_invite_claims_invite_code ON public.invite_claims(invite_code);
CREATE INDEX IF NOT EXISTS idx_invite_claims_inviter_id ON public.invite_claims(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invite_claims_claimer_id ON public.invite_claims(claimer_id);

-- ============================================
-- 3. Share Analytics Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.share_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  platform TEXT,  -- 'wechat', 'weibo', 'twitter', 'linkedin', 'copy', 'native'
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_share_analytics_user_id ON public.share_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_share_analytics_report_id ON public.share_analytics(report_id);

-- ============================================
-- 4. Add is_public and view_count to reports (if not exists)
-- ============================================

ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- ============================================
-- 5. RLS Policies for Invite Codes
-- ============================================

-- Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view their own invite codes
CREATE POLICY "Users can view their own invite codes"
  ON public.invite_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own invite codes
CREATE POLICY "Users can create their own invite codes"
  ON public.invite_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own invite codes
CREATE POLICY "Users can update their own invite codes"
  ON public.invite_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their own invite claims (as inviter or claimer)
CREATE POLICY "Users can view their own invite claims (inviter)"
  ON public.invite_claims
  FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = claimer_id);

-- Users can create invite claims (when claiming)
CREATE POLICY "Users can create invite claims"
  ON public.invite_claims
  FOR INSERT
  WITH CHECK (auth.uid() = claimer_id);

-- Users can view their own share analytics
CREATE POLICY "Users can view their own share analytics"
  ON public.share_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create share analytics
CREATE POLICY "Users can create share analytics"
  ON public.share_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. Function: Auto-generate invite code for new users
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_invite_code_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  is_unique BOOLEAN := FALSE;
  attempts INTEGER := 0;
BEGIN
  -- Generate unique 8-character code
  WHILE NOT is_unique AND attempts < 10 LOOP
    new_code := SUBSTRING(
      (SELECT STRING_AGG(SUBSTRING(chars FROM FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER FOR 1), '')
       FROM GENERATE_SERIES(1, 8)),
      1, 8
    );

    SELECT NOT EXISTS (SELECT 1 FROM public.invite_codes WHERE code = new_code)
    INTO is_unique;

    attempts := attempts + 1;
  END LOOP;

  -- Insert invite code
  INSERT INTO public.invite_codes (user_id, code)
  VALUES (NEW.id, new_code);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-generate invite code for new users
-- Note: Uncomment if you want auto-generation
-- DROP TRIGGER IF EXISTS trg_generate_invite_code ON public.users;
-- CREATE TRIGGER trg_generate_invite_code
--   AFTER INSERT ON public.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.generate_invite_code_for_new_user();

-- ============================================
-- 7. Function: Get invite stats
-- ============================================

CREATE OR REPLACE FUNCTION public.get_invite_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_invite RECORD;
  v_claims JSON;
BEGIN
  SELECT * INTO v_invite
  FROM public.invite_codes
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_invite IS NULL THEN
    RETURN json_build_object(
      'inviteCode', NULL,
      'totalInvites', 0,
      'creditsEarned', 0
    );
  END IF;

  SELECT json_agg(json_build_object(
    'claimer_id', claimer_id,
    'created_at', created_at
  )) INTO v_claims
  FROM public.invite_claims
  WHERE invite_code = v_invite.code
  ORDER BY created_at DESC
  LIMIT 10;

  RETURN json_build_object(
    'inviteCode', v_invite.code,
    'totalInvites', v_invite.claimed_count,
    'creditsEarned', COALESCE(v_invite.claimed_count, 0) * 2,
    'recentClaims', COALESCE(v_claims, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. Comments
-- ============================================

COMMENT ON TABLE public.invite_codes IS 'Stores unique invite codes for viral sharing';
COMMENT ON TABLE public.invite_claims IS 'Tracks invite claims for analytics and rewards';
COMMENT ON TABLE public.share_analytics IS 'Tracks sharing activity across platforms';
COMMENT ON COLUMN public.invite_codes.claimed_by IS 'Array of user IDs who have claimed this invite';
COMMENT ON COLUMN public.invite_codes.claimed_count IS 'Total number of times this invite has been claimed';
