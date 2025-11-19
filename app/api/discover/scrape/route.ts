import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  scrapeTikTokVideos,
  scrapeYouTubeVideos,
  calculateViralScore,
} from '@/lib/apify'
import { analyzeVideoContent } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, keywords, count = 10 } = body

    console.log('🚀 开始爬取:', { platform, keywords, count })

    if (!platform) {
      return NextResponse.json(
        { error: '请指定平台 (tiktok 或 youtube)' },
        { status: 400 }
      )
    }

    let videos: any[] = []

    // 根据平台选择爬虫
    if (platform === 'tiktok') {
      const hashtags = keywords ? keywords.split(',').map((k: string) => k.trim()) : ['ai', 'tech']
      videos = await scrapeTikTokVideos({ hashtags, count })
    } else if (platform === 'youtube') {
      videos = await scrapeYouTubeVideos({
        searchQuery: keywords || 'AI technology',
        maxResults: count,
      })
    } else {
      return NextResponse.json(
        { error: '不支持的平台，请选择 tiktok 或 youtube' },
        { status: 400 }
      )
    }

    console.log(`✅ 爬取完成，获得 ${videos.length} 个视频`)

    // 处理和保存视频数据
    const savedVideos = []

    for (const video of videos.slice(0, count)) {
      try {
        // 标准化数据
        const videoData =
          platform === 'tiktok'
            ? normalizeTikTokData(video)
            : normalizeYouTubeData(video)

        // 计算爆款分数
        const viralScore = calculateViralScore({
          views: videoData.views,
          likes: videoData.likes,
          comments: videoData.comments,
          shares: videoData.shares,
        })

        // AI分析
        console.log(`🤖 正在分析: ${videoData.title}`)
        const aiAnalysis = await analyzeVideoContent({
          title: videoData.title,
          description: videoData.description,
          views: videoData.views,
          likes: videoData.likes,
          comments: videoData.comments,
        })

        // 保存到数据库
        const { data, error } = await supabase
          .from('viral_videos')
          .upsert(
            {
              platform,
              platform_video_id: videoData.id,
              title: videoData.title,
              description: videoData.description,
              thumbnail_url: videoData.thumbnail_url,
              video_url: videoData.video_url,
              views: videoData.views,
              likes: videoData.likes,
              comments: videoData.comments,
              shares: videoData.shares,
              viral_score: viralScore,
              ai_analysis: aiAnalysis,
              author_name: videoData.author_name,
              author_id: videoData.author_id,
              published_at: videoData.published_at,
              scraped_at: new Date().toISOString(),
            },
            {
              onConflict: 'platform,platform_video_id',
            }
          )
          .select()
          .single()

        if (error) {
          console.error('保存视频失败:', error)
        } else {
          savedVideos.push(data)
          console.log(`✅ 已保存: ${videoData.title}`)
        }

        // 避免API限流
        await new Promise((resolve) => setTimeout(resolve, 1500))
      } catch (error) {
        console.error('处理视频失败:', error)
      }
    }

    console.log(`🎉 完成！保存了 ${savedVideos.length} 个视频`)

    return NextResponse.json({
      success: true,
      count: savedVideos.length,
      videos: savedVideos,
    })
  } catch (error: any) {
    console.error('爬取错误:', error)
    return NextResponse.json(
      { error: error.message || '爬取失败' },
      { status: 500 }
    )
  }
}

// 标准化TikTok数据
function normalizeTikTokData(video: any) {
  return {
    id: video.id,
    title: video.text || '无标题',
    description: video.text,
    thumbnail_url: video.videoMeta?.coverUrl,
    video_url: video.webVideoUrl,
    views: video.playCount || 0,
    likes: video.diggCount || 0,
    comments: video.commentCount || 0,
    shares: video.shareCount || 0,
    author_name: video.authorMeta?.nickName || video.authorMeta?.name,
    author_id: video.authorMeta?.id,
    published_at: video.createTime
      ? new Date(video.createTime * 1000).toISOString()
      : null,
  }
}

// 标准化YouTube数据
function normalizeYouTubeData(video: any) {
  return {
    id: video.id,
    title: video.title || '无标题',
    description: video.description,
    thumbnail_url: video.thumbnails?.high?.url,
    video_url: video.url || `https://www.youtube.com/watch?v=${video.id}`,
    views: parseInt(video.statistics?.viewCount || '0'),
    likes: parseInt(video.statistics?.likeCount || '0'),
    comments: parseInt(video.statistics?.commentCount || '0'),
    shares: 0, // YouTube API不提供分享数
    author_name: video.channelTitle,
    author_id: video.channelId,
    published_at: video.publishedAt,
  }
}
