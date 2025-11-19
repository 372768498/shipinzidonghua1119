# 🚀 部署指南

本文档提供 Jilo.ai 完整的生产环境部署步骤。

## 📋 目录

- [前置要求](#前置要求)
- [Supabase部署](#supabase部署)
- [Vercel部署](#vercel部署)
- [环境变量配置](#环境变量配置)
- [数据库迁移](#数据库迁移)
- [安全配置](#安全配置)
- [监控设置](#监控设置)
- [部署检查清单](#部署检查清单)

---

## 前置要求

### 必需的账号

- ✅ [Supabase](https://supabase.com) 账号 (Free tier可用)
- ✅ [Vercel](https://vercel.com) 账号 (Hobby tier可用，Pro推荐)
- ✅ [Apify](https://apify.com) 账号 (需要付费套餐)
- ✅ [FAL.AI](https://fal.ai) 账号 (按需付费)
- ✅ [Google Cloud Platform](https://console.cloud.google.com) 账号 (用于YouTube API)
- ✅ [Stripe](https://stripe.com) 账号 (用于支付)

### 本地开发工具

```bash
# Node.js 18.17+
node --version

# pnpm (推荐)
npm install -g pnpm

# Supabase CLI
npm install -g supabase

# Vercel CLI (可选)
npm install -g vercel
```

---

## Supabase部署

### 1. 创建Supabase项目

1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `jilo-ai-production`
   - Database Password: 生成强密码并保存
   - Region: 选择离用户最近的区域
   - Pricing Plan: 选择合适的套餐

### 2. 获取连接信息

进入 **Project Settings** → **API**，复制：
- Project URL: `https://xxxxx.supabase.co`
- `anon` public key
- `service_role` secret key (⚠️ 保密)

### 3. 配置数据库

#### 启用必要扩展

```sql
-- 在 SQL Editor 中执行
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";
```

#### 执行迁移

```bash
# 克隆仓库
git clone https://github.com/372768498/shipinzidonghua1119.git
cd shipinzidonghua1119

# 安装依赖
pnpm install

# 链接Supabase项目
supabase link --project-ref your-project-ref

# 运行迁移
supabase db push
```

或手动执行：

1. 进入 **SQL Editor**
2. 依次执行 `supabase/migrations/` 下的所有文件：
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_atomic_quota.sql`
   - `004_storage_config.sql`
   - `005_auto_cleanup.sql`
   - `006_content_moderation.sql`

### 4. 配置Storage

进入 **Storage** → **Create bucket**:

- Bucket name: `videos`
- Public bucket: ✅ Enabled
- File size limit: `104857600` (100MB)
- Allowed MIME types: `video/mp4,video/webm,image/jpeg,image/png`

### 5. 设置Cron Jobs

进入 **Database** → **Cron Jobs** → **Create cron job**:

```sql
-- 每小时清理僵尸任务
SELECT cron.schedule(
  'cleanup-zombie-jobs',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xxxxx.supabase.co/functions/v1/cleanup-zombie-jobs',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);

-- 每天凌晨3点清理过期数据
SELECT cron.schedule(
  'daily-data-cleanup',
  '0 3 * * *',
  $$
  SELECT cleanup_expired_data();
  $$
);
```

### 6. 部署Edge Functions

```bash
# 部署清理函数
supabase functions deploy cleanup-zombie-jobs

# 设置环境变量
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
```

---

## Vercel部署

### 1. 连接GitHub仓库

1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库 `372768498/shipinzidonghua1119`
3. 配置项目：
   - Framework Preset: **Next.js**
   - Root Directory: `./` (默认)
   - Build Command: `pnpm build` (默认)
   - Output Directory: `.next` (默认)

### 2. 配置环境变量

在 Vercel Dashboard → **Settings** → **Environment Variables** 添加：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Service Role密钥

# API密钥
APIFY_API_TOKEN=your_token
GEMINI_API_KEY=your_key
FAL_KEY=your_key

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_OAUTH_REDIRECT_URI=https://yourdomain.com/api/youtube/oauth/callback

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 安全密钥
APIFY_WEBHOOK_SECRET=随机生成的32字节hex
FAL_WEBHOOK_SECRET=随机生成的32字节hex
ENCRYPTION_KEY=随机生成的32字节hex (64个字符)

# 应用URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. 生成安全密钥

```bash
# 在本地运行
node -e "console.log('APIFY_WEBHOOK_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('FAL_WEBHOOK_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# 复制输出到Vercel环境变量
```

### 4. 部署

```bash
# 方式1：通过Git推送
git push origin main  # Vercel会自动部署

# 方式2：使用Vercel CLI
vercel --prod
```

### 5. 配置自定义域名

1. **Settings** → **Domains**
2. 添加自定义域名（如 `jilo.ai`）
3. 配置DNS记录：
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

---

## 环境变量配置

### Google Cloud Platform (YouTube API)

1. 访问 https://console.cloud.google.com
2. 创建新项目
3. 启用 **YouTube Data API v3**
4. 创建 OAuth 2.0 凭据：
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     https://yourdomain.com/api/youtube/oauth/callback
     http://localhost:3000/api/youtube/oauth/callback (开发环境)
     ```
5. 复制 Client ID 和 Client Secret

### Stripe Webhooks

1. 进入 Stripe Dashboard → **Developers** → **Webhooks**
2. 点击 **Add endpoint**
3. Endpoint URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
4. 选择事件：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. 复制 **Signing secret**

---

## 安全配置

### 1. CORS配置

在 `next.config.js` 中：

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        ],
      },
    ]
  },
}
```

### 2. 内容安全策略 (CSP)

```javascript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: *.supabase.co;
  media-src 'self' *.supabase.co;
  connect-src 'self' *.supabase.co *.stripe.com;
  font-src 'self';
`
```

### 3. 速率限制

使用 Vercel 的 Rate Limiting (Pro计划):

```javascript
// vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024,
      "rateLimit": {
        "limit": 100,
        "window": "1m"
      }
    }
  }
}
```

---

## 监控设置

### 1. Vercel Analytics

在 `app/layout.tsx` 添加：

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Sentry错误监控

```bash
pnpm add @sentry/nextjs

# 初始化
npx @sentry/wizard -i nextjs
```

配置环境变量：
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
SENTRY_AUTH_TOKEN=your_auth_token
```

### 3. Supabase日志

查看实时日志：
**Database** → **Logs** → 选择 **API**, **Database**, **Functions**

---

## 部署检查清单

### 部署前

- [ ] 所有环境变量已配置
- [ ] 数据库迁移已执行
- [ ] RLS策略已启用
- [ ] Storage已配置
- [ ] Cron Jobs已设置
- [ ] 安全密钥已生成
- [ ] Webhook URLs已更新

### 部署后

- [ ] 应用可正常访问
- [ ] 用户注册/登录功能正常
- [ ] 爬取功能测试通过
- [ ] 视频生成功能测试通过
- [ ] YouTube上传功能测试通过
- [ ] Stripe支付测试通过
- [ ] Webhook接收正常
- [ ] 实时更新正常工作
- [ ] 监控和日志正常

### 安全检查

- [ ] RLS策略限制用户只能看自己的数据
- [ ] Webhook有Secret验证
- [ ] Token已加密存储
- [ ] CORS配置正确
- [ ] CSP已设置
- [ ] 速率限制已启用
- [ ] 内容审查已启用

---

## 故障排查

### 常见问题

#### 1. Webhook不触发

```bash
# 检查Webhook URL
echo $NEXT_PUBLIC_APP_URL

# 确保middleware.ts排除了/api/webhooks

# 查看Vercel日志
vercel logs
```

#### 2. 数据库连接失败

```bash
# 测试连接
psql $DATABASE_URL

# 检查RLS策略
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

#### 3. 视频上传失败

```bash
# 检查Storage配置
# Supabase Dashboard → Storage → videos → Settings

# 确认MIME类型允许video/mp4
```

---

## 生产环境优化

### 1. 性能优化

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  swcMinify: true,
}
```

### 2. 缓存策略

```typescript
// app/api/videos/route.ts
export const revalidate = 60 // 60秒缓存
```

### 3. 数据库索引

```sql
-- 添加性能索引
CREATE INDEX IF NOT EXISTS idx_videos_user_status 
  ON generated_videos(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status
  ON crawl_jobs(status, created_at DESC);
```

---

## 扩展指南

### 升级到Pro计划

**Vercel Pro ($20/月):**
- 无限带宽
- 300s函数超时
- 高级分析
- 优先支持

**Supabase Pro ($25/月):**
- 8GB数据库
- 100GB带宽
- 50GB Storage
- 每日备份

### 水平扩展

- 使用Read Replicas分散查询负载
- 启用Supabase的Connection Pooler
- 考虑Redis缓存热数据

---

**部署支持:** 如遇问题，请查看 [故障排查文档](./TROUBLESHOOTING.md) 或提交 Issue。
