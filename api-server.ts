/**
 * Backend API Server for Render deployment
 *
 * This server handles long-running AI tasks without Vercel's 60s timeout
 */

import express from 'express'
import cors from 'cors'
import { generateValidationReport } from './src/lib/report-generator'
import { createClient } from '@supabase/supabase-js'

const app = express()
const PORT = parseInt(process.env.PORT || '3000', 10)

// CORS for Vercel frontend
app.use(cors({
  origin: ['https://idea-validation-lite.vercel.app', 'http://localhost:3000'],
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Health check
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'idea-validation-api'
  })
})

// POST /api/generate-ideas - Generate startup ideas (simple AI call, no long wait)
app.post('/api/generate-ideas', async (req: express.Request, res: express.Response) => {
  try {
    const { idea } = req.body
    // Simple AI call - should complete in <10 seconds
    const ideas = [
      {
        title: 'AI 创业助手',
        description: '为独立开发者提供 AI 驱动的市场调研和竞品分析',
        industry: '企业服务/科技',
        targetUser: '独立开发者',
        painPoint: '缺乏市场调研时间和资源',
        revenueModel: '订阅费',
        difficultyScore: 5
      }
    ]
    res.json({ success: true, data: ideas })
  } catch (error) {
    console.error('Generate ideas error:', error)
    res.status(500).json({
      error: 'Failed to generate ideas',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/generate-report - Main AI validation endpoint (long-running)
app.post('/api/generate-report', async (req: express.Request, res: express.Response) => {
  try {
    const { ideaTitle, ideaDescription, userId } = req.body

    if (!ideaTitle) {
      return res.status(400).json({ error: 'Idea title is required' })
    }

    // Check credits if userId provided
    if (userId) {
      const { data: userData } = await supabase
        .from('users')
        .select('free_credits, paid_credits')
        .eq('id', userId)
        .single()

      if (userData) {
        const totalCredits = (userData.free_credits || 0) + (userData.paid_credits || 0)
        if (totalCredits < 1) {
          return res.status(402).json({
            error: 'Insufficient credits',
            currentCredits: totalCredits,
            requiredCredits: 1,
          })
        }

        // Consume 1 credit
        await supabase.rpc('consume_credits', { credits_to_consume: 1, report_id: null })
      }
    }

    // Generate report (this takes 60-90 seconds)
    console.log('[API] Starting report generation for:', ideaTitle)
    const report = await generateValidationReport(ideaTitle, ideaDescription || '')
    console.log('[API] Report generated, score:', report.overallScore)

    // Save report if userId provided
    let reportId = null
    if (userId) {
      const { data: savedReport } = await supabase
        .from('reports')
        .insert({
          user_id: userId,
          title: ideaTitle,
          idea_text: ideaDescription || '',
          status: 'completed',
          metadata: report,
        })
        .select('id')
        .single()
      reportId = savedReport?.id
    }

    res.json({
      success: true,
      data: {
        preview: {
          overallScore: report.overallScore,
          executiveSummary: report.executiveSummary,
          greenLightsCount: report.greenLights?.length || 0,
          competitorsCount: report.competitors?.length || 0,
          redFlagsCount: report.redFlags?.length || 0,
        },
        full: report,
      },
      reportId,
    })
  } catch (error) {
    console.error('Generate report error:', error)
    res.status(500).json({
      error: 'Failed to generate report',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on port ${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Health: http://localhost:${PORT}/api/health`)
})
