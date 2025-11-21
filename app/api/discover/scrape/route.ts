import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, keywords, count } = body

    // 验证参数
    if (!platform || !keywords || !count) {
      return NextResponse.json({
        success: false,
        error: '缺少必需参数'
      }, { status: 400 })
    }

    if (!['tiktok', 'youtube'].includes(platform)) {
      return NextResponse.json({
        success: false,
        error: '不支持的平台'
      }, { status: 400 })
    }

    // TODO: 调用Apify API启动爬取任务
    // 这里先返回模拟响应
    console.log('启动爬取:', { platform, keywords, count })

    return NextResponse.json({
      success: true,
      taskId: `task_${Date.now()}`,
      message: `已启动${platform}爬取任务，预计${Math.ceil(count / 10)}分钟完成`
    })

  } catch (error: any) {
    console.error('启动爬取失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '服务器错误'
    }, { status: 500 })
  }
}
