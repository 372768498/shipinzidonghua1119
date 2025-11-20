/**
 * 分平台AI内容分析提示词
 * 根据TikTok和YouTube Shorts的不同特性提供差异化的分析
 */

import { Platform } from './viral-scoring';

export interface AnalysisPrompt {
  system: string;
  user: string;
}

// ============================================
// TikTok 分析提示词
// ============================================

export function getTikTokAnalysisPrompt(videoData: {
  title: string;
  description: string;
  hashtags: string[];
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}): AnalysisPrompt {
  return {
    system: `你是TikTok爆款内容分析专家。你的任务是分析短视频内容，识别使其成为爆款的关键因素。

**分析维度和权重：**

1. 开头3秒钩子（30%权重）
   - 视觉冲击力如何？
   - 是否有悬念或反转设置？
   - 音乐节拍是否匹配内容？
   - 前3秒是否能抓住注意力？

2. 娱乐性（25%权重）
   - 内容是否轻松、好玩、有趣？
   - 是否容易引发模仿欲望？
   - 社交传播性如何（朋友会分享吗）？
   - 情绪调动强度（搞笑/惊喜/共鸣）

3. 音乐选择（20%权重）
   - 是否使用热门BGM？
   - 音乐与内容契合度
   - 节奏卡点是否精准？
   - 音效运用是否有创意？

4. 情绪调动（15%权重）
   - 是否引发强烈情绪反应？
   - 年轻化表达方式
   - 是否有网络流行梗？
   - 共鸣点是否强烈？

5. 趋势参与（10%权重）
   - 是否参与热门挑战？
   - 话题标签使用是否合理？
   - 是否跟进当下热点？
   - 是否有创新性玩法？

**输出格式：**
返回JSON格式：
{
  "scores": {
    "hook": 0-30,
    "entertainment": 0-25,
    "music": 0-20,
    "emotion": 0-15,
    "trend": 0-10
  },
  "totalScore": 0-100,
  "strengths": ["优势1", "优势2", "优势3"],
  "weaknesses": ["不足1", "不足2"],
  "viralFactors": ["爆款因素1", "爆款因素2", "爆款因素3"],
  "recommendation": "是否推荐复制此内容策略及原因",
  "creativeDirection": "具体的创作方向建议"
}`,

    user: `请分析以下TikTok视频的爆款潜力：

**视频信息：**
标题：${videoData.title}
描述：${videoData.description}
标签：${videoData.hashtags.join(', ')}

**数据表现：**
- 观看量：${videoData.metrics.views.toLocaleString()}
- 点赞数：${videoData.metrics.likes.toLocaleString()}
- 评论数：${videoData.metrics.comments.toLocaleString()}
- 分享数：${videoData.metrics.shares.toLocaleString()}
- 互动率：${((videoData.metrics.likes + videoData.metrics.comments) / videoData.metrics.views * 100).toFixed(2)}%
- 分享率：${(videoData.metrics.shares / videoData.metrics.views * 100).toFixed(2)}%

请基于TikTok平台特性进行深度分析，关注娱乐性、音乐、社交传播力等核心要素。`
  };
}

// ============================================
// YouTube Shorts 分析提示词
// ============================================

export function getYouTubeShortsAnalysisPrompt(videoData: {
  title: string;
  description: string;
  tags: string[];
  metrics: {
    views: number;
    likes: number;
    comments: number;
    subscriberCount?: number;
  };
}): AnalysisPrompt {
  return {
    system: `你是YouTube Shorts爆款内容分析专家。你的任务是分析短视频内容，识别使其获得高搜索流量和订阅转化的关键因素。

**分析维度和权重：**

1. 价值传递（30%权重）
   - 提供了什么实用信息或知识？
   - 能否解决具体问题？
   - 信息的独特性和价值密度
   - 是否有明确的takeaway？

2. 信息密度（25%权重）
   - 表达是否高效简洁？
   - 有无冗余或拖沓内容？
   - 结构是否清晰（问题-方案）？
   - 节奏是否紧凑？

3. SEO优化（20%权重）
   - 标题是否包含搜索关键词？
   - 标题长度是否合适（30-60字符）？
   - 标签使用是否精准？
   - 描述是否详细且关键词丰富？
   - 可搜索性如何？

4. 订阅转化（15%权重）
   - 是否有引导订阅的call-to-action？
   - 是否提到相关系列内容？
   - 是否展示频道专业性？
   - 与长视频的联动潜力

5. 专业度（10%权重）
   - 画面质量和剪辑水平
   - 讲解清晰度和逻辑性
   - 可信度和权威感
   - 内容深度

**输出格式：**
返回JSON格式：
{
  "scores": {
    "value": 0-30,
    "density": 0-25,
    "seo": 0-20,
    "conversion": 0-15,
    "professionalism": 0-10
  },
  "totalScore": 0-100,
  "strengths": ["优势1", "优势2", "优势3"],
  "weaknesses": ["不足1", "不足2"],
  "viralFactors": ["成功因素1", "成功因素2", "成功因素3"],
  "seoKeywords": ["关键词1", "关键词2", "关键词3"],
  "recommendation": "是否推荐复制此内容策略及原因",
  "creativeDirection": "具体的创作方向建议，包括SEO优化建议"
}`,

    user: `请分析以下YouTube Shorts视频的爆款潜力：

**视频信息：**
标题：${videoData.title}
描述：${videoData.description}
标签：${videoData.tags.join(', ')}

**数据表现：**
- 观看量：${videoData.metrics.views.toLocaleString()}
- 点赞数：${videoData.metrics.likes.toLocaleString()}
- 评论数：${videoData.metrics.comments.toLocaleString()}
${videoData.metrics.subscriberCount ? `- 频道订阅数：${videoData.metrics.subscriberCount.toLocaleString()}` : ''}
- 互动率：${((videoData.metrics.likes + videoData.metrics.comments) / videoData.metrics.views * 100).toFixed(2)}%
${videoData.metrics.subscriberCount ? `- 观看/订阅比：${(videoData.metrics.views / videoData.metrics.subscriberCount).toFixed(2)}x` : ''}

请基于YouTube Shorts平台特性进行深度分析，关注价值传递、SEO优化、订阅转化等核心要素。`
  };
}

// ============================================
// 统一接口
// ============================================

export function getAnalysisPrompt(
  platform: Platform,
  videoData: any
): AnalysisPrompt {
  if (platform === 'tiktok') {
    return getTikTokAnalysisPrompt(videoData);
  } else {
    return getYouTubeShortsAnalysisPrompt(videoData);
  }
}

// ============================================
// 创作建议生成器
// ============================================

export function getCreationGuidancePrompt(
  platform: Platform,
  analysisResult: any
): string {
  if (platform === 'tiktok') {
    return `基于这个TikTok爆款视频的分析结果，生成一个详细的创作指导：

**分析结果：**
${JSON.stringify(analysisResult, null, 2)}

**请提供：**
1. 前3秒钩子设计（3个具体方案）
2. 推荐使用的热门音乐类型
3. 适合的话题标签组合（5-10个）
4. 最佳发布时间建议
5. 内容结构模板（开头-中间-结尾）
6. 差异化建议（如何避免纯复制）

格式要求：简洁、可执行、有具体示例`;
  } else {
    return `基于这个YouTube Shorts爆款视频的分析结果，生成一个详细的创作指导：

**分析结果：**
${JSON.stringify(analysisResult, null, 2)}

**请提供：**
1. 优化后的标题建议（包含SEO关键词）
2. 推荐的标签列表（8-10个）
3. 详细描述模板（包含关键词和CTA）
4. 系列内容规划建议
5. 长视频联动策略
6. 最佳发布时间和优化建议
7. 差异化建议（如何提供独特价值）

格式要求：简洁、可执行、有具体示例`;
  }
}

// ============================================
// 批量内容趋势分析
// ============================================

export function getBatchTrendAnalysisPrompt(
  platform: Platform,
  videos: any[]
): string {
  const platformName = platform === 'tiktok' ? 'TikTok' : 'YouTube Shorts';
  
  return `你是${platformName}内容趋势分析专家。请分析以下${videos.length}个爆款视频，识别共同的成功模式。

**视频列表：**
${videos.map((v, i) => `
${i + 1}. 标题：${v.title}
   观看：${v.views.toLocaleString()} | 点赞：${v.likes.toLocaleString()}
   标签：${v.tags?.join(', ') || v.hashtags?.join(', ') || 'N/A'}
`).join('\n')}

**请识别：**
1. 共同的内容主题和方向（top 5）
2. 高频关键词和标签（top 10）
3. 成功的内容结构模式
4. 数据表现的共同特征
${platform === 'tiktok' ? '5. 热门音乐和音效趋势\n6. 流行的视觉风格' : '5. SEO优化的共同策略\n6. 订阅转化的有效方法'}
7. 当前的内容缺口和机会点

**输出JSON格式：**
{
  "topThemes": ["主题1", "主题2", ...],
  "topKeywords": ["关键词1", "关键词2", ...],
  "successPatterns": ["模式1", "模式2", ...],
  "contentGaps": ["机会点1", "机会点2", ...],
  "recommendations": ["建议1", "建议2", ...]
}`;
}
