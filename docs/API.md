# 🔌 API文档

> **版本**: V1.0  
> **基础URL**: `https://jilo.ai/api`  
> **认证方式**: Bearer Token

---

## 📑 目录

1. [认证](#1-认证)
2. [爬虫API](#2-爬虫api)
3. [视频生成API](#3-视频生成api)
4. [发布API](#4-发布api)
5. [用户配额API](#5-用户配额api)
6. [Webhook](#6-webhook)
7. [错误码](#7-错误码)

---

## 1. 认证

所有API请求必须在Header中包含认证Token：

```http
Authorization: Bearer {your_token}
Content-Type: application/json
```

### 获取Token

用户登录后，系统自动生成JWT Token，有效期30天。

**前端获取方式**:
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

---

## 2. 爬虫API

### 2.1 启动爬虫任务

**端点**: `POST /api/scraper/start`

**描述**: 启动Apify爬虫，抓取指定平台的热门视频。

**请求体**:
```json
{
  "platform": "tiktok",  // tiktok | youtube | instagram
  "keywords": ["AI工具", "生产力"],
  "filters": {
    "minViews": 10000,
    "maxViews": 10000000,
    "minEngagementRate": 5,
    "publishedWithin": 7,  // 最近7天
    "videoDuration": {
      "min": 15,
      "max": 60
    }
  },
  "maxResults": 50
}
```

**响应**:
```json
{
  "success": true,
  "taskId": "scraper_task_abc123",
  "estimatedTime": 180,  // 秒
  "message": "爬虫任务已启动"
}
```

**状态码**:
- `200`: 成功
- `400`: 参数错误
- `402`: 配额不足
- `429`: 请求过于频繁

---

### 2.2 查询爬虫状态

**端点**: `GET /api/scraper/status/{taskId}`

**响应**:
```json
{
  "taskId": "scraper_task_abc123",
  "status": "running",  // pending | running | completed | failed
  "progress": 65,  // 0-100
  "videosFound": 32,
  "estimatedTimeRemaining": 60,  // 秒
  "error": null
}
```

---

### 2.3 获取爬取结果

**端点**: `GET /api/scraper/results/{taskId}`

**响应**:
```json
{
  "taskId": "scraper_task_abc123",
  "totalVideos": 45,
  "videos": [
    {
      "id": "video_xyz789",
      "platform": "tiktok",
      "url": "https://www.tiktok.com/@user/video/123456",
      "title": "10个AI工具让你效率翻倍",
      "description": "分享我最常用的AI工具...",
      "author": "@techguru",
      "stats": {
        "views": 1250000,
        "likes": 85000,
        "comments": 3200,
        "shares": 12000,
        "engagementRate": 8.02
      },
      "viralScore": 92,  // 0-100
      "publishedAt": "2024-11-15T10:30:00Z",
      "duration": 45,
      "thumbnail": "https://...",
      "tags": ["AI", "生产力", "工具"]
    }
  ]
}
```

---

## 3. 视频生成API

### 3.1 创建生成任务

**端点**: `POST /api/video/generate`

**请求体**:
```json
{
  "prompt": "一个科技感十足的办公场景，年轻人在使用AI工具，快速剪辑，充满未来感",
  "model": "minimax",  // minimax | runway-gen3 | kling
  "duration": 30,  // 15 | 30 | 60
  "aspectRatio": "9:16",  // 9:16 | 16:9 | 1:1
  "style": "realistic",  // realistic | anime | artistic
  "negativePrompt": "blurry, low quality",  // 可选
  "seed": null,  // 可选，用于复现
  "webhook": "https://yoursite.com/webhook"  // 可选
}
```

**响应**:
```json
{
  "success": true,
  "taskId": "video_gen_def456",
  "estimatedTime": 300,  // 秒
  "queuePosition": 3,
  "quotaUsed": 1,
  "quotaRemaining": 19
}
```

---

### 3.2 查询生成状态

**端点**: `GET /api/video/status/{taskId}`

**响应**:
```json
{
  "taskId": "video_gen_def456",
  "status": "processing",  // queued | processing | completed | failed
  "progress": 45,  // 0-100
  "estimatedTimeRemaining": 180,
  "result": null,  // 完成后才有
  "error": null
}
```

---

### 3.3 获取生成结果

**端点**: `GET /api/video/result/{taskId}`

**响应**:
```json
{
  "taskId": "video_gen_def456",
  "status": "completed",
  "video": {
    "id": "video_xyz123",
    "url": "https://supabase.storage/.../video.mp4",
    "tempUrl": "https://fal.ai/.../video.mp4",  // 临时链接，24小时有效
    "duration": 30,
    "resolution": "1080x1920",
    "size": 15234567,  // bytes
    "thumbnail": "https://...",
    "model": "minimax",
    "createdAt": "2024-11-19T12:00:00Z"
  },
  "cost": 0.05  // USD
}
```

---

### 3.4 批量生成

**端点**: `POST /api/video/batch-generate`

**请求体**:
```json
{
  "tasks": [
    {
      "prompt": "prompt 1",
      "model": "minimax",
      "duration": 30
    },
    {
      "prompt": "prompt 2",
      "model": "runway-gen3",
      "duration": 30
    }
  ],
  "webhook": "https://yoursite.com/webhook"  // 可选
}
```

**响应**:
```json
{
  "success": true,
  "batchId": "batch_ghi789",
  "taskIds": [
    "video_gen_001",
    "video_gen_002"
  ],
  "totalTasks": 2,
  "quotaUsed": 2,
  "quotaRemaining": 18
}
```

---

## 4. 发布API

### 4.1 连接YouTube账号

**端点**: `GET /api/youtube/connect`

**描述**: 重定向到Google OAuth授权页面。

**参数**:
```
redirect_uri: 授权成功后的回调地址
```

**回调**:
```
GET {redirect_uri}?code=xxx&state=xxx
```

---

### 4.2 发布到YouTube

**端点**: `POST /api/youtube/publish`

**请求体**:
```json
{
  "videoId": "video_xyz123",  // Jilo.ai中的视频ID
  "channelId": "UCxxxxx",  // YouTube频道ID
  "title": "10个AI工具让你效率翻倍",
  "description": "在这个视频中，我将分享...",
  "tags": ["AI", "生产力", "工具"],
  "category": "22",  // YouTube分类ID
  "privacy": "public",  // public | unlisted | private
  "thumbnailUrl": "https://...",  // 可选
  "publishAt": null,  // 可选，定时发布
  "playlist": "PLxxxxx"  // 可选，添加到播放列表
}
```

**响应**:
```json
{
  "success": true,
  "publishId": "publish_jkl012",
  "youtubeVideoId": "dQw4w9WgXcQ",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "status": "processing",  // uploading | processing | published | failed
  "estimatedTime": 120
}
```

---

### 4.3 查询发布状态

**端点**: `GET /api/youtube/publish-status/{publishId}`

**响应**:
```json
{
  "publishId": "publish_jkl012",
  "status": "published",
  "youtubeVideoId": "dQw4w9WgXcQ",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "uploadProgress": 100,
  "processingProgress": 100,
  "publishedAt": "2024-11-19T14:30:00Z",
  "error": null
}
```

---

### 4.4 AI优化标题描述

**端点**: `POST /api/youtube/optimize-seo`

**请求体**:
```json
{
  "title": "AI工具分享",  // 原始标题
  "description": "分享一些AI工具",  // 原始描述
  "keywords": ["AI", "工具"],  // 关键词
  "language": "zh-CN"  // zh-CN | en-US
}
```

**响应**:
```json
{
  "optimizedTitles": [
    "10个AI工具让你效率翻倍！2024必备生产力神器",
    "🔥效率提升10倍！最强AI工具合集【2024最新】",
    "AI工具推荐：改变你工作方式的10款神器"
  ],
  "optimizedDescription": "在这个视频中，我将分享10个超实用的AI工具...\n\n时间戳：\n0:00 - 介绍\n0:30 - 工具1...\n\n相关视频：...\n\n#AI #生产力 #工具推荐",
  "recommendedTags": [
    "AI工具",
    "生产力工具",
    "效率提升",
    "ChatGPT",
    "人工智能"
  ]
}
```

---

## 5. 用户配额API

### 5.1 查询配额

**端点**: `GET /api/user/quota`

**响应**:
```json
{
  "userId": "user_abc123",
  "plan": "standard",  // starter | standard | professional | enterprise
  "quota": {
    "videoGeneration": {
      "total": 100,
      "used": 35,
      "remaining": 65,
      "resetAt": "2024-12-01T00:00:00Z"
    },
    "scraping": {
      "total": 50,
      "used": 12,
      "remaining": 38,
      "resetAt": "2024-12-01T00:00:00Z"
    }
  }
}
```

---

### 5.2 使用配额（原子扣费）

**端点**: `POST /api/user/quota/consume`

**请求体**:
```json
{
  "type": "video_generation",  // video_generation | scraping
  "amount": 1,
  "taskId": "video_gen_def456"  // 用于幂等性
}
```

**响应**:
```json
{
  "success": true,
  "quotaRemaining": 64,
  "message": "配额扣除成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "QUOTA_EXCEEDED",
  "message": "配额已用尽，请升级套餐",
  "quotaRemaining": 0
}
```

---

## 6. Webhook

### 6.1 视频生成完成

当视频生成完成时，系统会发送POST请求到你指定的Webhook URL。

**请求头**:
```http
Content-Type: application/json
X-Jilo-Signature: sha256=xxxxx  // HMAC签名
X-Jilo-Event: video.generation.completed
```

**请求体**:
```json
{
  "event": "video.generation.completed",
  "taskId": "video_gen_def456",
  "userId": "user_abc123",
  "timestamp": "2024-11-19T12:00:00Z",
  "data": {
    "video": {
      "id": "video_xyz123",
      "url": "https://...",
      "duration": 30,
      "model": "minimax"
    }
  }
}
```

**签名验证** (Node.js):
```typescript
import crypto from 'crypto'

function verifyWebhook(payload: string, signature: string, secret: string) {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}
```

---

### 6.2 爬虫任务完成

**请求体**:
```json
{
  "event": "scraper.task.completed",
  "taskId": "scraper_task_abc123",
  "userId": "user_abc123",
  "timestamp": "2024-11-19T12:00:00Z",
  "data": {
    "videosFound": 45,
    "platform": "tiktok"
  }
}
```

---

### 6.3 发布完成

**请求体**:
```json
{
  "event": "youtube.publish.completed",
  "publishId": "publish_jkl012",
  "userId": "user_abc123",
  "timestamp": "2024-11-19T14:30:00Z",
  "data": {
    "youtubeVideoId": "dQw4w9WgXcQ",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
}
```

---

## 7. 错误码

| 错误码 | HTTP状态 | 说明 | 解决方案 |
|--------|----------|------|----------|
| `AUTH_REQUIRED` | 401 | 缺少认证Token | 在Header中添加Authorization |
| `AUTH_INVALID` | 401 | Token无效或过期 | 重新登录获取新Token |
| `QUOTA_EXCEEDED` | 402 | 配额已用尽 | 升级套餐或等待重置 |
| `RATE_LIMIT` | 429 | 请求过于频繁 | 降低请求频率 |
| `INVALID_PARAMS` | 400 | 参数错误 | 检查请求参数 |
| `TASK_NOT_FOUND` | 404 | 任务不存在 | 检查taskId |
| `GENERATION_FAILED` | 500 | 生成失败 | 重试或联系支持 |
| `WEBHOOK_FAILED` | 500 | Webhook验证失败 | 检查签名 |
| `YOUTUBE_AUTH_EXPIRED` | 401 | YouTube授权过期 | 重新授权 |
| `YOUTUBE_UPLOAD_FAILED` | 500 | 上传失败 | 重试或检查视频格式 |

---

## 8. SDK示例

### JavaScript/TypeScript

```typescript
import { JiloClient } from '@jilo/sdk'

const client = new JiloClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://jilo.ai/api'
})

// 启动爬虫
const scraperTask = await client.scraper.start({
  platform: 'tiktok',
  keywords: ['AI工具'],
  filters: { minViews: 10000 }
})

// 生成视频
const videoTask = await client.video.generate({
  prompt: '科技感办公场景',
  model: 'minimax',
  duration: 30
})

// 发布到YouTube
const publish = await client.youtube.publish({
  videoId: videoTask.result.id,
  title: 'AI工具分享',
  description: '...',
  tags: ['AI', '工具']
})
```

### Python

```python
from jilo import JiloClient

client = JiloClient(api_key='your_api_key')

# 启动爬虫
scraper_task = client.scraper.start(
    platform='tiktok',
    keywords=['AI工具'],
    filters={'min_views': 10000}
)

# 生成视频
video_task = client.video.generate(
    prompt='科技感办公场景',
    model='minimax',
    duration=30
)

# 发布到YouTube
publish = client.youtube.publish(
    video_id=video_task.result.id,
    title='AI工具分享',
    description='...',
    tags=['AI', '工具']
)
```

---

## 9. 速率限制

| 端点类型 | 限制 | 窗口 |
|----------|------|------|
| 查询接口 | 100次/分钟 | 滑动窗口 |
| 生成接口 | 10次/分钟 | 滑动窗口 |
| Webhook | 1000次/小时 | 固定窗口 |

**响应头**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

---

## 10. 版本控制

当前API版本：**V1**

所有端点默认使用最新稳定版本。如需使用特定版本：

```http
GET /api/v1/video/status/xxx
Accept: application/vnd.jilo.v1+json
```

**版本历史**:
- `V1.0` (2024-11-19): 初始版本

---

<div align="center">

**文档版本**: V1.0  
**最后更新**: 2024-11-19

[返回目录](#-目录) | [查看PRD](./PRD.md) | [查看架构文档](./ARCHITECTURE.md)

</div>