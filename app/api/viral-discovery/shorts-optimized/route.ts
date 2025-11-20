/**
 * API路由：优化的YouTube Shorts爬取 V2
 * POST /api/viral-discovery/shorts-optimized
 * 
 * ✨ V2新特性：
 * - 专业爆款定义标准（100分制）
 * - 相对定义（账号分层）
 * - 垂直领域调整
 * - 分享率最高权重
 * - 详细评分原因
 * 
 * 预设模式：
 * - viral：确定爆款（≥85分）
 * - hot：热门视频（≥70分）
 * - potential：潜力视频（≥55分）
 * - blueOcean：蓝海机会（小众高价值）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  scrapeOptimizedShortsV2,
  SHORTS_FILTER_PRESETS_V2,
  SHORTS_KEYWORDS,
  type ShortsFilterConfigV2,
} from '@/lib/youtube-shorts-optimizer-v2';

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
      preset = 'viral', // 'viral' | 'hot' | 'potential' | 'blueOcean'
      category, // 'education' | 'tech' | 'business' | 'lifestyle' | 'quickKnowledge'
      customKeywords = [],
      maxResults = 50,
    } = body;

    // 3. 验证preset
    const validPresets = ['viral', 'hot', 'potential', 'blueOcean'];
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

    // 6. 启动优化爬取（V2）
    console.log('🚀 启动Shorts爬取V2:', { preset, category, maxResults });
    
    const { runId, config, queries } = await scrapeOptimizedShortsV2({
      preset: preset as 'viral' | 'hot' | 'potential' | 'blueOcean',
      category: category as keyof typeof SHORTS_KEYWORDS | undefined,
      customKeywords,
      maxResults,
      webhookUrl: webhookUrl.toString(),
    });

    console.log('✅ 爬取任务已启动:', { runId, queries: queries.length });

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
          optimizationType: 'shorts-optimized-v2', // 标记为V2
          preset,
          category: category || 'mixed',
          filterConfig: config,
          queries,
          version: '2.0', // V2版本标识
          features: [
            'professional-standards',
            'relative-definition',
            'vertical-adjustment',
            'share-rate-priority',
          ],
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

    // 8. 返回结果（包含V2特性说明）
    return NextResponse.json({
      success: true,
      version: '2.0',
      job: {
        id: job.id,
        status: job.status,
        apifyRunId: runId,
        preset,
        category: category || 'mixed',
        queries: queries.slice(0, 5),
        estimatedTime: '3-5 minutes',
      },
      config: {
        preset,
        filterConfig: config,
        totalQueries: queries.length,
        minViralScore: config.minViralScore,
        scoringMethod: 'professional-standards-100-point',
      },
      features: {
        professionalStandards: true,
        relativeDefinition: true,
        verticalAdjustment: true,
        shareRatePriority: true,
        detailedReasons: true,
      },
      message: `Optimized Shorts scraping V2 started with ${preset} preset`,
    });

  } catch (error: any) {
    console.error('Error starting optimized shorts scraping V2:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/viral-discovery/shorts-optimized
 * 获取可用的预设配置（V2版本）
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // 如果请求预设列表
    if (action === 'list-presets') {
      return NextResponse.json({
        success: true,
        version: '2.0',
        presets: {
          viral: {
            name: '🔥 确定爆款',
            description: '已验证的爆款内容（≥85分）',
            minViews: 500000,
            minEngagementRate: 8,
            minShareRate: 1.5,
            minViralScore: 85,
            maxDaysOld: 7,
            icon: '🔥',
            features: ['高播放', '高互动', '强传播力'],
          },
          hot: {
            name: '🌟 热门视频',
            description: '热门优质内容（≥70分）',
            minViews: 200000,
            minEngagementRate: 8,
            minShareRate: 1,
            minViralScore: 70,
            maxDaysOld: 14,
            icon: '🌟',
            features: ['稳定播放', '良好互动', '持续传播'],
          },
          potential: {
            name: '⭐ 潜力挖掘',
            description: '早期高潜力内容（≥55分）',
            minViews: 50000,
            minEngagementRate: 15,
            minShareRate: 3,
            minViralScore: 55,
            maxDaysOld: 3,
            icon: '⭐',
            features: ['超高互动', '极强分享', '早期发现'],
          },
          blueOcean: {
            name: '🌊 蓝海机会',
            description: '小众高价值内容（≥55分）',
            minViews: 5000,
            minEngagementRate: 10,
            minShareRate: 3,
            minViralScore: 55,
            maxDaysOld: 2,
            icon: '🌊',
            features: ['低竞争', '高价值', '小创作者'],
          },
        },
        categories: {
          education: { 
            name: '教育', 
            icon: '📚', 
            keywords: SHORTS_KEYWORDS.education.slice(0, 3),
            platformBonus: 1.4, // YouTube Shorts教育类加权
          },
          tech: { 
            name: '科技', 
            icon: '💻', 
            keywords: SHORTS_KEYWORDS.tech.slice(0, 3),
            platformBonus: 1.3,
          },
          business: { 
            name: '商业', 
            icon: '💼', 
            keywords: SHORTS_KEYWORDS.business.slice(0, 3),
            platformBonus: 1.25,
          },
          lifestyle: { 
            name: '生活', 
            icon: '🏡', 
            keywords: SHORTS_KEYWORDS.lifestyle.slice(0, 3),
            platformBonus: 1.2,
          },
          quickKnowledge: { 
            name: '快速知识', 
            icon: '💡', 
            keywords: SHORTS_KEYWORDS.quickKnowledge.slice(0, 3),
            platformBonus: 1.35,
          },
        },
        v2Features: {
          professionalStandards: {
            name: '专业评分标准',
            description: '基于行业数据的100分制评分',
          },
          relativeDefinition: {
            name: '相对定义',
            description: '根据账号分层（mega/macro/mid/micro/nano）动态调整标准',
          },
          verticalAdjustment: {
            name: '垂直领域调整',
            description: '小众领域门槛降低（最高-70%）',
          },
          shareRatePriority: {
            name: '分享率优先',
            description: '分享是传播的关键，权重最高',
          },
          detailedReasons: {
            name: '详细评分原因',
            description: '每个视频提供具体的爆款原因分析',
          },
        },
      });
    }

    // 默认返回使用说明
    return NextResponse.json({
      success: true,
      version: '2.0',
      endpoint: '/api/viral-discovery/shorts-optimized',
      methods: {
        POST: {
          description: 'Start optimized Shorts scraping V2 with professional standards',
          body: {
            preset: 'viral | hot | potential | blueOcean (required)',
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
          description: 'Get available presets, categories, and V2 features',
          query: {
            action: 'list-presets',
          },
        },
      },
      improvements: {
        scoring: 'Professional 100-point system with detailed breakdown',
        definition: 'Relative definition based on account tier and vertical',
        accuracy: 'Higher accuracy with share rate priority',
        transparency: 'Detailed reasons for each viral score',
      },
      documentation: [
        '/docs/SHORTS_INTEGRATION_GUIDE.md',
        '/docs/VIRAL_DEFINITION_STANDARDS.md',
      ],
    });

  } catch (error: any) {
    console.error('Error in GET request:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
