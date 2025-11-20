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
 * 使用官方的YouTube Scraper: apify/youtube-scraper
 */
export async function scrapeYouTubeVideos(options: {
  searchQuery?: string
  maxResults?: number
}) {
  const { searchQuery = 'AI technology', maxResults = 20 } = options

  console.log('▶️ Starting YouTube scraper...')
  console.log('Search query:', searchQuery)

  try {
    // 使用官方的YouTube Scraper
    const run = await client.actor('apify/youtube-scraper').call({
      searchKeywords: [searchQuery],
      maxResults: maxResults,
      // 其他可选参数
      // proxy: { useApifyProxy: true },
    })

    console.log('✅ YouTube scraper finished')

    // 获取结果
    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    return items as YouTubeVideoData[]
  } catch (error: any) {
    console.error('YouTube scraper error:', error.message)
    
    // 如果官方Actor也不可用，尝试备用方案
    if (error.type === 'insufficient-permissions') {
      console.log('⚠️ YouTube scraper需要权限，尝试使用备用方案...')
      
      // 暂时返回空数组，不阻塞用户使用TikTok功能
      console.log('💡 建议：暂时使用TikTok搜索功能，或升级Apify账户以使用YouTube')
      return []
    }
    
    throw error
  }
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
