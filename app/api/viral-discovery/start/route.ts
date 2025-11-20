/**
 * API路由：启动爆款发现任务
 * POST /api/viral-discovery/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  fullViralDiscoveryWorkflow,
  runGrowthScraper,
  runYouTubeScraper,
  runShortsScraper,
} from '@/lib/apify-scrapers';

export async function POST(req: NextRequest) {
  try {
    // 1. 验证用户
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. 解析请求
    const body = await req.json();
    const {
      mode = 'full', // 'full', 'growth', 'scraper', 'shorts'
      monitoredChannels = [],
      searchKeywords = [],
      maxResults = 100,
    } = body;

    // 3. 验证输入
    if (mode === 'full' && monitoredChannels.length === 0 && searchKeywords.length === 0) {
      return NextResponse.json(
        { error: 'Either monitoredChannels or searchKeywords is required' },
        { status: 400 }
      );
    }

    // 4. 生成Webhook URL
    const webhookUrl = new URL('/api/webhooks/apify', process.env.NEXT_PUBLIC_APP_URL!);
    webhookUrl.searchParams.set('userId', user.id);
    webhookUrl.searchParams.set('secret', process.env.APIFY_WEBHOOK_SECRET!);

    // 5. 根据模式启动任务
    let result: any;
    let jobType: string;

    switch (mode) {
      case 'full':
        // 完整工作流：三个Scraper都运行
        result = await fullViralDiscoveryWorkflow({
          monitoredChannels,
          searchKeywords,
          webhookUrl: webhookUrl.toString(),
        });
        jobType = 'full_discovery';
        break;

      case 'growth':
        // 只运行Growth Scraper
        const growthRunId = await runGrowthScraper(
          monitoredChannels,
          webhookUrl.toString()
        );
        result = { growthRunId };
        jobType = 'growth_monitoring';
        break;

      case 'scraper':
        // 只运行YouTube Scraper
        const scraperRunId = await runYouTubeScraper({
          searchQueries: searchKeywords,
          maxResults,
          sortBy: 'views',
        }, webhookUrl.toString());
        result = { scraperRunId };
        jobType = 'video_scraping';
        break;

      case 'shorts':
        // 只运行Shorts Scraper
        const shortsRunId = await runShortsScraper(
          monitoredChannels,
          webhookUrl.toString()
        );
        result = { shortsRunId };
        jobType = 'shorts_scraping';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid mode' },
          { status: 400 }
        );
    }

    // 6. 创建爬取任务记录
    const { data: job, error: dbError } = await supabase
      .from('crawl_jobs')
      .insert({
        user_id: user.id,
        keywords: searchKeywords,
        platforms: ['youtube'],
        max_results_per_platform: maxResults,
        status: 'processing',
        apify_run_id: result.scraperRunId || result.growthRunId || result.shortsRunId,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create job record' },
        { status: 500 }
      );
    }

    // 7. 如果是full模式，存储额外的run IDs
    if (mode === 'full') {
      await supabase
        .from('crawl_jobs')
        .update({
          metadata: {
            growthRunId: result.growthRunId,
            scraperRunId: result.scraperRunId,
            shortsRunId: result.shortsRunId,
          }
        })
        .eq('id', job.id);
    }

    // 8. 返回结果
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        apifyRunIds: result,
        mode,
      },
      message: `Viral discovery ${mode} mode started successfully`,
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
 * GET /api/viral-discovery/status/:jobId
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
      .limit(10);

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress_percent,
        totalVideosFound: job.total_videos_found,
        viralVideosCount: job.viral_videos_count,
        avgViralScore: job.avg_viral_score,
        error: job.error_message,
      },
      topViralVideos: viralVideos || [],
    });

  } catch (error: any) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
