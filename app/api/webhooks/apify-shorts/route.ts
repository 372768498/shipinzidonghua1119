/**
 * Webhook处理器：处理优化Shorts爬取的回调 V2
 * POST /api/webhooks/apify-shorts
 * 
 * ✨ V2新特性：
 * - 使用专业评分标准
 * - 存储详细评分原因
 * - 支持相对定义数据
 * - 记录垂直领域调整
 * - 保存分享率数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  getOptimizedShortsResultsV2,
  SHORTS_FILTER_PRESETS_V2,
  type ShortsFilterConfigV2,
} from '@/lib/youtube-shorts-optimizer-v2';

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
    const preset = searchParams.get('preset') as 'viral' | 'hot' | 'potential' | 'blueOcean';

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

    console.log('Received Apify webhook V2:', {
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
        // 获取筛选配置（V2）
        const filterConfig = SHORTS_FILTER_PRESETS_V2[preset];

        console.log('🔍 获取并处理结果（V2专业标准）...');
        
        // 获取并处理结果（V2）
        const results = await getOptimizedShortsResultsV2(actorRunId, filterConfig);

        console.log(`✅ 处理完成: ${results.length}个视频, ${results.filter(r => r.passed).length}个通过筛选`);

        // 5. 存储爆款视频（V2增强数据）
        const viralVideos = results
          .filter(r => r.passed)
          .map(({ video, viralAnalysis }) => {
            const professionalScore = viralAnalysis.professionalScore;
            const finalVerdict = viralAnalysis.finalVerdict;
            
            return {
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
              shares: parseInt(video.shareCount || video.shares || '0'),
              
              // 频道信息
              channel_name: video.channelName || video.channelTitle,
              channel_url: video.channelUrl,
              subscriber_count: parseInt(video.subscriberCount || '0'),
              
              // 视频元数据
              duration: video.duration || 0,
              published_at: video.publishedAt || video.createTime,
              
              // V2专业评分
              viral_score: professionalScore.score, // 0-100专业评分
              engagement_rate: viralAnalysis.legacyScore?.breakdown.engagement || 0,
              
              // V2新增数据
              metadata: {
                preset,
                version: '2.0',
                
                // 专业评分详情
                professionalScore: {
                  score: professionalScore.score,
                  confidence: professionalScore.confidence,
                  isViral: professionalScore.isViral,
                  reasons: professionalScore.reasons, // 详细原因！
                },
                
                // 最终判断
                finalVerdict: {
                  isViral: finalVerdict.isViral,
                  confidence: finalVerdict.confidence,
                  level: finalVerdict.level, // viral/hot/potential/normal
                },
                
                // 传统评分对比（可选）
                legacyScore: viralAnalysis.legacyScore ? {
                  totalScore: viralAnalysis.legacyScore.totalScore,
                  breakdown: viralAnalysis.legacyScore.breakdown,
                } : null,
                
                // 其他元数据
                hashtags: video.hashtags || [],
                hasSubtitles: video.hasSubtitles,
                optimizationType: 'shorts-optimized-v2',
                category: video.category,
              },
            };
          });

        // 批量插入
        if (viralVideos.length > 0) {
          const { error: insertError } = await supabase
            .from('viral_videos')
            .insert(viralVideos);

          if (insertError) {
            console.error('Error inserting viral videos:', insertError);
            throw insertError;
          }

          console.log(`✅ 已保存 ${viralVideos.length} 个爆款视频`);
        }

        // 6. 计算V2增强统计数据
        const totalVideos = results.length;
        const viralCount = viralVideos.length;
        const avgViralScore = viralCount > 0
          ? viralVideos.reduce((sum, v) => sum + v.viral_score, 0) / viralCount
          : 0;
        
        // V2统计：按等级分类
        const levelDistribution = {
          viral: viralVideos.filter(v => 
            v.metadata.finalVerdict.level === 'viral'
          ).length,
          hot: viralVideos.filter(v => 
            v.metadata.finalVerdict.level === 'hot'
          ).length,
          potential: viralVideos.filter(v => 
            v.metadata.finalVerdict.level === 'potential'
          ).length,
        };
        
        // V2统计：评分分布
        const scoreDistribution = {
          excellent: viralVideos.filter(v => v.viral_score >= 85).length,   // ≥85 确定爆款
          good: viralVideos.filter(v => v.viral_score >= 70 && v.viral_score < 85).length, // 70-84 热门
          decent: viralVideos.filter(v => v.viral_score >= 55 && v.viral_score < 70).length, // 55-69 潜力
          low: viralVideos.filter(v => v.viral_score < 55).length,          // <55 普通
        };

        // 7. 更新任务状态为完成（V2增强数据）
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
              version: '2.0',
              statistics: {
                totalProcessed: totalVideos,
                passedFilter: viralCount,
                avgScore: Math.round(avgViralScore),
                
                // V2增强统计
                levelDistribution,
                scoreDistribution,
                
                // 评分摘要
                scoreSummary: {
                  min: viralCount > 0 ? Math.min(...viralVideos.map(v => v.viral_score)) : 0,
                  max: viralCount > 0 ? Math.max(...viralVideos.map(v => v.viral_score)) : 0,
                  avg: Math.round(avgViralScore),
                },
              },
            },
          })
          .eq('id', job.id);

        if (updateError) {
          console.error('Error updating job:', updateError);
          throw updateError;
        }

        console.log(`🎉 任务 ${job.id} 完成:`, {
          totalVideos,
          viralCount,
          avgViralScore: Math.round(avgViralScore),
          levelDistribution,
        });

        return NextResponse.json({
          success: true,
          version: '2.0',
          message: 'Webhook processed successfully with V2 professional standards',
          statistics: {
            totalVideos,
            viralCount,
            avgViralScore: Math.round(avgViralScore),
            levelDistribution,
            scoreDistribution,
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
