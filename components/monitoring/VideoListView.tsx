'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Play, ThumbsUp, MessageCircle, Share2, Clock } from 'lucide-react'
import Image from 'next/image'

interface Video {
  id: string
  title: string
  thumbnail_url: string
  video_url: string
  views: number
  likes: number
  comments: number
  shares: number
  viral_score: number
  author_name: string
  platform: string
  created_at: string
  ai_analysis?: any
}

interface VideoListViewProps {
  videos: Video[]
  onVideoClick: (video: Video) => void
}

export default function VideoListView({ videos, onVideoClick }: VideoListViewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getViralBadge = (score: number) => {
    if (score >= 90)
      return (
        <Badge className="bg-red-500 hover:bg-red-600">
          🔥 {score} 超级爆款
        </Badge>
      )
    if (score >= 80)
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">
          🔥 {score} 大爆款
        </Badge>
      )
    if (score >= 70)
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          📈 {score} 高人气
        </Badge>
      )
    return (
      <Badge variant="secondary">
        {score} 普通
      </Badge>
    )
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    return '刚刚'
  }

  const getEngagementRate = (video: Video) => {
    const total = video.likes + video.comments + video.shares
    return ((total / video.views) * 100).toFixed(1)
  }

  const getContentType = (analysis: any) => {
    if (!analysis?.content_type) return '待分析'
    return analysis.content_type
  }

  return (
    <div className="space-y-3">
      {videos.map((video) => (
        <Card key={video.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* 缩略图 */}
              <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                {video.thumbnail_url ? (
                  <Image
                    src={video.thumbnail_url}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {/* 爆款分徽章 */}
                <div className="absolute top-2 left-2">{getViralBadge(video.viral_score)}</div>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 min-w-0">
                {/* 标题和平台 */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2 flex-1">{video.title}</h3>
                </div>

                {/* 作者和时间 */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    {video.platform === 'tiktok' ? '🎵' : '▶️'} {video.platform}
                  </span>
                  <span>@{video.author_name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(video.created_at)}
                  </span>
                </div>

                {/* 数据指标 */}
                <div className="flex items-center gap-6 text-sm mb-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-blue-500" />
                    {formatNumber(video.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4 text-red-500" />
                    {formatNumber(video.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    {formatNumber(video.comments)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-4 h-4 text-purple-500" />
                    {formatNumber(video.shares)}
                  </span>
                  <Badge variant="outline">互动率 {getEngagementRate(video)}%</Badge>
                </div>

                {/* AI分析标签 */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">
                    💡 {getContentType(video.ai_analysis)}
                  </Badge>
                  {video.ai_analysis?.viral_factors?.emotion && (
                    <Badge variant="secondary">
                      {video.ai_analysis.viral_factors.emotion}
                    </Badge>
                  )}
                  {video.ai_analysis && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      ✓ AI已分析
                    </Badge>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => onVideoClick(video)}>
                    <Eye className="w-4 h-4 mr-1" />
                    查看详情
                  </Button>
                  <Button size="sm" variant="default">
                    <Play className="w-4 h-4 mr-1" />
                    用这个生成
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                      查看原视频
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
