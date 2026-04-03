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

interface ReportData {
  title: string
  idea_text: string
  metadata: {
    executiveSummary?: string
    marketSize?: { tam?: string; sam?: string; som?: string }
    targetAudience?: { primary?: string }
    competitors?: Array<{ name?: string }>
    greenLights?: Array<{ title?: string; description?: string }>
    redFlags?: Array<{ title?: string; description?: string }>
    overallScore?: number
    seo?: {
      metaTitle?: string
      metaDescription?: string
      keywords?: string[]
    }
  }
  created_at: string
}

export default function PublicReportPage() {
  const params = useParams()
  const slug = params.slug as string

  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(!supabase)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      setError('Supabase not configured')
      return
    }

    async function fetchReport() {
      try {
        const { data, error } = await supabase!
          .from('reports')
          .select('title, idea_text, metadata, created_at')
          .eq('slug', slug)
          .eq('is_public', true)
          .single()

        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }

        setReport(data)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch report')
        setLoading(false)
      }
    }

    if (slug) {
      fetchReport()
    }
  }, [slug])

  useEffect(() => {
    // Update meta tags when report loads
    if (report) {
      const seo = report.metadata.seo
      if (seo?.metaTitle) {
        document.title = seo.metaTitle
      }
      if (seo?.metaDescription) {
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc) {
          metaDesc.setAttribute('content', seo.metaDescription)
        }
      }
    }
  }, [report])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || 'This report may be private or has been removed.'}
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  const metadata = report.metadata
  const score = metadata.overallScore || 0
  const scoreColor = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-blue-600">IdeaProof</a>
          <div className="flex items-center gap-4">
            <ShareButton title={report.title} slug={slug} />
            <a
              href="/pricing"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Get Your Report
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title & Score */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{report.title}</h1>
          <p className="text-gray-600 mb-4">{report.idea_text}</p>
          <div className="flex items-center gap-4">
            <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
            <span className="text-gray-600">/ 100 Validation Score</span>
            <span className="text-gray-400 text-sm">
              Generated {new Date(report.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        {metadata.executiveSummary && (
          <section className="mb-8 p-6 bg-gray-50 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
            <p className="text-gray-700 whitespace-pre-line">{metadata.executiveSummary}</p>
          </section>
        )}

        {/* Market Size */}
        {metadata.marketSize && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Opportunity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metadata.marketSize.tam && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">TAM</div>
                  <div className="text-lg font-semibold text-gray-900">{metadata.marketSize.tam}</div>
                </div>
              )}
              {metadata.marketSize.sam && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">SAM</div>
                  <div className="text-lg font-semibold text-gray-900">{metadata.marketSize.sam}</div>
                </div>
              )}
              {metadata.marketSize.som && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">SOM</div>
                  <div className="text-lg font-semibold text-gray-900">{metadata.marketSize.som}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Green Lights */}
        {metadata.greenLights && metadata.greenLights.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-600">✓</span> Key Strengths
            </h2>
            <ul className="space-y-3">
              {metadata.greenLights.map((gl, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <span className="font-medium text-gray-900">{gl.title}</span>
                    {gl.description && (
                      <p className="text-gray-600 text-sm mt-1">{gl.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Red Flags */}
        {metadata.redFlags && metadata.redFlags.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-red-600">!</span> Potential Risks
            </h2>
            <ul className="space-y-3">
              {metadata.redFlags.map((rf, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">!</span>
                  <div>
                    <span className="font-medium text-gray-900">{rf.title}</span>
                    {rf.description && (
                      <p className="text-gray-600 text-sm mt-1">{rf.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Competitors */}
        {metadata.competitors && metadata.competitors.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Competitive Landscape</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {metadata.competitors.slice(0, 10).map((competitor, index) => (
                <li key={index} className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900 font-medium">{competitor.name}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <section className="mt-12 p-8 bg-blue-600 rounded-xl text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Validate Your Own Idea</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            Get an AI-powered validation report for your startup idea in minutes.
            Market size, competitors, risks, and go/no-go recommendations.
          </p>
          <a
            href="/pricing"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Get Started - ¥9.9 per Report
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Generated by IdeaProof - AI-powered startup validation</p>
          <p className="mt-2">
            <a href="/" className="hover:text-gray-700">Home</a>
            {' - '}
            <a href="/ideas" className="hover:text-gray-700">Idea Library</a>
            {' - '}
            <a href="/pricing" className="hover:text-gray-700">Pricing</a>
          </p>
        </div>
      </footer>
    </div>
  )
}

function ShareButton({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/report/${slug}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Validation Report',
          text: title,
          url,
        })
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="text-gray-600 hover:text-gray-900 text-sm font-medium"
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
