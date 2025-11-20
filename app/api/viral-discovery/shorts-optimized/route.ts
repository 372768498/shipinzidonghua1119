/**
 * API路由：优化的YouTube Shorts爬取
 * POST /api/viral-discovery/shorts-optimized
 * 
 * 特点：
 * - 3种智能预设（viral/potential/blueOcean）
 * - 5大类别关键词库（教育/科技/商业等）
 * - 5维度评分算法
 * - 自动筛选和排序
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  scrapeOptimizedShorts,
  SHORTS_FILTER_PRESETS,
  SHORTS_KEYWORDS,
  type ShortsFilterConfig,
} from '@/lib/youtube-shorts-optimizer';

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
      preset = 'viral', // 'viral' | 'potential' | 'blueOcean'
      category, // 'education' | 'tech' | 'business' | 'lifestyle' | 'quickKnowledge'
      customKeywords = [],
      maxResults = 50,
    } = body;

    // 3. 验证preset
    const validPresets = ['viral', 'potential', 'blueOcean'];
    if (!validPresets.includes(preset)) {
      return NextResponse.json(
        { error: `Invalid preset. Must be one of: ${validPresets.join(', ')}` },
        { status: 400 }
      );
    }

    // 4. 验证category（如果提供）
    if (category) {
      const validCategories = Object.keys(SHORTS_KEYWORDS);
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // 5. 生成Webhook URL
    const webhookUrl = new URL('/api/webhooks/apify-shorts', process.env.NEXT_PUBLIC_APP_URL!);
    webhookUrl.searchParams.set('userId', user.id);
    webhookUrl.searchParams.set('secret', process.env.APIFY_WEBHOOK_SECRET || 'default-secret');
    webhookUrl.searchParams.set('preset', preset);

    // 6. 启动优化爬取
    const { runId, config, queries } = await scrapeOptimizedShorts({
      preset: preset as 'viral' | 'potential' | 'blueOcean',
      category: category as keyof typeof SHORTS_KEYWORDS | undefined,
      customKeywords,
      maxResults,
      webhookUrl: webhookUrl.toString(),
    });

    // 7. 创建任务记录
    const { data: job, error: dbError } = await supabase
      .from('crawl_jobs')
      .insert({
        user_id: user.id,
        keywords: queries,
        platforms: ['youtube_shorts'],
        max_results_per_platform: maxResults,
        status: 'processing',
        apify_run_id: runId,
        metadata: {
          optimizationType: 'shorts-optimized',
          preset,
          category: category || 'mixed',
          filterConfig: config,
          queries,
        },
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

    // 8. 返回结果
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        apifyRunId: runId,
        preset,
        category: category || 'mixed',
        queries: queries.slice(0, 5), // 只返回前5个查询词
        estimatedTime: '3-5 minutes',
      },
      config: {
        preset,
        filterConfig: config,
        totalQueries: queries.length,
      },
      message: `Optimized Shorts scraping started with ${preset} preset`,
    });

  } catch (error: any) {
    console.error('Error starting optimized shorts scraping:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/viral-discovery/shorts-optimized/presets
 * 获取可用的预设配置
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // 如果请求预设列表
    if (action === 'list-presets') {
      return NextResponse.json({
        success: true,
        presets: {
          viral: {
            name: '爆款发现',
            description: '已验证的高播放量内容',
            minViews: 100000,
            minEngagementRate: 5,
            maxDaysOld: 7,
            icon: '🔥',
          },
          potential: {
            name: '潜力挖掘',
            description: '早期高互动率内容',
            minViews: 10000,
            minEngagementRate: 8,
            maxDaysOld: 3,
            icon: '🚀',
          },
          blueOcean: {
            name: '蓝海机会',
            description: '低竞争高价值内容',
            minViews: 5000,
            minEngagementRate: 10,
            maxDaysOld: 2,
            icon: '🌊',
          },
        },
        categories: {
          education: { name: '教育', icon: '📚', keywords: SHORTS_KEYWORDS.education.slice(0, 3) },
          tech: { name: '科技', icon: '💻', keywords: SHORTS_KEYWORDS.tech.slice(0, 3) },
          business: { name: '商业', icon: '💼', keywords: SHORTS_KEYWORDS.business.slice(0, 3) },
          lifestyle: { name: '生活', icon: '🏡', keywords: SHORTS_KEYWORDS.lifestyle.slice(0, 3) },
          quickKnowledge: { name: '快速知识', icon: '💡', keywords: SHORTS_KEYWORDS.quickKnowledge.slice(0, 3) },
        },
      });
    }

    // 默认返回使用说明
    return NextResponse.json({
      success: true,
      endpoint: '/api/viral-discovery/shorts-optimized',
      methods: {
        POST: {
          description: 'Start optimized Shorts scraping',
          body: {
            preset: 'viral | potential | blueOcean (required)',
            category: 'education | tech | business | lifestyle | quickKnowledge (optional)',
            customKeywords: 'string[] (optional)',
            maxResults: 'number (optional, default: 50)',
          },
          example: {
            preset: 'viral',
            category: 'education',
            maxResults: 30,
          },
        },
        GET: {
          description: 'Get available presets and categories',
          query: {
            action: 'list-presets',
          },
        },
      },
      documentation: '/docs/YOUTUBE_SHORTS_OPTIMIZATION.md',
    });

  } catch (error: any) {
    console.error('Error in GET request:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
