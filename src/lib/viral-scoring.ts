/**
 * 分平台爆款评分算法
 * 根据 TikTok 和 YouTube Shorts 的不同特性进行差异化评分
 */

export type Platform = 'tiktok' | 'youtube_shorts';

export interface VideoMetrics {
  views: number;
  likes: number;
  comments: number;
  shares?: number;
  saves?: number;
  publishedAt: string;
  duration: number;
  subscriberCount?: number;
  channelViews?: number;
  // TikTok特有
  musicId?: string;
  isTrending?: boolean;
  // YouTube特有
  tags?: string[];
  description?: string;
  title?: string;
}

export interface ViralScore {
  totalScore: number;
  grade: string;
  breakdown: {
    engagement: number;
    growth: number;
    freshness: number;
    platform: number;
  };
  isViral: boolean;
  reason: string;
}

// ============================================
// TikTok 爆款评分算法
// ============================================

/**
 * TikTok爆款评分
 * 重点：娱乐性、音乐、互动率、传播力
 */
export function calculateTikTokViralScore(video: VideoMetrics): ViralScore {
  let totalScore = 0;
  const breakdown = {
    engagement: 0,
    growth: 0,
    freshness: 0,
    platform: 0,
  };

  // 1. 互动率（40分）- TikTok最重要的指标
  const engagementRate = (video.likes + video.comments * 3 + (video.shares || 0) * 5) / video.views;
  breakdown.engagement = Math.min(engagementRate * 800, 40); // 提高权重
  
  // 2. 传播力（30分）- 分享是TikTok的核心
  const shareRate = (video.shares || 0) / video.views;
  breakdown.growth = Math.min(shareRate * 3000, 30);
  
  // 3. 新鲜度（20分）- TikTok重视快速爆发
  const hoursOld = (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60);
  if (hoursOld <= 24) {
    breakdown.freshness = 20; // 24小时内满分
  } else if (hoursOld <= 72) {
    breakdown.freshness = 15; // 3天内高分
  } else if (hoursOld <= 168) {
    breakdown.freshness = 10; // 1周内中等
  } else {
    breakdown.freshness = Math.max(10 - (hoursOld / 168) * 5, 0); // 持续衰减
  }
  
  // 4. 平台特性分（10分）
  let platformBonus = 0;
  // 使用热门音乐加分
  if (video.musicId && video.isTrending) {
    platformBonus += 5;
  }
  // 短视频加分（7-15秒最佳）
  if (video.duration >= 7 && video.duration <= 15) {
    platformBonus += 3;
  }
  // 高保存率加分
  const saveRate = (video.saves || 0) / video.views;
  if (saveRate > 0.02) {
    platformBonus += 2;
  }
  breakdown.platform = Math.min(platformBonus, 10);

  totalScore = breakdown.engagement + breakdown.growth + breakdown.freshness + breakdown.platform;

  // 判定爆款
  const isViral = totalScore >= 70 && video.views >= 1000000; // TikTok阈值：100万播放
  
  return {
    totalScore: Math.round(totalScore),
    grade: getGrade(totalScore),
    breakdown,
    isViral,
    reason: getTikTokReason(totalScore, video),
  };
}

function getTikTokReason(score: number, video: VideoMetrics): string {
  if (score >= 90) return '🔥 超级爆款！极高的互动率和传播力';
  if (score >= 80) return '🚀 大爆款！优秀的娱乐性和社交传播';
  if (score >= 70) return '⭐ 爆款！成功的短视频内容';
  if (score >= 60) return '📈 表现良好，接近爆款水平';
  return '📉 普通内容，互动和传播不足';
}

// ============================================
// YouTube Shorts 爆款评分算法
// ============================================

/**
 * YouTube Shorts爆款评分
 * 重点：价值传递、SEO、订阅转化、信息密度
 */
export function calculateYouTubeShortsViralScore(video: VideoMetrics): ViralScore {
  let totalScore = 0;
  const breakdown = {
    engagement: 0,
    growth: 0,
    freshness: 0,
    platform: 0,
  };

  // 1. 互动质量（30分）- YouTube更重视评论和订阅
  const engagementRate = (video.likes + video.comments * 5) / video.views; // 评论权重更高
  breakdown.engagement = Math.min(engagementRate * 600, 30);
  
  // 2. 订阅转化（30分）- YouTube核心指标
  if (video.subscriberCount && video.subscriberCount > 0) {
    const viewToSubRatio = video.views / video.subscriberCount;
    // 小频道爆款可能超过订阅数10倍
    breakdown.growth = Math.min(viewToSubRatio * 3, 30);
  } else {
    // 新频道给予基础分
    breakdown.growth = video.views >= 500000 ? 20 : 10;
  }
  
  // 3. 持久性（25分）- YouTube重视长尾流量
  const daysOld = (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld <= 7) {
    breakdown.freshness = 25; // 1周内高分
  } else if (daysOld <= 30) {
    breakdown.freshness = 20; // 1月内依然有效
  } else if (daysOld <= 90) {
    breakdown.freshness = 15; // 3月内长尾流量
  } else {
    breakdown.freshness = Math.max(15 - (daysOld / 90) * 5, 5); // 长期有价值内容
  }
  
  // 4. 平台特性分（15分）
  let platformBonus = 0;
  // SEO优化加分
  if (video.tags && video.tags.length >= 5) {
    platformBonus += 3;
  }
  // 标题质量（长度和关键词）
  if (video.title && video.title.length >= 30 && video.title.length <= 60) {
    platformBonus += 3;
  }
  // 描述详细度
  if (video.description && video.description.length >= 100) {
    platformBonus += 3;
  }
  // 视频时长（30-60秒最佳）
  if (video.duration >= 30 && video.duration <= 60) {
    platformBonus += 3;
  }
  // 保存率（高价值内容）
  const saveRate = (video.saves || 0) / video.views;
  if (saveRate > 0.03) {
    platformBonus += 3;
  }
  breakdown.platform = Math.min(platformBonus, 15);

  totalScore = breakdown.engagement + breakdown.growth + breakdown.freshness + breakdown.platform;

  // 判定爆款
  const isViral = totalScore >= 70 && video.views >= 500000; // YouTube阈值：50万播放
  
  return {
    totalScore: Math.round(totalScore),
    grade: getGrade(totalScore),
    breakdown,
    isViral,
    reason: getYouTubeReason(totalScore, video),
  };
}

function getYouTubeReason(score: number, video: VideoMetrics): string {
  if (score >= 90) return '🔥 超级爆款！高价值内容+优秀SEO';
  if (score >= 80) return '🚀 大爆款！强订阅转化和长尾流量';
  if (score >= 70) return '⭐ 爆款！成功的知识型短视频';
  if (score >= 60) return '📈 表现良好，价值传递到位';
  return '📉 普通内容，需优化SEO和价值点';
}

// ============================================
// 统一接口
// ============================================

export function calculateViralScore(
  platform: Platform,
  video: VideoMetrics
): ViralScore {
  if (platform === 'tiktok') {
    return calculateTikTokViralScore(video);
  } else {
    return calculateYouTubeShortsViralScore(video);
  }
}

function getGrade(score: number): string {
  if (score >= 90) return '🔥 S级';
  if (score >= 80) return '🚀 A级';
  if (score >= 70) return '⭐ B级';
  if (score >= 60) return '📈 C级';
  return '📉 D级';
}

// ============================================
// 相对爆款评分（考虑账号基础）
// ============================================

export function calculateRelativeViralScore(
  platform: Platform,
  video: VideoMetrics,
  accountMetrics: {
    followers: number;
    avgViews: number;
    niche: string;
  }
): ViralScore {
  const baseScore = calculateViralScore(platform, video);
  
  // 调整系数
  const performanceMultiplier = accountMetrics.avgViews > 0 
    ? video.views / accountMetrics.avgViews 
    : 1;
  
  // 小众领域调整
  const nicheAdjustment = getNicheAdjustment(accountMetrics.niche);
  
  // 新账号加成（粉丝少但爆款更有价值）
  const newAccountBonus = accountMetrics.followers < 10000 ? 1.2 : 1.0;
  
  const adjustedScore = baseScore.totalScore * 
    Math.min(performanceMultiplier, 2) * 
    nicheAdjustment * 
    newAccountBonus;

  return {
    ...baseScore,
    totalScore: Math.min(Math.round(adjustedScore), 100),
    reason: `${baseScore.reason}（相对表现：${performanceMultiplier.toFixed(1)}x）`,
  };
}

function getNicheAdjustment(niche: string): number {
  const adjustments: Record<string, number> = {
    // 大众领域
    '娱乐': 1.0,
    '搞笑': 1.0,
    '美食': 0.9,
    '音乐': 1.0,
    // 小众领域（降低阈值）
    'B2B营销': 0.3,
    '工业设计': 0.2,
    '专业编程': 0.3,
    '学术研究': 0.15,
    'AI工具': 0.4,
    '产品设计': 0.5,
  };
  
  return adjustments[niche] || 0.7; // 默认中等调整
}
