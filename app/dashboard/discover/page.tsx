'use client'

import { useState, useEffect } from 'react'
import { ViralVideo } from '@/types/database'
import { VideoCard } from '@/components/VideoCard'

export default function DiscoverPage() {
  const [videos, setVideos] = useState<ViralVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [scraping, setScraping] = useState(false)
  
  const [platform, setPlatform] = useState('tiktok')
  const [keywords, setKeywords] = useState('ai,tech')
  const [count, setCount] = useState(10)
  
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [minScore, setMinScore] = useState(0)
  const [sortBy, setSortBy] = useState('viral_score')
  const [timeFilter, setTimeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')

  const loadVideos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        platform: filterPlatform,
        sortBy,
        limit: '100',
      })

      const response = await fetch(`/api/discover/videos?${params}`)
      const data = await response.json()

      if (data.success) {
        setVideos(data.videos)
      }
    } catch (error) {
      console.error('加载视频失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [filterPlatform, sortBy])

  const handleScrape = async () => {
    setScraping(true)
    try {
      const response = await fetch('/api/discover/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          keywords,
          count,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`成功爬取 ${data.count} 个视频！`)
        loadVideos()
      } else {
        alert(`爬取失败: ${data.error}`)
      }
    } catch (error: any) {
      console.error('爬取错误:', error)
      alert(`爬取失败: ${error.message}`)
    } finally {
      setScraping(false)
    }
  }

  const handleDelete = async (videoId: string) => {
    if (!confirm('确定要删除这个视频吗？')) return

    try {
      const response = await fetch(`/api/discover/videos/${videoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setVideos(videos.filter((v) => v.id !== videoId))
        alert('删除成功')
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除错误:', error)
      alert('删除失败')
    }
  }

  const filteredVideos = videos.filter((video) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchTitle = video.title?.toLowerCase().includes(query)
      const matchDesc = video.description?.toLowerCase().includes(query)
      const matchAuthor = video.author_name?.toLowerCase().includes(query)
      if (!matchTitle && !matchDesc && !matchAuthor) return false
    }

    if (video.viral_score && video.viral_score < minScore) return false

    if (timeFilter !== 'all' && video.scraped_at) {
      const scrapedDate = new Date(video.scraped_at)
      const now = new Date()
      const diffDays = Math.floor(
        (now.getTime() - scrapedDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (timeFilter === 'today' && diffDays > 0) return false
      if (timeFilter === 'week' && diffDays > 7) return false
      if (timeFilter === 'month' && diffDays > 30) return false
    }

    return true
  })

  const groupedByDate = filteredVideos.reduce((groups, video) => {
    if (!video.scraped_at) return groups

    const date = new Date(video.scraped_at).toLocaleDateString('zh-CN')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(video)
    return groups
  }, {} as Record<string, ViralVideo[]>)

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">🔍 爆款视频发现</h1>
          <p className="text-muted-foreground">
            使用AI技术分析和发现热门视频，共找到 {filteredVideos.length} 个爆款
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <details className="bg-card border border-border rounded-lg mb-8">
          <summary className="p-4 cursor-pointer font-semibold hover:bg-accent">
            🚀 爬取新视频
          </summary>
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">平台</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded bg-background"
                  disabled={scraping}
                >
                  <option value="tiktok">🎵 TikTok</option>
                  <option value="youtube">▶️ YouTube</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  关键词/话题标签
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="用逗号分隔，如: ai,tech,chatgpt"
                  className="w-full px-3 py-2 border border-border rounded bg-background"
                  disabled={scraping}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">数量</label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  min={1}
                  max={50}
                  className="w-full px-3 py-2 border border-border rounded bg-background"
                  disabled={scraping}
                />
              </div>
            </div>

            <button
              onClick={handleScrape}
              disabled={scraping}
              className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
            >
              {scraping ? '🔄 爬取中...' : '🚀 开始爬取'}
            </button>

            {scraping && (
              <div className="mt-4 p-4 bg-muted rounded">
                <p className="text-sm">
                  ⏳ 正在爬取并分析视频，这可能需要几分钟...
                </p>
              </div>
            )}
          </div>
        </details>

        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 搜索标题、描述或作者..."
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-lg"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                平台
              </label>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-background text-sm"
              >
                <option value="all">全部</option>
                <option value="tiktok">🎵 TikTok</option>
                <option value="youtube">▶️ YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                爆款分
              </label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded bg-background text-sm"
              >
                <option value={0}>全部</option>
                <option value={80}>80+ 超爆款</option>
                <option value={60}>60+ 高人气</option>
                <option value={40}>40+ 中等</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                爬取时间
              </label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-background text-sm"
              >
                <option value="all">全部</option>
                <option value="today">今天</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                排序
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-background text-sm"
              >
                <option value="viral_score">爆款分</option>
                <option value="views">播放量</option>
                <option value="likes">点赞数</option>
                <option value="scraped_at">爬取时间</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                视图
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-3 py-2 rounded text-sm ${
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border hover:bg-accent'
                  }`}
                >
                  网格
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`flex-1 px-3 py-2 rounded text-sm ${
                    viewMode === 'timeline'
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border hover:bg-accent'
                  }`}
                >
                  时间线
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setMinScore(80)
                setTimeFilter('week')
              }}
              className="px-3 py-1 text-sm border border-border rounded-full hover:bg-accent"
            >
              🔥 本周超爆款
            </button>
            <button
              onClick={() => {
                setFilterPlatform('tiktok')
                setMinScore(60)
              }}
              className="px-3 py-1 text-sm border border-border rounded-full hover:bg-accent"
            >
              🎵 TikTok热门
            </button>
            <button
              onClick={() => {
                setSearchQuery('ai')
              }}
              className="px-3 py-1 text-sm border border-border rounded-full hover:bg-accent"
            >
              🤖 AI相关
            </button>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterPlatform('all')
                setMinScore(0)
                setTimeFilter('all')
              }}
              className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              ✕ 清空筛选
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-muted-foreground mb-2">
              {videos.length === 0
                ? '还没有发现的视频'
                : '没有符合条件的视频'}
            </p>
            {videos.length === 0 && (
              <p className="text-sm text-muted-foreground">
                点击上面的"爬取新视频"开始获取爆款内容
              </p>
            )}
            {videos.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterPlatform('all')
                  setMinScore(0)
                  setTimeFilter('all')
                }}
                className="mt-4 px-4 py-2 text-sm border border-border rounded hover:bg-accent"
              >
                清空筛选条件
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onDelete={() => handleDelete(video.id)}
                onUseForGeneration={(video) => {
                  alert(
                    `将使用这个视频生成新内容:\n\n${video.ai_analysis?.recommended_prompt}`
                  )
                }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dateVideos]) => (
                <div key={date}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      📅 {date}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({dateVideos.length} 个视频)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dateVideos.map((video) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        onDelete={() => handleDelete(video.id)}
                        onUseForGeneration={(video) => {
                          alert(
                            `将使用这个视频生成新内容:\n\n${video.ai_analysis?.recommended_prompt}`
                          )
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
