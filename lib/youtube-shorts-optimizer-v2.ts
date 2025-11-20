/**
 * YouTube Shorts 爬取优化策略 V2
 * 
 * ✨ 新特性：整合专业爆款定义标准
 * 
 * 核心洞察：
 * - YouTube Shorts更适合教育类和价值驱动内容
 * - 使用行业级的爆款评分标准
 * - 支持相对定义和平台差异化
 */

import { ApifyClient } from 'apify-client';
import { 
  isViral, 
  VIEW_THRESHOLDS,
  ENGAGEMENT_RATES,
  YOUTUBE_SHORTS_CHARACTERISTICS,
  getVerticalAdjustment,
  VIRAL_PRESETS
} from './viral-definition-standards';

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY!,
});

// ============================================
// 1. YouTube Shorts 专用关键词库（保留原有）
// ============================================

export const SHORTS_KEYWORDS = {
  education: [
    'how to', 'tutorial', 'learn', 'explain', 'guide',
    'tips', 'tricks', 'hack', 'lesson', 'course',
    '教程', '学习', '技巧', '干货', '知识',
  ],
  
  tech: [
    'AI', 'tech review', 'gadget', 'app review', 'productivity',
    'coding', 'programming', 'tech tips', 'software',
    '科技', '效率', '工具', 'APP推荐',
  ],
  
  business: [
    'business tips', 'entrepreneur', 'startup', 'marketing',
    'sales', 'passive income', 'side hustle', 'money',
    '创业', '副业', '赚钱', '营销',
  ],
  
  lifestyle: [
    'life hack', 'DIY', 'organize', 'clean', 'cook',
    'fitness', 'health', 'workout', 'recipe',
    '生活小技巧', '健康', '健身', '整理',
  ],
  
  quickKnowledge: [
    'did you know', 'fact', 'explained', 'science',
    'history', 'psychology', 'mind blown',
    '冷知识', '科普', '涨知识',
  ],
};

export function getOptimizedSearchQueries(
  category?: keyof typeof SHORTS_KEYWORDS,
  customKeywords?: string[]
): string[] {
  const queries: string[] = [];
  
  if (category) {
    queries.push(...SHORTS_KEYWORDS[category]);
  } else {
    queries.push(
      ...SHORTS_KEYWORDS.education.slice(0, 3),
      ...SHORTS_KEYWORDS.tech.slice(0, 2),
      ...SHORTS_KEYWORDS.business.slice(0, 2),
      ...SHORTS_KEYWORDS.quickKnowledge.slice(0, 2),
    );
  }
  
  if (customKeywords) {
    queries.push(...customKeywords);
  }
  
  return queries;
}

// ============================================
// 2. 升级的筛选条件（整合新标准）
// ============================================

export interface ShortsFilterConfigV2 {
  // 时长限制
  minDuration: number;
  maxDuration: number;
  
  // 质量门槛（使用新标准）
  minViews: number;
  minEngagementRate: number;
  minShareRate?: number; // 新增：分享率门槛
  
  // 时效性
  maxDaysOld: number;
  
  // 内容类型
  preferredCategories: string[];
  
  // 订阅数范围
  minSubscribers: number;
  maxSubscribers: number;
  
  // 使用专业标准评分
  useProfessionalStandards: boolean;
  minViralScore?: number; // 最低爆款评分（0-100）
}

/**
 * 预设配置（升级版）
 */
export const SHORTS_FILTER_PRESETS_V2 = {
  // 确定爆款（使用专业标准）
  viral: {
    minDuration: 15,
    maxDuration: 60,
    minViews: VIEW_THRESHOLDS.youtube_shorts.viral, // 50万+
    minEngagementRate: ENGAGEMENT_RATES.totalEngagement.good, // 8%+
    minShareRate: ENGAGEMENT_RATES.shareRate.good, // 1.5%+
    maxDaysOld: 7,
    preferredCategories: ['education', 'tech', 'business'],
    minSubscribers: 1000,
    maxSubscribers: 10000000,
    useProfessionalStandards: true,
    minViralScore: 85, // 确定爆款
  } as ShortsFilterConfigV2,
  
  // 热门视频
  hot: {
    minDuration: 20,
    maxDuration: 60,
    minViews: VIEW_THRESHOLDS.youtube_shorts.hot, // 20万+
    minEngagementRate: ENGAGEMENT_RATES.totalEngagement.good, // 8%+
    minShareRate: ENGAGEMENT_RATES.shareRate.normal, // 1%+
    maxDaysOld: 14,
    preferredCategories: ['education', 'tech', 'quickKnowledge'],
    minSubscribers: 500,
    maxSubscribers: 5000000,
    useProfessionalStandards: true,
    minViralScore: 70, // 热门视频
  } as ShortsFilterConfigV2,
  
  // 潜力挖掘（更智能的筛选）
  potential: {
    minDuration: 20,
    maxDuration: 60,
    minViews: VIEW_THRESHOLDS.youtube_shorts.potential, // 5万+
    minEngagementRate: ENGAGEMENT_RATES.totalEngagement.excellent, // 15%+ 高互动补偿播放量
    minShareRate: ENGAGEMENT_RATES.shareRate.excellent, // 3%+ 传播力强
    maxDaysOld: 3,
    preferredCategories: ['education', 'tech', 'business'],
    minSubscribers: 100,
    maxSubscribers: 50000,
    useProfessionalStandards: true,
    minViralScore: 55, // 潜力视频
  } as ShortsFilterConfigV2,
  
  // 蓝海机会（小众高价值）
  blueOcean: {
    minDuration: 30,
    maxDuration: 60,
    minViews: 5000, // 降低播放量要求
    minEngagementRate: 0.10, // 10%+ 互动率
    minShareRate: 0.03, // 3%+ 分享率
    maxDaysOld: 2,
    preferredCategories: ['education', 'business', 'tech'],
    minSubscribers: 100,
    maxSubscribers: 10000,
    useProfessionalStandards: true,
    minViralScore: 55, // 考虑相对表现
  } as ShortsFilterConfigV2,
};

/**
 * 应用筛选条件（升级版）
 */
export function filterShortsVideosV2(
  videos: any[],
  config: ShortsFilterConfigV2
): any[] {
  return videos.filter(video => {
    // 时长检查
    const duration = video.duration || 0;
    if (duration < config.minDuration || duration > config.maxDuration) {
      return false;
    }
    
    // 观看数检查
    const views = parseInt(video.viewCount || video.views || '0');
    if (views < config.minViews) {
      return false;
    }
    
    // 互动率检查（基础）
    const likes = parseInt(video.likeCount || video.likes || '0');
    const comments = parseInt(video.commentCount || video.comments || '0');
    const shares = parseInt(video.shareCount || video.shares || '0');
    const engagementRate = views > 0 ? ((likes + comments + shares) / views) : 0;
    if (engagementRate < config.minEngagementRate) {
      return false;
    }
    
    // 分享率检查（新增）
    if (config.minShareRate) {
      const shareRate = views > 0 ? (shares / views) : 0;
      if (shareRate < config.minShareRate) {
        return false;
      }
    }
    
    // 时效性检查
    const publishedAt = new Date(video.publishedAt || video.createTime);
    const daysOld = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld > config.maxDaysOld) {
      return false;
    }
    
    // 订阅数范围
    const subscribers = parseInt(video.subscriberCount || '0');
    if (subscribers < config.minSubscribers || subscribers > config.maxSubscribers) {
      return false;
    }
    
    return true;
  });
}

// ============================================
// 3. 专业评分系统（整合新标准）
// ============================================

export interface ViralScoreResult {
  // 专业标准评分
  professionalScore: {
    isViral: boolean;
    confidence: number;
    reasons: string[];
    score: number;
  };
  
  // 传统评分（保留作为参考）
  legacyScore?: {
    totalScore: number;
    breakdown: {
      engagement: number;
      growth: number;
      quality: number;
      timing: number;
      content: number;
    };
  };
  
  // 综合判断
  finalVerdict: {
    isViral: boolean;
    confidence: number;
    level: 'viral' | 'hot' | 'potential' | 'normal';
  };
}

/**
 * 升级的爆款评分函数
 */
export function calculateShortsViralScoreV2(video: {
  views: number;
  likes: number;
  comments: number;
  shares?: number;
  subscriberCount: number;
  duration: number;
  publishedAt: string;
  title: string;
  description: string;
  category?: string;
}): ViralScoreResult {
  // 1. 使用专业标准评分
  const professionalScore = isViral(
    {
      views: video.views,
      likes: video.likes,
      comments: video.comments,
      shares: video.shares || 0,
      subscriberCount: video.subscriberCount,
      publishedAt: video.publishedAt,
      category: video.category,
    },
    'youtube_shorts'
  );
  
  // 2. 计算传统评分（可选，用于对比）
  const legacyScore = calculateLegacyScore(video);
  
  // 3. 综合判断
  const finalVerdict = determineFinalVerdict(
    professionalScore,
    legacyScore,
    video
  );
  
  return {
    professionalScore,
    legacyScore,
    finalVerdict,
  };
}

/**
 * 传统评分算法（保留作为参考）
 */
function calculateLegacyScore(video: {
  views: number;
  likes: number;
  comments: number;
  subscriberCount: number;
  duration: number;
  publishedAt: string;
  title: string;
  description: string;
}) {
  const engagementRate = (video.likes + video.comments * 2) / video.views;
  const engagementScore = Math.min(engagementRate * 3000, 30);
  
  const viewToSubscriberRatio = video.views / Math.max(video.subscriberCount, 1);
  const growthScore = Math.min(Math.log10(viewToSubscriberRatio + 1) * 10, 25);
  
  const optimalDuration = 40;
  const durationScore = 10 - Math.abs(video.duration - optimalDuration) * 0.2;
  const contentScore = analyzeContentQuality(video.title, video.description);
  const qualityScore = Math.max(durationScore + contentScore, 0);
  
  const daysOld = (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  const timingScore = Math.max(10 - daysOld * 0.5, 0);
  
  const educationalScore = detectEducationalValue(video.title, video.description);
  
  const totalScore = Math.round(
    engagementScore + growthScore + qualityScore + timingScore + educationalScore
  );
  
  return {
    totalScore: Math.min(totalScore, 100),
    breakdown: {
      engagement: Math.round(engagementScore),
      growth: Math.round(growthScore),
      quality: Math.round(qualityScore),
      timing: Math.round(timingScore),
      content: Math.round(educationalScore),
    },
  };
}

function analyzeContentQuality(title: string, description: string): number {
  let score = 0;
  const text = `${title} ${description}`.toLowerCase();
  
  const eduKeywords = ['how to', 'tutorial', 'learn', 'guide', 'tips', 'explain'];
  eduKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 2;
  });
  
  if (/\d+/.test(title)) score += 2;
  if (title.includes('?')) score += 1;
  if (/[\u{1F300}-\u{1F9FF}]/u.test(title)) score += 1;
  
  return Math.min(score, 15);
}

function detectEducationalValue(title: string, description: string): number {
  let score = 0;
  const text = `${title} ${description}`.toLowerCase();
  
  const strongEducational = [
    'tutorial', 'course', 'lesson', 'learn', 'teach',
    'explain', 'guide', 'how to', 'step by step'
  ];
  
  strongEducational.forEach(keyword => {
    if (text.includes(keyword)) score += 3;
  });
  
  const knowledgeSharing = [
    'fact', 'science', 'history', 'psychology',
    'did you know', 'tips', 'tricks', 'hack'
  ];
  
  knowledgeSharing.forEach(keyword => {
    if (text.includes(keyword)) score += 2;
  });
  
  return Math.min(score, 10);
}

/**
 * 确定最终判断
 */
function determineFinalVerdict(
  professionalScore: any,
  legacyScore: any,
  video: any
): {
  isViral: boolean;
  confidence: number;
  level: 'viral' | 'hot' | 'potential' | 'normal';
} {
  // 以专业标准为主
  const score = professionalScore.score;
  
  let level: 'viral' | 'hot' | 'potential' | 'normal';
  if (score >= 85) {
    level = 'viral';
  } else if (score >= 70) {
    level = 'hot';
  } else if (score >= 55) {
    level = 'potential';
  } else {
    level = 'normal';
  }
  
  return {
    isViral: professionalScore.isViral,
    confidence: professionalScore.confidence,
    level,
  };
}

// ============================================
// 4. 主要爬取函数（升级版）
// ============================================

export async function scrapeOptimizedShortsV2(options: {
  preset?: 'viral' | 'hot' | 'potential' | 'blueOcean';
  category?: keyof typeof SHORTS_KEYWORDS;
  customKeywords?: string[];
  maxResults?: number;
  webhookUrl?: string;
}): Promise<{
  runId: string;
  config: ShortsFilterConfigV2;
  queries: string[];
}> {
  const {
    preset = 'viral',
    category,
    customKeywords,
    maxResults = 50,
    webhookUrl,
  } = options;

  const filterConfig = SHORTS_FILTER_PRESETS_V2[preset];
  const queries = getOptimizedSearchQueries(category, customKeywords);

  console.log('🎯 启动专业标准Shorts爬取');
  console.log('预设:', preset);
  console.log('类别:', category || '混合');
  console.log('关键词数:', queries.length);
  console.log('使用专业标准评分:', filterConfig.useProfessionalStandards);

  const scrapers = [
    'streamers/youtube-scraper',
    'clockworks/youtube-scraper',
    'bernardo/youtube-scraper',
  ];

  let runId = '';
  let lastError: Error | null = null;

  for (const scraperName of scrapers) {
    try {
      console.log(`🔄 尝试: ${scraperName}`);

      const run = await client.actor(scraperName).call(
        {
          searchQueries: queries,
          maxResults: maxResults,
          videoType: 'shorts',
          sortBy: 'relevance',
          proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
          },
        },
        {
          webhooks: webhookUrl
            ? [
                {
                  eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
                  requestUrl: webhookUrl,
                },
              ]
            : undefined,
        }
      );

      runId = run.id;
      console.log(`✅ 爬取任务启动: ${runId}`);
      break;
    } catch (error: any) {
      console.error(`❌ ${scraperName} 失败:`, error.message);
      lastError = error;
      continue;
    }
  }

  if (!runId) {
    throw lastError || new Error('所有Shorts爬虫都不可用');
  }

  return {
    runId,
    config: filterConfig,
    queries,
  };
}

/**
 * 获取并处理Shorts结果（升级版）
 */
export async function getOptimizedShortsResultsV2(
  runId: string,
  filterConfig?: ShortsFilterConfigV2
): Promise<Array<{
  video: any;
  viralAnalysis: ViralScoreResult;
  passed: boolean;
}>> {
  console.log('📥 获取爬取结果:', runId);

  const run = await client.run(runId).get();

  if (run.status !== 'SUCCEEDED') {
    throw new Error(`Run status: ${run.status}`);
  }

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  console.log(`📊 原始结果数: ${items.length}`);

  // 应用筛选
  let filteredVideos = items;
  if (filterConfig) {
    filteredVideos = filterShortsVideosV2(items, filterConfig);
    console.log(`✅ 筛选后: ${filteredVideos.length}`);
  }

  // 使用专业标准评分
  const results = filteredVideos.map(video => {
    const viralAnalysis = calculateShortsViralScoreV2({
      views: parseInt(video.viewCount || video.views || '0'),
      likes: parseInt(video.likeCount || video.likes || '0'),
      comments: parseInt(video.commentCount || video.comments || '0'),
      shares: parseInt(video.shareCount || video.shares || '0'),
      subscriberCount: parseInt(video.subscriberCount || '0'),
      duration: video.duration || 0,
      publishedAt: video.publishedAt || new Date().toISOString(),
      title: video.title || '',
      description: video.description || '',
      category: video.category,
    });

    // 判断是否通过
    const minScore = filterConfig?.minViralScore || 70;
    const passed = viralAnalysis.professionalScore.score >= minScore;

    return {
      video,
      viralAnalysis,
      passed,
    };
  });

  // 按专业评分排序
  results.sort((a, b) => 
    b.viralAnalysis.professionalScore.score - a.viralAnalysis.professionalScore.score
  );

  console.log(`🎯 通过评分的视频: ${results.filter(r => r.passed).length}`);
  console.log(`🔥 确定爆款(≥85分): ${results.filter(r => r.viralAnalysis.finalVerdict.level === 'viral').length}`);
  console.log(`🌟 热门视频(≥70分): ${results.filter(r => r.viralAnalysis.finalVerdict.level === 'hot').length}`);
  console.log(`⭐ 潜力视频(≥55分): ${results.filter(r => r.viralAnalysis.finalVerdict.level === 'potential').length}`);

  return results;
}

// ============================================
// 5. 便捷函数（升级版）
// ============================================

/**
 * 快速启动：发现爆款Shorts（使用专业标准）
 */
export async function quickDiscoverViralShortsV2(options?: {
  category?: keyof typeof SHORTS_KEYWORDS;
  preset?: 'viral' | 'hot' | 'potential' | 'blueOcean';
  maxResults?: number;
}) {
  const { category, preset = 'viral', maxResults = 30 } = options || {};

  console.log('🚀 快速爆款发现模式（专业标准）');

  const { runId, config, queries } = await scrapeOptimizedShortsV2({
    preset,
    category,
    maxResults,
  });

  console.log('⏳ 等待爬取完成...');
  await waitForCompletion(runId);

  const results = await getOptimizedShortsResultsV2(runId, config);
  const viralVideos = results.filter(r => r.passed);

  console.log('✅ 完成！');
  console.log(`📊 找到 ${viralVideos.length} 个符合标准的视频`);
  
  // 打印详细分析
  viralVideos.slice(0, 5).forEach((result, index) => {
    console.log(`\n--- Top ${index + 1} ---`);
    console.log(`标题: ${result.video.title}`);
    console.log(`评分: ${result.viralAnalysis.professionalScore.score}/100`);
    console.log(`等级: ${result.viralAnalysis.finalVerdict.level}`);
    console.log(`理由: ${result.viralAnalysis.professionalScore.reasons.join(', ')}`);
  });

  return viralVideos;
}

async function waitForCompletion(runId: string, maxWaitMinutes = 10) {
  const startTime = Date.now();
  const maxWaitMs = maxWaitMinutes * 60 * 1000;

  while (Date.now() - startTime < maxWaitMs) {
    const run = await client.run(runId).get();

    if (run.status === 'SUCCEEDED') {
      return;
    }

    if (run.status === 'FAILED' || run.status === 'ABORTED') {
      throw new Error(`Run ${run.status}: ${run.statusMessage}`);
    }

    await new Promise(resolve => setTimeout(resolve, 30000));
  }

  throw new Error('等待超时');
}

// ============================================
// 导出
// ============================================

export default {
  SHORTS_KEYWORDS,
  SHORTS_FILTER_PRESETS_V2,
  getOptimizedSearchQueries,
  scrapeOptimizedShortsV2,
  getOptimizedShortsResultsV2,
  calculateShortsViralScoreV2,
  quickDiscoverViralShortsV2,
};
