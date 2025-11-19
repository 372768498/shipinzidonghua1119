# 🕷️ Apify集成指南

> 使用Apify爬取TikTok、YouTube、Instagram的病毒式视频

---

## 📑 目录

1. [Apify简介](#1-apify简介)
2. [支持的平台](#2-支持的平台)
3. [配置Apify](#3-配置apify)
4. [TikTok爬虫](#4-tiktok爬虫)
5. [YouTube爬虫](#5-youtube爬虫)
6. [Instagram爬虫](#6-instagram爬虫)
7. [爬虫最佳实践](#7-爬虫最佳实践)
8. [成本优化](#8-成本优化)
9. [常见问题](#9-常见问题)

---

## 1. Apify简介

### 什么是Apify?

Apify是一个云端网页抓取和自动化平台，提供:
- 🚀 **现成的爬虫** (Actors): 无需编写爬虫代码
- 🔄 **定时任务**: 自动监控热门内容
- 📊 **数据导出**: JSON、CSV、Excel等格式
- 💰 **按需付费**: 只为使用的资源付费

### 为什么选择Apify?

| 对比项 | 自建爬虫 | Apify |
|--------|----------|-------|
| **开发时间** | 2-4周 | 即刻可用 |
| **维护成本** | 持续维护 | 零维护 |
| **IP封禁** | 需要代理池 | 自动处理 |
| **可靠性** | 不稳定 | 99.9%可用性 |
| **成本** | 服务器+人力 | $49/月起 |

---

## 2. 支持的平台

### TikTok

**Actor**: `apify/tiktok-scraper`

**能力**:
- ✅ 搜索关键词视频
- ✅ 爬取用户主页视频
- ✅ 爬取话题标签视频
- ✅ 获取评论和用户信息

**限制**:
- 每次运行最多1000条结果
- 不包含视频文件（仅元数据）

---

### YouTube

**Actor**: `apify/youtube-scraper`

**能力**:
- ✅ 搜索视频
- ✅ 爬取频道视频
- ✅ 爬取播放列表
- ✅ 获取评论和字幕

**限制**:
- 每次运行最多500条结果
- 速率限制: 100请求/分钟

---

### Instagram

**Actor**: `apify/instagram-scraper`

**能力**:
- ✅ 搜索话题标签
- ✅ 爬取用户Reels
- ✅ 获取帖子互动数据

**限制**:
- 需要Instagram登录凭证
- 容易触发速率限制

---

## 3. 配置Apify

### 3.1 创建账号

1. 访问 https://apify.com/sign-up
2. 选择免费套餐（$5免费额度）
3. 验证邮箱

### 3.2 获取API Token

1. 访问 https://console.apify.com/account/integrations
2. 点击「Create new token」
3. 复制Token:

```bash
apify_api_xxxxxxxxxxxxxxxxxxxxxxxx
```

4. 添加到 `.env.local`:

```bash
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxx
```

### 3.3 安装Apify Client

```bash
npm install apify-client
```

---

## 4. TikTok爬虫

### 4.1 基础用法

```typescript
import { ApifyClient } from 'apify-client'

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
})

// 启动TikTok爬虫
const run = await client.actor('apify/tiktok-scraper').call({
  hashtags: ['AI', 'productivity'],
  resultsPerPage: 50,
  shouldDownloadCovers: false,
  shouldDownloadVideos: false,
})

// 获取结果
const { items } = await client.dataset(run.defaultDatasetId).listItems()

console.log('找到视频:', items.length)
```

---

### 4.2 高级配置

```typescript
const input = {
  // 搜索方式（三选一）
  hashtags: ['AI工具', '生产力'],        // 通过话题标签
  // profiles: ['username1', 'username2'],  // 通过用户名
  // urls: ['https://www.tiktok.com/@user/video/123'],  // 直接URL

  // 结果数量
  resultsPerPage: 100,  // 每个话题最多100条

  // 是否下载
  shouldDownloadCovers: false,  // 不下载封面图（节省成本）
  shouldDownloadVideos: false,  // 不下载视频文件（仅元数据）
  shouldDownloadSubtitles: false,

  // 代理设置
  proxyConfiguration: {
    useApifyProxy: true,  // 使用Apify内置代理
    apifyProxyGroups: ['RESIDENTIAL'],  // 住宅IP（更可靠但贵）
  },
}

const run = await client.actor('apify/tiktok-scraper').call(input)
```

---

### 4.3 返回数据格式

```json
{
  "id": "7123456789012345678",
  "text": "10个AI工具让你效率翻倍 #AI #生产力",
  "createTime": "2024-11-15T10:30:00Z",
  "authorMeta": {
    "id": "123456",
    "name": "techguru",
    "nickName": "Tech Guru",
    "verified": true,
    "signature": "分享最新科技",
    "avatar": "https://...",
    "following": 500,
    "fans": 125000,
    "heart": 3500000,
    "video": 450
  },
  "musicMeta": {
    "musicId": "7123456789",
    "musicName": "original sound",
    "musicAuthor": "techguru"
  },
  "hashtags": [
    { "id": "1", "name": "AI" },
    { "id": "2", "name": "生产力" }
  ],
  "videoMeta": {
    "duration": 45,
    "width": 1080,
    "height": 1920
  },
  "diggCount": 85000,     // 点赞数
  "shareCount": 12000,    // 分享数
  "playCount": 1250000,   // 播放数
  "commentCount": 3200,   // 评论数
  "webVideoUrl": "https://www.tiktok.com/@techguru/video/7123456789012345678",
  "covers": {
    "default": "https://...",
    "dynamic": "https://..."
  }
}
```

---

### 4.4 计算爆款评分

```typescript
function calculateViralScore(video: any): number {
  const { playCount, diggCount, shareCount, commentCount } = video
  
  // 互动率
  const engagementRate = 
    ((diggCount + commentCount + shareCount) / playCount) * 100
  
  // 分享率（病毒式传播的关键指标）
  const shareRate = (shareCount / playCount) * 100
  
  // 评分算法
  const score = 
    Math.log10(playCount) * 40 +      // 播放量（对数缩放）
    engagementRate * 30 +             // 互动率
    shareRate * 100 * 20 +            // 分享率（放大100倍）
    Math.log10(diggCount) * 10        // 点赞数
  
  return Math.min(Math.round(score), 100)  // 0-100分
}

// 使用
const videos = items.map(video => ({
  ...video,
  viralScore: calculateViralScore(video)
}))

// 按评分排序
videos.sort((a, b) => b.viralScore - a.viralScore)
```

---

### 4.5 过滤高质量视频

```typescript
function filterHighQualityVideos(videos: any[]) {
  return videos.filter(video => {
    const engagementRate = 
      ((video.diggCount + video.commentCount + video.shareCount) / 
       video.playCount) * 100
    
    return (
      // 播放量: 1万-1000万（排除假数据和超级大号）
      video.playCount >= 10000 && video.playCount <= 10000000 &&
      
      // 互动率: 大于5%
      engagementRate > 5 &&
      
      // 视频时长: 15-60秒（短视频黄金时长）
      video.videoMeta.duration >= 15 && video.videoMeta.duration <= 60 &&
      
      // 最近7天内发布
      new Date(video.createTime) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
  })
}
```

---

## 5. YouTube爬虫

### 5.1 基础用法

```typescript
const run = await client.actor('apify/youtube-scraper').call({
  searchKeywords: 'AI tools',
  maxResults: 50,
  uploadDate: 'week',  // today | week | month | year
})

const { items } = await client.dataset(run.defaultDatasetId).listItems()
```

---

### 5.2 高级配置

```typescript
const input = {
  // 搜索方式（三选一）
  searchKeywords: 'AI productivity tools',  // 关键词搜索
  // channelUrls: ['https://www.youtube.com/c/channelname'],  // 频道
  // playlistUrls: ['https://www.youtube.com/playlist?list=xxx'],  // 播放列表

  // 结果数量
  maxResults: 100,

  // 时间范围
  uploadDate: 'week',  // today | week | month | year | all

  // 视频时长
  videoDuration: 'short',  // short (< 4min) | medium (4-20min) | long (> 20min)

  // 排序方式
  sortBy: 'relevance',  // relevance | date | viewCount | rating

  // 是否获取字幕
  subtitlesLanguage: 'en',  // 语言代码

  // 代理
  proxyConfiguration: {
    useApifyProxy: true,
  },
}

const run = await client.actor('apify/youtube-scraper').call(input)
```

---

### 5.3 返回数据格式

```json
{
  "id": "dQw4w9WgXcQ",
  "title": "10 AI Tools That Will Change Your Life in 2024",
  "description": "In this video, I share...",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "uploadDate": "2024-11-15",
  "duration": "10:24",
  "viewCount": 125000,
  "likeCount": 8500,
  "dislikeCount": null,  // YouTube已隐藏
  "commentCount": 320,
  "channelName": "Tech Productivity",
  "channelId": "UCxxxxxxxxxxxxx",
  "channelUrl": "https://www.youtube.com/channel/UCxxxxxxxxxxxxx",
  "subscriberCount": 450000,
  "tags": ["AI", "productivity", "tools", "2024"],
  "category": "Science & Technology"
}
```

---

### 5.4 计算YouTube爆款评分

```typescript
function calculateYoutubeViralScore(video: any): number {
  const { viewCount, likeCount, commentCount } = video
  
  // 互动率（YouTube没有分享数）
  const engagementRate = 
    ((likeCount + commentCount) / viewCount) * 100
  
  // 评论率（高评论率说明话题性强）
  const commentRate = (commentCount / viewCount) * 100
  
  // 评分算法
  const score = 
    Math.log10(viewCount) * 40 +
    engagementRate * 35 +
    commentRate * 200 * 25  // 评论率权重更高
  
  return Math.min(Math.round(score), 100)
}
```

---

## 6. Instagram爬虫

### 6.1 基础用法

```typescript
const run = await client.actor('apify/instagram-scraper').call({
  hashtags: ['ai', 'productivity'],
  resultsLimit: 50,
})

const { items } = await client.dataset(run.defaultDatasetId).listItems()
```

---

### 6.2 高级配置

⚠️ **注意**: Instagram爬虫需要登录凭证，更容易被封禁。

```typescript
const input = {
  // 搜索方式
  hashtags: ['aitools', 'productivity'],
  // username: ['user1', 'user2'],
  // directUrls: ['https://www.instagram.com/p/xxxxx/'],

  // 结果数量
  resultsLimit: 50,

  // 登录凭证（可选但推荐）
  loginCookies: [
    {
      name: 'sessionid',
      value: 'your_session_id_here',
    },
  ],

  // 代理
  proxyConfiguration: {
    useApifyProxy: true,
    apifyProxyGroups: ['RESIDENTIAL'],  // 必须使用住宅IP
  },
}

const run = await client.actor('apify/instagram-scraper').call(input)
```

---

## 7. 爬虫最佳实践

### 7.1 遵守robots.txt

```typescript
// Apify自动遵守robots.txt，无需额外配置
// 但建议设置合理的请求间隔

const input = {
  // ...
  proxyConfiguration: {
    useApifyProxy: true,
  },
  // 请求间隔（秒）
  requestDelay: 2,  // 2秒/请求
}
```

---

### 7.2 处理速率限制

```typescript
async function runScraperWithRetry(
  actorId: string,
  input: any,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const run = await client.actor(actorId).call(input)
      
      // 检查运行状态
      if (run.status === 'SUCCEEDED') {
        return await client.dataset(run.defaultDatasetId).listItems()
      }
      
      // 如果失败，等待后重试
      console.log(`尝试 ${i + 1}/${maxRetries} 失败，等待重试...`)
      await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)))
      
    } catch (error) {
      if (i === maxRetries - 1) throw error
    }
  }
}
```

---

### 7.3 监控爬虫运行

```typescript
async function monitorActorRun(runId: string) {
  while (true) {
    const run = await client.run(runId).get()
    
    console.log(`状态: ${run.status}, 进度: ${run.stats.requestsFinished}/${run.stats.requestsTotal}`)
    
    if (['SUCCEEDED', 'FAILED', 'ABORTED'].includes(run.status)) {
      break
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000))  // 5秒检查一次
  }
  
  return run
}

// 使用
const run = await client.actor('apify/tiktok-scraper').start(input)
const result = await monitorActorRun(run.id)
```

---

### 7.4 定时爬取

```typescript
// 创建定时任务（每天早上9点）
const schedule = await client.schedules().create({
  name: 'Daily TikTok Scraping',
  isEnabled: true,
  cronExpression: '0 9 * * *',  // 每天9:00
  actions: [{
    type: 'RUN_ACTOR',
    actorId: 'apify/tiktok-scraper',
    input: {
      hashtags: ['AI', 'productivity'],
      resultsPerPage: 50,
    },
  }],
})

console.log('定时任务创建成功:', schedule.id)
```

---

## 8. 成本优化

### 8.1 Apify定价

**免费套餐**:
- $5免费额度
- 适合测试和小规模使用

**付费套餐**:
- Starter: $49/月 ($50额度)
- Team: $499/月 ($500额度)
- Enterprise: 定制

**计费方式**:
```
成本 = 计算单元 (CU) × 单价

1 CU = 1 CPU核心 × 1GB内存 × 1小时
单价 = $0.40/CU

示例:
爬取100个TikTok视频 ≈ 0.02 CU ≈ $0.008
爬取100个YouTube视频 ≈ 0.03 CU ≈ $0.012
```

---

### 8.2 降低成本的技巧

#### 1. 只爬取元数据

```typescript
const input = {
  hashtags: ['AI'],
  resultsPerPage: 50,
  shouldDownloadCovers: false,   // 不下载封面
  shouldDownloadVideos: false,   // 不下载视频
  shouldDownloadSubtitles: false,  // 不下载字幕
}

// 成本降低: 70%
```

---

#### 2. 使用更便宜的代理

```typescript
const input = {
  // ...
  proxyConfiguration: {
    useApifyProxy: true,
    apifyProxyGroups: ['SHADER'],  // 数据中心IP（便宜但可能被封）
    // apifyProxyGroups: ['RESIDENTIAL'],  // 住宅IP（贵但更可靠）
  },
}

// 成本降低: 50%（如果不被封）
```

---

#### 3. 减少爬取频率

```typescript
// 不要每小时爬取，改为每天爬取
const schedule = await client.schedules().create({
  cronExpression: '0 9 * * *',  // 每天1次
  // 而不是 '0 * * * *',  // 每小时1次
})

// 成本降低: 95%
```

---

#### 4. 设置结果上限

```typescript
const input = {
  hashtags: ['AI'],
  resultsPerPage: 20,  // 只爬20条，而不是100条
}

// 成本降低: 80%
```

---

### 8.3 成本监控

```typescript
// 获取账户余额
const account = await client.user().get()
console.log('剩余额度:', account.usage.monthlyUsageUsd)

// 获取Actor运行成本
const run = await client.run(runId).get()
console.log('本次运行成本:', run.usage.computeUnits * 0.40, 'USD')

// 设置预算告警
if (account.usage.monthlyUsageUsd > 40) {  // $50套餐的80%
  console.warn('⚠️ 本月额度即将用尽！')
  // 发送告警邮件
}
```

---

## 9. 常见问题

### Q1: 爬虫失败，显示"CAPTCHA detected"

**原因**: 
目标网站检测到爬虫行为，要求人机验证。

**解决方案**:
```typescript
const input = {
  // ...
  proxyConfiguration: {
    useApifyProxy: true,
    apifyProxyGroups: ['RESIDENTIAL'],  // 使用住宅IP
  },
  requestDelay: 3,  // 增加请求间隔
}
```

---

### Q2: TikTok返回数据为空

**原因**:
1. 话题标签不存在
2. 地区限制
3. TikTok API变更

**解决方案**:
```typescript
// 1. 检查话题标签是否正确
const input = {
  hashtags: ['ai'],  // 小写，无#符号
}

// 2. 使用特定地区代理
const input = {
  proxyConfiguration: {
    useApifyProxy: true,
    apifyProxyCountry: 'US',  // 美国代理
  },
}
```

---

### Q3: YouTube搜索结果不准确

**原因**:
YouTube搜索算法复杂，受用户历史影响。

**解决方案**:
```typescript
const input = {
  searchKeywords: 'AI tools 2024',  // 更具体的关键词
  sortBy: 'viewCount',  // 按播放量排序
  uploadDate: 'week',   // 限制时间范围
}
```

---

### Q4: Instagram登录凭证过期

**原因**:
Instagram Session ID有效期短。

**解决方案**:
1. 定期更新Session ID
2. 使用多个账号轮换
3. 考虑使用TikTok/YouTube代替（更稳定）

---

### Q5: 成本超出预算

**原因**:
- 下载了大量视频文件
- 使用了昂贵的住宅代理
- 爬取频率过高

**解决方案**:
参考 [成本优化](#8-成本优化) 章节。

---

## 10. 进阶技巧

### 10.1 爬取后自动分析

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

async function analyzeViralVideo(video: any) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  
  const prompt = `
分析这个TikTok视频为什么会火:

标题: ${video.text}
播放量: ${video.playCount}
点赞: ${video.diggCount}
评论: ${video.commentCount}
分享: ${video.shareCount}
话题: ${video.hashtags.map(h => h.name).join(', ')}

请从以下角度分析:
1. 内容定位
2. 情绪共鸣
3. 传播机制
4. 可复制要素
  `
  
  const result = await model.generateContent(prompt)
  return result.response.text()
}
```

---

### 10.2 自动生成视频脚本

```typescript
async function generateScriptFromViral(video: any) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  
  const prompt = `
基于这个爆款TikTok视频，生成一个相似但不抄袭的视频脚本:

原视频标题: ${video.text}
原视频数据: ${video.playCount}播放, ${video.diggCount}点赞

要求:
1. 保持相同的主题和风格
2. 创造性地改编内容
3. 时长控制在45秒
4. 包含3-5个关键镜头描述
  `
  
  const result = await model.generateContent(prompt)
  return result.response.text()
}
```

---

<div align="center">

**文档版本**: V1.0  
**最后更新**: 2024-11-19

[返回目录](#-目录) | [查看API文档](./API.md) | [查看快速开始](./QUICKSTART.md)

</div>