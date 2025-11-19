# 🛠️ 开发指南

本文档提供 Jilo.ai 本地开发环境搭建和开发流程。

## 📋 目录

- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [开发工作流](#开发工作流)
- [代码风格](#代码风格)
- [测试](#测试)
- [调试技巧](#调试技巧)

---

## 快速开始

### 1. 安装依赖

```bash
# 克隆仓库
git clone https://github.com/372768498/shipinzidonghua1119.git
cd shipinzidonghua1119

# 安装依赖
pnpm install

# 复制环境变量
cp .env.example .env.local
```

### 2. 配置环境变量

编辑 `.env.local`，填入必要的密钥：

```bash
# Supabase (从 https://supabase.com/dashboard 获取)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# API密钥
APIFY_API_TOKEN=your_apify_token
GEMINI_API_KEY=your_gemini_key
FAL_KEY=your_fal_key

# 生成安全密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# 复制输出到APIFY_WEBHOOK_SECRET等
```

### 3. 启动Supabase本地开发

```bash
# 启动Supabase本地服务
supabase start

# 运行迁移
supabase db reset

# 查看服务状态
supabase status
```

输出示例：
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
```

更新 `.env.local` 中的URL为本地地址。

### 4. 启动开发服务器

```bash
# 开发模式
pnpm dev

# 访问
open http://localhost:3000
```

---

## 项目结构

```
jilo-ai/
├── app/                      # Next.js 14 App Router
│   ├── (marketing)/         # 公开页面
│   │   ├── page.tsx         # 首页
│   │   └── pricing/
│   ├── (auth)/              # 认证页面
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Dashboard页面 (受保护)
│   │   ├── discover/        # 爬取页
│   │   ├── generate/        # 生成页
│   │   ├── videos/          # 视频管理
│   │   └── publish/         # 发布页
│   ├── api/                 # API路由
│   │   ├── crawl/
│   │   │   └── start/       # 启动爬取
│   │   ├── generate/
│   │   │   └── video/       # 生成视频
│   │   ├── publish/
│   │   │   └── youtube/     # 上传YouTube
│   │   └── webhooks/
│   │       ├── apify/       # Apify回调
│   │       ├── fal/         # FAL.AI回调
│   │       └── stripe/      # Stripe回调
│   ├── layout.tsx
│   └── providers.tsx        # 全局Provider
├── components/
│   ├── ui/                  # shadcn/ui组件
│   ├── dashboard/           # Dashboard组件
│   └── layout/              # 布局组件
├── lib/
│   ├── supabase/            # Supabase客户端
│   │   ├── client.ts        # 浏览器客户端
│   │   ├── server.ts        # 服务端客户端
│   │   └── middleware.ts    # 中间件客户端
│   ├── api-clients/         # 第三方API封装
│   │   ├── apify.ts
│   │   ├── gemini.ts
│   │   ├── fal.ts
│   │   └── youtube.ts
│   ├── safety/              # 安全模块
│   │   └── content-moderation.ts
│   └── utils/               # 工具函数
│       ├── crypto.ts        # 加密/解密
│       └── webhook-verify.ts
├── types/
│   ├── supabase.ts          # Supabase生成的类型
│   └── index.ts             # 自定义类型
├── supabase/
│   ├── config.toml
│   ├── migrations/          # 数据库迁移
│   └── functions/           # Edge Functions
├── middleware.ts            # Next.js中间件
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 开发工作流

### 创建新功能

```bash
# 1. 创建分支
git checkout -b feature/new-feature

# 2. 开发功能
# ...

# 3. 提交代码
git add .
git commit -m "feat: add new feature"

# 4. 推送并创建 PR
git push origin feature/new-feature
```

### Commit消息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 新功能
fix: 修复问题
docs: 文档变更
style: 代码风格调整 (不影响功能)
refactor: 重构 (不是新功能也不是修复)
perf: 性能优化
test: 测试相关
chore: 构建过程或辅助工具变动
```

### 数据库变更

```bash
# 1. 创建新迁移
supabase migration new add_new_feature

# 2. 编辑 supabase/migrations/XXXXXX_add_new_feature.sql

# 3. 应用迁移
supabase db reset  # 本地测试

# 4. 生成TypeScript类型
supabase gen types typescript --local > types/supabase.ts
```

### 添加新的API路由

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 业务逻辑
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

---

## 代码风格

### TypeScript规范

```typescript
// ✅ 好的例子
export interface User {
  id: string
  email: string
  createdAt: Date
}

export async function fetchUser(userId: string): Promise<User | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Fetch user failed:', error)
    return null
  }
}

// ❌ 避免
function fetchData(id) {  // 缺少类型
  return fetch('/api/' + id).then(r => r.json())  // 缺少错误处理
}
```

### React组件规范

```typescript
// components/VideoCard.tsx
import { Video } from '@/types'

interface VideoCardProps {
  video: Video
  onDelete?: (id: string) => void
}

export function VideoCard({ video, onDelete }: VideoCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{video.title}</h3>
      {onDelete && (
        <button onClick={() => onDelete(video.id)}>
          Delete
        </button>
      )}
    </div>
  )
}
```

### 错误处理

```typescript
// ✅ 好的错误处理
try {
  const result = await riskyOperation()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  
  if (error instanceof DatabaseError) {
    return { success: false, error: 'Database error' }
  }
  
  return { success: false, error: 'Unknown error' }
}

// ❌ 避免
try {
  riskyOperation()
} catch (e) {
  console.log(e)  // 没有处理
}
```

---

## 测试

### 单元测试 (Vitest)

```bash
# 安装
pnpm add -D vitest @testing-library/react @testing-library/jest-dom

# 运行测试
pnpm test
```

```typescript
// lib/utils/__tests__/crypto.test.ts
import { describe, it, expect } from 'vitest'
import { encrypt, decrypt } from '../crypto'

describe('Crypto Utils', () => {
  it('should encrypt and decrypt correctly', () => {
    const original = 'test-token'
    const encrypted = encrypt(original)
    const decrypted = decrypt(encrypted)
    
    expect(decrypted).toBe(original)
  })
  
  it('should throw error for invalid data', () => {
    expect(() => decrypt('invalid')).toThrow()
  })
})
```

### API测试

```bash
# 使用curl测试
curl -X POST http://localhost:3000/api/crawl/start \
  -H "Content-Type: application/json" \
  -d '{"keywords":["AI"],"platforms":["tiktok"]}'

# 使用httpie (更友好)
http POST localhost:3000/api/crawl/start keywords:='["AI"]' platforms:='["tiktok"]'
```

### E2E测试 (Playwright)

```bash
# 安装
pnpm add -D @playwright/test
px playwright install

# 运行
pnpm test:e2e
```

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('http://localhost:3000/login')
  
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

---

## 调试技巧

### Next.js调试

```bash
# 启用详细日志
DEBUG=* pnpm dev

# Node.js Inspector
node --inspect node_modules/.bin/next dev
```

### Supabase调试

```typescript
// 启用查询日志
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
  
console.log('Query result:', { data, error })
```

### Webhook调试

```bash
# 使用ngrok暴露本地服务
ngrok http 3000

# 复制https URL到Apify/FAL Webhook设置
https://xxxx.ngrok.io/api/webhooks/apify
```

### 实时日志

```typescript
// 添加详细日志
console.log('[爬取] 开始', { jobId, keywords })
console.log('[爬取] Apify响应', response)
console.log('[爬取] 完成', { videosFound: data.length })
```

### VS Code配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

## 常见问题

### 1. TypeScript类型错误

```bash
# 重新生成Supabase类型
supabase gen types typescript --local > types/supabase.ts

# 检查类型
pnpm type-check
```

### 2. Supabase连接失败

```bash
# 检查服务状态
supabase status

# 重启服务
supabase stop
supabase start
```

### 3. 环境变量不生效

```bash
# 确认.env.local存在
ls -la .env.local

# 重启开发服务器
kill $(lsof -t -i:3000)
pnpm dev
```

---

## 有用命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 运行生产版本
pnpm lint             # 代码检查
pnpm type-check       # 类型检查

# Supabase
supabase start        # 启动本地服务
supabase stop         # 停止服务
supabase status       # 查看状态
supabase db reset     # 重置数据库
supabase db push      # 推送迁移
supabase gen types typescript --local > types/supabase.ts

# 测试
pnpm test             # 运行测试
pnpm test:watch       # 监视模式
pnpm test:e2e         # E2E测试
```

---

## 延伸阅读

- [Next.js文档](https://nextjs.org/docs)
- [Supabase文档](https://supabase.com/docs)
- [TypeScript指南](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

**需要帮助？** 查看 [故障排查文档](./TROUBLESHOOTING.md) 或提交 Issue。
