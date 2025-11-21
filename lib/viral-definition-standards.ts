/**
 * 专业的YouTube Shorts和TikTok爆款定义标准
 * 
 * 基于行业最佳实践和数据分析
 */

// ============================================
// 1. 量化指标（硬性标准）
// ============================================

/**
 * 播放量标准
 */
export const VIEW_THRESHOLDS = {
  tiktok: {
    viral: 1000000,      // 100万+ 确定爆款
    hot: 500000,         // 50万+ 热门
    potential: 100000,   // 10万+ 潜力
    normal: 10000,       // 1万+ 正常
  },
  youtube_shorts: {
    viral: 500000,       // 50万+ 确定爆款
    hot: 200000,         // 20万+ 热门
    potential: 50000,    // 5万+ 潜力
    normal: 5000,        // 5千+ 正常
  },
};

/**
 * 互动率标准（相对播放量的百分比）
 */
export const ENGAGEMENT_RATES = {
  // 点赞率标准
  likeRate: {
    excellent: 0.10,     // 10%+ 极优
    good: 0.05,          // 5%+ 优秀
    normal: 0.02,        // 2%+ 正常
    poor: 0.01,          // 1%+ 较差
  },
  
  // 评论率标准
  commentRate: {
    excellent: 0.02,     // 2%+ 极优
    good: 0.01,          // 1%+ 优秀
    normal: 0.005,       // 0.5%+ 正常
    poor: 0.002,         // 0.2%+ 较差
  },
  
  // 分享率标准（关键传播指标）
  shareRate: {
    excellent: 0.03,     // 3%+ 极优
    good: 0.015,         // 1.5%+ 优秀
    normal: 0.01,        // 1%+ 正常
    poor: 0.005,         // 0.5%+ 较差
  },
  
  // 综合互动率（点赞+评论+分享）
  totalEngagement: {
    excellent: 0.15,     // 15%+ 极优
    good: 0.08,          // 8%+ 优秀
    normal: 0.04,        // 4%+ 正常
    poor: 0.02,          // 2%+ 较差
  },
};

/**
 * 完播率标准（如果API能获取）
 */
export const COMPLETION_RATES = {
  excellent: 0.70,       // 70%+ 极优
  good: 0.60,            // 60%+ 优秀
  normal: 0.50,          // 50%+ 正常
  poor: 0.40,            // 40%+ 较差
};

/**
 * 时间窗口标准
 */
export const TIME_WINDOWS = {
  // 爆发期（小时）
  burst: {
    fast: 6,             // 6小时内快速增长
    normal: 24,          // 24小时内持续增长
    slow: 72,            // 72小时持续获得推荐
  },
  
  // 二次爆发（天）
  secondWave: {
    min: 7,              // 7天后
    max: 14,             // 14天内
  },
  
  // 新鲜度（天）
  freshness: {
    hot: 1,              // 1天内 最新
    warm: 3,             // 3天内 新鲜
    normal: 7,           // 7天内 正常
    old: 14,             // 14天内 较旧
  },
};

// ============================================
// 2. 平台差异标准
// ============================================

/**
 * TikTok特性
 */
export const TIKTOK_CHARACTERISTICS = {
  // 内容偏好
  contentPreference: {
    entertainment: 1.3,   // 娱乐性加权
    music: 1.2,          // 音乐匹配加权
    challenge: 1.25,     // 挑战类加权
    young: 1.15,         // 年轻化内容加权
  },
  
  // 关键指标
  keyMetrics: {
    musicMatch: 'high',  // 音乐匹配重要性
    trendFollow: 'high', // 趋势跟随重要性
    viralSpeed: 'fast',  // 传播速度快
  },
  
  // 爆款特征关键词
  viralKeywords: [
    '挑战', 'challenge', '模仿', 'dance', 'trend',
    '搞笑', 'funny', '剧情', 'story', '反转',
    '颜值', 'beauty', '才艺', 'talent', '神曲',
  ],
};

/**
 * YouTube Shorts特性
 */
export const YOUTUBE_SHORTS_CHARACTERISTICS = {
  // 内容偏好
  contentPreference: {
    educational: 1.4,    // 教育类加权
    valuable: 1.3,       // 价值型加权
    knowledge: 1.25,     // 知识型加权
    howto: 1.35,         // 教程类加权
  },
  
  // 关键指标
  keyMetrics: {
    subscriberConversion: 'high', // 订阅转化重要
    searchTraffic: 'high',        // 搜索流量重要
    contentLinking: 'high',       // 内容联动重要
  },
  
  // 爆款特征关键词
  viralKeywords: [
    'how to', 'tutorial', 'guide', 'tips', 'tricks',
    'learn', 'explain', 'fact', 'science', 'hack',
    '教程', '技巧', '干货', '知识', '科普',
  ],
};

// ============================================
// 3. 相对定义标准
// ============================================

/**
 * 账号基础分层
 */
export const ACCOUNT_TIERS = {
  mega: {
    minFollowers: 1000000,       // 100万+
    viewMultiplier: 0.5,         // 相对要求：50%播放/粉丝比
  },
  macro: {
    minFollowers: 100000,        // 10万+
    viewMultiplier: 1.0,         // 相对要求：100%播放/粉丝比
  },
  mid: {
    minFollowers: 10000,         // 1万+
    viewMultiplier: 3.0,         // 相对要求：300%播放/粉丝比
  },
  micro: {
    minFollowers: 1000,          // 1千+
    viewMultiplier: 10.0,        // 相对要求：1000%播放/粉丝比
  },
  nano: {
    minFollowers: 0,             // 小于1千
    viewMultiplier: 50.0,        // 相对要求：5000%播放/粉丝比
  },
};

/**
 * 垂直领域调整
 */
export const VERTICAL_ADJUSTMENTS = {
  // 大众领域（竞争激烈）
  mainstream: {
    categories: ['娱乐', 'entertainment', '搞笑', 'funny', '音乐', 'music'],
    threshold: 1.0,              // 标准门槛
    competitionLevel: 'high',
  },
  
  // 中等领域
  mid: {
    categories: ['生活', 'lifestyle', '美食', 'food', '旅行', 'travel'],
    threshold: 0.7,              // 降低30%
    competitionLevel: 'medium',
  },
  
  // 小众领域（竞争较小）
  niche: {
    categories: ['科技', 'tech', '教育', 'education', '商业', 'business'],
    threshold: 0.5,              // 降低50%
    competitionLevel: 'low',
  },
  
  // 超小众领域
  ultraNiche: {
    categories: ['专业', 'professional', '学术', 'academic', 'B2B'],
    threshold: 0.3,              // 降低70%
    competitionLevel: 'very_low',
  },
};

// ============================================
// 4. 内容特征评分标准
// ============================================

/**
 * 开头设计评分
 */
export const HOOK_SCORE_FACTORS = {
  // 前3秒关键元素
  first3Seconds: {
    visualImpact: 15,    // 视觉冲击
    suspense: 20,        // 悬念设置
    conflict: 18,        // 冲突引入
    curiosity: 17,       // 好奇心激发
  },
  
  // 钩子文案特征
  hookPhrases: [
    { pattern: /你知道吗|did you know/i, score: 15 },
    { pattern: /居然|竟然|amazing|shocking/i, score: 18 },
    { pattern: /千万别|不要|never|don't/i, score: 16 },
    { pattern: /如何|怎么|how to/i, score: 14 },
    { pattern: /\d+个|top \d+/i, score: 12 },
    { pattern: /秘密|secret|揭秘/i, score: 17 },
  ],
};

/**
 * 情绪共鸣评分
 */
export const EMOTION_SCORE_FACTORS = {
  // 情绪类型及权重
  emotions: {
    funny: { keywords: ['搞笑', '哈哈', 'lol', 'funny', '笑'], weight: 1.2 },
    touching: { keywords: ['感动', '泪目', 'touching', 'emotional'], weight: 1.3 },
    surprising: { keywords: ['惊讶', '震惊', 'amazing', 'wow'], weight: 1.15 },
    angry: { keywords: ['气愤', '愤怒', 'angry', 'mad'], weight: 1.1 },
    inspiring: { keywords: ['励志', '激励', 'inspiring', 'motivational'], weight: 1.25 },
  },
};

/**
 * 趋势把握评分
 */
export const TREND_SCORE_FACTORS = {
  // 热门话题标签
  hotTopics: {
    recentDays: 7,       // 最近7天的热门话题
    weight: 1.3,         // 跟热点加权
  },
  
  // 挑战参与
  challenges: {
    active: 1.25,        // 参与活跃挑战
    archived: 1.05,      // 参与过时挑战
  },
  
  // 音乐使用
  music: {
    trending: 1.2,       // 使用热门音乐
    classic: 1.1,        // 使用经典音乐
    original: 1.15,      // 使用原创音乐
  },
};

// ============================================
// 5. 综合爆款定义函数
// ============================================

export interface ViralDefinition {
  minViews: number;
  minLikeRate: number;
  minCommentRate: number;
  minShareRate: number;
  minTotalEngagement: number;
  maxDaysOld: number;
  accountTier: keyof typeof ACCOUNT_TIERS;
  verticalType: keyof typeof VERTICAL_ADJUSTMENTS;
}

/**
 * 判断是否为爆款
 */
export function isViral(
  video: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    subscriberCount: number;
    publishedAt: string;
    category?: string;
  },
  platform: 'tiktok' | 'youtube_shorts',
  options?: Partial<ViralDefinition>
): {
  isViral: boolean;
  confidence: number; // 0-100 的置信度
  reasons: string[];
  score: number;
} {
  const reasons: string[] = [];
  let score = 0;
  
  // 1. 先检查相对表现（重要！小账号的相对爆款）
  const tier = getAccountTier(video.subscriberCount);
  const requiredViews = video.subscriberCount * ACCOUNT_TIERS[tier].viewMultiplier;
  const relativePerformance = video.views >= requiredViews;
  
  // 2. 基础播放量检查
  const viewThreshold = VIEW_THRESHOLDS[platform];
  let hasMinViews = false;
  
  if (video.views >= viewThreshold.viral) {
    score += 30;
    reasons.push('播放量达到爆款标准');
    hasMinViews = true;
  } else if (video.views >= viewThreshold.hot) {
    score += 20;
    reasons.push('播放量达到热门标准');
    hasMinViews = true;
  } else if (video.views >= viewThreshold.potential) {
    score += 10;
    reasons.push('播放量具有潜力');
    hasMinViews = true;
  } else if (relativePerformance) {
    // 播放量虽低，但相对表现优秀，给予基础分
    score += 15;
    reasons.push('播放量较低但相对表现优秀');
    hasMinViews = true;
  } else {
    // 播放量低且相对表现也差，直接返回
    reasons.push('播放量未达到最低标准且相对表现不佳');
    return { isViral: false, confidence: 0, reasons, score: 0 };
  }
  
  // 3. 互动率检查
  const likeRate = video.likes / video.views;
  const commentRate = video.comments / video.views;
  const shareRate = video.shares / video.views;
  const totalEngagement = (video.likes + video.comments + video.shares) / video.views;
  
  if (likeRate >= ENGAGEMENT_RATES.likeRate.excellent) {
    score += 15;
    reasons.push('点赞率极优');
  } else if (likeRate >= ENGAGEMENT_RATES.likeRate.good) {
    score += 10;
    reasons.push('点赞率优秀');
  }
  
  if (commentRate >= ENGAGEMENT_RATES.commentRate.excellent) {
    score += 12;
    reasons.push('评论率极优');
  } else if (commentRate >= ENGAGEMENT_RATES.commentRate.good) {
    score += 8;
    reasons.push('评论率优秀');
  }
  
  if (shareRate >= ENGAGEMENT_RATES.shareRate.excellent) {
    score += 18; // 分享是传播力的关键
    reasons.push('分享率极优（关键传播指标）');
  } else if (shareRate >= ENGAGEMENT_RATES.shareRate.good) {
    score += 12;
    reasons.push('分享率优秀');
  }
  
  // 4. 相对定义加分（如果已经在步骤1中识别为相对爆款）
  if (relativePerformance) {
    score += 10;
    reasons.push(`相对粉丝数表现优秀（${tier}级账号）`);
  }
  
  // 5. 时间新鲜度
  const daysOld = (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld <= TIME_WINDOWS.freshness.hot) {
    score += 10;
    reasons.push('内容极新鲜（24小时内）');
  } else if (daysOld <= TIME_WINDOWS.freshness.warm) {
    score += 5;
    reasons.push('内容新鲜（3天内）');
  }
  
  // 6. 综合判断
  const confidence = Math.min(score, 100);
  const isViral = score >= 70; // 70分以上认为是爆款
  
  return {
    isViral,
    confidence,
    reasons,
    score,
  };
}

/**
 * 获取账号等级
 */
function getAccountTier(followers: number): keyof typeof ACCOUNT_TIERS {
  if (followers >= ACCOUNT_TIERS.mega.minFollowers) return 'mega';
  if (followers >= ACCOUNT_TIERS.macro.minFollowers) return 'macro';
  if (followers >= ACCOUNT_TIERS.mid.minFollowers) return 'mid';
  if (followers >= ACCOUNT_TIERS.micro.minFollowers) return 'micro';
  return 'nano';
}

/**
 * 获取垂直领域调整系数
 */
export function getVerticalAdjustment(category: string): number {
  for (const [type, config] of Object.entries(VERTICAL_ADJUSTMENTS)) {
    if (config.categories.some(cat => 
      category.toLowerCase().includes(cat.toLowerCase())
    )) {
      return config.threshold;
    }
  }
  return 1.0; // 默认无调整
}

/**
 * 导出便捷使用的预设配置
 */
export const VIRAL_PRESETS = {
  strict: {
    minViews: 1000000,
    minTotalEngagement: 0.10,
    maxDaysOld: 7,
  },
  normal: {
    minViews: 500000,
    minTotalEngagement: 0.05,
    maxDaysOld: 14,
  },
  relaxed: {
    minViews: 100000,
    minTotalEngagement: 0.03,
    maxDaysOld: 30,
  },
};
