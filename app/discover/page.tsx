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

  // 加载视频列表
  const loadVideos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        platform: filterPlatform,
        sortBy: 'viral_score',
        limit: '20',
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

  // 初始加载
  useEffect(() => {
    loadVideos()
  }, [filterPlatform])

  // 开始爬取
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

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">🔍 爆款视频发现</h1>
          <p className="text-muted-foreground">
            使用AI技术分析和发现TikTok、YouTube等平台的热门视频
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 爬取控制面板 */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🚀 开始爬取</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* 平台选择 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                选择平台
              </label>
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

            {/* 关键词 */}
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

            {/* 数量 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                爬取数量
              </label>
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

          {/* 开始按钮 */}
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scraping ? '🔄 爬取中...' : '🚀 开始爬取'}
          </button>

          {scraping && (
            <div className="mt-4 p-4 bg-muted rounded">
              <p className="text-sm">
                ⏳ 正在爬取并分析视频，这可能需要几分钟...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                提示：每个视频都会使用Gemini AI进行深度分析
              </p>
            </div>
          )}
        </div>

        {/* 筛选器 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">筛选平台:</span>
            <div className="flex gap-2">
              {['all', 'tiktok', 'youtube'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPlatform(p)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    filterPlatform === p
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border hover:bg-accent'
                  }`}
                >
                  {p === 'all' ? '全部' : p === 'tiktok' ? '🎵 TikTok' : '▶️ YouTube'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={loadVideos}
            disabled={loading}
            className="px-4 py-2 border border-border rounded hover:bg-accent text-sm font-medium"
          >
            {loading ? '🔄 加载中...' : '🔄 刷新'}
          </button>
        </div>

        {/* 视频网格 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-muted-foreground mb-4">
              还没有发现的视频，点击上面的"开始爬取"按钮来获取爆款视频！
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              共找到 {videos.length} 个爆款视频
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onUseForGeneration={(video) => {
                    // TODO: 跳转到生成页面
                    alert(
                      `将使用这个视频生成新内容:\n\n${video.ai_analysis?.recommended_prompt}`
                    )
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
