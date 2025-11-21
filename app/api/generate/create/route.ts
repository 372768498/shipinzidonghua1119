import { NextRequest, NextResponse } from 'next/server'
import type { CreateTaskRequest, CreateTaskResponse, GenerateTask } from '@/contracts/generate.contract'

export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskRequest = await request.json()

    // 验证必填字段
    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Prompt不能为空'
      }, { status: 400 })
    }

    if (!body.model) {
      return NextResponse.json({
        success: false,
        error: '请选择生成模型'
      }, { status: 400 })
    }

    // 创建新任务
    const newTask: GenerateTask = {
      id: Date.now().toString(),
      title: body.prompt.slice(0, 50) + (body.prompt.length > 50 ? '...' : ''),
      prompt: body.prompt,
      model: body.model,
      status: 'pending',
      progress: 0,
      duration: body.duration || 5,
      created_at: new Date().toISOString(),
      source_video_id: body.source_video_id,
      estimated_cost: calculateCost(body.model, body.duration || 5)
    }

    // 模拟异步处理：2秒后更新状态为processing
    setTimeout(() => {
      // 在实际应用中，这里会触发真实的视频生成任务
      console.log('任务开始处理:', newTask.id)
    }, 2000)

    const response: CreateTaskResponse = {
      success: true,
      task: newTask,
      taskId: newTask.id,
      message: '任务创建成功，正在排队处理...'
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error: any) {
    console.error('创建任务失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '服务器错误'
    }, { status: 500 })
  }
}

// 计算预估成本
function calculateCost(model: string, duration: number): number {
  const costPerSecond: Record<string, number> = {
    minimax: 0.05,
    runway: 0.15,
    kling: 0.08,
    sora: 0.30
  }
  return (costPerSecond[model] || 0.05) * duration
}
