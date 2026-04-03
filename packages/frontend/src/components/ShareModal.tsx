'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  reportData: {
    overallScore: number
    executiveSummary: string
    greenLights?: string[]
    redFlags?: string[]
    marketSize?: { TAM?: string; SAM?: string; SOM?: string }
    [key: string]: unknown
  }
  ideaTitle: string
  reportUrl?: string
  reportId?: string
  reportSlug?: string
}

export default function ShareModal({
  isOpen,
  onClose,
  reportData,
  ideaTitle,
  reportUrl,
  reportId,
  reportSlug,
}: ShareModalProps) {
  const [posterHtml, setPosterHtml] = useState<string>('')
  const [posterSvg, setPosterSvg] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'poster' | 'link'>('poster')
  const [copied, setCopied] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  // Generate public share URL
  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    const baseUrl = window.location.origin
    if (reportSlug) return `${baseUrl}/report/${reportSlug}`
    if (reportId) return `${baseUrl}/report/${reportId}`
    return reportUrl || window.location.href
  }

  const generatePoster = useCallback(async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/share/generate-poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaTitle,
          reportData,
          score: reportData.overallScore,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPosterHtml(data.html)
        setPosterSvg(data.svg)
      }
    } catch (error) {
      console.error('Failed to generate poster:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [ideaTitle, reportData])

  useEffect(() => {
    if (isOpen && reportData) {
      generatePoster()
    }
  }, [isOpen, reportData, generatePoster])

  const handleDownload = async () => {
    if (!posterRef.current) return

    // Use html2canvas if available, otherwise fall back to simple download
    const win = window as unknown as Record<string, unknown>
    if (win.html2canvas) {
      try {
        const html2canvasFn = win.html2canvas as unknown as (elem: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>
        const canvas = await html2canvasFn(posterRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
        })

        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `ideaproof-${ideaTitle.replace(/\s+/g, '-').toLowerCase()}-poster.png`
            link.click()
            URL.revokeObjectURL(url)
          }
        }, 'image/png')
      } catch (error) {
        console.error('Failed to download poster:', error)
      }
    } else {
      // Fallback: download SVG
      downloadSvg()
    }
  }

  const downloadSvg = () => {
    if (!posterSvg) return

    const blob = new Blob([posterSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ideaproof-${ideaTitle.replace(/\s+/g, '-').toLowerCase()}-poster.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async (platform: string) => {
    const url = getShareUrl()
    const text = `我刚用 IdeaProof 验证了一个创意：${ideaTitle}，得分 ${reportData.overallScore}/100。快来看看！`

    const shareUrls: Record<string, string> = {
      wechat: `https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsg?content=${encodeURIComponent(text + ' ' + url)}`,
      weibo: `https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    }

    if (platform === 'copy') {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    }

    if (navigator.share && platform === 'native') {
      try {
        await navigator.share({
          title: 'IdeaProof 验证报告',
          text,
          url,
        })
      } catch {
        // User cancelled
      }
      return
    }

    const shareUrl = shareUrls[platform]
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">分享你的验证报告</h2>
            <p className="text-sm text-gray-500">分享给朋友、投资人或社交媒体</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('poster')}
              className={`px-6 py-3 text-sm font-medium transition ${
                activeTab === 'poster'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 分享海报
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`px-6 py-3 text-sm font-medium transition ${
                activeTab === 'link'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔗 分享链接
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'poster' && (
            <div className="p-6">
              {/* Poster Preview */}
              <div className="mb-6">
                {isGenerating ? (
                  <div className="aspect-[4/5] bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">正在生成海报...</p>
                    </div>
                  </div>
                ) : posterHtml ? (
                  <div className="relative">
                    {/* Render poster using iframe for isolation */}
                    <iframe
                      srcDoc={posterHtml}
                      className="w-full aspect-[4/5] rounded-xl shadow-lg border border-gray-200"
                      sandbox=""
                      title="分享海报预览"
                    />
                    {/* Hidden div for html2canvas */}
                    <div
                      ref={posterRef}
                      className="absolute top-0 left-0 opacity-0 pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: posterHtml }}
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/5] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                    海报生成失败，请重试
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleDownload}
                    disabled={isGenerating || !posterHtml}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📥 下载海报
                  </button>
                  <button
                    onClick={() => handleShare('native')}
                    disabled={isGenerating || !posterHtml}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📤 系统分享
                  </button>
                </div>

                {/* Share Channels */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-3 text-center">分享到</p>
                  <div className="flex justify-center gap-4">
                    <ShareButton
                      icon="💬"
                      label="微信"
                      onClick={() => handleShare('wechat')}
                    />
                    <ShareButton
                      icon="🧣"
                      label="微博"
                      onClick={() => handleShare('weibo')}
                    />
                    <ShareButton
                      icon="🐦"
                      label="Twitter"
                      onClick={() => handleShare('twitter')}
                    />
                    <ShareButton
                      icon="💼"
                      label="LinkedIn"
                      onClick={() => handleShare('linkedin')}
                    />
                    <ShareButton
                      icon="🔗"
                      label={copied ? '已复制' : '复制链接'}
                      onClick={() => handleShare('copy')}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'link' && (
            <div className="p-6">
              {/* Link Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{ideaTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      验证得分：{reportData.overallScore}/100
                    </p>
                    <p className="text-xs text-gray-500 mt-2 truncate">
                      {reportData.executiveSummary?.substring(0, 100) || 'IdeaProof 验证报告'}
                    </p>
                  </div>
                </div>
              </div>

              {/* URL Copy */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  公开报告链接
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl()}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm"
                  />
                  <button
                    onClick={() => handleShare('copy')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                  >
                    {copied ? '已复制!' : '复制'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 提示：任何知道此链接的人都可以查看报告
                </p>
              </div>

              {/* QR Code Placeholder */}
              <div className="text-center">
                <div className="inline-block p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="w-32 h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    [二维码]
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">扫描二维码查看完整报告</p>
              </div>
            </div>
          )}
        </div>

        {/* Invite Section */}
        <div className="border-t px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">🎁 邀请好友，获得免费额度</p>
              <p className="text-xs text-gray-500">好友得 1 次免费验证，你得 2 次</p>
            </div>
            <a
              href="/dashboard?tab=invites"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              查看邀请
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShareButton({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition min-w-[64px]"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs text-gray-600">{label}</span>
    </button>
  )
}
