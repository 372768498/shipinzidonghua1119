# YouTube Shorts 优化器整合指南

## 📋 概述

新的YouTube Shorts优化器已成功整合到现有系统中。本指南说明如何使用新旧两套API。

---

## 🆚 新旧API对比

### 原有API（保持兼容）

**路由：** `POST /api/viral-discovery/start`

```typescript
{
  mode: 'shorts',
  monitoredChannels: ['channel1', 'channel2'],
  maxResults: 100
}
```

**特点：**
- ✅ 简单直接
- ✅ 与其他模式统一
- ⚠️ 无智能筛选
- ⚠️ 无教育类优化

---

### 新优化API（推荐）

**路由：** `POST /api/viral-discovery/shorts-optimized`

```typescript
{
  preset: 'viral',        // 'viral' | 'potential' | 'blueOcean'
  category: 'education',  // 可选
  customKeywords: [],     // 可选
  maxResults: 50
}
```

**特点：**
- ✅ 3种智能预设
- ✅ 5大类别关键词
- ✅ 5维度评分算法
- ✅ 自动筛选排序
- ✅ 教育类内容优化

---

## 🚀 快速开始

### 方式1：通过API调用（推荐生产环境）

#### 1.1 启动爆款发现

```bash
curl -X POST http://localhost:3000/api/viral-discovery/shorts-optimized \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-xxx" \
  -d '{
    "preset": "viral",
    "category": "education",
    "maxResults": 30
  }'
```

**响应：**
```json
{
  "success": true,
  "job": {
    "id": "abc123",
    "status": "processing",
    "apifyRunId": "xyz789",
    "preset": "viral",
    "category": "education",
    "queries": ["how to", "tutorial", "learn", "explain", "guide"],
    "estimatedTime": "3-5 minutes"
  }
}
```

#### 1.2 查询任务状态

```bash
curl http://localhost:3000/api/viral-discovery/start?jobId=abc123
```

#### 1.3 获取可用预设

```bash
curl http://localhost:3000/api/viral-discovery/shorts-optimized?action=list-presets
```

---

### 方式2：通过测试脚本（推荐开发测试）

#### 2.1 快速启动脚本（Windows）

```bash
# 双击运行
run-shorts-test.bat

# 或命令行
node test-shorts-optimizer.js viral education
```

#### 2.2 直接测试

```bash
# 爆款发现 + 教育类
node test-shorts-optimizer.js viral education

# 潜力挖掘 + 科技类
node test-shorts-optimizer.js potential tech

# 蓝海机会 + 商业类
node test-shorts-optimizer.js blueOcean business
```

---

## 🎯 三大预设模式详解

### 🔥 Viral（爆款发现）

**适用场景：** 快速找到已验证的爆款内容

**筛选条件：**
- 播放数：≥ 100,000
- 互动率：≥ 5%
- 发布时间：≤ 7天
- 订阅数：1K - 10M

**推荐类别：** education, tech, business

**示例：**
```typescript
{
  preset: 'viral',
  category: 'education',
  maxResults: 30
}
```

---

### 🚀 Potential（潜力挖掘）

**适用场景：** 发现早期高潜力内容

**筛选条件：**
- 播放数：≥ 10,000
- 互动率：≥ 8%（高）
- 发布时间：≤ 3天（新鲜）
- 订阅数：500 - 50K

**推荐类别：** education, tech, quickKnowledge

**示例：**
```typescript
{
  preset: 'potential',
  category: 'tech',
  customKeywords: ['ChatGPT', 'AI tutorial']
}
```

---

### 🌊 BlueOcean（蓝海机会）

**适用场景：** 寻找低竞争高价值领域

**筛选条件：**
- 播放数：≥ 5,000
- 互动率：≥ 10%（极高）
- 发布时间：≤ 2天（最新）
- 订阅数：100 - 10K

**推荐类别：** education, business, lifestyle

**示例：**
```typescript
{
  preset: 'blueOcean',
  category: 'business',
  customKeywords: ['startup tips', 'founder advice']
}
```

---

## 📊 数据流程

```
前端/API调用
    ↓
POST /api/viral-discovery/shorts-optimized
    ↓
创建 crawl_job 记录
    ↓
调用 scrapeOptimizedShorts()
    ↓
Apify 开始爬取（3-5分钟）
    ↓
Webhook: POST /api/webhooks/apify-shorts
    ↓
getOptimizedShortsResults()
    ├─ 应用智能筛选
    ├─ 计算5维度评分
    └─ 排序和过滤
    ↓
批量插入 viral_videos 表
    ↓
更新 crawl_job 状态为 completed
    ↓
前端通过 Supabase Realtime 收到通知
```

---

## 🔧 前端集成示例

### React Hook

```typescript
// hooks/useShortsOptimized.ts
import { useState } from 'react';

export function useShortsOptimized() {
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<any>(null);

  const startScraping = async (options: {
    preset: 'viral' | 'potential' | 'blueOcean';
    category?: string;
    customKeywords?: string[];
    maxResults?: number;
  }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/viral-discovery/shorts-optimized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setJob(data.job);
        
        // 订阅实时更新
        subscribeToJob(data.job.id);
      }
      
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const subscribeToJob = (jobId: string) => {
    // 使用 Supabase Realtime 订阅任务状态变化
    const subscription = supabase
      .channel('crawl_jobs')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'crawl_jobs',
        filter: `id=eq.${jobId}`,
      }, (payload) => {
        setJob(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  return { startScraping, loading, job };
}
```

### 使用示例

```typescript
// components/ShortsOptimizedButton.tsx
export function ShortsOptimizedButton() {
  const { startScraping, loading, job } = useShortsOptimized();
  const [preset, setPreset] = useState<'viral' | 'potential' | 'blueOcean'>('viral');
  const [category, setCategory] = useState('education');

  const handleStart = async () => {
    await startScraping({
      preset,
      category,
      maxResults: 30,
    });
  };

  return (
    <div>
      <select value={preset} onChange={(e) => setPreset(e.target.value as any)}>
        <option value="viral">🔥 爆款发现</option>
        <option value="potential">🚀 潜力挖掘</option>
        <option value="blueOcean">🌊 蓝海机会</option>
      </select>

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="education">📚 教育</option>
        <option value="tech">💻 科技</option>
        <option value="business">💼 商业</option>
        <option value="lifestyle">🏡 生活</option>
        <option value="quickKnowledge">💡 快速知识</option>
      </select>

      <button onClick={handleStart} disabled={loading}>
        {loading ? '爬取中...' : '开始爬取'}
      </button>

      {job && (
        <div>
          <p>状态: {job.status}</p>
          <p>预计: {job.estimatedTime}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📈 数据库变化

新优化器使用现有的数据库结构，但在 `metadata` 字段中添加了额外信息：

```typescript
// crawl_jobs.metadata
{
  optimizationType: 'shorts-optimized',
  preset: 'viral',
  category: 'education',
  filterConfig: { /* 筛选配置 */ },
  queries: ['how to', 'tutorial', ...],
  statistics: {
    totalProcessed: 100,
    passedFilter: 45,
    avgScore: 78.5,
    scoreDistribution: {
      high: 15,    // ≥80分
      medium: 20,  // 70-79分
      low: 10      // <70分
    }
  }
}

// viral_videos.metadata
{
  preset: 'viral',
  scoreBreakdown: {
    engagement: 25,
    growth: 22,
    quality: 20,
    timing: 8,
    content: 10
  },
  hashtags: [...],
  optimizationType: 'shorts-optimized'
}
```

---

## 🔄 迁移策略

### 从旧API迁移到新API

**不需要立即迁移！** 两套API可以并存。

#### 阶段1：并行运行（推荐）
```typescript
// 对于新的Shorts爬取，使用优化API
if (platform === 'youtube_shorts') {
  return fetch('/api/viral-discovery/shorts-optimized', {
    method: 'POST',
    body: JSON.stringify({
      preset: 'viral',
      category: 'education',
    }),
  });
}

// 其他平台继续使用旧API
else {
  return fetch('/api/viral-discovery/start', {
    method: 'POST',
    body: JSON.stringify({
      mode: platform,
      ...options,
    }),
  });
}
```

#### 阶段2：数据对比
- 同时运行新旧两套爬取
- 对比爆款命中率、数据质量
- 根据实际效果决定是否完全切换

#### 阶段3：完全切换
- 确认新API稳定且效果更好
- 更新所有调用点
- 保留旧API作为备份

---

## 🧪 测试清单

### API测试

```bash
# 1. 测试预设列表
curl http://localhost:3000/api/viral-discovery/shorts-optimized?action=list-presets

# 2. 测试爆款发现
curl -X POST http://localhost:3000/api/viral-discovery/shorts-optimized \
  -H "Content-Type: application/json" \
  -d '{"preset":"viral","category":"education"}'

# 3. 测试潜力挖掘
curl -X POST http://localhost:3000/api/viral-discovery/shorts-optimized \
  -H "Content-Type: application/json" \
  -d '{"preset":"potential","category":"tech"}'

# 4. 测试蓝海机会
curl -X POST http://localhost:3000/api/viral-discovery/shorts-optimized \
  -H "Content-Type: application/json" \
  -d '{"preset":"blueOcean","category":"business"}'

# 5. 查询任务状态
curl http://localhost:3000/api/viral-discovery/start?jobId=<JOB_ID>
```

### 测试脚本

```bash
# 运行测试脚本
node test-shorts-optimizer.js viral education

# 预期输出：
# ✅ 启动爬取任务
# ✅ 返回任务ID
# ✅ 显示预计时间
# ✅ 3-5分钟后完成
# ✅ 显示Top 10高分视频
# ✅ 显示统计信息
```

---

## 🐛 故障排除

### 问题1：Webhook未收到回调

**症状：** 任务卡在 `processing` 状态

**检查：**
```bash
# 1. 检查Webhook URL是否正确
echo $NEXT_PUBLIC_APP_URL

# 2. 检查Apify Run状态
# 访问 Apify Console

# 3. 检查Webhook Secret
echo $APIFY_WEBHOOK_SECRET
```

**解决：**
- 确保 `NEXT_PUBLIC_APP_URL` 是公网可访问的
- 本地测试使用 ngrok 或 localtunnel
- 检查中间件是否拦截了 `/api/webhooks/*`

---

### 问题2：数据未保存到数据库

**症状：** Webhook收到了，但 `viral_videos` 表为空

**检查：**
```sql
-- 检查任务状态
SELECT * FROM crawl_jobs WHERE apify_run_id = 'xxx';

-- 检查是否有错误
SELECT error_message FROM crawl_jobs WHERE id = 'xxx';
```

**解决：**
- 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否配置
- 检查RLS策略是否正确
- 查看服务器日志获取详细错误

---

### 问题3：评分算法返回NaN

**症状：** `viral_score` 为 `null` 或 `NaN`

**原因：** Apify返回的数据字段不匹配

**解决：**
- 检查 `getOptimizedShortsResults()` 的字段映射
- 打印第一个视频的原始数据结构
- 更新字段映射逻辑

---

## 📚 相关文档

- [优化器详细文档](./YOUTUBE_SHORTS_OPTIMIZATION.md)
- [更新总结](./SHORTS_OPTIMIZATION_SUMMARY.md)
- [API文档](./API.md)
- [故障排除](./TROUBLESHOOTING.md)

---

## 💡 最佳实践

### 1. 预设选择

```
内容类型        推荐预设        推荐类别
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
快速爆款        viral          education
长期布局        potential      tech
小众蓝海        blueOcean      business
```

### 2. 关键词策略

```typescript
// ✅ 好的做法
{
  preset: 'viral',
  category: 'education',
  customKeywords: ['Python tutorial', 'machine learning basics']
}

// ❌ 避免
{
  preset: 'viral',
  customKeywords: ['random', 'stuff', 'content'] // 太泛了
}
```

### 3. 批量处理

```typescript
// 如果需要多个类别的数据
const categories = ['education', 'tech', 'business'];

for (const category of categories) {
  await startScraping({
    preset: 'viral',
    category,
    maxResults: 20,
  });
  
  // 等待5分钟避免API限流
  await sleep(300000);
}
```

---

## 🎉 总结

新的YouTube Shorts优化器已完全整合到现有系统中：

✅ **新API路由**：`/api/viral-discovery/shorts-optimized`  
✅ **Webhook处理**：`/api/webhooks/apify-shorts`  
✅ **向后兼容**：旧API继续工作  
✅ **测试脚本**：完整的测试工具  
✅ **文档齐全**：详细的使用指南

**立即开始使用！** 🚀

---

<div align="center">

**最后更新：** 2025-11-20  
**版本：** 1.0.0  
**作者：** Jilo.ai Team

[返回主文档](../README.md)

</div>
