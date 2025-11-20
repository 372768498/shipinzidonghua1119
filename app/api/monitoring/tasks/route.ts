import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * 获取所有监控任务
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active')

    let query = supabaseAdmin
      .from('monitoring_tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, tasks: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * 创建新的监控任务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      task_type = 'hashtag',
      target_value,
      platform = 'tiktok',
      frequency = 'every_6_hours',
      description,
    } = body

    if (!target_value) {
      return NextResponse.json(
        { error: '请指定监控目标（关键词/话题标签）' },
        { status: 400 }
      )
    }

    // 创建监控任务
    const { data, error } = await supabaseAdmin
      .from('monitoring_tasks')
      .insert({
        task_type,
        target_value,
        platform,
        frequency,
        is_active: true,
        apify_run_input: {
          hashtags: target_value.split(',').map((k: string) => k.trim()),
          resultsPerPage: 100,
          shouldDownloadVideos: false,
        },
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      task: data,
      message: `监控任务已创建：${target_value}`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
