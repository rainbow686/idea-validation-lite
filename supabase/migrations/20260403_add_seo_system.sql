-- Migration: Add SEO Bulk Acquisition System
-- Date: 2026-04-03
-- Description: Implements SEO pages, idea library, and public reports for organic traffic

-- ============================================
-- 1. Reports Table Extensions
-- ============================================

-- Add SEO fields to reports table
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Index for public reports lookup
CREATE INDEX IF NOT EXISTS idx_reports_is_public ON public.reports(is_public);
CREATE INDEX IF NOT EXISTS idx_reports_slug ON public.reports(slug);

-- ============================================
-- 2. SEO Pages Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,  -- AI-generated SEO content
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  views INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('draft','published','archived')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for SEO pages
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON public.seo_pages(slug);
CREATE INDEX IF NOT EXISTS idx_seo_pages_status ON public.seo_pages(status);
CREATE INDEX IF NOT EXISTS idx_seo_pages_keywords ON public.seo_pages USING GIN(keywords);

-- ============================================
-- 3. Idea Library Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.idea_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  target_user TEXT,
  pain_point TEXT,
  revenue_model TEXT,
  difficulty_score INTEGER,
  views INTEGER DEFAULT 0,
  validations INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for idea library
CREATE INDEX IF NOT EXISTS idx_idea_library_industry ON public.idea_library(industry);
CREATE INDEX IF NOT EXISTS idx_idea_library_is_public ON public.idea_library(is_public);
CREATE INDEX IF NOT EXISTS idx_idea_library_views ON public.idea_library(views DESC);
CREATE INDEX IF NOT EXISTS idx_idea_library_validations ON public.idea_library(validations DESC);
CREATE INDEX IF NOT EXISTS idx_idea_library_created_at ON public.idea_library(created_at DESC);

-- ============================================
-- 4. Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS for new tables
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_library ENABLE ROW LEVEL SECURITY;

-- SEO Pages policies
CREATE POLICY "Public can view published SEO pages"
  ON public.seo_pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can create SEO pages"
  ON public.seo_pages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update SEO pages"
  ON public.seo_pages FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Idea Library policies
CREATE POLICY "Public can view public ideas"
  ON public.idea_library FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create ideas"
  ON public.idea_library FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own ideas"
  ON public.idea_library FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own ideas"
  ON public.idea_library FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 5. Functions for SEO System
-- ============================================

-- Function to update updated_at timestamp (if not exists from credit system)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_text TEXT, table_name TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
  exists_bool BOOLEAN;
BEGIN
  -- Create base slug from text
  base_slug := LOWER(REGEXP_REPLACE(base_text, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '^-+|-+$', '');

  -- Check uniqueness and add counter if needed
  LOOP
    final_slug := CASE WHEN counter = 0 THEN base_slug ELSE base_slug || '-' || counter END;

    IF table_name = 'reports' THEN
      EXECUTE 'SELECT EXISTS(SELECT 1 FROM public.reports WHERE slug = $1)' INTO exists_bool USING final_slug;
    ELSIF table_name = 'seo_pages' THEN
      EXECUTE 'SELECT EXISTS(SELECT 1 FROM public.seo_pages WHERE slug = $1)' INTO exists_bool USING final_slug;
    ELSE
      exists_bool := FALSE;
    END IF;

    IF NOT exists_bool THEN
      RETURN final_slug;
    END IF;

    counter := counter + 1;
  END LOOP;
END;
$$;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_seo_views(page_slug TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.seo_pages
  SET views = views + 1
  WHERE slug = page_slug AND status = 'published';
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_idea_views(idea_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.idea_library
  SET views = views + 1
  WHERE id = idea_id AND is_public = true;
END;
$$;

-- Function to increment validation count
CREATE OR REPLACE FUNCTION public.increment_idea_validations(idea_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.idea_library
  SET validations = validations + 1
  WHERE id = idea_id;
END;
$$;

-- ============================================
-- 6. Triggers for Updated At
-- ============================================

DROP TRIGGER IF EXISTS update_seo_pages_updated_at ON public.seo_pages;
CREATE TRIGGER update_seo_pages_updated_at
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_idea_library_updated_at ON public.idea_library;
CREATE TRIGGER update_idea_library_updated_at
  BEFORE UPDATE ON public.idea_library
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 7. Helper Views
-- ============================================

-- View for public reports with SEO data
CREATE OR REPLACE VIEW public.public_reports AS
SELECT
  r.id,
  r.idea_title as title,
  r.slug,
  r.idea_title,
  r.idea_description,
  r.report_data as metadata,
  r.created_at,
  u.email as author_email
FROM public.reports r
LEFT JOIN public.users u ON r.user_id = u.id
WHERE r.is_public = true AND r.slug IS NOT NULL;

-- View for idea library with stats
CREATE OR REPLACE VIEW public.idea_library_public AS
SELECT
  id,
  title,
  description,
  industry,
  target_user,
  pain_point,
  revenue_model,
  difficulty_score,
  views,
  validations,
  created_at
FROM public.idea_library
WHERE is_public = true;
