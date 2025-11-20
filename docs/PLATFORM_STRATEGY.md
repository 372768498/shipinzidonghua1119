# 分平台爆款策略实现

> **重要洞察**：TikTok和YouTube Shorts的爆款内容特征完全不同，需要差异化的评分算法和AI分析策略。

---

## 📊 核心差异对比

| 维度 | TikTok | YouTube Shorts |
|------|--------|----------------|
| **内容导向** | 娱乐、情绪、社交 | 价值、知识、解决方案 |
| **关键指标** | 分享率、音乐匹配 | 订阅转化、SEO优化 |
| **爆款阈值** | 100万+播放 | 50万+播放 |
| **时效性** | 24-72小时快速爆发 | 7-30天长尾流量 |
| **成功要素** | 前3秒钩子、热门BGM | 标题关键词、信息密度 |
| **传播方式** | 社交分享为主 | 搜索流量为主 |
| **内容类型** | 搞笑、挑战、音乐 | 教程、评测、科普 |

---

## 🎯 评分算法差异

### TikTok评分算法（总分100）

```typescript
1. 互动率（40分） - 最高权重
   = (点赞 + 评论×3 + 分享×5) / 播放量
   说明：分享权重最高，因为分享代表社交传播力

2. 传播力（30分）
   = 分享数 / 播放量
   说明：TikTok的核心是社交传播

3. 新鲜度（20分）
   - 24小时内：满分20分
   - 3天内：15分
   - 1周内：10分
   - 超过1周：持续衰减
   说明：TikTok重视快速爆发

4. 平台特性（10分）
   + 使用热门音乐：5分
   + 7-15秒最佳时长：3分
   + 高保存率（>2%）：2分
```

### YouTube Shorts评分算法（总分100）

```typescript
1. 互动质量（30分）
   = (点赞 + 评论×5) / 播放量
   说明：评论权重更高，代表深度互动

2. 订阅转化（30分）
   = 播放量 / 订阅数
   说明：小频道爆款可能是订阅数的10倍+

3. 持久性（25分）
   - 7天内：25分
   - 30天内：20分
   - 90天内：15分
   - 超过90天：仍保留5分基础分
   说明：YouTube重视长尾流量

4. 平台特性（15分）
   + SEO标签（5+个）：3分
   + 标题长度（30-60字符）：3分
   + 详细描述（100+字符）：3分
   + 最佳时长（30-60秒）：3分
   + 高保存率（>3%）：3分
```

### 关键区别总结

| 评分项 | TikTok权重 | YouTube权重 | 原因 |
|--------|-----------|-------------|------|
| 互动率 | 40% | 30% | TikTok更看重立即反应 |
| 订阅转化 | 0% | 30% | YouTube的核心指标 |
| 分享传播 | 30% | 0% | TikTok的社交属性 |
| 新鲜度 | 20% | 25% | YouTube更重视长期价值 |
| 平台特性 | 10% | 15% | YouTube的SEO更重要 |

---

## 🤖 AI分析提示词差异

### TikTok分析侧重点

**分析维度（权重）：**
1. **开头3秒钩子（30%）** ← 最关键
   - 视觉冲击力
   - 悬念设置
   - 音乐节拍匹配

2. **娱乐性（25%）**
   - 轻松有趣
   - 引发模仿欲望
   - 社交传播性

3. **音乐选择（20%）**
   - 热门BGM使用
   - 音乐契合度
   - 节奏卡点

4. **情绪调动（15%）**
   - 搞笑/惊喜/共鸣
   - 年轻化表达

5. **趋势参与（10%）**
   - 热门挑战
   - 话题标签

### YouTube Shorts分析侧重点

**分析维度（权重）：**
1. **价值传递（30%）** ← 最关键
   - 实用信息
   - 问题解决
   - 独特价值

2. **信息密度（25%）**
   - 高效表达
   - 无冗余内容
   - 清晰结构

3. **SEO优化（20%）**
   - 关键词使用
   - 标题优化
   - 可搜索性

4. **订阅转化（15%）**
   - 引导订阅
   - 系列内容
   - 频道专业性

5. **专业度（10%）**
   - 画面质量
   - 讲解清晰
   - 可信度

---

## 💻 技术实现架构

### 1. 核心文件结构

```
src/
├── lib/
│   ├── viral-scoring.ts          # 分平台评分算法
│   └── ai-prompts.ts              # 分平台AI提示词
├── app/
│   ├── api/
│   │   ├── viral-discovery/
│   │   │   └── route.ts          # 启动任务API（支持平台选择）
│   │   └── webhooks/
│   │       └── apify/
│   │           └── route.ts       # Webhook处理（分平台分析）
│   └── discover/
│       └── page.tsx               # 发现页面（平台选择UI）
```

### 2. 数据流程

```mermaid
用户选择平台
    ↓
启动Apify爬虫（TikTok或YouTube）
    ↓
Webhook接收原始数据
    ↓
根据平台类型调用对应评分算法
    ↓
根据平台特性调用对应AI分析提示词
    ↓
保存爆款视频到数据库
    ↓
Supabase Realtime推送更新到前端
```

### 3. 关键代码片段

#### 平台判断逻辑

```typescript
// 从数据库获取Job信息
const platform: Platform = job.source_platform === 'tiktok' 
  ? 'tiktok' 
  : 'youtube_shorts';

// 调用对应的评分算法
const viralScore = calculateViralScore(platform, videoMetrics);

// 调用对应的AI分析提示词
const analysisPrompt = getAnalysisPrompt(platform, videoData);
```

#### 统一接口设计

```typescript
// 评分接口
export function calculateViralScore(
  platform: Platform,
  video: VideoMetrics
): ViralScore

// AI分析接口
export function getAnalysisPrompt(
  platform: Platform,
  videoData: any
): AnalysisPrompt
```

---

## 🎨 前端用户体验

### 平台选择UI设计

**YouTube Shorts按钮：**
- 颜色：蓝色系
- 图标：▶️
- 说明：价值导向 | SEO优化 | 订阅转化

**TikTok按钮：**
- 颜色：粉色系
- 图标：🎵
- 说明：娱乐导向 | 音乐节奏 | 社交传播

### 平台差异提示

根据选择的平台动态显示：
- **YouTube Shorts**：
  - 重视知识型和教程类内容
  - SEO和可搜索性至关重要
  - 爆款阈值：50万+播放
  - 订阅转化率是关键指标

- **TikTok**：
  - 注重娱乐性和情绪共鸣
  - 前3秒钩子决定成败
  - 爆款阈值：100万+播放
  - 音乐和热门挑战很重要

---

## 📈 实际应用建议

### TikTok内容创作方向

1. **前3秒设计**
   - 使用视觉冲击（特效、剪辑）
   - 设置悬念或反转
   - 匹配热门BGM节奏

2. **内容类型优选**
   - 搞笑段子
   - 舞蹈挑战
   - 生活vlog
   - 情感共鸣

3. **发布策略**
   - 晚上8-10点发布
   - 使用热门话题标签
   - 参与平台挑战
   - 引导分享传播

### YouTube Shorts内容创作方向

1. **标题优化**
   - 包含搜索关键词
   - 30-60字符最佳
   - 清晰表达价值点

2. **内容类型优选**
   - 教程和技巧
   - 知识科普
   - 问题解决
   - 产品评测

3. **发布策略**
   - 早上10点或下午2点发布
   - 详细描述和标签
   - 引导订阅和观看系列
   - 与长视频联动

---

## 🔧 配置说明

### 环境变量

```env
# Apify
APIFY_API_TOKEN=your_apify_token
APIFY_WEBHOOK_SECRET=your_webhook_secret

# Google Gemini
GEMINI_API_KEY=your_gemini_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Apify Actor选择

**TikTok：**
- Actor: `apify/tiktok-scraper`
- 用途：抓取热门视频和用户内容

**YouTube Shorts：**
- Actor: `bernardo/youtube-scraper`
- 参数：`videoDuration: 'short'` 只抓取短视频

---

## 🚀 使用流程

### 1. 启动发现任务

```typescript
POST /api/viral-discovery
{
  "platform": "youtube_shorts", // or "tiktok"
  "mode": "combined",
  "searchKeywords": ["AI教程", "React开发"],
  "monitoredChannels": ["https://youtube.com/@channel1"],
  "maxResults": 100
}
```

### 2. 实时监听更新

```typescript
// Supabase Realtime
supabase
  .channel('crawl_jobs_changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'crawl_jobs',
  }, handleUpdate)
  .subscribe()
```

### 3. 获取爆款结果

```typescript
GET /api/viral-discovery?jobId=xxx

// 返回
{
  "job": {
    "platform": "youtube_shorts",
    "status": "completed",
    "viralVideosCount": 45
  },
  "viralVideos": [...]
}
```

---

## ⚠️ 注意事项

1. **平台切换不影响历史数据**
   - 每个任务都记录了 `source_platform`
   - 可以同时运行TikTok和YouTube任务

2. **评分不可跨平台对比**
   - TikTok 80分 ≠ YouTube 80分
   - 各有不同的评分标准

3. **AI分析结果仅供参考**
   - 最终判断需要人工审核
   - 注意版权和原创性

4. **成本控制**
   - Apify按使用量计费
   - Gemini API有配额限制
   - 建议设置合理的 `maxResults`

---

## 📊 效果评估

### 预期指标

**TikTok：**
- 爆款识别准确率：80%+
- 平均发现时间：24-48小时
- 推荐复制成功率：60%+

**YouTube Shorts：**
- 爆款识别准确率：85%+
- 平均发现时间：7-14天
- 推荐复制成功率：70%+

---

## 🎯 后续优化方向

1. **相对评分系统**
   - 考虑账号粉丝基数
   - 垂直领域调整系数
   - 新号扶持机制

2. **批量趋势分析**
   - 识别共同成功模式
   - 发现内容缺口机会
   - 生成创作指导

3. **创作辅助工具**
   - 基于爆款生成脚本
   - 推荐音乐和标签
   - SEO标题优化

4. **A/B测试功能**
   - 同一内容两个平台对比
   - 不同策略效果验证
   - 数据驱动优化

---

**最后更新**：2024-11-20
**作者洞察**：平台差异化是爆款发现的关键，不能用同一套标准衡量所有平台。
