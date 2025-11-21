// Dashboard主页契约

// 统计数据
export interface DashboardStats {
  totalVideos: number
  avgViralScore: number
  generatedVideos: number
  publishedVideos: number
}

// 最近活动
export interface RecentActivity {
  id: string
  type: 'discover' | 'generate' | 'publish'
  title: string
  timestamp: string
  status: 'success' | 'processing' | 'failed'
}

// Mock数据
export const mockStats: DashboardStats = {
  totalVideos: 127,
  avgViralScore: 88,
  generatedVideos: 45,
  publishedVideos: 32
}

export const mockActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'discover',
    title: '发现25个TikTok爆款视频',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'success'
  },
  {
    id: '2',
    type: 'generate',
    title: '生成视频：AI编程教程',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: 'processing'
  },
  {
    id: '3',
    type: 'publish',
    title: '发布到YouTube Shorts',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    status: 'success'
  }
]

// API
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard/stats')
  return response.json()
}

export async function getRecentActivities(): Promise<RecentActivity[]> {
  const response = await fetch('/api/dashboard/activities')
  return response.json()
}