import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { AIAnalysis } from '@/types/database'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

/**
 * 使用AI分析视频内容（自动降级：Gemini 3.0 → 2.5 → 2.0 → 1.5 → OpenAI）
 */
export async function analyzeVideoContent(data: {
  title: string
  description?: string
  views: number
  likes: number
  comments: number
}): Promise<AIAnalysis> {
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

  // 尝试顺序：优先使用最新的Gemini模型
  const models = [
    // Gemini 3.0 系列（优先尝试）
    { type: 'gemini', name: 'gemini-3.0-pro', label: 'Gemini 3.0 Pro' },
    { type: 'gemini', name: 'gemini-3.0-pro-preview', label: 'Gemini 3.0 Pro Preview' },
    { type: 'gemini', name: 'gemini-3-pro', label: 'Gemini 3 Pro' },
    
    // Gemini 2.5 系列
    { type: 'gemini', name: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { type: 'gemini', name: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { type: 'gemini', name: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
    
    // Gemini 2.0 系列
    { type: 'gemini', name: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Exp)' },
    { type: 'gemini', name: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { type: 'gemini', name: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
    
    // Gemini 1.5 系列（稳定版本）
    { type: 'gemini', name: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { type: 'gemini', name: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    
    // OpenAI 备用
    { type: 'openai', name: 'gpt-4o-mini', label: 'GPT-4o-mini' },
  ]

  for (const modelConfig of models) {
    try {
      if (modelConfig.type === 'gemini') {
        console.log(`🤖 尝试使用: ${modelConfig.label}`)
        const model = genAI.getGenerativeModel({ model: modelConfig.name })
        
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // 提取JSON（移除可能的markdown代码块标记）
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const analysis = JSON.parse(jsonText) as AIAnalysis

        console.log(`✅ ${modelConfig.label} 分析成功`)
        return analysis
      } else {
        // OpenAI
        console.log(`🤖 尝试使用: ${modelConfig.label}`)
        const completion = await openai.chat.completions.create({
          model: modelConfig.name,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的短视频内容分析师，擅长分析爆款视频的成功因素。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        })

        const text = completion.choices[0].message.content || '{}'
        const analysis = JSON.parse(text) as AIAnalysis

        console.log(`✅ ${modelConfig.label} 分析成功`)
        return analysis
      }
    } catch (error: any) {
      console.error(`❌ ${modelConfig.label} 失败:`, error.message)
      // 继续尝试下一个模型
      continue
    }
  }

  // 所有模型都失败，返回默认分析
  console.error('⚠️ 所有AI模型均失败，使用默认分析')
  return {
    summary: data.title.substring(0, 50),
    key_points: ['高播放量', '用户喜爱', '值得参考'],
    content_type: '未知',
    target_audience: '大众用户',
    viral_factors: ['内容质量好', '话题热度高', '传播性强'],
    recommended_prompt: `Create a video about: ${data.title}`,
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
