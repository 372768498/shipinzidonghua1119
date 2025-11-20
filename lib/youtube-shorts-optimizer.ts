/**
 * YouTube Shorts 爬取优化策略
 * 
 * 核心洞察：
 * - YouTube Shorts更适合教育类和价值驱动内容
 * - 与TikTok的娱乐音乐驱动不同
 * - 需要针对性的关键词和评分算法
 */

import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY!,
});

// ============================================
// 1. YouTube Shorts 专用关键词库
// ============================================

/**
 * 按类别分组的高质量关键词
 * 基于Shorts平台特性优化
 */
export const SHORTS_KEYWORDS = {
  // 教育类（Shorts的强项）
  education: [
    'how to', 'tutorial', 'learn', 'explain', 'guide',
    'tips', 'tricks', 'hack', 'lesson', 'course',
    '教程', '学习', '技巧', '干货', '知识',
  ],
  
  // 科技与效率
  tech: [
    'AI', 'tech review', 'gadget', 'app review', 'productivity',
    'coding', 'programming', 'tech tips', 'software',
    '科技', '效率', '工具', 'APP推荐',
  ],
  
  // 商业与创业
  business: [
    'business tips', 'entrepreneur', 'startup', 'marketing',
    'sales', 'passive income', 'side hustle', 'money',
    '创业', '副业', '赚钱', '营销',
  ],
  
  // 生活技能
  lifestyle: [
    'life hack', 'DIY', 'organize', 'clean', 'cook',
    'fitness', 'health', 'workout', 'recipe',
    '生活小技巧', '健康', '健身', '整理',
  ],
  
  // 快速知识
  quickKnowledge: [
    'did you know', 'fact', 'explained', 'science',
    'history', 'psychology', 'mind blown',
    '冷知识', '科普', '涨知识',
  ],
};

/**
 * 获取优化后的搜索查询
 */
export function getOptimizedSearchQueries(
  category?: keyof typeof SHORTS_KEYWORDS,
  customKeywords?: string[]
): string[] {
  const queries: string[] = [];
  
  if (category) {
    // 单个类别
    queries.push(...SHORTS_KEYWORDS[category]);
  } else {
    // 所有类别混合，优先教育类
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
// 2. 智能筛选条件
// ============================================

export interface ShortsFilterConfig {
  // 时长限制（Shorts特性）
  minDuration: number; // 秒
  maxDuration: number; // 秒（Shorts上限60秒）
  
  // 质量门槛
  minViews: number;
  minEngagementRate: number; // 百分比
  
  // 时效性
  maxDaysOld: number;
  
  // 内容类型
  preferredCategories: string[];
  
  // 订阅数范围（发现中小创作者）
  minSubscribers: number;
  maxSubscribers: number;
}

/**
 * 预设配置
 */
export const SHORTS_FILTER_PRESETS = {
  // 爆款发现（已验证的爆款）
  viral: {
    minDuration: 15,
    maxDuration: 60,
    minViews: 100000,
    minEngagementRate: 5,
    maxDaysOld: 7,
    preferredCategories: ['education', 'tech', 'business'],
    minSubscribers: 1000,
    maxSubscribers: 10000000,
  } as ShortsFilterConfig,
  
  // 潜力挖掘（早期高潜力）
  potential: {
    minDuration: 20,
    maxDuration: 60,
    minViews: 10000,
    minEngagementRate: 8,
    maxDaysOld: 3,
    preferredCategories: ['education', 'tech', 'quickKnowledge'],
    minSubscribers: 500,
    maxSubscribers: 50000,
  } as ShortsFilterConfig,
  
  // 蓝海机会（低竞争高价值）
  blueOcean: {
    minDuration: 30,
    maxDuration: 60,
    minViews: 5000,
    minEngagementRate: 10,
    maxDaysOld: 2,
    preferredCategories: ['education', 'business', 'lifestyle'],
    minSubscribers: 100,
    maxSubscribers: 10000,
  } as ShortsFilterConfig,
};

/**
 * 应用筛选条件
 */
export function filterShortsVideos(
  videos: any[],
  config: ShortsFilterConfig
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
    
    // 互动率检查
    const likes = parseInt(video.likeCount || video.likes || '0');
    const comments = parseInt(video.commentCount || video.comments || '0');
    const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
    if (engagementRate < config.minEngagementRate) {
      return false;
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
// 3. Shorts专用评分算法
// ============================================

/**
 * Shorts爆款评分算法（0-100分）
 * 针对教育/价值类内容优化
 */
export function calculateShortsViralScore(video: {
  views: number;
  likes: number;
  comments: number;
  subscriberCount: number;
  duration: number; // 秒
  publishedAt: string;
  title: string;
  description: string;
}): {
  totalScore: number;
  breakdown: {
    engagement: number;
    growth: number;
    quality: number;
    timing: number;
    content: number;
  };
} {
  // 1. 互动质量（30分）
  const engagementRate = (video.likes + video.comments * 2) / video.views;
  const engagementScore = Math.min(engagementRate * 3000, 30);
  
  // 2. 增长潜力（25分）
  // 观看/订阅比 - Shorts更容易突破订阅数限制
  const viewToSubscriberRatio = video.views / Math.max(video.subscriberCount, 1);
  const growthScore = Math.min(Math.log10(viewToSubscriberRatio + 1) * 10, 25);
  
  // 3. 内容质量（25分）
  // 基于时长和完播率推测
  const optimalDuration = 40; // Shorts最佳时长
  const durationScore = 10 - Math.abs(video.duration - optimalDuration) * 0.2;
  
  // 标题/描述质量分析
  const contentScore = analyzeContentQuality(video.title, video.description);
  const qualityScore = Math.max(durationScore + contentScore, 0);
  
  // 4. 时机把握（10分）
  const daysOld = (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  const timingScore = Math.max(10 - daysOld * 0.5, 0);
  
  // 5. 教育价值加成（10分）
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

/**
 * 分析内容质量
 */
function analyzeContentQuality(title: string, description: string): number {
  let score = 0;
  const text = `${title} ${description}`.toLowerCase();
  
  // 教育关键词
  const eduKeywords = ['how to', 'tutorial', 'learn', 'guide', 'tips', 'explain'];
  eduKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 2;
  });
  
  // 数字（步骤、列表）
  if (/\d+/.test(title)) score += 2;
  
  // 问号（问题导向）
  if (title.includes('?')) score += 1;
  
  // Emoji（视觉吸引）
  if (/[\u{1F300}-\u{1F9FF}]/u.test(title)) score += 1;
  
  return Math.min(score, 15);
}

/**
 * 检测教育价值
 */
function detectEducationalValue(title: string, description: string): number {
  let score = 0;
  const text = `${title} ${description}`.toLowerCase();
  
  // 教育类别强匹配
  const strongEducational = [
    'tutorial', 'course', 'lesson', 'learn', 'teach',
    'explain', 'guide', 'how to', 'step by step'
  ];
  
  strongEducational.forEach(keyword => {
    if (text.includes(keyword)) score += 3;
  });
  
  // 知识分享
  const knowledgeSharing = [
    'fact', 'science', 'history', 'psychology',
    'did you know', 'tips', 'tricks', 'hack'
  ];
  
  knowledgeSharing.forEach(keyword => {
    if (text.includes(keyword)) score += 2;
  });
  
  return Math.min(score, 10);
}

// ============================================
// 4. 智能爬取策略
// ============================================

export interface SmartCrawlConfig {
  // 批量策略
  batchSize: number; // 每批爬取数量
  batchInterval: number; // 批次间隔（小时）
  
  // 频道策略
  channelRotation: boolean; // 是否轮换频道
  channelsPerBatch: number;
  
  // 关键词策略
  keywordRotation: boolean; // 是否轮换关键词
  keywordsPerBatch: number;
  
  // 预设类型
  preset: 'viral' | 'potential' | 'blueOcean';
}

/**
 * 成本优化的爬取计划
 */
export function createCostOptimizedCrawlPlan(
  config: SmartCrawlConfig
): {
  schedule: Array<{
    hour: number;
    keywords: string[];
    channels: string[];
    maxResults: number;
  }>;
  estimatedCost: number;
  estimatedResults: number;
} {
  const schedule = [];
  const keywords = getOptimizedSearchQueries();
  
  // 分时段爬取（避开高峰期）
  const crawlHours = [2, 8, 14, 20]; // UTC时间
  
  for (const hour of crawlHours) {
    schedule.push({
      hour,
      keywords: keywords.slice(0, config.keywordsPerBatch),
      channels: [], // 由用户配置
      maxResults: config.batchSize,
    });
  }
  
  // 成本估算（基于Apify定价）
  const estimatedCost = schedule.length * 0.5; // 每次爬取约$0.5
  const estimatedResults = schedule.length * config.batchSize;
  
  return {
    schedule,
    estimatedCost,
    estimatedResults,
  };
}

// ============================================
// 5. 主要爬取函数（优化版）
// ============================================

/**
 * 优化的Shorts爬取
 */
export async function scrapeOptimizedShorts(options: {
  preset?: 'viral' | 'potential' | 'blueOcean';
  category?: keyof typeof SHORTS_KEYWORDS;
  customKeywords?: string[];
  maxResults?: number;
  webhookUrl?: string;
}): Promise<{
  runId: string;
  config: ShortsFilterConfig;
  queries: string[];
}> {
  const {
    preset = 'viral',
    category,
    customKeywords,
    maxResults = 50,
    webhookUrl,
  } = options;

  // 获取配置
  const filterConfig = SHORTS_FILTER_PRESETS[preset];
  const queries = getOptimizedSearchQueries(category, customKeywords);

  console.log('🎯 启动优化Shorts爬取');
  console.log('预设:', preset);
  console.log('类别:', category || '混合');
  console.log('关键词数:', queries.length);

  // 使用多个scraper备用
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
          // Shorts特定配置
          videoType: 'shorts', // 如果scraper支持
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
 * 获取并处理Shorts结果
 */
export async function getOptimizedShortsResults(
  runId: string,
  filterConfig?: ShortsFilterConfig
): Promise<Array<{
  video: any;
  viralScore: number;
  scoreBreakdown: any;
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
    filteredVideos = filterShortsVideos(items, filterConfig);
    console.log(`✅ 筛选后: ${filteredVideos.length}`);
  }

  // 计算评分
  const results = filteredVideos.map(video => {
    const scoreResult = calculateShortsViralScore({
      views: parseInt(video.viewCount || video.views || '0'),
      likes: parseInt(video.likeCount || video.likes || '0'),
      comments: parseInt(video.commentCount || video.comments || '0'),
      subscriberCount: parseInt(video.subscriberCount || '0'),
      duration: video.duration || 0,
      publishedAt: video.publishedAt || new Date().toISOString(),
      title: video.title || '',
      description: video.description || '',
    });

    return {
      video,
      viralScore: scoreResult.totalScore,
      scoreBreakdown: scoreResult.breakdown,
      passed: scoreResult.totalScore >= 70, // 爆款门槛
    };
  });

  // 按评分排序
  results.sort((a, b) => b.viralScore - a.viralScore);

  console.log(`🎯 高分视频(≥70): ${results.filter(r => r.passed).length}`);

  return results;
}

// ============================================
// 6. 导出便捷函数
// ============================================

/**
 * 快速启动：发现爆款Shorts
 */
export async function quickDiscoverViralShorts(options?: {
  category?: keyof typeof SHORTS_KEYWORDS;
  maxResults?: number;
}) {
  const { category, maxResults = 30 } = options || {};

  console.log('🚀 快速爆款发现模式');

  const { runId, config, queries } = await scrapeOptimizedShorts({
    preset: 'viral',
    category,
    maxResults,
  });

  console.log('⏳ 等待爬取完成...');
  
  // 轮询等待（生产环境使用webhook）
  await waitForCompletion(runId);

  const results = await getOptimizedShortsResults(runId, config);
  const viralVideos = results.filter(r => r.passed);

  console.log('✅ 完成！');
  console.log(`📊 爆款视频数: ${viralVideos.length}`);

  return viralVideos;
}

/**
 * 轮询等待任务完成
 */
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

    // 等待30秒后重试
    await new Promise(resolve => setTimeout(resolve, 30000));
  }

  throw new Error('等待超时');
}

export default {
  SHORTS_KEYWORDS,
  SHORTS_FILTER_PRESETS,
  getOptimizedSearchQueries,
  scrapeOptimizedShorts,
  getOptimizedShortsResults,
  calculateShortsViralScore,
  quickDiscoverViralShorts,
};
