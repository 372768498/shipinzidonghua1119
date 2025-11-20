'use client'

import { ViralVideo } from '@/types/database'
import { formatNumber } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface VideoCardProps {
  video: ViralVideo
  onUseForGeneration?: (video: ViralVideo) => void
  onDelete?: (videoId: string) => void
}

export function VideoCard({
  video,
  onUseForGeneration,
  onDelete,
}: VideoCardProps) {
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

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '超爆款'
    if (score >= 60) return '高人气'
    if (score >= 40) return '中等'
    return '一般'
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all bg-card group">
      {/* 缩略图 */}
      {video.thumbnail_url && (
        <div className="relative h-48 bg-muted">
          <img
            src={video.thumbnail_url}
            alt={video.title || '视频缩略图'}
            className="w-full h-full object-cover"
          />
          {/* 悬浮删除按钮 */}
          {onDelete && (
            <button
              onClick={() => onDelete(video.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600"
            >
              🗑️ 删除
            </button>
          )}
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
                🔥 {video.viral_score} {getScoreLabel(video.viral_score)}
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

        {/* 作者和时间 */}
        <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
          {video.author_name && <span>@{video.author_name}</span>}
          {video.scraped_at && (
            <span className="text-xs">
              {formatDistanceToNow(new Date(video.scraped_at), {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
          )}
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">播放</div>
            <div className="font-semibold">{formatNumber(video.views)}</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">点赞</div>
            <div className="font-semibold">{formatNumber(video.likes)}</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">评论</div>
            <div className="font-semibold">{formatNumber(video.comments)}</div>
          </div>
        </div>

        {/* 互动率 */}
        {video.views > 0 && (
          <div className="mb-3 text-xs text-muted-foreground">
            互动率:{' '}
            {(
              ((video.likes + video.comments + video.shares) / video.views) *
              100
            ).toFixed(2)}
            %
          </div>
        )}

        {/* AI分析 */}
        {video.ai_analysis && (
          <div className="mb-3 p-3 bg-muted rounded text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">🤖 AI分析</span>
              {video.ai_analysis.content_type && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                  {video.ai_analysis.content_type}
                </span>
              )}
            </div>
            <p className="text-muted-foreground line-clamp-2 mb-2">
              {video.ai_analysis.summary}
            </p>
            {video.ai_analysis.viral_factors &&
              video.ai_analysis.viral_factors.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {video.ai_analysis.viral_factors.slice(0, 3).map((factor, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-background border border-border rounded text-xs"
                    >
                      ⭐ {factor}
                    </span>
                  ))}
                </div>
              )}
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
