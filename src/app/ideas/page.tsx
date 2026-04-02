'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http'))
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : ''
const supabaseAnonKey = typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : ''

// Don't initialize client if env vars are missing (build time)
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

interface Idea {
  id: string
  title: string
  description: string
  industry: string
  target_user: string
  pain_point: string
  revenue_model: string
  difficulty_score: number
  views: number
  validations: number
  created_at: string
}

type SortOption = 'latest' | 'popular' | 'validated'
type IndustryFilter = string | 'all'

export default function IdeaLibraryPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(!supabase) // Skip loading if no supabase
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [industries, setIndustries] = useState<string[]>([])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    async function fetchIdeas() {
      try {
        let query = supabase!
          .from('idea_library')
          .select('*')
          .eq('is_public', true)

        // Apply industry filter
        if (selectedIndustry !== 'all') {
          query = query.eq('industry', selectedIndustry)
        }

        // Apply sorting
        switch (sortBy) {
          case 'latest':
            query = query.order('created_at', { ascending: false })
            break
          case 'popular':
            query = query.order('views', { ascending: false })
            break
          case 'validated':
            query = query.order('validations', { ascending: false })
            break
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching ideas:', error)
          return
        }

        setIdeas(data || [])

        // Extract unique industries for filter
        const uniqueIndustries = Array.from(new Set(data?.map(idea => idea.industry).filter(Boolean)))
        setIndustries(uniqueIndustries)
      } catch (err) {
        console.error('Error fetching ideas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchIdeas()
  }, [sortBy, selectedIndustry])

  const filteredIdeas = ideas.filter(idea => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      idea.title.toLowerCase().includes(query) ||
      idea.description?.toLowerCase().includes(query) ||
      idea.industry?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-blue-600">IdeaProof</a>
          <nav className="flex items-center gap-4">
            <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Startup Idea Library</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Explore {ideas.length}+ validated startup ideas across industries.
            See what problems founders are solving and how they plan to make money.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Industry Filter */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">All Industries</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Viewed</option>
              <option value="validated">Most Validated</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-gray-600 mt-4">
          Showing {filteredIdeas.length} of {ideas.length} ideas
          {selectedIndustry !== 'all' && ` in ${selectedIndustry}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </section>

      {/* Ideas Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No ideas found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map(idea => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Have Your Own Idea?</h2>
          <p className="text-gray-600 mb-6">
            Get a comprehensive validation report with market analysis, competitor research, and go/no-go recommendation.
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Validate Your Idea - ¥9.9
          </a>
        </div>
      </section>
    </div>
  )
}

function IdeaCard({ idea }: { idea: Idea }) {
  const difficultyColor =
    idea.difficulty_score && idea.difficulty_score <= 3
      ? 'bg-green-100 text-green-800'
      : idea.difficulty_score && idea.difficulty_score <= 6
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800'

  const difficultyLabel =
    idea.difficulty_score && idea.difficulty_score <= 3
      ? 'Easy'
      : idea.difficulty_score && idea.difficulty_score <= 6
      ? 'Medium'
      : 'Hard'

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{idea.title}</h3>
          {idea.industry && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {idea.industry}
            </span>
          )}
        </div>
        {idea.difficulty_score !== null && idea.difficulty_score !== undefined && (
          <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColor}`}>
            {difficultyLabel}
          </span>
        )}
      </div>

      {/* Description */}
      {idea.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{idea.description}</p>
      )}

      {/* Details */}
      <div className="space-y-2 mb-4">
        {idea.pain_point && (
          <div>
            <span className="text-xs text-gray-500">Pain Point</span>
            <p className="text-sm text-gray-700">{idea.pain_point}</p>
          </div>
        )}
        {idea.revenue_model && (
          <div>
            <span className="text-xs text-gray-500">Revenue Model</span>
            <p className="text-sm text-gray-700">{idea.revenue_model}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {idea.views}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {idea.validations}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(idea.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
