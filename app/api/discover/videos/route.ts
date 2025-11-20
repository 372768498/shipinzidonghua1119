import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const sortBy = searchParams.get('sortBy') || 'viral_score'
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabaseAdmin
      .from('viral_videos')
      .select('*')
      .order(sortBy, { ascending: false })
      .limit(limit)

    // 平台筛选
    if (platform && platform !== 'all') {
      query = query.eq('platform', platform)
    }

    const { data, error } = await query

    if (error) {
      console.error('查询视频失败:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      videos: data,
    })
  } catch (error: any) {
    console.error('获取视频列表错误:', error)
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    )
  }
}
