import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // TODO: 从数据库获取最近活动
    // 目前返回空数组
    return NextResponse.json([])
  } catch (error) {
    console.error('Dashboard activities error:', error)
    return NextResponse.json([])
  }
}