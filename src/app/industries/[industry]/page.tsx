'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http'))
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : ''
const supabaseAnonKey = typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : ''

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

interface Idea {
  id: string
  title: string
  description: string
  pain_point: string
  revenue_model: string
  difficulty_score: number
  views: number
  validations: number
  created_at: string
}

interface IndustryStats {
  totalIdeas: number
  totalValidations: number
  avgDifficulty: number
  topRevenueModels: string[]
}

export default function IndustryPage() {
  const params = useParams()
  const industry = decodeURIComponent(params.industry as string)

  const [ideas, setIdeas] = useState<Idea[]>([])
  const [stats, setStats] = useState<IndustryStats | null>(null)
  const [loading, setLoading] = useState(!supabase)
  const [industryAnalysis, setIndustryAnalysis] = useState<string>('')

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    async function fetchIndustryData() {
      try {
        // Fetch ideas for this industry
        const { data: ideasData, error } = await supabase!
          .from('idea_library')
          .select('*')
          .eq('industry', industry)
          .eq('is_public', true)
          .order('validations', { ascending: false })
          .limit(20)

        if (error) {
          console.error('Error fetching industry ideas:', error)
          setLoading(false)
          return
        }

        setIdeas(ideasData || [])

        // Calculate stats
        if (ideasData && ideasData.length > 0) {
          const totalValidations = ideasData.reduce((sum, idea) => sum + (idea.validations || 0), 0)
          const avgDifficulty = ideasData.reduce((sum, idea) => sum + (idea.difficulty_score || 0), 0) / ideasData.length
          const revenueModels = Array.from(
            new Set(ideasData.map(idea => idea.revenue_model).filter(Boolean))
          ).slice(0, 5)

          setStats({
            totalIdeas: ideasData.length,
            totalValidations,
            avgDifficulty: Math.round(avgDifficulty),
            topRevenueModels: revenueModels,
          })

          // Generate AI analysis
          const analysis = generateIndustryAnalysis(industry, {
            totalIdeas: ideasData.length,
            totalValidations,
            avgDifficulty: Math.round(avgDifficulty),
            topRevenueModels: revenueModels,
            topIdeas: ideasData.slice(0, 3),
          })
          setIndustryAnalysis(analysis)
        }
      } catch (err) {
        console.error('Error fetching industry data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (industry) {
      fetchIndustryData()
    }
  }, [industry])

  useEffect(() => {
    // Update meta tags
    if (industry && stats) {
      document.title = `${industry} Startup Ideas - ${stats.totalIdeas} Validated Concepts | IdeaProof`

      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          `Explore ${stats.totalIdeas} validated startup ideas in the ${industry} industry. See market trends, revenue models, and validation insights.`
        )
      }
    }
  }, [industry, stats])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading industry data...</p>
        </div>
      </div>
    )
  }

  if (!stats || ideas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Industry Not Found</h1>
          <p className="text-gray-600 mb-4">
            No validated ideas found for this industry yet.
          </p>
          <a
            href="/ideas"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse All Ideas
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-blue-600">IdeaProof</a>
          <nav className="flex items-center gap-4">
            <a href="/ideas" className="text-gray-600 hover:text-gray-900">All Ideas</a>
            <a
              href="/pricing"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Get Your Report
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-2">
            <a href="/ideas" className="hover:text-white">Startup Ideas</a>
            <span>/</span>
            <span>{industry}</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{industry} Startup Ideas</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Explore {stats.totalIdeas} validated startup concepts in the {industry} space.
            See what problems entrepreneurs are solving and how they plan to make money.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-blue-600">{stats.totalIdeas}</div>
            <div className="text-gray-600 text-sm mt-1">Validated Ideas</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-green-600">{stats.totalValidations}</div>
            <div className="text-gray-600 text-sm mt-1">Total Validations</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-purple-600">
              {stats.avgDifficulty}/10
            </div>
            <div className="text-gray-600 text-sm mt-1">Avg Difficulty</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-lg font-bold text-orange-600">{stats.topRevenueModels.length}</div>
            <div className="text-gray-600 text-sm mt-1">Revenue Models</div>
          </div>
        </div>
      </section>

      {/* AI Analysis */}
      {industryAnalysis && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Industry Insights
            </h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{industryAnalysis}</p>
            </div>
          </div>
        </section>
      )}

      {/* Ideas List */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Validated Ideas in {industry}
        </h2>
        <div className="space-y-4">
          {ideas.map(idea => (
            <IdeaRow key={idea.id} idea={idea} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Building a {industry} Startup?
          </h2>
          <p className="text-gray-600 mb-6">
            Get a comprehensive validation report with market analysis, competitor research,
            and industry-specific insights.
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Validate Your {industry} Idea - ¥9.9
          </a>
        </div>
      </section>
    </div>
  )
}

function IdeaRow({ idea }: { idea: Idea }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{idea.title}</h3>
          {idea.description && (
            <p className="text-gray-600 text-sm mb-2">{idea.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {idea.pain_point && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {idea.pain_point.substring(0, 50)}...
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{idea.validations}</div>
            <div className="text-xs text-gray-500">Validations</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{idea.views}</div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function generateIndustryAnalysis(
  industry: string,
  data: {
    totalIdeas: number
    totalValidations: number
    avgDifficulty: number
    topRevenueModels: string[]
    topIdeas: Array<{ title: string; pain_point: string }>
  }
): string {
  const { totalIdeas, totalValidations, avgDifficulty, topRevenueModels, topIdeas } = data

  const difficultyInsight = avgDifficulty <= 3
    ? 'This industry has relatively low barriers to entry, making it attractive for first-time founders and lean startups.'
    : avgDifficulty <= 6
    ? 'This industry presents moderate challenges, requiring a balance of domain expertise and execution capability.'
    : 'This industry has high barriers to entry, often requiring significant expertise, capital, or regulatory navigation.'

  const validationInsight = totalValidations > totalIdeas * 2
    ? `With ${totalValidations} total validations across ${totalIdeas} ideas, this is a highly active space with strong entrepreneur interest.`
    : `With ${totalValidations} validations across ${totalIdeas} ideas, this industry shows steady but measured entrepreneur interest.`

  const revenueInsight = topRevenueModels.length > 0
    ? `Popular monetization strategies include ${topRevenueModels.slice(0, 3).join(', ')}.`
    : 'Revenue models vary widely across ideas.'

  const topIdeaInsight = topIdeas.length > 0
    ? `Top validated concepts focus on: ${topIdeas.map(idea => idea.pain_point || idea.title).slice(0, 2).join('; ')}.`
    : ''

  return `## ${industry} Industry Overview

The ${industry} sector currently has ${totalIdeas} validated startup concepts in our database, representing ${totalValidations} total validation decisions by entrepreneurs.

### Key Insights

**Barrier to Entry:** ${difficultyInsight}

**Market Activity:** ${validationInsight}

**Monetization:** ${revenueInsight}

${topIdeaInsight}

### What This Means for Founders

${avgDifficulty <= 4
    ? `The lower difficulty score suggests ${industry} is accessible to new entrants. Focus on differentiation and rapid execution to capture market share before competitors.`
    : `The higher difficulty score indicates ${industry} requires careful planning and possibly significant resources. Consider partnering with domain experts or pursuing a niche angle before tackling broader markets.`
}

---
*Analysis generated by IdeaProof AI based on ${totalIdeas} validated concepts in the ${industry} sector.*
`.trim()
}
