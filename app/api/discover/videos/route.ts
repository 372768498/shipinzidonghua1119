import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const platform = searchParams.get('platform')
    const minScore = searchParams.get('minScore')
    const sortBy = searchParams.get('sortBy') || 'viral_score'
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') || '100'

    const supabase = createServerClient()
    let query = supabase
      .from('viral_videos')
      .select('*')
      .limit(parseInt(limit))

    // 平台筛选
    if (platform && platform !== 'all') {
      query = query.eq('platform', platform)
    }

    // 爆款分筛选
    if (minScore) {
      query = query.gte('viral_score', parseInt(minScore))
    }

    // 搜索
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,author_name.ilike.%${search}%`)
    }

    // 排序
    query = query.order(sortBy, { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('数据库查询错误:', error)
      return NextResponse.json({
        success: false,
        error: '获取视频失败'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      videos: data || [],
      total: data?.length || 0
    })

  } catch (error: any) {
    console.error('获取视频列表失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '服务器错误'
    }, { status: 500 })
  }
}
