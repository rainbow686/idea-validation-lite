import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

export async function POST(request: NextRequest) {
  try {
    const { reportId, isPublic = false } = await request.json()

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify report exists and belongs to user
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, user_id, is_public')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Update report public status
    await supabase
      .from('reports')
      .update({ is_public: isPublic })
      .eq('id', reportId)

    // Check if share already exists
    const { data: existingShare } = await supabase
      .from('report_shares')
      .select('slug')
      .eq('report_id', reportId)
      .single()

    if (existingShare) {
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/report/${existingShare.slug}`
      return NextResponse.json({ shareUrl, slug: existingShare.slug, created: false })
    }

    // Generate short slug
    const slug = nanoid()

    // Create share record
    const { error } = await supabase
      .from('report_shares')
      .insert({
        report_id: reportId,
        slug,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      })

    if (error) throw error

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/report/${slug}`

    return NextResponse.json({ shareUrl, slug, created: true })
  } catch (error) {
    console.error('Error creating share link:', error)
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: share, error } = await supabase
      .from('report_shares')
      .select('report_id, expires_at, reports(title, idea_text, metadata, is_public)')
      .eq('slug', slug)
      .single()

    if (error || !share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }

    // Check if expired
    if (new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share expired' }, { status: 410 })
    }

    return NextResponse.json({
      valid: true,
      report: share.reports,
    })
  } catch (error) {
    console.error('Error checking share:', error)
    return NextResponse.json({ error: 'Failed to check share' }, { status: 500 })
  }
}
