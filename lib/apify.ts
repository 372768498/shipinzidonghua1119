import { ApifyClient } from 'apify-client'

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY!,
})

export interface TikTokVideoData {
  id: string
  text: string
  createTime: number
  authorMeta: {
    id: string
    name: string
    nickName: string
  }
  videoMeta: {
    coverUrl: string
    downloadAddr: string
    duration: number
  }
  diggCount: number
  shareCount: number
  playCount: number
  commentCount: number
  webVideoUrl: string
}

export interface YouTubeVideoData {
  id: string
  title: string
  description: string
  publishedAt: string
  channelTitle: string
  channelId: string
  thumbnails: {
    high: { url: string }
  }
  statistics: {
    viewCount: string
    likeCount: string
    commentCount: string
  }
  url: string
}

/**
 * 抓取TikTok热门视频
 */
export async function scrapeTikTokVideos(options: {
  hashtags?: string[]
  count?: number
}) {
  const { hashtags = ['ai', 'tech'], count = 20 } = options

  console.log('🎵 Starting TikTok scraper...')
  console.log('Hashtags:', hashtags)

  const run = await client.actor('clockworks/tiktok-scraper').call({
    hashtags,
    resultsPerPage: count,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
  })

  console.log('✅ TikTok scraper finished')

  // 获取结果
  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  return items as TikTokVideoData[]
}

/**
 * 抓取YouTube热门视频
 */
export async function scrapeYouTubeVideos(options: {
  searchQuery?: string
  maxResults?: number
}) {
  const { searchQuery = 'AI technology', maxResults = 20 } = options

  console.log('▶️ Starting YouTube scraper...')
  console.log('Search query:', searchQuery)

  const run = await client.actor('bernardo/youtube-scraper').call({
    searchKeywords: searchQuery,
    maxResults,
  })

  console.log('✅ YouTube scraper finished')

  // 获取结果
  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  return items as YouTubeVideoData[]
}

/**
 * 计算爆款分数 (0-100)
 */
export function calculateViralScore(data: {
  views: number
  likes: number
  comments: number
  shares: number
}): number {
  const { views, likes, comments, shares } = data

  // 互动率权重
  const engagementRate =
    views > 0 ? ((likes + comments * 2 + shares * 3) / views) * 100 : 0

  // 基于播放量的分数 (log scale)
  const viewScore = Math.min(Math.log10(views + 1) * 10, 40)

  // 基于互动率的分数
  const engagementScore = Math.min(engagementRate * 2, 40)

  // 基于点赞数的分数
  const likeScore = Math.min(Math.log10(likes + 1) * 5, 20)

  const totalScore = viewScore + engagementScore + likeScore

  return Math.round(Math.min(totalScore, 100))
}
