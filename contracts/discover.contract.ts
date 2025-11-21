// 爆款发现页面 - 接口契约

// ===== 类型定义 =====
export interface ViralVideo {
  id: string
  platform: 'tiktok' | 'youtube'
  title: string
  description?: string
  thumbnail_url: string
  video_url: string
  author_name: string
  author_avatar?: string
  views: number
  likes: number
  comments: number
  shares: number
  viral_score: number
  scraped_at: string
  ai_analysis?: {
    content_quality: number
    entertainment_value: number
    viral_potential: number
    recommended_prompt: string
  }
}

export interface ScrapeParams {
  platform: 'tiktok' | 'youtube'
  keywords: string
  count: number
}

export interface VideoFilters {
  platform?: 'all' | 'tiktok' | 'youtube'
  minScore?: number
  sortBy?: 'viral_score' | 'views' | 'likes' | 'scraped_at'
  timeRange?: 'all' | 'today' | 'week' | 'month'
  search?: string
}

// ===== API接口 =====

// GET /api/discover/videos
export interface GetVideosResponse {
  success: boolean
  videos: ViralVideo[]
  total: number
  error?: string
}

// POST /api/discover/scrape
export interface ScrapeRequest {
  platform: 'tiktok' | 'youtube'
  keywords: string
  count: number
}

export interface ScrapeResponse {
  success: boolean
  taskId?: string
  message?: string
  error?: string
}

// DELETE /api/discover/videos/{id}
export interface DeleteResponse {
  success: boolean
  error?: string
}

// ===== Mock数据 =====
export const mockVideos: ViralVideo[] = [
  {
    id: '1',
    platform: 'tiktok',
    title: 'AI编程革命：Claude如何改变开发方式',
    description: '探索AI辅助编程的未来',
    thumbnail_url: 'https://picsum.photos/seed/1/400/600',
    video_url: 'https://example.com/video1',
    author_name: 'TechGuru',
    author_avatar: 'https://picsum.photos/seed/avatar1/100',
    views: 1250000,
    likes: 89000,
    comments: 3200,
    shares: 12000,
    viral_score: 92,
    scraped_at: new Date().toISOString(),
    ai_analysis: {
      content_quality: 88,
      entertainment_value: 85,
      viral_potential: 92,
      recommended_prompt: 'Create a tutorial about AI coding assistants with dynamic code examples'
    }
  },
  {
    id: '2',
    platform: 'youtube',
    title: '3分钟学会Prompt Engineering',
    description: '快速掌握AI提示词技巧',
    thumbnail_url: 'https://picsum.photos/seed/2/400/600',
    video_url: 'https://example.com/video2',
    author_name: 'AI学院',
    author_avatar: 'https://picsum.photos/seed/avatar2/100',
    views: 850000,
    likes: 42000,
    comments: 1800,
    shares: 6500,
    viral_score: 85,
    scraped_at: new Date(Date.now() - 86400000).toISOString(),
    ai_analysis: {
      content_quality: 90,
      entertainment_value: 78,
      viral_potential: 85,
      recommended_prompt: 'Educational video about prompt engineering with practical examples'
    }
  },
  {
    id: '3',
    platform: 'tiktok',
    title: 'ChatGPT vs Claude：终极对决',
    thumbnail_url: 'https://picsum.photos/seed/3/400/600',
    video_url: 'https://example.com/video3',
    author_name: 'AI评测师',
    views: 2100000,
    likes: 156000,
    comments: 8900,
    shares: 28000,
    viral_score: 95,
    scraped_at: new Date(Date.now() - 3600000).toISOString(),
    ai_analysis: {
      content_quality: 92,
      entertainment_value: 88,
      viral_potential: 95,
      recommended_prompt: 'Comparison video with split-screen layout and head-to-head tests'
    }
  },
  {
    id: '4',
    platform: 'youtube',
    title: 'AI绘画Midjourney完整教程',
    thumbnail_url: 'https://picsum.photos/seed/4/400/600',
    video_url: 'https://example.com/video4',
    author_name: '创意工坊',
    views: 650000,
    likes: 35000,
    comments: 1200,
    shares: 4800,
    viral_score: 78,
    scraped_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '5',
    platform: 'tiktok',
    title: 'AI写代码有多快？实测震惊',
    thumbnail_url: 'https://picsum.photos/seed/5/400/600',
    video_url: 'https://example.com/video5',
    author_name: '程序员小李',
    views: 1800000,
    likes: 98000,
    comments: 5600,
    shares: 18000,
    viral_score: 88,
    scraped_at: new Date(Date.now() - 7200000).toISOString(),
    ai_analysis: {
      content_quality: 85,
      entertainment_value: 90,
      viral_potential: 88,
      recommended_prompt: 'Speed coding challenge with timer and live commentary'
    }
  }
]

// ===== API调用示例 =====

// 获取视频列表
export async function getVideos(filters: VideoFilters = {}): Promise<GetVideosResponse> {
  const params = new URLSearchParams()
  if (filters.platform && filters.platform !== 'all') params.set('platform', filters.platform)
  if (filters.minScore) params.set('minScore', filters.minScore.toString())
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.search) params.set('search', filters.search)
  
  const response = await fetch(`/api/discover/videos?${params}`)
  return response.json()
}

// 启动爬取
export async function startScrape(params: ScrapeParams): Promise<ScrapeResponse> {
  const response = await fetch('/api/discover/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  return response.json()
}

// 删除视频
export async function deleteVideo(videoId: string): Promise<DeleteResponse> {
  const response = await fetch(`/api/discover/videos/${videoId}`, {
    method: 'DELETE'
  })
  return response.json()
}
