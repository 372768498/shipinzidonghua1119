# 🐛 TECHNICAL_DEBT - 技术债务清单

> **目的**: 系统化跟踪和管理技术债务  
> **更新时间**: 2024-11-21  
> **总债务**: 23项 (🔴高5 | 🟡中8 | 🟢低10)

---

## 📊 债务总览

### 按优先级分类
- 🔴 **高优先级** (Critical): 5项 - 影响核心功能或安全
- 🟡 **中优先级** (Important): 8项 - 影响用户体验或开发效率
- 🟢 **低优先级** (Nice-to-have): 10项 - 可延后处理

### 按类别分类
- 🏗️ **架构**: 6项
- 🔐 **安全**: 3项
- 💾 **数据**: 4项
- 🎨 **前端**: 5项
- ⚙️ **API**: 3项
- 📝 **文档**: 2项

---

## 🔴 高优先级债务 (Critical)

### 1. 所有API都是Mock数据
**类别**: ⚙️ API  
**影响**: 🔴 Critical - 无法正常运行生产环境

**现状**:
- `/api/discover/*` - 使用Mock数据
- `/api/generate/*` - 完全Mock
- `/api/dashboard/*` - Mock统计
- `/api/monitoring/*` - Mock任务

**问题**:
- 用户无法看到真实数据
- 无法执行实际操作
- 演示环境受限

**解决方案**:
```typescript
// 需要集成的真实服务:
1. Apify API - 爬虫服务
2. Google Gemini - AI分析
3. FAL.AI - 视频生成
4. YouTube Data API - 发布服务
5. Supabase - 数据存储
```

**预计工时**: 5-7天  
**优先级理由**: MVP核心功能，必须完成  
**计划Sprint**: Sprint 2 (本周)

---

### 2. 无用户认证系统
**类别**: 🔐 安全  
**影响**: 🔴 Critical - 所有页面公开访问

**现状**:
- 登录页仅为演示UI
- 没有Session管理
- 没有权限控制
- 没有用户配额限制

**问题**:
- 任何人都能访问dashboard
- 无法区分用户
- 无法计费或限流

**解决方案**:
```typescript
// 选项1: NextAuth.js (推荐)
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// 选项2: Supabase Auth
import { createClient } from '@supabase/supabase-js'
```

**预计工时**: 2-3天  
**优先级理由**: 安全基础，上线必备  
**计划Sprint**: Sprint 3

---

### 3. 无统一错误处理
**类别**: 🏗️ 架构  
**影响**: 🔴 Critical - 影响稳定性和调试

**现状**:
- 各个组件独立处理错误
- 没有全局Error Boundary
- API错误处理不一致
- 缺少错误日志系统

**问题**:
```typescript
// 当前做法（❌ 不一致）
try {
  await fetch('/api/...')
} catch (e) {
  alert('失败') // 有些用alert
  console.error(e) // 有些只console
  // 有些什么都不做
}
```

**解决方案**:
```typescript
// 创建统一错误处理系统
// 1. 全局Error Boundary
export function GlobalErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logErrorToService}
    >
      {children}
    </ErrorBoundary>
  )
}

// 2. API错误处理中间件
export async function apiCall(url, options) {
  try {
    const res = await fetch(url, options)
    if (!res.ok) throw new ApiError(res)
    return res.json()
  } catch (error) {
    handleError(error)
    throw error
  }
}

// 3. 错误日志服务（Sentry/LogRocket）
Sentry.captureException(error)
```

**预计工时**: 2天  
**优先级理由**: 影响所有功能，越早越好  
**计划Sprint**: Sprint 2

---

### 4. 旧文件未清理
**类别**: 🏗️ 架构  
**影响**: 🔴 Medium-High - 可能导致路由冲突

**现状**:
```
⚠️ 废弃文件（需删除）:
app/discover/page.tsx         # 已迁移到 dashboard/
app/monitoring/page.tsx       # 已迁移到 dashboard/
```

**问题**:
- Next.js可能同时匹配两个路由
- 增加bundle大小
- 维护混乱

**解决方案**:
```bash
# 立即执行
rm -rf app/discover
rm -rf app/monitoring
git add -A
git commit -m "chore: remove old directories after route restructure"
```

**预计工时**: 5分钟  
**优先级理由**: 简单但重要，避免未来问题  
**计划Sprint**: 立即执行 ⚡

---

### 5. 前端类型不统一
**类别**: 🎨 前端  
**影响**: 🔴 Medium - 维护困难，容易出bug

**现状**:
```typescript
// Gemini生成的UI使用自己的类型 ❌
interface Video {
  id: string
  title: string
  // ... 自定义字段
}

// 但contracts中已经定义了 ✅
import { ViralVideo } from '@/contracts/discover.contract'
```

**问题**:
- 类型定义重复
- 修改contract后UI不同步
- TypeScript检查不生效

**解决方案**:
```typescript
// 统一使用contracts中的类型
import { ViralVideo } from '@/contracts/discover.contract'
import { GenerateTask } from '@/contracts/generate.contract'

// 页面直接使用
const [videos, setVideos] = useState<ViralVideo[]>([])
```

**预计工时**: 1天（重构现有页面）  
**优先级理由**: 越早统一越容易维护  
**计划Sprint**: Sprint 2

---

## 🟡 中优先级债务 (Important)

### 6. 无Loading状态统一管理
**类别**: 🎨 前端  
**影响**: 🟡 Medium - 用户体验差

**现状**:
- 有些API调用有loading
- 有些直接显示空白
- Loading样式不统一

**解决方案**:
```typescript
// 创建统一Loading组件
export function LoadingState({ size = 'md' }) {
  return <Spinner size={size} />
}

// 使用Suspense
<Suspense fallback={<LoadingState />}>
  <VideoList />
</Suspense>
```

**预计工时**: 1天  
**计划Sprint**: Sprint 3

---

### 7. 无数据持久化策略
**类别**: 💾 数据  
**影响**: 🟡 Medium - 用户体验差

**现状**:
```typescript
// 所有state都在内存中
const [videos, setVideos] = useState([])
// 刷新页面 → 数据丢失 ❌
```

**问题**:
- 用户刷新页面丢失筛选条件
- 表单数据不保存
- 无缓存机制

**解决方案**:
```typescript
// 选项1: localStorage
useLocalStorage('filters', initialFilters)

// 选项2: React Query + 缓存
const { data } = useQuery('videos', fetchVideos, {
  staleTime: 5 * 60 * 1000 // 5分钟缓存
})

// 选项3: Zustand全局状态
import create from 'zustand'
import { persist } from 'zustand/middleware'
```

**预计工时**: 2天  
**计划Sprint**: Sprint 3

---

### 8. API响应格式不统一
**类别**: ⚙️ API  
**影响**: 🟡 Medium - 前端处理复杂

**现状**:
```typescript
// 有些API返回
{ success: true, data: [...] }

// 有些返回
{ success: true, videos: [...], total: 10 }

// 有些直接返回
{ videos: [...] }
```

**解决方案**:
```typescript
// 定义统一响应格式
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    total?: number
    page?: number
  }
}
```

**预计工时**: 1天  
**计划Sprint**: Sprint 2

---

### 9. 缺少组件库
**类别**: 🎨 前端  
**影响**: 🟡 Medium - 重复造轮子

**现状**:
- 每个页面自己写Button、Input等
- 样式不一致
- 无法复用

**解决方案**:
```typescript
// 选项1: 使用shadcn/ui (推荐)
npx shadcn-ui@latest init

// 选项2: 创建自己的组件库
components/ui/
  ├── button.tsx
  ├── input.tsx
  ├── card.tsx
  └── ...
```

**预计工时**: 3天  
**计划Sprint**: Sprint 3

---

### 10. 缺少API速率限制
**类别**: 🔐 安全  
**影响**: 🟡 Medium - 成本和滥用风险

**现状**:
- 没有限流
- 用户可以无限调用API
- 没有成本控制

**解决方案**:
```typescript
// Vercel Edge Config + Upstash Redis
import { Ratelimit } from "@upstash/ratelimit"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})

// 在API中使用
const { success } = await ratelimit.limit(ip)
if (!success) return new Response('Too Many Requests', { status: 429 })
```

**预计工时**: 1天  
**计划Sprint**: Sprint 4

---

### 11. 没有分析埋点
**类别**: 📊 监控  
**影响**: 🟡 Medium - 无法优化

**现状**:
- 不知道用户怎么使用产品
- 无法追踪转化率
- 无法发现问题

**解决方案**:
```typescript
// 集成分析工具
// 选项1: Google Analytics 4
import { gtag } from 'lib/gtag'

// 选项2: Mixpanel
import mixpanel from 'mixpanel-browser'

// 选项3: PostHog (开源)
import posthog from 'posthog-js'
```

**预计工时**: 1天  
**计划Sprint**: Sprint 4

---

### 12. 环境变量管理混乱
**类别**: 🏗️ 架构  
**影响**: 🟡 Medium - 安全风险

**现状**:
```typescript
// 有些hard-coded
const API_KEY = "sk-abc123..." // ❌

// 有些用process.env
process.env.NEXT_PUBLIC_API_KEY // ⚠️

// 没有验证
```

**解决方案**:
```typescript
// 1. 使用 zod 验证环境变量
import { z } from 'zod'

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),
  FAL_API_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)

// 2. 创建 .env.example
GEMINI_API_KEY=your_key_here
FAL_API_KEY=your_key_here
```

**预计工时**: 0.5天  
**计划Sprint**: Sprint 2

---

### 13. 缺少E2E测试
**类别**: 🧪 测试  
**影响**: 🟡 Medium - 回归风险高

**现状**:
- 测试覆盖率: 0%
- 全靠手动测试
- 容易引入回归bug

**解决方案**:
```typescript
// 使用 Playwright
import { test, expect } from '@playwright/test'

test('user can create video generation task', async ({ page }) => {
  await page.goto('/dashboard/generate')
  await page.fill('textarea', 'A beautiful sunset')
  await page.click('button:has-text("立即生成")')
  await expect(page.locator('.task-card')).toBeVisible()
})
```

**预计工时**: 3天（设置+关键路径测试）  
**计划Sprint**: Sprint 5

---

## 🟢 低优先级债务 (Nice-to-have)

### 14. 无国际化支持
**类别**: 🎨 前端  
**影响**: 🟢 Low - 目前只针对中文市场

**现状**:
- 所有文案hard-coded中文
- 无法切换语言

**解决方案**:
```typescript
// next-intl
import { useTranslations } from 'next-intl'

const t = useTranslations('Dashboard')
<h1>{t('welcome')}</h1>
```

**预计工时**: 5天（提取+翻译）  
**计划Sprint**: 未规划（产品决定）

---

### 15. 无暗色/亮色主题切换
**类别**: 🎨 前端  
**影响**: 🟢 Low - 有就更好

**现状**:
- 固定暗色主题
- 无法切换

**解决方案**:
```typescript
// next-themes
import { ThemeProvider } from 'next-themes'
```

**预计工时**: 1天  
**计划Sprint**: 未规划

---

### 16. 性能优化未做
**类别**: ⚡ 性能  
**影响**: 🟢 Low - 目前流量小

**待优化项**:
- 图片未优化（使用Next Image）
- 无代码分割
- 无懒加载
- Bundle size大

**预计工时**: 3天  
**计划Sprint**: Sprint 6+

---

### 17-23. 其他低优先级
- 17. 无SEO优化
- 18. 无PWA支持
- 19. 无离线功能
- 20. 无数据导出
- 21. 无快捷键
- 22. 无搜索历史
- 23. 无数据可视化图表

**预计工时**: 各1-2天  
**计划Sprint**: 根据产品优先级决定

---

## 📈 偿还计划

### Sprint 2 (本周 - 核心功能)
**目标**: 完成MVP必备功能

- [ ] #1 集成真实API (5-7天) 🔴
- [ ] #3 统一错误处理 (2天) 🔴  
- [ ] #4 清理旧文件 (5分钟) 🔴
- [ ] #5 统一类型定义 (1天) 🔴
- [ ] #8 统一API响应 (1天) 🟡
- [ ] #12 环境变量管理 (0.5天) 🟡

**预计总工时**: 10天

---

### Sprint 3 (下周 - 用户体验)
**目标**: 提升用户体验和安全性

- [ ] #2 用户认证系统 (2-3天) 🔴
- [ ] #6 Loading状态管理 (1天) 🟡
- [ ] #7 数据持久化 (2天) 🟡
- [ ] #9 组件库 (3天) 🟡

**预计总工时**: 8-9天

---

### Sprint 4-5 (安全和监控)
- [ ] #10 API速率限制
- [ ] #11 分析埋点
- [ ] #13 E2E测试

---

### Sprint 6+ (优化和增强)
- 性能优化
- SEO
- 国际化
- 其他低优先级功能

---

## 🎯 关键指标

**当前状态**:
- 🔴 高优先级: 5/5 未解决
- 🟡 中优先级: 8/8 未解决
- 🟢 低优先级: 10/10 未解决
- **总计**: 23/23 未解决

**目标**:
- Sprint 2结束: 5/5 高优先级解决 ✅
- Sprint 3结束: 4/8 中优先级解决
- Sprint 5结束: 8/8 中优先级解决 ✅

---

## 💡 债务管理原则

### 1. 优先级评估
```
Critical (🔴): 影响核心功能或安全 → 必须立即处理
Important (🟡): 影响用户体验 → 2-3个Sprint内处理
Nice-to-have (🟢): 锦上添花 → 有空再说
```

### 2. 控制新债务
- 每次PR必须评估是否引入新债务
- 新债务必须记录在此文档
- 优先修复旧债务再添加新功能

### 3. 定期Review
- 每Sprint结束回顾债务清单
- 更新优先级和预计工时
- 庆祝已解决的债务 🎉

---

## 🔗 相关文档

- [PROJECT_SNAPSHOT.md](./PROJECT_SNAPSHOT.md) - 项目当前状态
- [WORKLOG.md](./WORKLOG.md) - 工作日志
- [SPRINT_PLAN.md](./SPRINT_PLAN.md) - Sprint规划

---

**最后更新**: 2024-11-21  
**下次Review**: Sprint 2结束  
**维护者**: Jilo.ai Team
