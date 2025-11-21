// YouTube发布页面 - 接口契约

// ===== 类型定义 =====

export type PublishStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'
export type PrivacyStatus = 'public' | 'private' | 'unlisted'
export type ConnectionStatus = 'connected' | 'disconnected' | 'expired' | 'error'

// YouTube频道信息
export interface YouTubeChannel {
  id: string
  title: string
  description: string
  thumbnail_url: string
  subscriber_count: number
  video_count: number
  connected_at: string
  last_upload_at?: string
}

// 视频元数据
export interface VideoMetadata {
  title: string
  description: string
  tags: string[]
  category_id?: string // YouTube分类ID
  privacy_status: PrivacyStatus
  made_for_kids: boolean
  thumbnail_file?: File // 自定义缩略图
}

// 发布任务
export interface PublishTask {
  id: string
  video_id: string // 关联的生成视频ID
  video_url: string // 本地视频URL
  video_title: string
  metadata: VideoMetadata
  status: PublishStatus
  progress: number // 0-100
  youtube_video_id?: string // YouTube视频ID
  youtube_url?: string // YouTube视频链接
  scheduled_time?: string // 定时发布时间
  created_at: string
  published_at?: string
  error_message?: string
  views?: number // 发布后的观看数
  likes?: number // 点赞数
  comments?: number // 评论数
}

// OAuth连接状态
export interface OAuthConnection {
  status: ConnectionStatus
  channel?: YouTubeChannel
  access_token_expires_at?: string
  scopes: string[]
  error_message?: string
}

// 发布统计
export interface PublishStats {
  total_published: number
  total_scheduled: number
  total_failed: number
  total_views: number
  total_likes: number
  publishing_today: number
  quota_used: number // YouTube API配额使用量
  quota_limit: number
}

// 分类选项
export interface CategoryOption {
  id: string
  name: string
  description: string
}

// 任务筛选
export interface TaskFilters {
  status?: PublishStatus | 'all'
  sortBy?: 'created_at' | 'published_at' | 'views'
  search?: string
}

// ===== API接口 =====

// GET /api/publish/connection - 获取OAuth连接状态
export interface GetConnectionResponse {
  success: boolean
  connection?: OAuthConnection
  error?: string
}

// POST /api/publish/connect - 发起OAuth连接
export interface ConnectRequest {
  redirect_uri: string
}

export interface ConnectResponse {
  success: boolean
  auth_url?: string
  error?: string
}

// POST /api/publish/disconnect - 断开OAuth连接
export interface DisconnectResponse {
  success: boolean
  error?: string
}

// GET /api/publish/tasks - 获取发布任务列表
export interface GetTasksResponse {
  success: boolean
  tasks: PublishTask[]
  total: number
  error?: string
}

// POST /api/publish/create - 创建发布任务
export interface CreateTaskRequest {
  video_id: string // 生成的视频ID
  metadata: VideoMetadata
  scheduled_time?: string // 可选：定时发布
}

export interface CreateTaskResponse {
  success: boolean
  task?: PublishTask
  taskId?: string
  message?: string
  error?: string
}

// POST /api/publish/upload/{id} - 立即上传发布
export interface UploadTaskResponse {
  success: boolean
  youtube_video_id?: string
  youtube_url?: string
  error?: string
}

// DELETE /api/publish/tasks/{id} - 删除任务
export interface DeleteTaskResponse {
  success: boolean
  error?: string
}

// GET /api/publish/stats - 获取发布统计
export interface GetStatsResponse {
  success: boolean
  stats?: PublishStats
  error?: string
}

// GET /api/publish/categories - 获取YouTube分类列表
export interface GetCategoriesResponse {
  success: boolean
  categories: CategoryOption[]
  error?: string
}

// ===== Mock数据 =====

export const mockChannel: YouTubeChannel = {
  id: 'UCxxx',
  title: 'AI编程教学频道',
  description: '专注于AI辅助编程、Prompt工程和自动化开发',
  thumbnail_url: 'https://picsum.photos/seed/channel/200/200',
  subscriber_count: 12500,
  video_count: 156,
  connected_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
  last_upload_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString()
}

export const mockConnection: OAuthConnection = {
  status: 'connected',
  channel: mockChannel,
  access_token_expires_at: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
  scopes: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly'
  ]
}

export const mockCategories: CategoryOption[] = [
  { id: '28', name: '科学与技术', description: '科技、编程、教程' },
  { id: '27', name: '教育', description: '教学、学习、知识分享' },
  { id: '22', name: '人物与博客', description: 'Vlog、个人频道' },
  { id: '24', name: '娱乐', description: '娱乐、搞笑、综艺' },
  { id: '10', name: '音乐', description: '音乐、MV、音乐教学' },
  { id: '26', name: '操作指南与风格', description: '教程、DIY、指南' }
]

export const mockStats: PublishStats = {
  total_published: 24,
  total_scheduled: 3,
  total_failed: 2,
  total_views: 156780,
  total_likes: 8923,
  publishing_today: 1,
  quota_used: 4500,
  quota_limit: 10000
}

export const mockTasks: PublishTask[] = [
  {
    id: '1',
    video_id: '1',
    video_url: 'https://example.com/generated/video1.mp4',
    video_title: 'AI编程教学视频',
    metadata: {
      title: '10分钟学会AI辅助编程 | Claude Code完整教程',
      description: '在这个视频中，我将教你如何使用AI工具来加速编程...\n\n时间轴：\n00:00 - 介绍\n02:30 - 环境配置\n05:00 - 实战演示\n08:00 - 总结\n\n相关链接：\nhttps://claude.ai\n\n#AI编程 #Claude #教程',
      tags: ['AI编程', 'Claude', 'Prompt工程', '编程教程', '人工智能'],
      category_id: '28',
      privacy_status: 'public',
      made_for_kids: false
    },
    status: 'published',
    progress: 100,
    youtube_video_id: 'dQw4w9WgXcQ',
    youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    published_at: new Date(Date.now() - 20 * 3600000).toISOString(),
    views: 3456,
    likes: 289,
    comments: 45
  },
  {
    id: '2',
    video_id: '2',
    video_url: 'https://example.com/generated/video2.mp4',
    video_title: 'Prompt工程技巧展示',
    metadata: {
      title: 'Prompt工程必学技巧 | 5个让AI更懂你的方法',
      description: 'Prompt工程是AI时代的必备技能...',
      tags: ['Prompt工程', 'AI技巧', 'ChatGPT', 'Claude'],
      category_id: '28',
      privacy_status: 'public',
      made_for_kids: false
    },
    status: 'publishing',
    progress: 75,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    views: 0
  },
  {
    id: '3',
    video_id: '3',
    video_url: 'https://example.com/generated/video3.mp4',
    video_title: 'AI对决场景动画',
    metadata: {
      title: 'AI模型大对决！Claude vs GPT-4 vs Gemini',
      description: '谁是最强AI？实战对比三大主流AI模型...',
      tags: ['AI对比', 'Claude', 'GPT-4', 'Gemini', '评测'],
      category_id: '28',
      privacy_status: 'public',
      made_for_kids: false
    },
    status: 'scheduled',
    progress: 0,
    scheduled_time: new Date(Date.now() + 12 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '4',
    video_id: '4',
    video_url: 'https://example.com/generated/video4.mp4',
    video_title: '科技感转场动画',
    metadata: {
      title: '超酷科技转场特效合集 | 免费下载',
      description: '精选10个科技感转场动画...',
      tags: ['转场特效', '视频剪辑', '特效素材'],
      category_id: '22',
      privacy_status: 'unlisted',
      made_for_kids: false
    },
    status: 'failed',
    progress: 30,
    created_at: new Date(Date.now() - 10800000).toISOString(),
    error_message: 'YouTube API配额不足，请明天重试'
  },
  {
    id: '5',
    video_id: '5',
    video_url: 'https://example.com/generated/video5.mp4',
    video_title: '快速编程挑战视频',
    metadata: {
      title: '1小时编程挑战 | 用AI完成5个项目',
      description: '挑战在1小时内用AI辅助完成5个完整项目...',
      tags: ['编程挑战', 'AI编程', '快速开发', '项目教程'],
      category_id: '28',
      privacy_status: 'private',
      made_for_kids: false
    },
    status: 'draft',
    progress: 0,
    created_at: new Date(Date.now() - 600000).toISOString()
  }
]

// ===== API调用函数 =====

// 获取OAuth连接状态
export async function getConnection(): Promise<GetConnectionResponse> {
  const response = await fetch('/api/publish/connection')
  return response.json()
}

// 发起OAuth连接
export async function connectYouTube(redirect_uri: string): Promise<ConnectResponse> {
  const response = await fetch('/api/publish/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ redirect_uri })
  })
  return response.json()
}

// 断开OAuth连接
export async function disconnectYouTube(): Promise<DisconnectResponse> {
  const response = await fetch('/api/publish/disconnect', {
    method: 'POST'
  })
  return response.json()
}

// 获取发布任务列表
export async function getTasks(filters: TaskFilters = {}): Promise<GetTasksResponse> {
  const params = new URLSearchParams()
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.search) params.set('search', filters.search)
  
  const response = await fetch(`/api/publish/tasks?${params}`)
  return response.json()
}

// 创建发布任务
export async function createTask(request: CreateTaskRequest): Promise<CreateTaskResponse> {
  const response = await fetch('/api/publish/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  })
  return response.json()
}

// 立即上传发布
export async function uploadTask(taskId: string): Promise<UploadTaskResponse> {
  const response = await fetch(`/api/publish/upload/${taskId}`, {
    method: 'POST'
  })
  return response.json()
}

// 删除任务
export async function deleteTask(taskId: string): Promise<DeleteTaskResponse> {
  const response = await fetch(`/api/publish/tasks/${taskId}`, {
    method: 'DELETE'
  })
  return response.json()
}

// 获取发布统计
export async function getStats(): Promise<GetStatsResponse> {
  const response = await fetch('/api/publish/stats')
  return response.json()
}

// 获取YouTube分类列表
export async function getCategories(): Promise<GetCategoriesResponse> {
  const response = await fetch('/api/publish/categories')
  return response.json()
}
