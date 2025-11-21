// 视频生成页面 - 接口契约

// ===== 类型定义 =====

export type VideoModel = 'minimax' | 'runway' | 'kling' | 'sora'
export type GenerateStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface GenerateTask {
  id: string
  title: string
  prompt: string
  model: VideoModel
  status: GenerateStatus
  progress: number // 0-100
  video_url?: string
  thumbnail_url?: string
  duration?: number // 秒
  created_at: string
  completed_at?: string
  error_message?: string
  source_video_id?: string // 关联的爆款视频ID
  estimated_cost?: number // 预估成本(美元)
  actual_cost?: number // 实际成本(美元)
}

export interface GenerateParams {
  prompt: string
  model: VideoModel
  duration?: number // 期望时长(秒)
  aspect_ratio?: '16:9' | '9:16' | '1:1'
  source_video_id?: string // 如果基于爆款视频生成
}

export interface ModelInfo {
  id: VideoModel
  name: string
  description: string
  max_duration: number // 最大时长(秒)
  cost_per_second: number // 每秒成本(美元)
  speed: 'fast' | 'medium' | 'slow' // 生成速度
  quality: 'high' | 'medium' | 'low'
  available: boolean
}

export interface TaskFilters {
  status?: GenerateStatus | 'all'
  model?: VideoModel | 'all'
  sortBy?: 'created_at' | 'completed_at' | 'title'
  search?: string
}

// ===== API接口 =====

// GET /api/generate/tasks
export interface GetTasksResponse {
  success: boolean
  tasks: GenerateTask[]
  total: number
  error?: string
}

// POST /api/generate/create
export interface CreateTaskRequest {
  prompt: string
  model: VideoModel
  duration?: number
  aspect_ratio?: '16:9' | '9:16' | '1:1'
  source_video_id?: string
}

export interface CreateTaskResponse {
  success: boolean
  task?: GenerateTask
  taskId?: string
  message?: string
  error?: string
}

// GET /api/generate/tasks/{id}
export interface GetTaskResponse {
  success: boolean
  task?: GenerateTask
  error?: string
}

// DELETE /api/generate/tasks/{id}
export interface DeleteTaskResponse {
  success: boolean
  error?: string
}

// GET /api/generate/models
export interface GetModelsResponse {
  success: boolean
  models: ModelInfo[]
  error?: string
}

// ===== Mock数据 =====

export const mockModels: ModelInfo[] = [
  {
    id: 'minimax',
    name: 'Minimax Video-01',
    description: '高性价比，快速生成，适合批量创作',
    max_duration: 10,
    cost_per_second: 0.05,
    speed: 'fast',
    quality: 'medium',
    available: true
  },
  {
    id: 'runway',
    name: 'Runway Gen-3',
    description: '专业级质量，细节丰富，适合高端内容',
    max_duration: 10,
    cost_per_second: 0.15,
    speed: 'medium',
    quality: 'high',
    available: true
  },
  {
    id: 'kling',
    name: 'Kling AI',
    description: '中国本土，速度快，适合中文场景',
    max_duration: 10,
    cost_per_second: 0.08,
    speed: 'fast',
    quality: 'medium',
    available: true
  },
  {
    id: 'sora',
    name: 'OpenAI Sora 2',
    description: '顶级效果，长视频，价格昂贵',
    max_duration: 60,
    cost_per_second: 0.30,
    speed: 'slow',
    quality: 'high',
    available: false // 暂未开放
  }
]

export const mockTasks: GenerateTask[] = [
  {
    id: '1',
    title: 'AI编程教学视频',
    prompt: 'A professional developer coding in a modern office with AI assistant, screen showing code being written automatically, futuristic atmosphere',
    model: 'runway',
    status: 'completed',
    progress: 100,
    video_url: 'https://example.com/generated/video1.mp4',
    thumbnail_url: 'https://picsum.photos/seed/gen1/400/600',
    duration: 8,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 1800000).toISOString(),
    source_video_id: '1',
    estimated_cost: 1.20,
    actual_cost: 1.20
  },
  {
    id: '2',
    title: 'Prompt工程技巧展示',
    prompt: 'Animated visualization of prompt engineering concepts, colorful text flowing and transforming, abstract tech background',
    model: 'minimax',
    status: 'processing',
    progress: 65,
    thumbnail_url: 'https://picsum.photos/seed/gen2/400/600',
    duration: 6,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    source_video_id: '2',
    estimated_cost: 0.30
  },
  {
    id: '3',
    title: 'AI对决场景动画',
    prompt: 'Two AI robots facing each other in a futuristic arena, dramatic lighting, crowd cheering, epic confrontation scene',
    model: 'kling',
    status: 'completed',
    progress: 100,
    video_url: 'https://example.com/generated/video3.mp4',
    thumbnail_url: 'https://picsum.photos/seed/gen3/400/600',
    duration: 10,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    completed_at: new Date(Date.now() - 5400000).toISOString(),
    source_video_id: '3',
    estimated_cost: 0.80,
    actual_cost: 0.80
  },
  {
    id: '4',
    title: '科技感转场动画',
    prompt: 'High-tech digital transition effects, holographic interfaces, glowing particles, cyberpunk aesthetic',
    model: 'runway',
    status: 'failed',
    progress: 45,
    thumbnail_url: 'https://picsum.photos/seed/gen4/400/600',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    error_message: '生成超时，请重试',
    estimated_cost: 0.75
  },
  {
    id: '5',
    title: '快速编程挑战视频',
    prompt: 'Time-lapse of code being written rapidly, multiple screens showing different programming languages, energetic and fast-paced',
    model: 'minimax',
    status: 'pending',
    progress: 0,
    thumbnail_url: 'https://picsum.photos/seed/gen5/400/600',
    duration: 5,
    created_at: new Date(Date.now() - 600000).toISOString(),
    source_video_id: '5',
    estimated_cost: 0.25
  }
]

// ===== API调用示例 =====

// 获取任务列表
export async function getTasks(filters: TaskFilters = {}): Promise<GetTasksResponse> {
  const params = new URLSearchParams()
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.model && filters.model !== 'all') params.set('model', filters.model)
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.search) params.set('search', filters.search)
  
  const response = await fetch(`/api/generate/tasks?${params}`)
  return response.json()
}

// 创建生成任务
export async function createTask(params: CreateTaskRequest): Promise<CreateTaskResponse> {
  const response = await fetch('/api/generate/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  return response.json()
}

// 获取单个任务
export async function getTask(taskId: string): Promise<GetTaskResponse> {
  const response = await fetch(`/api/generate/tasks/${taskId}`)
  return response.json()
}

// 删除任务
export async function deleteTask(taskId: string): Promise<DeleteTaskResponse> {
  const response = await fetch(`/api/generate/tasks/${taskId}`, {
    method: 'DELETE'
  })
  return response.json()
}

// 获取可用模型
export async function getModels(): Promise<GetModelsResponse> {
  const response = await fetch('/api/generate/models')
  return response.json()
}
