import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export interface DetailedAIAnalysis {
  // 基础分析
  summary: string
  content_type: string // 教程、娱乐、评测、开箱、剧情等
  target_audience: string
  
  // 爆款因素深度分析
  viral_factors: {
    hook: string // 开头钩子（前3秒）
    storytelling: string // 叙事结构
    visual_style: string // 视觉风格
    pacing: string // 节奏感
    emotion: string // 情绪调动
    uniqueness: string // 独特卖点
  }
  
  // 内容结构分析
  content_structure: {
    opening: string // 开场方式
    middle: string // 中间展开
    ending: string // 结尾方式
    duration_estimate: string // 预估时长
  }
  
  // 制作技巧
  production_techniques: {
    camera_work: string // 镜头运用
    editing: string // 剪辑手法
    music: string // 音乐选择
    text_overlay: string // 文字使用
    special_effects: string // 特效
  }
  
  // 可复制元素
  replicable_elements: string[]
  
  // 创作建议（分步骤）
  creation_guide: {
    concept: string // 概念/创意点
    script_outline: string // 脚本大纲
    shooting_tips: string[] // 拍摄要点
    editing_tips: string[] // 剪辑要点
    key_moments: string[] // 关键时刻
  }
  
  // 视频生成提示词（优化版）
  ai_video_prompt: {
    main_prompt: string // 主提示词（英文）
    style_prompt: string // 风格提示词
    scene_breakdown: string[] // 场景分解
    duration: string // 建议时长
  }
  
  // 话题标签分析
  hashtag_analysis: {
    primary_tags: string[] // 主要标签
    trending_tags: string[] // 相关热门标签
    niche_tags: string[] // 细分标签
  }
  
  // 竞争分析
  competitive_insights: {
    differentiation: string // 如何差异化
    improvement_opportunities: string[] // 改进机会
    market_gap: string // 市场空白
  }
  
  // 风险评估
  risk_assessment: {
    copyright_risk: string // 版权风险
    content_safety: string // 内容安全
    platform_compliance: string // 平台合规
  }
}

/**
 * 深度分析视频内容
 */
export async function deepAnalyzeVideo(data: {
  title: string
  description?: string
  views: number
  likes: number
  comments: number
  shares: number
  author_name?: string
  hashtags?: string[]
}): Promise<DetailedAIAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `
作为一个专业的短视频内容分析师，请深度分析以下爆款视频，提供详细的创作指导：

【视频信息】
标题: ${data.title}
描述: ${data.description || '无'}
作者: ${data.author_name || '未知'}
标签: ${data.hashtags?.join(', ') || '无'}

【数据表现】
播放量: ${data.views.toLocaleString()}
点赞数: ${data.likes.toLocaleString()}
评论数: ${data.comments.toLocaleString()}
分享数: ${data.shares.toLocaleString()}
互动率: ${(((data.likes + data.comments + data.shares) / data.views) * 100).toFixed(2)}%

请提供以下JSON格式的详细分析：

{
  "summary": "视频核心内容总结（80字以内）",
  "content_type": "内容类型（教程/娱乐/评测/开箱/剧情/知识科普/生活记录等）",
  "target_audience": "目标受众详细描述",
  
  "viral_factors": {
    "hook": "开头前3秒如何吸引观众的",
    "storytelling": "叙事结构和逻辑",
    "visual_style": "视觉呈现风格特点",
    "pacing": "节奏和剪辑速度",
    "emotion": "调动了什么情绪（好奇/惊喜/共鸣/焦虑等）",
    "uniqueness": "独特卖点是什么"
  },
  
  "content_structure": {
    "opening": "开场方式（问题式/悬念式/冲突式/展示式等）",
    "middle": "中间如何展开内容",
    "ending": "结尾如何收束（行动号召/悬念/总结等）",
    "duration_estimate": "预估时长（15秒/30秒/60秒/3分钟等）"
  },
  
  "production_techniques": {
    "camera_work": "镜头运用（固定/手持/运动镜头/第一视角等）",
    "editing": "剪辑手法（快切/转场/特效/慢动作等）",
    "music": "音乐使用（BGM风格/音效/静音等）",
    "text_overlay": "文字使用（字幕/标题/强调/对话等）",
    "special_effects": "特效使用（滤镜/动画/特殊效果等）"
  },
  
  "replicable_elements": [
    "可以直接复制的元素1",
    "可以直接复制的元素2",
    "可以直接复制的元素3"
  ],
  
  "creation_guide": {
    "concept": "核心创意概念",
    "script_outline": "脚本大纲（开头-发展-高潮-结尾）",
    "shooting_tips": ["拍摄要点1", "拍摄要点2", "拍摄要点3"],
    "editing_tips": ["剪辑要点1", "剪辑要点2", "剪辑要点3"],
    "key_moments": ["关键时刻1（X秒处）", "关键时刻2（Y秒处）"]
  },
  
  "ai_video_prompt": {
    "main_prompt": "主要视频生成提示词（英文，100词左右，描述视觉、动作、场景）",
    "style_prompt": "风格提示词（cinematographic, realistic, animated等）",
    "scene_breakdown": [
      "Scene 1: 第一个场景描述（英文）",
      "Scene 2: 第二个场景描述（英文）",
      "Scene 3: 第三个场景描述（英文）"
    ],
    "duration": "建议总时长"
  },
  
  "hashtag_analysis": {
    "primary_tags": ["核心标签1", "核心标签2", "核心标签3"],
    "trending_tags": ["相关热门标签1", "相关热门标签2"],
    "niche_tags": ["细分标签1", "细分标签2"]
  },
  
  "competitive_insights": {
    "differentiation": "如何在同类内容中脱颖而出",
    "improvement_opportunities": ["改进机会1", "改进机会2"],
    "market_gap": "发现的市场空白或未满足需求"
  },
  
  "risk_assessment": {
    "copyright_risk": "版权风险评估（低/中/高及原因）",
    "content_safety": "内容安全评估",
    "platform_compliance": "平台合规性评估"
  }
}

重要：
1. 分析要具体、可执行，不要泛泛而谈
2. 提示词要详细描述视觉元素
3. 创作指导要像教程一样详细
4. 只返回JSON，不要其他文字
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // 提取JSON
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const analysis = JSON.parse(jsonText) as DetailedAIAnalysis

    return analysis
  } catch (error) {
    console.error('深度分析错误:', error)

    // 返回基础分析
    return {
      summary: data.title.substring(0, 80),
      content_type: '待分析',
      target_audience: '大众用户',
      viral_factors: {
        hook: '待分析',
        storytelling: '待分析',
        visual_style: '待分析',
        pacing: '待分析',
        emotion: '待分析',
        uniqueness: '待分析',
      },
      content_structure: {
        opening: '待分析',
        middle: '待分析',
        ending: '待分析',
        duration_estimate: '未知',
      },
      production_techniques: {
        camera_work: '待分析',
        editing: '待分析',
        music: '待分析',
        text_overlay: '待分析',
        special_effects: '待分析',
      },
      replicable_elements: ['待分析'],
      creation_guide: {
        concept: '待分析',
        script_outline: '待分析',
        shooting_tips: ['待分析'],
        editing_tips: ['待分析'],
        key_moments: ['待分析'],
      },
      ai_video_prompt: {
        main_prompt: `Create a video about: ${data.title}`,
        style_prompt: 'realistic, engaging',
        scene_breakdown: ['Scene 1: Introduction', 'Scene 2: Main content', 'Scene 3: Conclusion'],
        duration: '30-60 seconds',
      },
      hashtag_analysis: {
        primary_tags: data.hashtags?.slice(0, 3) || [],
        trending_tags: [],
        niche_tags: [],
      },
      competitive_insights: {
        differentiation: '待分析',
        improvement_opportunities: [],
        market_gap: '待分析',
      },
      risk_assessment: {
        copyright_risk: '待评估',
        content_safety: '待评估',
        platform_compliance: '待评估',
      },
    }
  }
}

/**
 * 批量深度分析（带进度）
 */
export async function batchDeepAnalyze(
  videos: Array<{
    title: string
    description?: string
    views: number
    likes: number
    comments: number
    shares: number
    author_name?: string
    hashtags?: string[]
  }>,
  onProgress?: (current: number, total: number) => void
): Promise<DetailedAIAnalysis[]> {
  const results: DetailedAIAnalysis[] = []

  for (let i = 0; i < videos.length; i++) {
    try {
      const analysis = await deepAnalyzeVideo(videos[i])
      results.push(analysis)

      if (onProgress) {
        onProgress(i + 1, videos.length)
      }

      // 避免API限流，每次间隔2秒
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`批量分析错误 (${i + 1}/${videos.length}):`, error)
    }
  }

  return results
}
