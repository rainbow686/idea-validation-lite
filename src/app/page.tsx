'use client'

import { useState } from 'react'

interface ReportData {
  preview: {
    overallScore: number
    executiveSummary: string
    greenLightsCount: number
    competitorsCount: number
    redFlagsCount: number
  }
  full: {
    overallScore: number
    executiveSummary: string
    greenLights: string[]
    redFlags: string[]
    marketSize: {
      TAM: string
      SAM: string
      SOM: string
    }
    competitors: Array<{
      name: string
      description: string
      differentiation: string
    }>
    recommendations: string[]
  }
}

export default function Home() {
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState<ReportData | null>(null)
  const [email, setEmail] = useState('')

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaTitle, ideaDescription }),
      })

      const data = await response.json()
      console.log('Report response:', data)

      if (data.success && data.data) {
        setReport(data.data)
      } else if (data.error) {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUnlock = async (priceType: string) => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceType, email }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            IdeaValidation<span className="text-emerald-500">Lite</span>
          </h1>
          <nav className="flex gap-4">
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">
              How it works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Validate Your Startup Idea
          <br />
          <span className="text-emerald-500">in 5 Minutes</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Get an AI-powered validation report with market analysis, competitor insights,
          and actionable recommendations. Free preview available.
        </p>
      </section>

      {/* Input Form */}
      {!report && (
        <section className="max-w-2xl mx-auto px-4 pb-20">
          <form onSubmit={handleGenerate} className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <label htmlFor="ideaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Idea Title *
              </label>
              <input
                id="ideaTitle"
                type="text"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="e.g., AI-powered task manager for developers"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="ideaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Idea
              </label>
              <textarea
                id="ideaDescription"
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                placeholder="Tell us more about your idea, target users, and the problem you're solving..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating || !ideaTitle}
              className="w-full bg-emerald-500 text-white py-4 rounded-lg font-semibold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating Report...' : 'Generate Free Preview'}
            </button>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Get a free preview with overall score and summary. Unlock full report for $9.99.
            </p>
          </form>
        </section>
      )}

      {/* Report Preview */}
      {report && (
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Score */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 mb-4">
                <span className="text-4xl font-bold text-emerald-500">
                  {report.preview.overallScore}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Validation Score</h3>
              <p className="text-gray-600 mt-2">Based on market demand, competition, and feasibility</p>
            </div>

            {/* Executive Summary (Free) */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Executive Summary</h4>
              <p className="text-gray-700 whitespace-pre-line">{report.preview.executiveSummary}</p>
            </div>

            {/* Locked Content */}
            <div className="border-t pt-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-400">{report.preview.greenLightsCount}</div>
                  <div className="text-sm text-gray-500">Green Lights</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-400">{report.preview.competitorsCount}</div>
                  <div className="text-sm text-gray-500">Competitors Analyzed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-400">{report.preview.redFlagsCount}</div>
                  <div className="text-sm text-gray-500">Risk Flags</div>
                </div>
              </div>

              {/* Paywall */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-8 text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Unlock Full Report</h4>
                <p className="text-gray-600 mb-6">
                  Get complete market analysis, competitor deep-dive, risk assessment, and actionable recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => handleUnlock('one_time')}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition"
                  >
                    Unlock for $9.99
                  </button>
                  <button
                    onClick={() => handleUnlock('monthly')}
                    className="bg-white text-emerald-500 border-2 border-emerald-500 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition"
                  >
                    Subscribe $29/mo (3 reports)
                  </button>
                </div>
                <div className="mt-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for receipt"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* New Validation Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setReport(null)
                  setIdeaTitle('')
                  setIdeaDescription('')
                }}
                className="text-emerald-500 hover:text-emerald-600 font-medium"
              >
                ← Validate Another Idea
              </button>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Submit Your Idea</h4>
              <p className="text-gray-600">Tell us about your startup idea in a sentence or two.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">AI Analysis</h4>
              <p className="text-gray-600">Our AI analyzes market data, competitors, and user discussions.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Get Report</h4>
              <p className="text-gray-600">Receive a detailed validation report with actionable insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple Pricing</h3>
          <p className="text-gray-600 text-center mb-12">Start with a free preview, upgrade when you need more.</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="border rounded-2xl p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Free</h4>
              <div className="text-4xl font-bold text-gray-900 mb-4">$0</div>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>✓ 1 free preview</li>
                <li>✓ Overall validation score</li>
                <li>✓ Executive summary</li>
                <li className="text-gray-400">✕ Full market analysis</li>
                <li className="text-gray-400">✕ Competitor deep-dive</li>
                <li className="text-gray-400">✕ PDF download</li>
              </ul>
              <a href="#" className="block text-center bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
                Try Free
              </a>
            </div>

            {/* Starter */}
            <div className="border-2 border-emerald-500 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Starter</h4>
              <div className="text-4xl font-bold text-gray-900 mb-4">$9.99</div>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>✓ 1 complete report</li>
                <li>✓ Full market analysis</li>
                <li>✓ Competitor deep-dive</li>
                <li>✓ Risk assessment</li>
                <li>✓ Actionable recommendations</li>
                <li>✓ PDF download</li>
              </ul>
              <button className="block w-full text-center bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition">
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="border rounded-2xl p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Pro</h4>
              <div className="text-4xl font-bold text-gray-900 mb-4">$29/mo</div>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>✓ 3 reports per month</li>
                <li>✓ Full market analysis</li>
                <li>✓ Competitor deep-dive</li>
                <li>✓ Risk assessment</li>
                <li>✓ Actionable recommendations</li>
                <li>✓ PDF download</li>
              </ul>
              <button className="block w-full text-center bg-white text-emerald-500 border-2 border-emerald-500 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 IdeaValidationLite. Built for solo founders.</p>
        </div>
      </footer>
    </div>
  )
}
