import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * 获取爆款视频列表
 * 支持筛选、排序、分页
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 获取查询参数
    const task = searchParams.get('task') || 'all'
    const sort = searchParams.get('sort') || 'viral_score'
    const minViralScore = parseInt(searchParams.get('minViralScore') || '0')
    const minViews = parseInt(searchParams.get('minViews') || '0')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 构建查询
    let query = supabaseAdmin
      .from('viral_videos')
      .select('*', { count: 'exact' })

    // 筛选条件
    if (minViralScore > 0) {
      query = query.gte('viral_score', minViralScore)
    }

    if (minViews > 0) {
      query = query.gte('views', minViews)
    }

    // 搜索
    if (search) {
      query = query.or(`title.ilike.%${search}%,author_name.ilike.%${search}%`)
    }

    // 排序
    const sortColumn = sort.replace(/_/g, '_')
    query = query.order(sortColumn, { ascending: false })

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('查询视频错误:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      videos: data || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('获取视频列表错误:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
