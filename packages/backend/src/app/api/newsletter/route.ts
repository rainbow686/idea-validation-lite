import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: '该邮箱已订阅' },
        { status: 409 }
      )
    }

    // Insert subscription
    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email,
        source: source || 'website',
        subscribed_at: new Date().toISOString(),
      })

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '订阅成功！我们会在产品更新时通知你',
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, error: '订阅失败，请稍后重试' },
      { status: 500 }
    )
  }
}
