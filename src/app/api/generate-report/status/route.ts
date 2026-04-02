/* eslint-disable no-var */
import { NextRequest, NextResponse } from 'next/server'
import { ValidationReport } from '@/lib/report-generator'

// Global job store - must match the one in route.ts
declare global {
  var jobStore: Map<string, {
    status: 'pending' | 'processing' | 'completed' | 'failed'
    data?: {
      preview: {
        overallScore: number
        executiveSummary: string
        greenLightsCount: number
        competitorsCount: number
        redFlagsCount: number
      }
      full: ValidationReport
    }
    error?: string
    createdAt: number
    completedAt?: number
  }>
}

const getJobStore = () => {
  if (!global.jobStore) {
    global.jobStore = new Map()
  }
  return global.jobStore
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const jobId = searchParams.get('id')

  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID is required' },
      { status: 400 }
    )
  }

  const jobStore = getJobStore()
  const job = jobStore.get(jobId)

  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    jobId,
    status: job.status,
    data: job.data,
    error: job.error,
    progress: job.status === 'completed' ? 100 : job.status === 'processing' ? 50 : 0,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  })
}
