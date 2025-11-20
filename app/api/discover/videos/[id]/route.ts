import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { error } = await supabaseAdmin
      .from('viral_videos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除视频失败:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('删除视频错误:', error)
    return NextResponse.json(
      { error: error.message || '删除失败' },
      { status: 500 }
    )
  }
}
