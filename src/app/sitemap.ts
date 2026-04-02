import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ideaproof.ai'

/**
 * Generate sitemap.xml with all public pages
 * Updates daily to include new reports, ideas, and industry pages
 * Note: Dynamic URLs are generated at runtime
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/ideas`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  // Skip dynamic pages during build if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey || !supabaseUrl.startsWith('http')) {
    console.log('Sitemap: Supabase not configured, using static pages only')
    return staticPages
  }

  // Fetch dynamic pages from database
  const dynamicPages: MetadataRoute.Sitemap = []

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch public reports
    const { data: reports } = await supabase
      .from('reports')
      .select('slug, updated_at, created_at')
      .eq('is_public', true)
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1000)

    if (reports) {
      reports.forEach(report => {
        dynamicPages.push({
          url: `${BASE_URL}/report/${report.slug}`,
          lastModified: new Date(report.updated_at || report.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      })
    }

    // Fetch unique industries
    const { data: industryData } = await supabase
      .from('idea_library')
      .select('industry')
      .eq('is_public', true)
      .not('industry', 'is', null)

    if (industryData) {
      const uniqueIndustries = Array.from(
        new Set(industryData.map(item => item.industry).filter(Boolean))
      )

      uniqueIndustries.forEach(industry => {
        dynamicPages.push({
          url: `${BASE_URL}/industries/${encodeURIComponent(industry)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        })
      })
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages even if database fetch fails
  }

  return [...staticPages, ...dynamicPages]
}
