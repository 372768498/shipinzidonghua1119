import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIAnalysis } from '@/types/database'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

/**
 * 使用Gemini分析视频内容
 */
export async function analyzeVideoContent(data: {
  title: string
  description?: string
  views: number
  likes: number
  comments: number
}): Promise<AIAnalysis> {
  // 使用最新的模型名称
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `
分析以下视频的爆款因素，并提供创作建议：

标题: ${data.title}
描述: ${data.description || '无'}
播放量: ${data.views.toLocaleString()}
点赞数: ${data.likes.toLocaleString()}
评论数: ${data.comments.toLocaleString()}

请以JSON格式返回分析结果，包含以下字段：
{
  "summary": "视频内容的简短总结（50字以内）",
  "key_points": ["关键要点1", "关键要点2", "关键要点3"],
  "content_type": "内容类型（如：教程、娱乐、知识科普等）",
  "target_audience": "目标受众描述",
  "viral_factors": ["爆款因素1", "爆款因素2", "爆款因素3"],
  "recommended_prompt": "基于这个视频，生成类似内容的AI视频提示词（英文，50-100词）"
}

只返回JSON，不要其他文字。
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // 提取JSON（移除可能的markdown代码块标记）
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const analysis = JSON.parse(jsonText) as AIAnalysis

    return analysis
  } catch (error) {
    console.error('Gemini分析错误:', error)

    // 返回默认分析
    return {
      summary: data.title.substring(0, 50),
      key_points: ['高播放量', '用户喜爱', '值得参考'],
      content_type: '未知',
      target_audience: '大众用户',
      viral_factors: ['内容质量好', '话题热度高', '传播性强'],
      recommended_prompt: `Create a video about: ${data.title}`,
    }
  }
}

/**
 * 批量分析视频
 */
export async function batchAnalyzeVideos(
  videos: Array<{
    title: string
    description?: string
    views: number
    likes: number
    comments: number
  }>
): Promise<AIAnalysis[]> {
  const results: AIAnalysis[] = []

  for (const video of videos) {
    try {
      const analysis = await analyzeVideoContent(video)
      results.push(analysis)

      // 避免触发API限流，每次请求间隔1秒
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('批量分析错误:', error)
      results.push({
        summary: video.title.substring(0, 50),
        key_points: ['待分析'],
        content_type: '未知',
        target_audience: '未知',
        viral_factors: ['待分析'],
        recommended_prompt: `Create a video about: ${video.title}`,
      })
    }
  }

  return results
}
