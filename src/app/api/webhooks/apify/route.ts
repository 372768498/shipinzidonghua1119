import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  calculateViralScore, 
  calculateRelativeViralScore,
  Platform 
} from '@/lib/viral-scoring';
import { getAnalysisPrompt } from '@/lib/ai-prompts';

const WEBHOOK_SECRET = process.env.APIFY_WEBHOOK_SECRET || '';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * POST /api/webhooks/apify
 * 接收Apify爬虫完成后的回调
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 验证Webhook签名（HMAC-SHA256）
    const signature = req.headers.get('x-apify-signature');
    const rawBody = await req.text();
    
    if (WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    console.log('Apify webhook received:', {
      runId: payload.resource?.id,
      status: payload.resource?.status,
    });

    // 2. 获取Run详细信息
    const runId = payload.resource?.id;
    if (!runId) {
      return NextResponse.json(
        { error: 'Missing run ID' },
        { status: 400 }
      );
    }

    // 3. 从数据库查找对应的Job
    const supabase = createRouteHandlerClient({ cookies });
    const { data: job, error: jobError } = await supabase
      .from('crawl_jobs')
      .select('*')
      .or(`apify_growth_run_id.eq.${runId},apify_scraper_run_id.eq.${runId},apify_shorts_run_id.eq.${runId}`)
      .single();

    if (jobError || !job) {
      console.error('Job not found for runId:', runId);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // 4. 判断平台类型
    const platform: Platform = job.source_platform === 'tiktok' 
      ? 'tiktok' 
      : 'youtube_shorts';

    // 5. 如果任务失败，更新状态并返回
    if (payload.resource?.status === 'FAILED') {
      await supabase
        .from('crawl_jobs')
        .update({
          status: 'failed',
          error_message: payload.resource?.statusMessage || 'Apify run failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      return NextResponse.json({ success: true });
    }

    // 6. 如果任务成功，获取数据并分析
    if (payload.resource?.status === 'SUCCEEDED') {
      // 获取Apify Dataset中的数据
      const apifyClient = new (await import('apify-client')).ApifyClient({
        token: process.env.APIFY_API_TOKEN,
      });

      const { items } = await apifyClient
        .dataset(payload.resource.defaultDatasetId)
        .listItems();

      console.log(`Processing ${items.length} videos from Apify`);

      let processedCount = 0;
      let viralCount = 0;
      let totalViralScore = 0;

      // 批量处理视频
      for (const item of items) {
        try {
          // 7. 计算爆款评分（分平台）
          const videoMetrics = extractMetrics(item, platform);
          const viralScore = calculateViralScore(platform, videoMetrics);

          // 8. 只处理爆款视频（评分≥70）
          if (!viralScore.isViral) {
            continue;
          }

          viralCount++;
          totalViralScore += viralScore.totalScore;

          // 9. 调用Google Gemini进行AI分析
          let aiAnalysis = null;
          try {
            const analysisPrompt = getAnalysisPrompt(platform, {
              title: item.title || '',
              description: item.description || '',
              tags: item.tags || [],
              hashtags: item.hashtags || [],
              metrics: {
                views: item.views || 0,
                likes: item.likes || 0,
                comments: item.comments || 0,
                shares: item.shares || 0,
                subscriberCount: item.subscriberCount,
              },
            });

            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent([
              analysisPrompt.system,
              analysisPrompt.user,
            ]);

            const response = await result.response;
            const text = response.text();
            
            // 尝试解析JSON
            try {
              aiAnalysis = JSON.parse(text);
            } catch {
              aiAnalysis = { rawAnalysis: text };
            }
          } catch (aiError) {
            console.error('AI analysis failed:', aiError);
          }

          // 10. 保存爆款视频到数据库
          const { error: insertError } = await supabase
            .from('viral_videos')
            .insert({
              crawl_job_id: job.id,
              user_id: job.user_id,
              source_platform: platform,
              video_url: item.url || item.videoUrl || '',
              video_id: item.id || item.videoId || '',
              title: item.title || '',
              description: item.description || '',
              thumbnail_url: item.thumbnail || item.thumbnailUrl || '',
              
              // 数据指标
              views: item.views || 0,
              likes: item.likes || 0,
              comments: item.comments || 0,
              shares: item.shares || 0,
              saves: item.saves || 0,
              
              // 频道信息
              channel_name: item.channelName || item.authorName || '',
              channel_url: item.channelUrl || item.authorUrl || '',
              subscriber_count: item.subscriberCount || null,
              
              // 内容元数据
              duration_seconds: item.duration || 0,
              published_at: item.publishedAt || item.createTime || new Date().toISOString(),
              hashtags: item.hashtags || [],
              tags: item.tags || [],
              
              // 爆款评分
              viral_score: viralScore.totalScore,
              viral_grade: viralScore.grade,
              viral_breakdown: viralScore.breakdown,
              viral_reason: viralScore.reason,
              
              // AI分析
              ai_analysis: aiAnalysis,
              
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error('Failed to insert viral video:', insertError);
          } else {
            processedCount++;
          }
        } catch (itemError) {
          console.error('Failed to process item:', itemError);
        }
      }

      // 11. 更新Job状态
      await supabase
        .from('crawl_jobs')
        .update({
          status: 'completed',
          progress_percent: 100,
          total_videos_found: items.length,
          viral_videos_count: viralCount,
          avg_viral_score: viralCount > 0 ? Math.round(totalViralScore / viralCount) : 0,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      console.log(`Job ${job.id} completed: ${processedCount} viral videos saved`);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 从Apify数据中提取指标（分平台）
 */
function extractMetrics(item: any, platform: Platform) {
  if (platform === 'tiktok') {
    return {
      views: item.playCount || item.views || 0,
      likes: item.diggCount || item.likes || 0,
      comments: item.commentCount || item.comments || 0,
      shares: item.shareCount || item.shares || 0,
      saves: item.collectCount || item.saves || 0,
      publishedAt: item.createTime || item.publishedAt || new Date().toISOString(),
      duration: item.duration || 0,
      musicId: item.musicId,
      isTrending: item.isTrending || false,
    };
  } else {
    // YouTube Shorts
    return {
      views: item.views || 0,
      likes: item.likes || 0,
      comments: item.comments || 0,
      shares: item.shares || 0,
      saves: item.saves || 0,
      publishedAt: item.publishedAt || new Date().toISOString(),
      duration: item.duration || 0,
      subscriberCount: item.subscriberCount || 0,
      channelViews: item.channelViews || 0,
      tags: item.tags || [],
      description: item.description || '',
      title: item.title || '',
    };
  }
}
