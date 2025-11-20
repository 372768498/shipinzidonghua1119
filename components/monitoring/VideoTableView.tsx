'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Play } from 'lucide-react'

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

interface VideoTableViewProps {
  videos: Video[]
  onVideoClick: (video: Video) => void
}

export default function VideoTableView({ videos, onVideoClick }: VideoTableViewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getEngagementRate = (video: Video) => {
    const total = video.likes + video.comments + video.shares
    return ((total / video.views) * 100).toFixed(1)
  }

  const getViralBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-red-500">🔥{score}</Badge>
    if (score >= 80) return <Badge className="bg-orange-500">🔥{score}</Badge>
    if (score >= 70) return <Badge className="bg-yellow-500">📈{score}</Badge>
    return <Badge variant="secondary">{score}</Badge>
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

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">爆款分</TableHead>
            <TableHead className="min-w-[300px]">标题</TableHead>
            <TableHead>作者</TableHead>
            <TableHead className="text-right">播放量</TableHead>
            <TableHead className="text-right">互动率</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>时间</TableHead>
            <TableHead className="text-right w-[180px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => (
            <TableRow key={video.id}>
              <TableCell>{getViralBadge(video.viral_score)}</TableCell>
              <TableCell>
                <div className="font-medium line-clamp-2">{video.title}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">@{video.author_name}</div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatNumber(video.views)}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline">{getEngagementRate(video)}%</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {video.ai_analysis?.content_type || '待分析'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {getTimeAgo(video.created_at)}
              </TableCell>
              <TableCell>
                <div className="flex gap-1 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => onVideoClick(video)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
