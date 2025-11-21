import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // 获取统计数据
    const { count: totalVideos } = await supabase
      .from('viral_videos')
      .select('*', { count: 'exact', head: true })
    
    const { data: videos } = await supabase
      .from('viral_videos')
      .select('viral_score')
    
    const avgViralScore = videos && videos.length > 0
      ? Math.round(videos.reduce((sum, v) => sum + (v.viral_score || 0), 0) / videos.length)
      : 0

    return NextResponse.json({
      totalVideos: totalVideos || 0,
      avgViralScore,
      generatedVideos: 0, // TODO: 从生成记录表获取
      publishedVideos: 0  // TODO: 从发布记录表获取
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({
      totalVideos: 0,
      avgViralScore: 0,
      generatedVideos: 0,
      publishedVideos: 0
    })
  }
}