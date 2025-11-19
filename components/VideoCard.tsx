'use client'

import { ViralVideo } from '@/types/database'
import { formatNumber } from '@/lib/utils'

interface VideoCardProps {
  video: ViralVideo
  onUseForGeneration?: (video: ViralVideo) => void
}

export function VideoCard({ video, onUseForGeneration }: VideoCardProps) {
  const getPlatformIcon = () => {
    switch (video.platform) {
      case 'tiktok':
        return '🎵'
      case 'youtube':
        return '▶️'
      case 'instagram':
        return '📷'
      default:
        return '🎬'
    }
  }

  const getPlatformColor = () => {
    switch (video.platform) {
      case 'tiktok':
        return 'bg-pink-100 text-pink-700'
      case 'youtube':
        return 'bg-red-100 text-red-700'
      case 'instagram':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-orange-600 bg-orange-100'
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-card">
      {/* 缩略图 */}
      {video.thumbnail_url && (
        <div className="relative h-48 bg-muted">
          <img
            src={video.thumbnail_url}
            alt={video.title || '视频缩略图'}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getPlatformColor()}`}
            >
              {getPlatformIcon()} {video.platform.toUpperCase()}
            </span>
            {video.viral_score && (
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(
                  video.viral_score
                )}`}
              >
                🔥 {video.viral_score}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 内容 */}
      <div className="p-4">
        {/* 标题 */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {video.title || '无标题'}
        </h3>

        {/* 作者 */}
        {video.author_name && (
          <p className="text-sm text-muted-foreground mb-3">
            @{video.author_name}
          </p>
        )}

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
          <div>
            <div className="text-muted-foreground">播放量</div>
            <div className="font-semibold">{formatNumber(video.views)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">点赞</div>
            <div className="font-semibold">{formatNumber(video.likes)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">评论</div>
            <div className="font-semibold">{formatNumber(video.comments)}</div>
          </div>
        </div>

        {/* AI分析 */}
        {video.ai_analysis && (
          <div className="mb-3 p-3 bg-muted rounded text-sm">
            <p className="font-medium mb-1">🤖 AI分析</p>
            <p className="text-muted-foreground line-clamp-2">
              {video.ai_analysis.summary}
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {video.video_url && (
            <a
              href={video.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 text-sm border border-border rounded hover:bg-accent text-center"
            >
              查看原视频
            </a>
          )}
          {onUseForGeneration && video.ai_analysis && (
            <button
              onClick={() => onUseForGeneration(video)}
              className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:opacity-90"
            >
              用这个生成
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
