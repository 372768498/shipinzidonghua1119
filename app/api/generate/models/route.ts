import { NextResponse } from 'next/server'
import { mockModels } from '@/contracts/generate.contract'
import type { GetModelsResponse } from '@/contracts/generate.contract'

export async function GET() {
  try {
    const response: GetModelsResponse = {
      success: true,
      models: mockModels
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('获取模型列表失败:', error)
    return NextResponse.json({
      success: false,
      models: [],
      error: error.message || '服务器错误'
    }, { status: 500 })
  }
}
