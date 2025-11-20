import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ApifyClient } from 'apify-client';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

/**
 * POST /api/viral-discovery
 * 启动爆款发现任务
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 解析请求参数
    const body = await req.json();
    const {
      platform = 'youtube_shorts', // 'tiktok' | 'youtube_shorts'
      mode = 'combined', // 'growth' | 'shorts' | 'combined'
      searchKeywords = [],
      monitoredChannels = [],
      maxResults = 100,
    } = body;

    // 验证平台参数
    if (!['tiktok', 'youtube_shorts'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be "tiktok" or "youtube_shorts"' },
        { status: 400 }
      );
    }

    // 验证模式参数
    if (!['growth', 'shorts', 'combined'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "growth", "shorts", or "combined"' },
        { status: 400 }
      );
    }

    // 2. 验证用户认证
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 3. 创建Job记录
    const { data: job, error: jobError } = await supabase
      .from('crawl_jobs')
      .insert({
        user_id: user.id,
        source_platform: platform,
        job_type: 'viral_discovery',
        status: 'pending',
        search_keywords: searchKeywords,
        monitored_channels: monitoredChannels,
        config: {
          mode,
          maxResults,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError || !job) {
      throw new Error('Failed to create job');
    }

    // 4. 根据平台和模式启动Apify Actor
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/apify`;
    const result: any = {};

    if (platform === 'tiktok') {
      // TikTok爬虫逻辑
      if (mode === 'growth' || mode === 'combined') {
        const growthRun = await apifyClient.actor('apify/tiktok-scraper').call({
          hashtags: searchKeywords,
          maxItems: maxResults,
          sortBy: 'most-liked',
          webhooks: [{
            eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
            requestUrl: webhookUrl,
          }],
        });
        result.growthRunId = growthRun.id;
      }

      if (mode === 'shorts' || mode === 'combined') {
        const shortsRun = await apifyClient.actor('apify/tiktok-scraper').call({
          profiles: monitoredChannels.map(url => {
            // 从URL中提取用户名
            const match = url.match(/@([^/?]+)/);
            return match ? match[1] : url;
          }),
          maxItems: maxResults,
          sortBy: 'most-recent',
          webhooks: [{
            eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
            requestUrl: webhookUrl,
          }],
        });
        result.shortsRunId = shortsRun.id;
      }
    } else {
      // YouTube Shorts爬虫逻辑
      if (mode === 'growth' || mode === 'combined') {
        const growthRun = await apifyClient.actor('bernardo/youtube-scraper').call({
          searchKeywords,
          maxResults,
          sortBy: 'upload_date',
          videoDuration: 'short', // 只抓取短视频
          webhooks: [{
            eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
            requestUrl: webhookUrl,
          }],
        });
        result.growthRunId = growthRun.id;
      }

      if (mode === 'shorts' || mode === 'combined') {
        const shortsRun = await apifyClient.actor('bernardo/youtube-scraper').call({
          startUrls: monitoredChannels.map(url => ({ url: `${url}/shorts` })),
          maxResults: maxResults / monitoredChannels.length,
          sortBy: 'upload_date',
          webhooks: [{
            eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
            requestUrl: webhookUrl,
          }],
        });
        result.shortsRunId = shortsRun.id;
      }
    }

    // 5. 更新Job状态
    await supabase
      .from('crawl_jobs')
      .update({
        status: 'processing',
        apify_growth_run_id: result.growthRunId,
        apify_shorts_run_id: result.shortsRunId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    // 6. 返回结果
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        platform,
        mode,
        status: 'processing',
        apifyRunIds: result,
      },
      message: `${platform === 'tiktok' ? 'TikTok' : 'YouTube Shorts'} viral discovery started`,
    });

  } catch (error: any) {
    console.error('Error starting viral discovery:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/viral-discovery?jobId=xxx
 * 查询任务状态
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // 验证用户
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 查询任务
    const { data: job, error } = await supabase
      .from('crawl_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // 查询关联的爆款视频
    const { data: viralVideos } = await supabase
      .from('viral_videos')
      .select('*')
      .eq('crawl_job_id', jobId)
      .order('viral_score', { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        platform: job.source_platform,
        status: job.status,
        progress: job.progress_percent,
        totalVideosFound: job.total_videos_found,
        viralVideosCount: job.viral_videos_count,
        avgViralScore: job.avg_viral_score,
        error: job.error_message,
        createdAt: job.created_at,
        completedAt: job.completed_at,
      },
      viralVideos: viralVideos || [],
    });

  } catch (error: any) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
