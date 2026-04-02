import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/invite
 *
 * Handles invitation code generation and reward distribution
 *
 * Actions:
 * - 'generate': Generate a unique invite code for user
 * - 'claim': Claim reward using an invite code
 * - 'stats': Get user's invite stats
 */
export async function POST(request: NextRequest) {
  try {
    const { action, inviteCode } = await request.json()

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    let userId: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (error || !user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      userId = user.id
    }

    switch (action) {
      case 'generate':
        return await handleGenerateInvite(userId)
      case 'claim':
        return await handleClaimInvite(userId, inviteCode)
      case 'stats':
        return await handleInviteStats(userId)
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: generate, claim, or stats' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in invite API:', error)
    return NextResponse.json(
      { error: 'Failed to process invitation: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

/**
 * Get Supabase client with proper typing
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase not configured')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

/**
 * Generate a unique invite code for the user
 */
async function handleGenerateInvite(userId: string | null) {
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const supabase = getSupabaseClient()

  // Check if user already has an invite code
  const { data: existingCode } = await supabase
    .from('invite_codes')
    .select('code')
    .eq('user_id', userId)
    .single()

  if (existingCode?.code) {
    return NextResponse.json({
      success: true,
      inviteCode: existingCode.code,
      inviteUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://idea-validation-lite.vercel.app'}?ref=${existingCode.code}`,
      message: 'Invite code already exists',
    })
  }

  // Generate a new unique invite code (8 character alphanumeric)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No I, O, 0, 1 to avoid confusion
  let inviteCode = ''
  let isUnique = false
  let attempts = 0

  while (!isUnique && attempts < 10) {
    inviteCode = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    const { data: existing } = await supabase
      .from('invite_codes')
      .select('code')
      .eq('code', inviteCode)
      .single()
    isUnique = !existing
    attempts++
  }

  // Create invite code record
  const { error } = await supabase
    .from('invite_codes')
    .insert({
      user_id: userId,
      code: inviteCode,
    })

  if (error) {
    console.error('Failed to create invite code:', error)
    return NextResponse.json(
      { error: 'Failed to generate invite code' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    inviteCode,
    inviteUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://idea-validation-lite.vercel.app'}?ref=${inviteCode}`,
    message: 'Invite code generated successfully',
  })
}

/**
 * Claim reward using an invite code
 * Reward structure:
 * - New user gets 1 free credit
 * - Inviter gets 2 free credits
 */
async function handleClaimInvite(newUserId: string | null, inviteCode: string) {
  if (!newUserId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  if (!inviteCode) {
    return NextResponse.json(
      { error: 'Invite code is required' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseClient()

  // Find the invite code
  const { data: inviteData, error: inviteError } = await supabase
    .from('invite_codes')
    .select('user_id, claimed_by, claimed_count')
    .eq('code', inviteCode)
    .single()

  if (inviteError || !inviteData) {
    return NextResponse.json(
      { error: 'Invalid invite code' },
      { status: 404 }
    )
  }

  const inviterId = inviteData.user_id
  const claimedBy = inviteData.claimed_by || []

  // Check if already claimed by this user
  if (claimedBy.includes(newUserId)) {
    return NextResponse.json(
      { error: 'You have already claimed this invite reward' },
      { status: 400 }
    )
  }

  // Check if user is trying to invite themselves
  if (inviterId === newUserId) {
    return NextResponse.json(
      { error: 'Cannot claim your own invite code' },
      { status: 400 }
    )
  }

  // Award credits using sequential updates
  // 1. Award 1 free credit to new user
  const { data: userData } = await supabase
    .from('users')
    .select('free_credits')
    .eq('id', newUserId)
    .single()

  const currentCredits = userData?.free_credits || 0
  await supabase
    .from('users')
    .update({ free_credits: currentCredits + 1 })
    .eq('id', newUserId)

  // 2. Award 2 free credits to inviter
  const { data: inviterData } = await supabase
    .from('users')
    .select('free_credits')
    .eq('id', inviterId)
    .single()

  const inviterCurrentCredits = inviterData?.free_credits || 0
  await supabase
    .from('users')
    .update({ free_credits: inviterCurrentCredits + 2 })
    .eq('id', inviterId)

  // 3. Update claimed_by list
  await supabase
    .from('invite_codes')
    .update({
      claimed_by: [...claimedBy, newUserId],
      claimed_count: (inviteData.claimed_count || 0) + 1,
    })
    .eq('code', inviteCode)

  // 4. Log the invite claim for analytics
  await supabase
    .from('invite_claims')
    .insert({
      invite_code: inviteCode,
      inviter_id: inviterId,
      claimer_id: newUserId,
      credits_awarded: 1,
    })

  return NextResponse.json({
    success: true,
    message: 'Congratulations! You received 1 free credit. Your inviter received 2 free credits.',
    creditsAwarded: 1,
  })
}

/**
 * Get user's invite statistics
 */
async function handleInviteStats(userId: string | null) {
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const supabase = getSupabaseClient()

  // Get user's invite code
  const { data: inviteData } = await supabase
    .from('invite_codes')
    .select('code, claimed_count, claimed_by, created_at')
    .eq('user_id', userId)
    .single()

  if (!inviteData) {
    return NextResponse.json({
      success: true,
      inviteCode: null,
      inviteUrl: null,
      stats: {
        totalInvites: 0,
        creditsEarned: 0,
        joinDate: null,
        recentClaims: [],
      },
    })
  }

  // Get detailed claim history
  const { data: claimsData } = await supabase
    .from('invite_claims')
    .select('claimer_id, created_at')
    .eq('invite_code', inviteData.code)
    .order('created_at', { ascending: false })

  return NextResponse.json({
    success: true,
    inviteCode: inviteData.code,
    inviteUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://idea-validation-lite.vercel.app'}?ref=${inviteData.code}`,
    stats: {
      totalInvites: inviteData.claimed_count || 0,
      creditsEarned: (inviteData.claimed_count || 0) * 2,
      joinDate: inviteData.created_at,
      recentClaims: (claimsData || []).map((c) => ({
        claimedAt: c.created_at,
      })),
    },
  })
}
