import { NextRequest, NextResponse } from 'next/server'
import { mockTasks } from '@/contracts/generate.contract'
import type { GetTasksResponse, TaskFilters } from '@/contracts/generate.contract'

// Mock数据存储（实际应该用数据库）
let tasks = [...mockTasks]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const model = searchParams.get('model')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const search = searchParams.get('search')

    let filteredTasks = [...tasks]

    // 状态筛选
    if (status && status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === status)
    }

    // 模型筛选
    if (model && model !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.model === model)
    }

    // 搜索
    if (search) {
      const searchLower = search.toLowerCase()
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.prompt.toLowerCase().includes(searchLower)
      )
    }

    // 排序
    filteredTasks.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] as string
      const bValue = b[sortBy as keyof typeof b] as string
      return bValue.localeCompare(aValue)
    })

    const response: GetTasksResponse = {
      success: true,
      tasks: filteredTasks,
      total: filteredTasks.length
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('获取任务列表失败:', error)
    return NextResponse.json({
      success: false,
      tasks: [],
      total: 0,
      error: error.message || '服务器错误'
    }, { status: 500 })
  }
}
