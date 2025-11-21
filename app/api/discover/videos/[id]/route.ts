import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id

    if (!videoId) {
      return NextResponse.json({
        success: false,
        error: '缺少视频ID'
      }, { status: 400 })
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('viral_videos')
      .delete()
      .eq('id', videoId)

    if (error) {
      console.error('删除视频错误:', error)
      return NextResponse.json({
        success: false,
        error: '删除失败'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true
    })

  } catch (error: any) {
    console.error('删除视频失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '服务器错误'
    }, { status: 500 })
  }
}
