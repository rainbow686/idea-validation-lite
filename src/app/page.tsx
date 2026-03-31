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
    // P0 fields
    swotAnalysis: {
      strengths: string[]
      weaknesses: string[]
      opportunities: string[]
      threats: string[]
    }
    targetAudience: {
      primaryICP: string
      demographics: string
      psychographics: string
      painPoints: string[]
    }
    goNoGoRecommendation: {
      recommendation: 'GO' | 'NO-GO' | 'CONDITIONAL'
      confidence: number
      rationale: string
      keyConditions?: string[]
    }
    riskMatrix: Array<{
      risk: string
      level: 'HIGH' | 'MEDIUM' | 'LOW'
      impact: 'HIGH' | 'MEDIUM' | 'LOW'
      likelihood: 'HIGH' | 'MEDIUM' | 'LOW'
      mitigation: string
    }>
    revenueModelSuggestions: Array<{
      model: string
      description: string
      pros: string[]
      cons: string[]
      estimatedMRR: string
    }>
  }
}

export default function Home() {
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState<ReportData | null>(null)
  const [email, setEmail] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)

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

  const handleDownloadPdf = async () => {
    if (!report || !ideaTitle) return

    setIsDownloadingPdf(true)
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaTitle, ideaDescription }),
      })

      const data = await response.json()

      if (data.success && data.pdf) {
        // Convert base64 to blob and download
        const binaryString = atob(data.pdf)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `validation-report-${ideaTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`
        link.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF')
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            IdeaValidation<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Lite</span>
          </h1>
          <nav className="flex gap-4">
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">
              How it works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">
              Pricing
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-emerald-50 via-white to-white pt-24 pb-16">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-400/20 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-emerald-100 mb-6">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-gray-700">AI-Powered Validation — 89% Accuracy Rate</span>
          </div>

          {/* Headline */}
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Don&apos;t Build Blind.
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Validate Your Idea First.
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Get investor-ready validation reports in minutes. Market size, competitors, risks, and go/no-go recommendations — all powered by AI.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
            <div className="bg-white rounded-xl p-4 shadow-md border border-emerald-50">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">120s</div>
              <div className="text-sm text-gray-500 mt-1">Analysis Time</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-emerald-50">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">89%</div>
              <div className="text-sm text-gray-500 mt-1">Accuracy Rate</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-emerald-50">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">500+</div>
              <div className="text-sm text-gray-500 mt-1">Ideas Validated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Input Form (Integrated in Hero) */}
      {!report && (
        <section className="max-w-2xl mx-auto px-4 pb-20 -mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-2 border border-gray-100">
            <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="Enter your startup idea..."
                className="flex-1 px-6 py-4 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-400"
                required
              />
              <button
                type="submit"
                disabled={isGenerating || !ideaTitle}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/25 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Analyzing...' : 'Analyze Free'}
              </button>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 mt-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free preview available</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Instant results</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>PDF download</span>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {['TAM/SAM/SOM Analysis', 'Competitor Research', 'SWOT Analysis', 'GO/NO-GO Recommendation', 'Risk Assessment', 'Revenue Models'].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 bg-white rounded-full text-sm text-gray-600 border border-gray-200 shadow-sm"
              >
                ✓ {feature}
              </span>
            ))}
          </div>
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
              {/* Test button - remove in production */}
              <div className="mb-6 text-center">
                <button
                  onClick={() => setIsUnlocked(true)}
                  className="text-sm text-gray-500 underline hover:text-gray-700"
                >
                  🧪 Test: View Full Report (Free)
                </button>
              </div>

              {isUnlocked ? (
                /* Full Report (Unlocked) */
                <div className="space-y-6">
                  {/* Green Lights */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Green Lights</h4>
                    <ul className="space-y-2">
                      {report.full.greenLights.map((light, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-emerald-500 mr-2">✓</span>
                          <span className="text-gray-700">{light}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Market Size */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Market Size</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-500">TAM</div>
                        <div className="text-lg font-bold text-gray-900">{report.full.marketSize.TAM}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-500">SAM</div>
                        <div className="text-lg font-bold text-gray-900">{report.full.marketSize.SAM}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-500">SOM</div>
                        <div className="text-lg font-bold text-gray-900">{report.full.marketSize.SOM}</div>
                      </div>
                    </div>
                  </div>

                  {/* Competitors */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Competitors</h4>
                    <div className="space-y-4">
                      {report.full.competitors.map((competitor, i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-lg">
                          <div className="font-semibold text-gray-900 mb-1">{competitor.name}</div>
                          <div className="text-sm text-gray-600 mb-2">{competitor.description}</div>
                          <div className="text-sm text-emerald-600">
                            <strong>Differentiation:</strong> {competitor.differentiation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Red Flags */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Red Flags</h4>
                    <ul className="space-y-2">
                      {report.full.redFlags.map((flag, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-red-500 mr-2">⚠</span>
                          <span className="text-gray-700">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h4>
                    <ol className="space-y-2">
                      {report.full.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start">
                          <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* GO/NO-GO Recommendation */}
                  <div className="border-2 border-emerald-200 rounded-xl p-6 bg-gradient-to-r from-emerald-50 to-white">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Final Recommendation</h4>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold mb-3 ${
                      report.full.goNoGoRecommendation.recommendation === 'GO' ? 'bg-emerald-100 text-emerald-700' :
                      report.full.goNoGoRecommendation.recommendation === 'NO-GO' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {report.full.goNoGoRecommendation.recommendation === 'GO' && '✓ '}
                      {report.full.goNoGoRecommendation.recommendation === 'NO-GO' && '✕ '}
                      {report.full.goNoGoRecommendation.recommendation === 'CONDITIONAL' && '⚠ '}
                      {report.full.goNoGoRecommendation.recommendation}
                      <span className="ml-3 text-xs font-normal">
                        Confidence: {report.full.goNoGoRecommendation.confidence}%
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{report.full.goNoGoRecommendation.rationale}</p>
                    {report.full.goNoGoRecommendation.keyConditions && report.full.goNoGoRecommendation.keyConditions.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Key Conditions:</p>
                        <ul className="space-y-1">
                          {report.full.goNoGoRecommendation.keyConditions.map((condition, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start">
                              <span className="text-emerald-500 mr-2">→</span>
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* SWOT Analysis */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">SWOT Analysis</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-emerald-700 mb-2">Strengths</h5>
                        <ul className="space-y-1">
                          {report.full.swotAnalysis.strengths.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-red-700 mb-2">Weaknesses</h5>
                        <ul className="space-y-1">
                          {report.full.swotAnalysis.weaknesses.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-blue-700 mb-2">Opportunities</h5>
                        <ul className="space-y-1">
                          {report.full.swotAnalysis.opportunities.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-orange-700 mb-2">Threats</h5>
                        <ul className="space-y-1">
                          {report.full.swotAnalysis.threats.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="border rounded-xl p-6 bg-gray-50">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Target Audience</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Primary ICP</p>
                        <p className="text-gray-700">{report.full.targetAudience.primaryICP}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Demographics</p>
                        <p className="text-gray-700">{report.full.targetAudience.demographics}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Psychographics</p>
                        <p className="text-gray-700">{report.full.targetAudience.psychographics}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Pain Points</p>
                        <ul className="space-y-1">
                          {report.full.targetAudience.painPoints.map((pain, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start">
                              <span className="text-red-500 mr-2">!</span>
                              {pain}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Risk Matrix */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Risk Matrix</h4>
                    <div className="space-y-3">
                      {report.full.riskMatrix.map((riskItem, i) => (
                        <div key={i} className="border rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-900">{riskItem.risk}</span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              riskItem.level === 'HIGH' ? 'bg-red-100 text-red-700' :
                              riskItem.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {riskItem.level} RISK
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Impact: <span className={riskItem.impact === 'HIGH' ? 'font-semibold text-red-600' : 'text-gray-700'}>{riskItem.impact}</span>
                            {' · '}
                            Likelihood: <span className={riskItem.likelihood === 'HIGH' ? 'font-semibold text-red-600' : 'text-gray-700'}>{riskItem.likelihood}</span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-semibold">Mitigation: </span>
                            {riskItem.mitigation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revenue Model Suggestions */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Revenue Model Suggestions</h4>
                    <div className="space-y-4">
                      {report.full.revenueModelSuggestions.map((model, i) => (
                        <div key={i} className="border rounded-xl p-5 bg-white shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-base font-bold text-gray-900">{model.model}</h5>
                            <span className="text-sm font-semibold text-emerald-600">{model.estimatedMRR}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-emerald-700 mb-1">Pros</p>
                              <ul className="space-y-1">
                                {model.pros.map((pro, j) => (
                                  <li key={j} className="text-sm text-gray-700 flex items-start">
                                    <span className="text-emerald-500 mr-2">✓</span>
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-red-700 mb-1">Cons</p>
                              <ul className="space-y-1">
                                {model.cons.map((con, j) => (
                                  <li key={j} className="text-sm text-gray-700 flex items-start">
                                    <span className="text-red-500 mr-2">✕</span>
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Download PDF Button */}
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloadingPdf}
                      className="bg-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloadingPdf ? 'Generating PDF...' : '📄 Download PDF Report'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Paywall (Locked) */
                <>
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
                </>
              )}
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
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">How It Works</h3>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Three simple steps to validate your startup idea with AI-powered insights
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-emerald-600">1</span>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900">Submit Your Idea</h4>
              <p className="text-gray-600 leading-relaxed">Tell us about your startup idea in a sentence or two. No sign-up required.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-emerald-600">2</span>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900">AI Analysis</h4>
              <p className="text-gray-600 leading-relaxed">Our AI analyzes market data, competitors, and user discussions in 120 seconds.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-emerald-600">3</span>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900">Get Report</h4>
              <p className="text-gray-600 leading-relaxed">Receive a detailed validation report with actionable insights and PDF download.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple, Transparent Pricing</h3>
          <p className="text-gray-600 text-center mb-12">Start with a free preview, upgrade when you need more.</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Free</h4>
              <div className="text-4xl font-bold text-gray-900 mb-4">$0</div>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>1 free preview</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>Overall validation score</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>Executive summary</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  <span>Full market analysis</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  <span>PDF download</span>
                </li>
              </ul>
              <a href="#" className="block text-center bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                Try Free
              </a>
            </div>

            {/* Starter */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                Most Popular
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Starter</h4>
              <div className="text-4xl font-bold text-gray-900 mb-4">$9.99</div>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>1 complete report</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>Full market analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>Competitor deep-dive</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>Risk assessment</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>PDF download</span>
                </li>
              </ul>
              <button className="block w-full text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/25">
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Pro</h4>
              <div className="text-4xl font-bold text-gray-900 mb-4">$29<span className="text-lg text-gray-500 font-normal">/mo</span></div>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>3 reports per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>Full market analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>Competitor deep-dive</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>Risk assessment</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span>PDF download</span>
                </li>
              </ul>
              <button className="block w-full text-center bg-white text-emerald-500 border-2 border-emerald-500 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition">
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
