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
  
  // 调试：打印第一个视频数据
  if (items.length > 0) {
    console.log('📊 TikTok返回的第一个视频数据:', JSON.stringify(items[0], null, 2))
  }

  return items as TikTokVideoData[]
}

/**
 * 抓取YouTube热门视频
 * 使用可用的YouTube Scraper
 */
export async function scrapeYouTubeVideos(options: {
  searchQuery?: string
  maxResults?: number
}) {
  const { searchQuery = 'AI technology', maxResults = 20 } = options

  console.log('▶️ Starting YouTube scraper...')
  console.log('Search query:', searchQuery)

  try {
    // 尝试多个YouTube Scraper，按优先级
    const scrapers = [
      'streamers/youtube-scraper',      // 优先选择：功能完善
      'clockworks/youtube-scraper',     // 备选1：与TikTok同作者
      'bernardo/youtube-scraper',       // 备选2：也比较流行
    ]

    let lastError: Error | null = null

    for (const scraperName of scrapers) {
      try {
        console.log(`🔄 尝试使用: ${scraperName}`)
        
        const run = await client.actor(scraperName).call({
          searchQueries: [searchQuery],
          maxResults: maxResults,
          // 通用配置
          proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
          },
        })

        console.log(`✅ YouTube scraper (${scraperName}) 完成`)

        // 获取结果
        const { items } = await client.dataset(run.defaultDatasetId).listItems()
        
        // 调试：打印第一个视频数据结构
        if (items.length > 0) {
          console.log('📊 YouTube返回的第一个视频数据:')
          console.log(JSON.stringify(items[0], null, 2))
        }

        return items as YouTubeVideoData[]
      } catch (error: any) {
        console.error(`❌ ${scraperName} 失败:`, error.message)
        lastError = error
        continue // 尝试下一个scraper
      }
    }

    // 如果所有scraper都失败了
    throw lastError || new Error('所有YouTube scraper都不可用')

  } catch (error: any) {
    console.error('YouTube scraper error:', error.message)
    
    // 如果是权限问题
    if (error.type === 'record-not-found' || error.statusCode === 404) {
      console.log('⚠️ YouTube scraper不存在或需要权限')
      console.log('💡 解决方案:')
      console.log('  1. 访问 https://apify.com/store')
      console.log('  2. 搜索 "YouTube Scraper"')
      console.log('  3. 选择一个免费的scraper并记录其名称')
      console.log('  4. 更新代码中的scraper名称')
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
