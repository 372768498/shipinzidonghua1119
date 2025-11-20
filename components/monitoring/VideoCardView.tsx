'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Play, ThumbsUp, MessageCircle } from 'lucide-react'
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

interface VideoCardViewProps {
  videos: Video[]
  onVideoClick: (video: Video) => void
}

export default function VideoCardView({ videos, onVideoClick }: VideoCardViewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getViralBadge = (score: number) => {
    if (score >= 90) return { text: `🔥 ${score}`, color: 'bg-red-500' }
    if (score >= 80) return { text: `🔥 ${score}`, color: 'bg-orange-500' }
    if (score >= 70) return { text: `📈 ${score}`, color: 'bg-yellow-500' }
    return { text: score.toString(), color: 'bg-gray-500' }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {videos.map((video) => {
        const badge = getViralBadge(video.viral_score)
        return (
          <Card key={video.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            {/* 缩略图 */}
            <div className="relative w-full aspect-video bg-muted">
              {video.thumbnail_url ? (
                <Image
                  src={video.thumbnail_url}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className={`absolute top-2 left-2 px-2 py-1 rounded text-white text-sm font-bold ${badge.color}`}>
                {badge.text}
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* 标题 */}
              <h3 className="font-semibold line-clamp-2 min-h-[48px]">{video.title}</h3>

              {/* 作者 */}
              <p className="text-sm text-muted-foreground">@{video.author_name}</p>

              {/* 数据 */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex flex-col items-center">
                  <Eye className="w-4 h-4 text-blue-500 mb-1" />
                  <span className="font-medium">{formatNumber(video.views)}</span>
                </div>
                <div className="flex flex-col items-center">
                  <ThumbsUp className="w-4 h-4 text-red-500 mb-1" />
                  <span className="font-medium">{formatNumber(video.likes)}</span>
                </div>
                <div className="flex flex-col items-center">
                  <MessageCircle className="w-4 h-4 text-green-500 mb-1" />
                  <span className="font-medium">{formatNumber(video.comments)}</span>
                </div>
              </div>

              {/* AI标签 */}
              {video.ai_analysis && (
                <Badge variant="secondary" className="w-full justify-center">
                  💡 {video.ai_analysis.content_type || '已分析'}
                </Badge>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => onVideoClick(video)}>
                  详情
                </Button>
                <Button size="sm" className="flex-1">
                  生成
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
