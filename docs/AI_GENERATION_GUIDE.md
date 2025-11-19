# 🎬 AI视频生成完全指南

> **文档版本**: V1.0  
> **创建日期**: 2024-11-19  
> **最后更新**: 2024-11-19

---

## 📑 目录

1. [生成流程概览](#1-生成流程概览)
2. [AI模型选择](#2-ai模型选择)
3. [Prompt工程](#3-prompt工程)
4. [技术实现](#4-技术实现)
5. [质量优化](#5-质量优化)
6. [故障排查](#6-故障排查)

---

## 1. 生成流程概览

### 1.1 完整生成链路

```
用户输入 → Prompt优化 → 模型选择 → API调用 → 异步生成 → 质量检查 → 存储交付
    ↓          ↓           ↓          ↓          ↓          ↓          ↓
  文字描述   Gemini分析   FAL.AI    Webhook   3-10分钟   AI审查    Supabase
```

### 1.2 时间预估

| 步骤 | 耗时 | 说明 |
|------|------|------|
| **Prompt优化** | 2-5秒 | Gemini分析+增强 |
| **队列排队** | 0-30秒 | 取决于系统负载 |
| **AI生成** | 3-10分钟 | 取决于模型和视频长度 |
| **质量检查** | 5-10秒 | AI内容审查 |
| **存储上传** | 10-20秒 | 上传到Supabase Storage |
| **总计** | ~5-15分钟 | 端到端完整时间 |

---

## 2. AI模型选择

### 2.1 FAL.AI支持的模型

Jilo.ai通过FAL.AI统一API接入多个顶尖视频生成模型:

#### 🎯 Minimax Video-01 (推荐)

**基本信息**:
```
模型ID: fal-ai/minimax-video
价格: $0.05/视频
生成时间: 3-5分钟
输出质量: ⭐⭐⭐⭐
```

**优势**:
- ✅ 性价比最高 ($0.05/视频)
- ✅ 生成速度快 (3-5分钟)
- ✅ 中文理解优秀
- ✅ 适合批量生成

**劣势**:
- ⚠️ 细节不如Runway
- ⚠️ 物理规律偶尔不准确

**适用场景**:
- 营销短视频
- 产品演示
- 教程讲解
- 批量内容生产

**示例Prompt**:
```
一个科技感十足的产品展示视频:
- 白色简约背景
- 产品从左侧缓慢旋转进入
- 金属质感，反光效果
- 30秒，流畅运镜
```

---

#### 🏆 Runway Gen-3 Alpha

**基本信息**:
```
模型ID: fal-ai/runway-gen3/turbo/image-to-video
价格: $0.20/视频
生成时间: 5-10分钟
输出质量: ⭐⭐⭐⭐⭐
```

**优势**:
- ✅ 画面质量顶尖
- ✅ 物理规律准确
- ✅ 创意表现力强
- ✅ 支持图生视频

**劣势**:
- ⚠️ 价格较高 ($0.20/视频)
- ⚠️ 生成时间长 (5-10分钟)

**适用场景**:
- 品牌宣传片
- 高端广告
- 艺术作品
- 需要极致质量的场景

**示例Prompt**:
```
电影级别的城市夜景:
- 霓虹灯闪烁的街道
- 镜头从高楼俯冲而下
- 雨后湿润的地面反光
- 赛博朋克风格
- 60秒，电影运镜
```

---

#### 🇨🇳 Kling AI 1.0

**基本信息**:
```
模型ID: fal-ai/kling-video/v1/standard/text-to-video
价格: $0.08/视频
生成时间: 4-7分钟
输出质量: ⭐⭐⭐⭐
```

**优势**:
- ✅ 中文理解最强
- ✅ 适合中国文化元素
- ✅ 价格适中
- ✅ 生成稳定

**劣势**:
- ⚠️ 国际化内容稍弱
- ⚠️ 创意表现不如Runway

**适用场景**:
- 中文内容
- 传统文化主题
- 国内市场营销
- 电商产品视频

**示例Prompt**:
```
中国风水墨画风格:
- 山水画逐渐展开
- 墨色晕染效果
- 飞鸟从画中飞出
- 传统古琴配乐
- 45秒，诗意镜头
```

---

### 2.2 模型选择决策树

```javascript
function selectModel(requirements) {
  // 预算优先
  if (requirements.budget === "low" && requirements.quantity > 10) {
    return "minimax-video"; // 批量生产
  }
  
  // 质量优先
  if (requirements.quality === "premium") {
    return "runway-gen3"; // 高端作品
  }
  
  // 中文内容
  if (requirements.language === "chinese" || requirements.culture === "chinese") {
    return "kling-video"; // 中文优化
  }
  
  // 默认: 性价比
  return "minimax-video";
}
```

**使用建议**:

| 场景 | 推荐模型 | 原因 |
|------|----------|------|
| **日常营销** | Minimax | 性价比高，速度快 |
| **品牌大片** | Runway | 质量顶尖，值得投入 |
| **中文内容** | Kling | 理解更准确 |
| **批量生产** | Minimax | 成本可控 |
| **实验创意** | Minimax | 试错成本低 |

---

## 3. Prompt工程

### 3.1 Prompt结构

**最佳实践格式**:

```
[主题描述] + [视觉风格] + [运镜方式] + [情绪基调] + [技术参数]
```

**示例**:
```
创建一个未来科技产品发布会的视频:

主题: 全息投影展示新款AI芯片
风格: 赛博朋克，霓虹蓝紫色调
运镜: 缓慢推进，从全景到特写
情绪: 震撼、科技感、未来感
参数: 30秒，1080x1920，30fps

具体场景:
- 0-10秒: 暗场，突然亮起全息投影
- 10-20秒: 芯片360度旋转展示
- 20-30秒: 数据流光效果环绕
```

### 3.2 Prompt优化流程

**使用Gemini自动优化Prompt**:

```javascript
const optimizationPrompt = `
你是一个AI视频生成专家。用户提供了一个简单的视频创意:
"${userInput}"

请将它优化成一个详细的、结构化的视频生成Prompt，包含:

1. **主题描述** (1-2句话，清晰具体)
2. **视觉风格** (色调、光影、画面质感)
3. **运镜设计** (镜头运动、切换节奏)
4. **情绪基调** (想要触发的观众情感)
5. **时间结构** (分段描述每个时间段的内容)
6. **技术参数** (分辨率、帧率等)

要求:
- 具体且可视化，避免抽象描述
- 考虑AI模型的能力边界
- 确保叙事连贯性
- 适合${selectedModel}模型

输出JSON格式:
{
  "optimizedPrompt": "优化后的完整Prompt",
  "expectedQuality": 1-10分,
  "estimatedDuration": "生成时间估计",
  "suggestions": ["优化建议1", "优化建议2"]
}
`;

const result = await gemini.generateContent(optimizationPrompt);
```

### 3.3 Prompt最佳实践

#### ✅ 好的Prompt示例

```
创建一个产品演示视频:

产品: 智能咖啡机
场景: 现代简约厨房，清晨阳光透过窗户

时间线:
0-5秒: 
  - 镜头: 从侧面推进特写
  - 内容: 咖啡机在大理石台面上，不锈钢外壳反射柔和光线
  
5-15秒:
  - 镜头: 顶视角俯拍
  - 内容: 手按下按钮，蒸汽缓缓升起
  
15-25秒:
  - 镜头: 特写咖啡流入杯中
  - 内容: 深棕色液体，奶油色泡沫
  
25-30秒:
  - 镜头: 拉远到全景
  - 内容: 一杯完美的咖啡，旁边放着牛角包

风格: 温暖、高端、生活化
色调: 暖色调，金色阳光
配乐: 轻松的爵士乐
```

#### ❌ 不好的Prompt示例

```
做一个咖啡机的视频，要好看一点
```

**问题**:
- ❌ 过于简单和模糊
- ❌ 缺少具体的视觉描述
- ❌ 没有时间结构
- ❌ 没有风格指导

---

### 3.4 常见Prompt模板

#### 模板1: 产品展示

```
产品: [产品名称]
场景: [背景环境]

镜头语言:
- 开场: [全景/特写]
- 中段: [产品展示角度]
- 结尾: [行动号召画面]

视觉风格:
- 色调: [暖色/冷色/黑白]
- 光线: [自然光/戏剧光/霓虹光]
- 质感: [简约/奢华/科技]

技术参数:
- 时长: 15-60秒
- 分辨率: 1080x1920
- 节奏: [快速/中等/缓慢]
```

#### 模板2: 教程讲解

```
主题: [教程主题]
目标: [学习目标]

叙事结构:
1. 问题引入 (0-5秒)
   - 提出一个痛点
   - 视觉: [相关场景]
   
2. 解决方案 (5-40秒)
   - 步骤1: [具体操作]
   - 步骤2: [具体操作]
   - 视觉: [操作演示]
   
3. 结果展示 (40-60秒)
   - 展示最终效果
   - 视觉: [before/after对比]

风格: 清晰、专业、易懂
```

#### 模板3: 情感故事

```
故事: [故事梗概]
情感: [想要传达的情感]

剧情:
- 起: [建立场景]
- 承: [冲突出现]
- 转: [转折点]
- 合: [解决和升华]

视觉:
- 色调随情绪变化
- 镜头语言表达情感
- 音乐强化氛围

技术:
- 慢镜头在关键时刻
- 特写捕捉表情
- 蒙太奇手法
```

---

## 4. 技术实现

### 4.1 API调用流程

#### 步骤1: 初始化请求

```typescript
// app/api/generate/route.ts

import * as fal from "@fal-ai/serverless-client";

fal.config({
  credentials: process.env.FAL_KEY
});

export async function POST(req: Request) {
  const { prompt, model, duration } = await req.json();
  
  // 1. 验证用户配额
  const hasQuota = await checkUserQuota(userId);
  if (!hasQuota) {
    return Response.json(
      { error: "配额不足" },
      { status: 403 }
    );
  }
  
  // 2. 创建数据库记录
  const { data: task } = await supabase
    .from("video_tasks")
    .insert({
      user_id: userId,
      prompt: prompt,
      model: model,
      status: "pending"
    })
    .select()
    .single();
  
  // 3. 触发异步生成 (Fire & Forget)
  await fal.queue.submit(model, {
    input: {
      prompt: prompt,
      video_size: "portrait_16_9",
      duration: duration
    },
    webhookUrl: `${process.env.BASE_URL}/api/webhooks/fal?taskId=${task.id}`
  });
  
  // 4. 立即返回任务ID
  return Response.json({
    taskId: task.id,
    status: "processing",
    estimatedTime: "3-10 minutes"
  });
}
```

#### 步骤2: Webhook接收

```typescript
// app/api/webhooks/fal/route.ts

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  
  // 1. 验证Webhook签名
  const signature = req.headers.get("x-fal-signature");
  const isValid = await verifyWebhookSignature(signature, await req.text());
  
  if (!isValid) {
    return Response.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }
  
  const payload = await req.json();
  
  // 2. 检查幂等性（防止重复处理）
  const requestId = req.headers.get("x-fal-request-id");
  const processed = await checkProcessed(requestId);
  if (processed) {
    return Response.json({ status: "already_processed" });
  }
  
  // 3. 处理生成结果
  if (payload.status === "completed") {
    const videoUrl = payload.data.video.url;
    
    // 下载并上传到Supabase Storage
    const permanentUrl = await downloadAndStore(videoUrl, taskId);
    
    // 更新数据库
    await supabase
      .from("video_tasks")
      .update({
        status: "completed",
        video_url: permanentUrl,
        completed_at: new Date().toISOString()
      })
      .eq("id", taskId);
    
    // 通知前端 (Supabase Realtime)
    await supabase
      .from("video_tasks")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", taskId);
  }
  
  // 4. 处理失败
  if (payload.status === "failed") {
    await supabase
      .from("video_tasks")
      .update({
        status: "failed",
        error: payload.error
      })
      .eq("id", taskId);
  }
  
  // 5. 标记已处理
  await markProcessed(requestId);
  
  return Response.json({ status: "ok" });
}
```

#### 步骤3: 前端实时监听

```typescript
// app/dashboard/generate/page.tsx

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GeneratePage() {
  const [task, setTask] = useState(null);
  const supabase = createClient();
  
  useEffect(() => {
    if (!task) return;
    
    // 订阅Supabase Realtime
    const channel = supabase
      .channel(`task-${task.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "video_tasks",
          filter: `id=eq.${task.id}`
        },
        (payload) => {
          console.log("任务更新:", payload.new);
          setTask(payload.new);
          
          // 播放成功音效
          if (payload.new.status === "completed") {
            new Audio("/sounds/success.mp3").play();
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [task]);
  
  return (
    <div>
      {task.status === "processing" && (
        <div>
          <Spinner />
          <p>AI正在生成视频... (预计3-10分钟)</p>
          <ProgressBar value={task.progress} />
        </div>
      )}
      
      {task.status === "completed" && (
        <div>
          <VideoPlayer src={task.video_url} />
          <Button>发布到YouTube</Button>
        </div>
      )}
    </div>
  );
}
```

---

## 5. 质量优化

### 5.1 生成前优化

#### 优化1: Prompt增强

```javascript
// 使用Gemini分析并增强用户Prompt
async function enhancePrompt(userPrompt) {
  const analysis = await gemini.generateContent(`
    分析这个视频创意并增强:
    "${userPrompt}"
    
    请添加:
    1. 更具体的视觉描述
    2. 镜头运动建议
    3. 色彩和光影
    4. 情绪基调
    
    返回增强后的Prompt
  `);
  
  return analysis.text;
}
```

#### 优化2: 负面Prompt

```javascript
const negativePrompts = [
  "low quality",
  "blurry",
  "distorted",
  "pixelated",
  "watermark",
  "text overlay",
  "ugly",
  "deformed"
].join(", ");

await fal.queue.submit(model, {
  input: {
    prompt: enhancedPrompt,
    negative_prompt: negativePrompts // 避免这些特征
  }
});
```

### 5.2 生成后优化

#### 优化1: 质量评分

```javascript
async function evaluateVideoQuality(videoUrl) {
  const analysis = await gemini.generateContent([
    {
      inlineData: {
        mimeType: "video/mp4",
        data: await fetchVideoBase64(videoUrl)
      }
    },
    {
      text: `
        评估这个AI生成视频的质量 (0-10分):
        
        维度:
        1. 画面清晰度
        2. 运动流畅度
        3. 色彩和谐度
        4. 创意表现力
        5. 整体完成度
        
        返回JSON:
        {
          "score": 0-10,
          "clarity": 0-10,
          "motion": 0-10,
          "color": 0-10,
          "creativity": 0-10,
          "overall": 0-10,
          "issues": ["问题1", "问题2"],
          "suggestions": ["改进建议1"]
        }
      `
    }
  ]);
  
  return JSON.parse(analysis.text);
}
```

#### 优化2: 自动重试机制

```javascript
async function generateWithRetry(prompt, model, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fal.queue.submit(model, {
        input: { prompt }
      });
      
      // 评估质量
      const quality = await evaluateVideoQuality(result.video.url);
      
      // 质量达标，返回
      if (quality.score >= 7) {
        return {
          success: true,
          video: result.video.url,
          quality: quality
        };
      }
      
      // 质量不达标，优化Prompt重试
      if (attempt < maxRetries) {
        prompt = await optimizePromptBasedOnIssues(
          prompt,
          quality.issues
        );
        console.log(`第${attempt}次生成质量不达标，优化后重试...`);
      }
      
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`第${attempt}次生成失败，重试...`);
    }
  }
  
  throw new Error("多次重试后仍未达到质量标准");
}
```

---

## 6. 故障排查

### 6.1 常见问题

#### 问题1: 生成卡住超时

**症状**:
```
任务状态一直是 "processing"，超过15分钟未完成
```

**排查步骤**:

1. **检查FAL.AI状态**
```bash
# 查看FAL系统状态
curl https://status.fal.ai
```

2. **检查Webhook是否触发**
```sql
-- 查看Webhook日志
SELECT * FROM webhook_logs 
WHERE task_id = 'xxx' 
ORDER BY created_at DESC;
```

3. **手动查询任务状态**
```javascript
const status = await fal.queue.status(model, {
  requestId: task.fal_request_id
});
console.log(status);
```

**解决方案**:
```javascript
// 实现超时自动检测和清理
const TIMEOUT = 15 * 60 * 1000; // 15分钟

setInterval(async () => {
  const staleTasks = await supabase
    .from("video_tasks")
    .select("*")
    .eq("status", "processing")
    .lt("created_at", new Date(Date.now() - TIMEOUT).toISOString());
  
  for (const task of staleTasks.data) {
    // 标记为超时
    await supabase
      .from("video_tasks")
      .update({
        status: "failed",
        error: "Generation timeout after 15 minutes"
      })
      .eq("id", task.id);
    
    // 退还配额
    await refundQuota(task.user_id, 1);
  }
}, 5 * 60 * 1000); // 每5分钟检查一次
```

#### 问题2: 视频质量差

**症状**:
```
生成的视频模糊、运动不自然、或与Prompt不符
```

**排查步骤**:

1. **检查Prompt质量**
```javascript
// 评估Prompt的详细程度
function evaluatePrompt(prompt) {
  const hasVisual = /色调|颜色|光线|风格/.test(prompt);
  const hasMotion = /镜头|运动|推进|旋转/.test(prompt);
  const hasStructure = /秒|时间|开头|结尾/.test(prompt);
  
  return {
    visual: hasVisual,
    motion: hasMotion,
    structure: hasStructure,
    score: (hasVisual + hasMotion + hasStructure) / 3
  };
}
```

2. **尝试不同模型**
```javascript
// 如果Minimax质量不足，升级到Runway
if (quality.score < 7) {
  console.log("切换到Runway Gen-3提升质量");
  model = "fal-ai/runway-gen3/turbo/image-to-video";
}
```

#### 问题3: Webhook未触发

**症状**:
```
FAL.AI生成完成，但数据库状态未更新
```

**排查步骤**:

1. **检查Webhook URL是否可访问**
```bash
curl -X POST https://jilo.ai/api/webhooks/fal?taskId=test \
  -H "Content-Type: application/json" \
  -d '{"status": "test"}'
```

2. **检查Webhook签名验证**
```javascript
// 临时禁用签名验证，测试是否是验证问题
if (process.env.NODE_ENV === "development") {
  console.log("开发环境: 跳过签名验证");
  // 继续处理...
}
```

3. **查看Vercel日志**
```bash
vercel logs
# 搜索 "webhook" 关键词
```

**解决方案**:
```javascript
// 添加Webhook失败重试机制
app.post("/api/webhooks/fal", async (req, res) => {
  try {
    // 处理逻辑...
    res.json({ status: "ok" });
  } catch (error) {
    // 记录错误
    await logWebhookError(error, req.body);
    
    // 触发手动重试
    await retryProcessing(req.body);
    
    // 返回200防止FAL重复发送
    res.status(200).json({ error: error.message });
  }
});
```

---

### 6.2 监控和告警

#### 监控指标

```javascript
// 实时监控关键指标
const metrics = {
  // 生成成功率
  successRate: async () => {
    const total = await countTasks({ status: ["completed", "failed"] });
    const success = await countTasks({ status: "completed" });
    return (success / total * 100).toFixed(2);
  },
  
  // 平均生成时间
  avgDuration: async () => {
    const tasks = await getTasks({ 
      status: "completed",
      limit: 100 
    });
    
    const durations = tasks.map(t => 
      new Date(t.completed_at) - new Date(t.created_at)
    );
    
    return (durations.reduce((a, b) => a + b, 0) / durations.length / 1000).toFixed(0);
  },
  
  // 卡住任务数
  stuckTasks: async () => {
    return await countTasks({
      status: "processing",
      olderThan: "15 minutes"
    });
  }
};

// 每5分钟发送监控报告
setInterval(async () => {
  const report = {
    timestamp: new Date(),
    successRate: await metrics.successRate(),
    avgDuration: await metrics.avgDuration(),
    stuckTasks: await metrics.stuckTasks()
  };
  
  console.log("📊 监控报告:", report);
  
  // 如果成功率<80%，发送告警
  if (report.successRate < 80) {
    await sendAlert({
      level: "warning",
      message: `视频生成成功率降至 ${report.successRate}%`
    });
  }
  
  // 如果有超过5个卡住任务，发送告警
  if (report.stuckTasks > 5) {
    await sendAlert({
      level: "error",
      message: `${report.stuckTasks} 个任务卡住超过15分钟`
    });
  }
}, 5 * 60 * 1000);
```

---

## 📎 附录

### A. FAL.AI完整参数

```typescript
interface FALVideoInput {
  // 必需参数
  prompt: string;
  
  // 可选参数
  negative_prompt?: string;
  video_size?: "square" | "portrait_16_9" | "landscape_16_9";
  duration?: "5" | "10";
  fps?: 24 | 30;
  
  // 高级参数 (模型特定)
  seed?: number; // 固定随机种子
  guidance_scale?: number; // 7-15, 越高越贴合Prompt
  num_inference_steps?: number; // 生成步数
}
```

### B. 成本估算

**月度成本计算** (假设1000个视频/月):

```
Minimax: 1000视频 × $0.05 = $50
Runway: 1000视频 × $0.20 = $200
Kling: 1000视频 × $0.08 = $80

混合策略 (800 Minimax + 200 Runway):
$50 × 0.8 + $200 × 0.2 = $40 + $40 = $80
```

### C. 最佳实践清单

- ✅ 始终优化Prompt后再生成
- ✅ 使用负面Prompt避免低质量
- ✅ 实现超时检测和清理
- ✅ 监控生成成功率和时长
- ✅ 为高质量场景保留Runway配额
- ✅ 批量生成使用Minimax降低成本

---

<div align="center">

**文档版本**: V1.0  
**最后更新**: 2024-11-19  

[返回文档首页](../README.md) | [查看爆款策略](./VIRAL_CONTENT_STRATEGY.md) | [查看API文档](./API.md)

</div>