/**
 * Webhook处理器：处理优化Shorts爬取的回调
 * POST /api/webhooks/apify-shorts
 * 
 * 接收Apify的webhook回调，处理并存储优化后的结果
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  getOptimizedShortsResults,
  SHORTS_FILTER_PRESETS,
  type ShortsFilterConfig,
} from '@/lib/youtube-shorts-optimizer';

// 使用Service Role Key以绕过RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // 1. 验证webhook密钥
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const userId = searchParams.get('userId');
    const preset = searchParams.get('preset') as 'viral' | 'potential' | 'blueOcean';

    if (secret !== process.env.APIFY_WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!userId || !preset) {
      console.error('Missing userId or preset');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 2. 解析Apify回调数据
    const webhookData = await req.json();
    const { 
      eventType,
      eventData: { actorRunId, status },
    } = webhookData;

    console.log('Received Apify webhook:', {
      eventType,
      actorRunId,
      status,
      userId,
      preset,
    });

    // 3. 更新任务状态
    const { data: job, error: jobError } = await supabase
      .from('crawl_jobs')
      .select('*')
      .eq('apify_run_id', actorRunId)
      .eq('user_id', userId)
      .single();

    if (jobError || !job) {
      console.error('Job not found:', jobError);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // 4. 处理不同的事件类型
    if (eventType === 'ACTOR.RUN.SUCCEEDED') {
      try {
        // 获取筛选配置
        const filterConfig = SHORTS_FILTER_PRESETS[preset];

        // 获取并处理结果
        const results = await getOptimizedShortsResults(actorRunId, filterConfig);

        console.log(`Processed ${results.length} videos, ${results.filter(r => r.passed).length} passed filter`);

        // 5. 存储爆款视频
        const viralVideos = results
          .filter(r => r.passed) // 只保存通过筛选的
          .map(({ video, viralScore, scoreBreakdown }) => ({
            crawl_job_id: job.id,
            user_id: userId,
            platform: 'youtube_shorts',
            video_id: video.id || video.videoId,
            title: video.title,
            url: video.url || video.videoUrl || `https://youtube.com/shorts/${video.id}`,
            thumbnail_url: video.thumbnailUrl || video.thumbnail?.url,
            description: video.description || video.caption || '',
            
            // 统计数据
            views: parseInt(video.viewCount || video.views || '0'),
            likes: parseInt(video.likeCount || video.likes || '0'),
            comments: parseInt(video.commentCount || video.comments || '0'),
            shares: 0, // YouTube Shorts API通常不返回分享数
            
            // 频道信息
            channel_name: video.channelName || video.channelTitle,
            channel_url: video.channelUrl,
            subscriber_count: parseInt(video.subscriberCount || '0'),
            
            // 视频元数据
            duration: video.duration || 0,
            published_at: video.publishedAt || video.createTime,
            
            // 爆款评分
            viral_score: viralScore,
            engagement_rate: scoreBreakdown.engagement,
            
            // 优化特有数据
            metadata: {
              preset,
              scoreBreakdown,
              hashtags: video.hashtags || [],
              hasSubtitles: video.hasSubtitles,
              optimizationType: 'shorts-optimized',
            },
          }));

        // 批量插入
        if (viralVideos.length > 0) {
          const { error: insertError } = await supabase
            .from('viral_videos')
            .insert(viralVideos);

          if (insertError) {
            console.error('Error inserting viral videos:', insertError);
            throw insertError;
          }
        }

        // 6. 计算统计数据
        const totalVideos = results.length;
        const viralCount = viralVideos.length;
        const avgViralScore = viralCount > 0
          ? viralVideos.reduce((sum, v) => sum + v.viral_score, 0) / viralCount
          : 0;

        // 7. 更新任务状态为完成
        const { error: updateError } = await supabase
          .from('crawl_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            total_videos_found: totalVideos,
            viral_videos_count: viralCount,
            avg_viral_score: Math.round(avgViralScore),
            progress_percent: 100,
            metadata: {
              ...job.metadata,
              statistics: {
                totalProcessed: totalVideos,
                passedFilter: viralCount,
                avgScore: avgViralScore,
                scoreDistribution: {
                  high: viralVideos.filter(v => v.viral_score >= 80).length,
                  medium: viralVideos.filter(v => v.viral_score >= 70 && v.viral_score < 80).length,
                  low: viralVideos.filter(v => v.viral_score < 70).length,
                },
              },
            },
          })
          .eq('id', job.id);

        if (updateError) {
          console.error('Error updating job:', updateError);
          throw updateError;
        }

        console.log(`Job ${job.id} completed successfully:`, {
          totalVideos,
          viralCount,
          avgViralScore,
        });

        return NextResponse.json({
          success: true,
          message: 'Webhook processed successfully',
          statistics: {
            totalVideos,
            viralCount,
            avgViralScore: Math.round(avgViralScore),
          },
        });

      } catch (error: any) {
        console.error('Error processing results:', error);
        
        // 标记任务为失败
        await supabase
          .from('crawl_jobs')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        return NextResponse.json(
          { error: 'Failed to process results' },
          { status: 500 }
        );
      }
    }

    // 处理失败事件
    else if (eventType === 'ACTOR.RUN.FAILED' || eventType === 'ACTOR.RUN.ABORTED') {
      await supabase
        .from('crawl_jobs')
        .update({
          status: 'failed',
          error_message: `Apify run ${status.toLowerCase()}`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      return NextResponse.json({
        success: true,
        message: 'Job marked as failed',
      });
    }

    // 其他事件类型
    return NextResponse.json({
      success: true,
      message: 'Event received but not processed',
      eventType,
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
