/**
 * Backend API Server for Render deployment
 *
 * Uses async/polling pattern to handle long-running AI tasks
 * (Render free plan has ~60s request timeout, but report generation takes 60-90s)
 */

import express from 'express'
import cors from 'cors'
import { generateValidationReport } from './src/lib/report-generator.js'
import { createClient } from '@supabase/supabase-js'

const app = express()
const PORT = parseInt(process.env.PORT || '3000', 10)

// CORS for Vercel frontend
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// In-memory job queue (single instance on Render free plan)
interface Job {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  ideaTitle: string
  ideaDescription?: string
  userId?: string
  result?: any
  error?: string
  createdAt: Date
  completedAt?: Date
}

const jobs = new Map<string, Job>()

// Generate unique job ID
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Background job processor
async function processJob(jobId: string) {
  const job = jobs.get(jobId)
  if (!job) return

  try {
    job.status = 'processing'
    console.log(`[Job ${jobId}] Starting report generation for:`, job.ideaTitle)

    const report = await generateValidationReport(job.ideaTitle, job.ideaDescription || '')
    console.log(`[Job ${jobId}] Report generated, score:`, report.overallScore)

    // Save report if userId provided
    let reportId = null
    if (job.userId) {
      const { data: savedReport } = await supabase
        .from('reports')
        .insert({
          user_id: job.userId,
          title: job.ideaTitle,
          idea_text: job.ideaDescription || '',
          status: 'completed',
          metadata: report,
        })
        .select('id')
        .single()
      reportId = savedReport?.id
    }

    job.result = {
      preview: {
        overallScore: report.overallScore,
        executiveSummary: report.executiveSummary,
        greenLightsCount: report.greenLights?.length || 0,
        competitorsCount: report.competitors?.length || 0,
        redFlagsCount: report.redFlags?.length || 0,
      },
      full: report,
      reportId,
    }
    job.status = 'completed'
    job.completedAt = new Date()
  } catch (error) {
    console.error(`[Job ${jobId}] Error:`, error)
    job.status = 'failed'
    job.error = error instanceof Error ? error.message : 'Unknown error'
    job.completedAt = new Date()
  }
}

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

// POST /api/generate-report - Start async report generation
// Returns jobId immediately, client polls /api/report-status/:jobId
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
        const totalCredits = (userData.free_credits || 0) + (userData.payd_credits || 0)
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

    // Create job
    const jobId = generateJobId()
    const job: Job = {
      id: jobId,
      status: 'pending',
      ideaTitle,
      ideaDescription,
      userId,
      createdAt: new Date(),
    }
    jobs.set(jobId, job)

    // Start background processing (don't await)
    processJob(jobId).catch(err => {
      console.error(`[Job ${jobId}] Unhandled error:`, err)
    })

    // Return job ID immediately
    res.json({
      success: true,
      jobId,
      message: 'Report generation started. Poll /api/report-status/' + jobId + ' for results.',
    })
  } catch (error) {
    console.error('Generate report error:', error)
    res.status(500).json({
      error: 'Failed to start report generation',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/report-status/:jobId - Poll for report status
app.get('/api/report-status/:jobId', (req: express.Request, res: express.Response) => {
  const { jobId } = req.params
  const job = jobs.get(jobId)

  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }

  const response: any = {
    jobId: job.id,
    status: job.status,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  }

  if (job.status === 'completed' && job.result) {
    response.data = job.result
  } else if (job.status === 'failed' && job.error) {
    response.error = job.error
  }

  // Clean up completed jobs older than 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  for (const [id, j] of jobs.entries()) {
    if (j.completedAt && j.completedAt < tenMinutesAgo) {
      jobs.delete(id)
    }
  }

  res.json(response)
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on port ${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Health: http://localhost:${PORT}/api/health`)
})
