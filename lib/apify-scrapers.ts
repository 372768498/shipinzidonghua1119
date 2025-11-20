/**
 * Apify三剑客集成库
 * 1. YouTube Growth Scraper - 频道增长监控
 * 2. YouTube Scraper - 深度视频分析
 * 3. YouTube Shorts Scraper - 短视频专项
 */

import { ApifyClient } from 'apify-client';

// 初始化Apify客户端
const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN!,
});

// ============================================
// 1. YouTube Growth Scraper
// ============================================

export interface GrowthScraperInput {
  channelUrls: string[];
  maxChannels?: number;
}

export interface GrowthScraperResult {
  channelUrl: string;
  channelId: string;
  channelName: string;
  subscriberCount: number;
  avgViews: number;
  medianViews: number;
  trendPercentage: number; // 正数=增长，负数=下降
  isActive: boolean;
  recentVideos: Array<{
    videoId: string;
    views: number;
    publishedAt: string;
  }>;
}

/**
 * 启动Growth Scraper任务
 */
export async function runGrowthScraper(
  channelUrls: string[],
  webhookUrl?: string
): Promise<string> {
  const input: GrowthScraperInput = {
    channelUrls: channelUrls.slice(0, 500), // 最多500个
    maxChannels: channelUrls.length,
  };

  const run = await apifyClient
    .actor('bakkeshks/youtube-growth-scraper')
    .call(input, {
      webhooks: webhookUrl ? [
        {
          eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
          requestUrl: webhookUrl,
        }
      ] : undefined,
    });

  return run.id;
}

/**
 * 获取Growth Scraper结果
 */
export async function getGrowthScraperResults(
  runId: string
): Promise<GrowthScraperResult[]> {
  const run = await apifyClient.run(runId).get();
  
  if (run.status !== 'SUCCEEDED') {
    throw new Error(`Run status: ${run.status}`);
  }

  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
  return items as GrowthScraperResult[];
}

// ============================================
// 2. YouTube Scraper (Streamers)
// ============================================

export interface YouTubeScraperInput {
  searchQueries?: string[];
  channelUrls?: string[];
  videoUrls?: string[];
  maxResults?: number;
  sortBy?: 'relevance' | 'views' | 'date' | 'rating';
}

export interface YouTubeVideoResult {
  videoId: string;
  videoUrl: string;
  title: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  duration: number; // seconds
  publishedAt: string;
  thumbnailUrl: string;
  
  // Channel info
  channelId: string;
  channelName: string;
  channelUrl: string;
  subscriberCount: number;
  
  // Engagement
  engagementRate: number;
  
  // Tags & Metadata
  tags: string[];
  hashtags: string[];
}

/**
 * 启动YouTube Scraper任务
 */
export async function runYouTubeScraper(
  input: YouTubeScraperInput,
  webhookUrl?: string
): Promise<string> {
  const run = await apifyClient
    .actor('streamers/youtube-scraper')
    .call({
      searchQueries: input.searchQueries || [],
      channelUrls: input.channelUrls || [],
      videoUrls: input.videoUrls || [],
      maxResults: input.maxResults || 100,
      sortBy: input.sortBy || 'views',
    }, {
      webhooks: webhookUrl ? [
        {
          eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
          requestUrl: webhookUrl,
        }
      ] : undefined,
    });

  return run.id;
}

/**
 * 获取YouTube Scraper结果
 */
export async function getYouTubeScraperResults(
  runId: string
): Promise<YouTubeVideoResult[]> {
  const run = await apifyClient.run(runId).get();
  
  if (run.status !== 'SUCCEEDED') {
    throw new Error(`Run status: ${run.status}`);
  }

  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
  return items as YouTubeVideoResult[];
}

// ============================================
// 3. YouTube Shorts Scraper
// ============================================

export interface ShortsScraperInput {
  channelUrls: string[];
  maxResults?: number;
}

export interface YouTubeShortsResult {
  videoId: string;
  videoUrl: string;
  title: string;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  duration: number; // seconds
  publishedAt: string;
  thumbnailUrl: string;
  
  // Channel info
  channelName: string;
  channelUrl: string;
  subscriberCount: number;
  
  // Shorts specific
  hashtags: string[];
  hasSubtitles: boolean;
  hasComments: boolean;
}

/**
 * 启动Shorts Scraper任务
 */
export async function runShortsScraper(
  channelUrls: string[],
  webhookUrl?: string
): Promise<string> {
  const input: ShortsScraperInput = {
    channelUrls,
    maxResults: 50,
  };

  const run = await apifyClient
    .actor('streamers/youtube-shorts-scraper')
    .call(input, {
      webhooks: webhookUrl ? [
        {
          eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
          requestUrl: webhookUrl,
        }
      ] : undefined,
    });

  return run.id;
}

/**
 * 获取Shorts Scraper结果
 */
export async function getShortsScraperResults(
  runId: string
): Promise<YouTubeShortsResult[]> {
  const run = await apifyClient.run(runId).get();
  
  if (run.status !== 'SUCCEEDED') {
    throw new Error(`Run status: ${run.status}`);
  }

  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
  return items as YouTubeShortsResult[];
}

// ============================================
// 爆款评分算法
// ============================================

/**
 * 计算爆款评分 (0-100)
 */
export function calculateViralScore(video: {
  views: number;
  likes: number;
  comments: number;
  subscriberCount: number;
  publishedAt: string;
}): number {
  // 1. 互动率 (40分)
  const engagementRate = (video.likes + video.comments * 2) / video.views;
  const engagementScore = Math.min(engagementRate * 1000, 40);
  
  // 2. 观看/订阅比 (30分)
  const viewToSubscriberRatio = video.views / Math.max(video.subscriberCount, 1);
  const ratioScore = Math.min(viewToSubscriberRatio * 10, 30);
  
  // 3. 新鲜度 (20分)
  const daysOld = Math.floor(
    (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const freshnessScore = Math.max(20 - daysOld * 0.5, 0);
  
  // 4. 绝对观看数 (10分)
  const viewScore = Math.min(Math.log10(video.views) * 2, 10);
  
  return Math.round(engagementScore + ratioScore + freshnessScore + viewScore);
}

/**
 * 判断是否为爆款视频
 */
export function isViralVideo(viralScore: number, minScore: number = 70): boolean {
  return viralScore >= minScore;
}

/**
 * 计算趋势状态
 */
export function getTrendStatus(trendPercentage: number): string {
  if (trendPercentage > 50) return '🔥 超热';
  if (trendPercentage > 20) return '📈 上升';
  if (trendPercentage > 0) return '➡️ 稳定';
  if (trendPercentage > -20) return '📉 下降';
  return '❄️ 冷淡';
}

// ============================================
// 组合工作流
// ============================================

/**
 * 完整的爆款发现工作流
 */
export async function fullViralDiscoveryWorkflow(params: {
  monitoredChannels: string[];
  searchKeywords: string[];
  webhookUrl: string;
}): Promise<{
  growthRunId: string;
  scraperRunId: string;
  shortsRunId: string;
}> {
  // 步骤1: Growth Scraper监控频道增长
  const growthRunId = await runGrowthScraper(
    params.monitoredChannels,
    params.webhookUrl
  );
  
  // 步骤2: YouTube Scraper深度抓取
  const scraperRunId = await runYouTubeScraper({
    searchQueries: params.searchKeywords,
    maxResults: 100,
    sortBy: 'views',
  }, params.webhookUrl);
  
  // 步骤3: Shorts Scraper抓取短视频
  const shortsRunId = await runShortsScraper(
    params.monitoredChannels.slice(0, 20), // 只对前20个频道抓取Shorts
    params.webhookUrl
  );
  
  return {
    growthRunId,
    scraperRunId,
    shortsRunId,
  };
}

/**
 * 获取Apify运行状态
 */
export async function getRunStatus(runId: string): Promise<{
  status: string;
  progress: number;
  error?: string;
}> {
  const run = await apifyClient.run(runId).get();
  
  return {
    status: run.status,
    progress: run.stats?.requestsFinished || 0,
    error: run.statusMessage,
  };
}

/**
 * 取消运行中的任务
 */
export async function abortRun(runId: string): Promise<void> {
  await apifyClient.run(runId).abort();
}

// ============================================
// 工具函数
// ============================================

/**
 * 验证YouTube频道URL
 */
export function isValidYouTubeChannelUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/channel\/[^\/]+$/,
    /^https?:\/\/(www\.)?youtube\.com\/@[^\/]+$/,
    /^https?:\/\/(www\.)?youtube\.com\/c\/[^\/]+$/,
  ];
  return patterns.some(pattern => pattern.test(url));
}

/**
 * 提取频道ID
 */
export function extractChannelId(url: string): string | null {
  const match = url.match(/\/(channel|@|c)\/([^\/\?]+)/);
  return match ? match[2] : null;
}

/**
 * 格式化数字（K, M, B）
 */
export function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

/**
 * 计算互动率
 */
export function calculateEngagementRate(
  likes: number,
  comments: number,
  views: number
): number {
  if (views === 0) return 0;
  return ((likes + comments) / views) * 100;
}
