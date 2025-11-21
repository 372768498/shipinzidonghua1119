import { NextRequest, NextResponse } from 'next/server'
import { mockTasks } from '@/contracts/generate.contract'
import type { GetTaskResponse, DeleteTaskResponse } from '@/contracts/generate.contract'

// Mock数据存储
let tasks = [...mockTasks]

// GET /api/generate/tasks/[id] - 获取单个任务
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const task = tasks.find(t => t.id === id)

    if (!task) {
      return NextResponse.json({
        success: false,
        error: '任务不存在'
      }, { status: 404 })
    }

    const response: GetTaskResponse = {
      success: true,
      task
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('获取任务详情失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '服务器错误'
    }, { status: 500 })
  }
}

// DELETE /api/generate/tasks/[id] - 删除任务
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const taskIndex = tasks.findIndex(t => t.id === id)

    if (taskIndex === -1) {
      return NextResponse.json({
        success: false,
        error: '任务不存在'
      }, { status: 404 })
    }

    // 删除任务
    tasks.splice(taskIndex, 1)

    const response: DeleteTaskResponse = {
      success: true
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('删除任务失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '服务器错误'
    }, { status: 500 })
  }
}
