# 💻 开发最佳实践 (Development Best Practices)

> **文档目的**: Jilo.ai项目的开发规范、工作流程和最佳实践指南  
> **创建日期**: 2024-11-19  
> **维护者**: 技术团队

---

## 📋 目录

1. [代码规范](#代码规范)
2. [Git工作流程](#git工作流程)
3. [测试策略](#测试策略)
4. [部署流程](#部署流程)
5. [团队协作](#团队协作)
6. [常用代码片段](#常用代码片段)

---

## 代码规范

### TypeScript规范

#### 命名规范

```typescript
// ✅ 好的命名
// 文件名: kebab-case
video-generation-service.ts
user-quota-manager.ts

// 类型/接口: PascalCase
interface VideoGenerationTask {
  id: string;
  userId: string;
  status: TaskStatus;
}

type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 函数: camelCase
async function generateVideo(prompt: string): Promise<Video> {
  // ...
}

// 常量: UPPER_SNAKE_CASE
const MAX_VIDEO_DURATION = 60;
const DEFAULT_AI_MODEL = 'fal-ai/minimax-video';

// 私有变量: _camelCase
class VideoService {
  private _apiKey: string;
  
  private async _callAPI() {
    // ...
  }
}
```

#### 类型安全

```typescript
// ❌ 避免使用any
function processData(data: any) {
  return data.something;
}

// ✅ 使用具体类型
interface VideoData {
  id: string;
  url: string;
  duration: number;
}

function processData(data: VideoData): string {
  return data.url;
}

// ✅ 使用泛型
function fetchData<T>(endpoint: string): Promise<T> {
  return fetch(endpoint).then(r => r.json());
}

// ✅ 使用类型守卫
function isVideo(data: unknown): data is VideoData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'url' in data &&
    'duration' in data
  );
}
```

#### 错误处理

```typescript
// ❌ 不好的错误处理
async function generateVideo(prompt: string) {
  const result = await fal.generate(prompt);
  return result;
}

// ✅ 完善的错误处理
class VideoGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'VideoGenerationError';
  }
}

async function generateVideo(prompt: string): Promise<Video> {
  try {
    const result = await fal.generate(prompt);
    
    if (!result.video_url) {
      throw new VideoGenerationError(
        'Video URL missing from response',
        'MISSING_VIDEO_URL',
        result
      );
    }
    
    return {
      id: result.request_id,
      url: result.video_url,
      duration: result.duration
    };
    
  } catch (error) {
    if (error instanceof VideoGenerationError) {
      throw error;
    }
    
    // 包装未知错误
    throw new VideoGenerationError(
      'Failed to generate video',
      'GENERATION_FAILED',
      { originalError: error, prompt }
    );
  }
}
```

#### 异步代码规范

```typescript
// ❌ 避免：回调地狱
function processVideo(id: string, callback: Function) {
  getVideo(id, (video) => {
    analyzeVideo(video, (analysis) => {
      saveAnalysis(analysis, (result) => {
        callback(result);
      });
    });
  });
}

// ✅ 使用 async/await
async function processVideo(id: string): Promise<AnalysisResult> {
  const video = await getVideo(id);
  const analysis = await analyzeVideo(video);
  const result = await saveAnalysis(analysis);
  return result;
}

// ✅ 并发处理
async function processMultipleVideos(ids: string[]): Promise<Video[]> {
  // 全部并发
  const videos = await Promise.all(
    ids.map(id => getVideo(id))
  );
  
  return videos;
}

// ✅ 批量处理（控制并发数）
async function processBatch(
  ids: string[], 
  concurrency: number = 5
): Promise<Video[]> {
  const results: Video[] = [];
  
  for (let i = 0; i < ids.length; i += concurrency) {
    const batch = ids.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(id => getVideo(id))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

---

### React/Next.js规范

#### 组件规范

```typescript
// ✅ 好的组件结构
import { useState, useEffect, useCallback } from 'react';
import { VideoGenerationTask } from '@/types';

interface VideoCardProps {
  task: VideoGenerationTask;
  onRetry?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

export function VideoCard({ 
  task, 
  onRetry, 
  onDelete 
}: VideoCardProps) {
  // 1. Hooks
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. 事件处理器
  const handleRetry = useCallback(() => {
    setIsLoading(true);
    onRetry?.(task.id);
  }, [task.id, onRetry]);
  
  // 3. 副作用
  useEffect(() => {
    // cleanup
    return () => {
      // ...
    };
  }, []);
  
  // 4. 条件渲染
  if (task.status === 'processing') {
    return <VideoLoadingSkeleton />;
  }
  
  // 5. 主渲染
  return (
    <div className="video-card">
      <video src={task.video_url} controls />
      <div className="actions">
        <button onClick={handleRetry} disabled={isLoading}>
          Retry
        </button>
        <button onClick={() => onDelete?.(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
```

#### Hooks使用规范

```typescript
// ✅ 自定义Hook
function useVideoGeneration(userId: string) {
  const [tasks, setTasks] = useState<VideoGenerationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getVideoTasks(userId);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const generateVideo = useCallback(async (prompt: string) => {
    const newTask = await api.generateVideo({ userId, prompt });
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [userId]);
  
  return { tasks, loading, error, generateVideo, refetch: fetchTasks };
}

// 使用
function VideoPage() {
  const { tasks, loading, generateVideo } = useVideoGeneration('user-123');
  
  if (loading) return <Loading />;
  
  return (
    <div>
      {tasks.map(task => (
        <VideoCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

#### API路由规范

```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { VideoGenerationService } from '@/lib/services';

// ✅ 使用Zod验证请求
const GenerateVideoSchema = z.object({
  prompt: z.string().min(10).max(500),
  model: z.enum(['minimax', 'runway', 'kling']).optional(),
  duration: z.number().min(5).max(60).optional()
});

export async function POST(request: NextRequest) {
  try {
    // 1. 认证
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. 解析并验证请求
    const body = await request.json();
    const validated = GenerateVideoSchema.parse(body);
    
    // 3. 业务逻辑
    const service = new VideoGenerationService();
    const task = await service.generateVideo({
      userId: session.user.id,
      ...validated
    });
    
    // 4. 返回响应
    return NextResponse.json({
      success: true,
      data: task
    });
    
  } catch (error) {
    // 5. 错误处理
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Generate video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### 数据库规范

#### 查询优化

```typescript
// ❌ N+1查询问题
async function getVideosWithUsers() {
  const videos = await db.videos.findMany();
  
  for (const video of videos) {
    video.user = await db.users.findOne({ id: video.userId });
  }
  
  return videos;
}

// ✅ 使用JOIN或批量查询
async function getVideosWithUsers() {
  return await db.videos.findMany({
    include: {
      user: true
    }
  });
}

// ✅ 或者手动批量查询
async function getVideosWithUsers() {
  const videos = await db.videos.findMany();
  const userIds = [...new Set(videos.map(v => v.userId))];
  const users = await db.users.findMany({
    where: { id: { in: userIds } }
  });
  
  const userMap = new Map(users.map(u => [u.id, u]));
  return videos.map(v => ({
    ...v,
    user: userMap.get(v.userId)
  }));
}
```

#### 事务处理

```typescript
// ✅ 使用事务确保数据一致性
async function createVideoAndDeductQuota(
  userId: string, 
  videoData: VideoData
) {
  return await db.$transaction(async (tx) => {
    // 1. 检查并扣除配额
    const user = await tx.users.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.quota < 1) {
      throw new Error('Insufficient quota');
    }
    
    await tx.users.update({
      where: { id: userId },
      data: { quota: { decrement: 1 } }
    });
    
    // 2. 创建视频记录
    const video = await tx.videos.create({
      data: {
        ...videoData,
        userId
      }
    });
    
    // 3. 记录配额交易
    await tx.quotaTransactions.create({
      data: {
        userId,
        amount: -1,
        type: 'video_generation',
        relatedId: video.id
      }
    });
    
    return video;
  });
}
```

---

## Git工作流程

### 分支策略

```
main (生产环境)
  ↑
  └── develop (开发环境)
        ↑
        ├── feature/video-generation (功能分支)
        ├── feature/user-dashboard (功能分支)
        ├── bugfix/webhook-error (修复分支)
        └── hotfix/security-patch (紧急修复)
```

### 分支命名规范

```bash
# 功能开发
feature/短横线分隔的功能描述
feature/add-video-watermark
feature/improve-quota-system

# Bug修复
bugfix/问题描述
bugfix/fix-webhook-timeout
bugfix/resolve-quota-race-condition

# 紧急修复（直接从main拉取）
hotfix/紧急问题描述
hotfix/security-token-encryption
hotfix/database-connection-leak
```

### Commit规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 格式
<type>(<scope>): <subject>

# 类型
feat: 新功能
fix: 修复Bug
docs: 文档更新
style: 代码格式调整（不影响功能）
refactor: 重构代码
perf: 性能优化
test: 测试相关
chore: 构建/工具相关

# 示例
feat(video): 添加视频水印功能
fix(webhook): 修复FAL.AI回调超时问题
docs(api): 更新API文档
refactor(quota): 重构配额管理系统
perf(database): 优化视频查询性能
test(auth): 添加认证模块单元测试
chore(deps): 升级Next.js到14.2
```

### Pull Request流程

```markdown
## PR标题
feat(video): Add video watermark feature

## 描述
这个PR实现了视频水印功能，允许用户在生成的视频上添加自定义水印。

## 变更内容
- [ ] 添加水印API接口
- [ ] 实现水印位置调整
- [ ] 添加单元测试
- [ ] 更新API文档

## 测试
- [x] 本地测试通过
- [x] 单元测试通过
- [ ] E2E测试通过

## 截图/演示
[可选：添加截图或GIF]

## 相关Issue
Closes #123

## 检查清单
- [x] 代码遵循项目规范
- [x] 添加了必要的测试
- [x] 文档已更新
- [x] 无新增的TypeScript错误
- [x] 已进行自我代码审查
```

---

## 测试策略

### 测试金字塔

```
       /\
      /  \  E2E Tests (少量)
     /----\
    / Unit \  Integration Tests (中等)
   /--------\
  /  Tests   \ Unit Tests (大量)
 /____________\
```

### 单元测试

```typescript
// lib/services/video-generation.test.ts
import { describe, it, expect, vi } from 'vitest';
import { VideoGenerationService } from './video-generation';

describe('VideoGenerationService', () => {
  it('should generate video successfully', async () => {
    // Arrange
    const service = new VideoGenerationService();
    const prompt = 'A beautiful sunset';
    
    // Mock FAL.AI API
    vi.mock('@/lib/fal', () => ({
      generate: vi.fn().mockResolvedValue({
        request_id: 'test-123',
        video_url: 'https://example.com/video.mp4'
      })
    }));
    
    // Act
    const result = await service.generateVideo({
      userId: 'user-123',
      prompt
    });
    
    // Assert
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('video_url');
    expect(result.status).toBe('processing');
  });
  
  it('should throw error when quota insufficient', async () => {
    // Arrange
    const service = new VideoGenerationService();
    
    vi.mock('@/lib/db', () => ({
      rpc: vi.fn().mockResolvedValue(false)
    }));
    
    // Act & Assert
    await expect(
      service.generateVideo({
        userId: 'user-123',
        prompt: 'test'
      })
    ).rejects.toThrow('Insufficient quota');
  });
});
```

### 集成测试

```typescript
// app/api/generate/route.test.ts
import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('POST /api/generate', () => {
  it('should return 401 without authentication', async () => {
    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' })
    });
    
    const response = await POST(request);
    expect(response.status).toBe(401);
  });
  
  it('should validate request body', async () => {
    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: {
        'Cookie': 'session=valid-session'
      },
      body: JSON.stringify({ prompt: 'short' }) // 太短
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const body = await response.json();
    expect(body.error).toBe('Invalid request');
  });
});
```

### E2E测试

```typescript
// e2e/video-generation.spec.ts
import { test, expect } from '@playwright/test';

test('complete video generation flow', async ({ page }) => {
  // 1. 登录
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // 2. 导航到生成页面
  await page.goto('/generate');
  
  // 3. 输入Prompt
  await page.fill('[name="prompt"]', 'A beautiful sunset over the ocean');
  
  // 4. 选择模型
  await page.selectOption('[name="model"]', 'minimax');
  
  // 5. 开始生成
  await page.click('button:has-text("Generate Video")');
  
  // 6. 等待生成完成（最多3分钟）
  await expect(page.locator('.video-player')).toBeVisible({ 
    timeout: 180000 
  });
  
  // 7. 验证视频可以播放
  const videoElement = page.locator('video');
  await expect(videoElement).toHaveAttribute('src', /^https:\/\//);
});
```

---

## 部署流程

### 环境配置

```bash
# .env.local (开发环境)
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# .env.production (生产环境)
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://jilo.ai
```

### 部署前检查清单

```markdown
## 代码质量
- [ ] 所有测试通过
- [ ] ESLint无错误
- [ ] TypeScript编译通过
- [ ] 代码已经过审查

## 功能验证
- [ ] 新功能在staging环境测试通过
- [ ] 回归测试通过
- [ ] 性能测试通过

## 安全检查
- [ ] 敏感信息未硬编码
- [ ] API密钥已加密
- [ ] 新增的RLS策略已测试

## 文档
- [ ] API文档已更新
- [ ] CHANGELOG已更新
- [ ] 部署说明已更新

## 监控
- [ ] 错误追踪已配置
- [ ] 性能监控已配置
- [ ] 告警规则已设置
```

### 部署步骤

```bash
# 1. 拉取最新代码
git checkout main
git pull origin main

# 2. 安装依赖
npm install

# 3. 运行测试
npm run test
npm run test:e2e

# 4. 构建生产版本
npm run build

# 5. 部署到Vercel
vercel --prod

# 6. 验证部署
curl https://jilo.ai/api/health
```

### 回滚流程

```bash
# 快速回滚到上一个版本
vercel rollback

# 或者指定版本
vercel rollback [deployment-url]

# 验证回滚
curl https://jilo.ai/api/health
```

---

## 团队协作

### 代码审查指南

#### 审查者检查清单

```markdown
## 代码质量
- [ ] 代码逻辑清晰易懂
- [ ] 命名规范恰当
- [ ] 没有重复代码
- [ ] 错误处理完善

## 功能完整性
- [ ] 实现了PR描述的所有功能
- [ ] 边界情况已处理
- [ ] 性能考虑合理

## 测试
- [ ] 单元测试覆盖充分
- [ ] 测试用例有意义
- [ ] 手动测试通过

## 安全
- [ ] 无SQL注入风险
- [ ] 输入验证充分
- [ ] 认证授权正确

## 文档
- [ ] 复杂逻辑有注释
- [ ] API文档已更新
- [ ] README如需要已更新
```

#### 审查评论规范

```markdown
# ✅ 好的评论
## 💡 建议
这里可以使用`Promise.all`并发处理，提升性能：
\`\`\`typescript
const results = await Promise.all(
  items.map(item => processItem(item))
);
\`\`\`

## ⚠️ 问题
这里可能有内存泄露风险，useEffect缺少cleanup：
\`\`\`typescript
useEffect(() => {
  const subscription = api.subscribe();
  return () => subscription.unsubscribe(); // 添加这行
}, []);
\`\`\`

## ❓ 疑问
为什么这里需要setTimeout？有其他更好的方案吗？

# ❌ 不好的评论
"代码很烂"
"这样不行"
"改一下"
```

### 知识分享

#### 技术分享会

```markdown
## 每周技术分享 (周五下午)

### 主题示例
- Week 1: Next.js 14新特性解析
- Week 2: 如何优化数据库查询
- Week 3: Webhook安全最佳实践
- Week 4: React性能优化技巧

### 格式
- 时长: 30-45分钟
- 形式: 演示 + Q&A
- 输出: 文档 + 代码示例
```

---

## 常用代码片段

### API错误处理包装器

```typescript
// lib/utils/api-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export function apiHandler<T extends z.ZodType>(
  schema: T,
  handler: (
    data: z.infer<T>,
    req: NextRequest
  ) => Promise<unknown>
) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validated = schema.parse(body);
      const result = await handler(validated, req);
      
      return NextResponse.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }
      
      console.error('API error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// 使用
export const POST = apiHandler(
  z.object({ prompt: z.string() }),
  async (data, req) => {
    return await generateVideo(data.prompt);
  }
);
```

### 重试机制

```typescript
// lib/utils/retry.ts
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError!;
}

// 使用
const video = await retry(
  () => fal.generate(prompt),
  { maxAttempts: 3, delay: 2000 }
);
```

### 批量处理工具

```typescript
// lib/utils/batch.ts
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<R[]> {
  const { batchSize = 10, onProgress } = options;
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);
    
    onProgress?.(Math.min(i + batchSize, items.length), items.length);
  }
  
  return results;
}

// 使用
await processBatch(
  videoIds,
  async (id) => await processVideo(id),
  {
    batchSize: 5,
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed}/${total}`);
    }
  }
);
```

### 类型安全的环境变量

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  FAL_API_KEY: z.string().min(1),
  
  // Optional with defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MAX_VIDEO_DURATION: z.coerce.number().default(60),
});

export const env = envSchema.parse(process.env);

// 使用 - 自动补全 + 类型检查
import { env } from '@/lib/env';

const apiKey = env.FAL_API_KEY; // ✅ 类型安全
const timeout = env.MAX_VIDEO_DURATION; // ✅ 自动补全
```

---

<div align="center">

**文档版本**: V1.0  
**最后更新**: 2024-11-19  

[返回目录](../README.md) | [查看ADR](./ADR.md) | [查看故障排除](./TROUBLESHOOTING.md)

</div>
