-- Migration: Add Auth Trigger for Auto-Creating User Records
-- Date: 2026-04-03
-- Description: Automatically creates public.users record when user signs up via Supabase Auth

-- ============================================
-- 1. Create Function: Handle New User Creation
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, free_credits, paid_credits, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    3,  -- Free 3 credits for new users
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Create Trigger: On Auth User Created
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. Ensure RLS is Enabled
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLS Policies
-- ============================================

-- Policy: Users can view own data
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update own data
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Allow trigger insert (service role)
DROP POLICY IF EXISTS "Service can insert users" ON public.users;
CREATE POLICY "Service can insert users" ON public.users
  FOR INSERT
  WITH CHECK (true);
