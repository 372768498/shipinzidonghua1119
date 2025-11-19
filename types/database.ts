// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      viral_videos: {
        Row: ViralVideo
        Insert: Omit<ViralVideo, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ViralVideo, 'id' | 'created_at' | 'updated_at'>>
      }
      video_generation_tasks: {
        Row: VideoGenerationTask
        Insert: Omit<VideoGenerationTask, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<VideoGenerationTask, 'id' | 'created_at' | 'updated_at'>>
      }
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

// 用户
export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  quota: number
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}

// 爆款视频
export interface ViralVideo {
  id: string
  platform: 'tiktok' | 'youtube' | 'instagram'
  platform_video_id: string
  title: string | null
  description: string | null
  thumbnail_url: string | null
  video_url: string | null
  views: number
  likes: number
  comments: number
  shares: number
  viral_score: number | null
  ai_analysis: AIAnalysis | null
  author_name: string | null
  author_id: string | null
  published_at: string | null
  scraped_at: string
  created_at: string
  updated_at: string
}

// AI分析结果
export interface AIAnalysis {
  summary: string
  key_points: string[]
  content_type: string
  target_audience: string
  viral_factors: string[]
  recommended_prompt: string
}

// 视频生成任务
export interface VideoGenerationTask {
  id: string
  user_id: string
  prompt: string
  ai_model: 'minimax' | 'runway' | 'kling'
  duration: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  video_url: string | null
  thumbnail_url: string | null
  error_message: string | null
  fal_request_id: string | null
  published_to_youtube: boolean
  youtube_video_id: string | null
  youtube_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}
