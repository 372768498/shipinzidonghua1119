# 🚀 快速开始指南

> 10分钟上手Jilo.ai开发

---

## 📑 目录

1. [前置要求](#1-前置要求)
2. [克隆项目](#2-克隆项目)
3. [环境配置](#3-环境配置)
4. [数据库设置](#4-数据库设置)
5. [本地运行](#5-本地运行)
6. [第一个功能测试](#6-第一个功能测试)
7. [常见问题](#7-常见问题)

---

## 1. 前置要求

### 开发环境

- **Node.js**: >= 18.17.0
- **npm**: >= 9.0.0
- **Git**: >= 2.30.0

### 必需账号

- [x] **Supabase账号** (免费)
  - 注册: https://supabase.com
  - 用途: 数据库、存储、认证

- [x] **Apify账号** (免费)
  - 注册: https://apify.com
  - 用途: 网页爬虫
  - 免费额度: $5/月

- [x] **FAL.AI账号** (免费试用)
  - 注册: https://fal.ai
  - 用途: AI视频生成
  - 免费额度: $5

- [x] **Google Cloud账号** (免费)
  - 注册: https://console.cloud.google.com
  - 用途: YouTube API、Gemini API

### 可选账号

- [ ] **Vercel账号** (部署用)
- [ ] **Stripe账号** (支付用)

---

## 2. 克隆项目

```bash
# 克隆仓库
git clone https://github.com/372768498/shipinzidonghua1119.git

# 进入项目目录
cd shipinzidonghua1119

# 安装依赖
npm install
```

---

## 3. 环境配置

### 3.1 复制环境变量模板

```bash
cp .env.example .env.local
```

### 3.2 配置Supabase

1. 访问 https://supabase.com/dashboard
2. 创建新项目
3. 进入 **Settings > API**
4. 复制以下信息到 `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.3 配置Apify

1. 访问 https://console.apify.com/account/integrations
2. 创建API Token
3. 添加到 `.env.local`:

```bash
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxx
```

### 3.4 配置FAL.AI

1. 访问 https://fal.ai/dashboard/keys
2. 创建API Key
3. 添加到 `.env.local`:

```bash
FAL_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 3.5 配置Google Gemini

1. 访问 https://aistudio.google.com/app/apikey
2. 创建API Key
3. 添加到 `.env.local`:

```bash
GOOGLE_GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3.6 配置YouTube API

1. 访问 https://console.cloud.google.com
2. 创建项目
3. 启用 **YouTube Data API v3**
4. 创建OAuth 2.0凭据:
   - 应用类型: Web应用
   - 授权重定向URI: `http://localhost:3000/api/auth/youtube/callback`
5. 添加到 `.env.local`:

```bash
YOUTUBE_CLIENT_ID=xxxxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback
```

### 3.7 配置Webhook密钥

```bash
# 生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 添加到 .env.local
WEBHOOK_SECRET=生成的密钥
```

### 3.8 完整的 .env.local 示例

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Apify
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxx

# FAL.AI
FAL_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Google Gemini
GOOGLE_GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx

# YouTube API
YOUTUBE_CLIENT_ID=xxxxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback

# Webhook
WEBHOOK_SECRET=生成的随机密钥

# 可选：OpenAI (如果使用)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

---

## 4. 数据库设置

### 4.1 运行数据库迁移

在Supabase Dashboard的SQL Editor中，执行以下脚本（按顺序）：

#### 步骤1: 创建表结构

```sql
-- 复制 docs/DATABASE.md 中的建表SQL
-- 或运行项目中的 supabase/migrations/001_initial_schema.sql
```

#### 步骤2: 创建RLS策略

```sql
-- 复制 docs/DATABASE.md 中的RLS策略
-- 或运行 supabase/migrations/002_rls_policies.sql
```

#### 步骤3: 创建RPC函数

```sql
-- 复制 docs/DATABASE.md 中的RPC函数
-- 或运行 supabase/migrations/003_rpc_functions.sql
```

### 4.2 验证数据库

```bash
# 使用Supabase CLI验证
npx supabase db pull
```

---

## 5. 本地运行

### 5.1 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:3000

### 5.2 验证配置

打开浏览器控制台，检查是否有错误信息。

### 5.3 注册测试账号

1. 访问: http://localhost:3000/auth/signup
2. 使用邮箱注册
3. 查收验证邮件（查看Supabase Dashboard > Authentication > Users）

---

## 6. 第一个功能测试

### 测试1: 爬取TikTok热门视频

```bash
# 使用curl测试API
curl -X POST http://localhost:3000/api/scraper/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "platform": "tiktok",
    "keywords": ["AI"],
    "filters": {
      "minViews": 10000,
      "maxViews": 1000000
    },
    "maxResults": 10
  }'
```

**预期响应**:
```json
{
  "success": true,
  "taskId": "scraper_task_xxx",
  "estimatedTime": 180
}
```

---

### 测试2: 生成AI视频

```bash
curl -X POST http://localhost:3000/api/video/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "一只可爱的猫咪在窗台晒太阳",
    "model": "minimax",
    "duration": 30,
    "aspectRatio": "9:16"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "taskId": "video_gen_xxx",
  "estimatedTime": 300,
  "quotaRemaining": 19
}
```

---

### 测试3: 查询任务状态

```bash
curl http://localhost:3000/api/video/status/video_gen_xxx \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**预期响应** (处理中):
```json
{
  "taskId": "video_gen_xxx",
  "status": "processing",
  "progress": 45,
  "estimatedTimeRemaining": 180
}
```

**预期响应** (完成):
```json
{
  "taskId": "video_gen_xxx",
  "status": "completed",
  "video": {
    "id": "video_abc",
    "url": "https://supabase.storage/.../video.mp4"
  }
}
```

---

## 7. 常见问题

### Q1: 启动时报错 "Missing environment variables"

**解决方案**:
1. 确认 `.env.local` 文件存在
2. 检查所有必需的环境变量是否已配置
3. 重启开发服务器

```bash
npm run dev
```

---

### Q2: Supabase连接失败

**错误信息**:
```
Failed to connect to Supabase
```

**解决方案**:
1. 检查 `NEXT_PUBLIC_SUPABASE_URL` 是否正确
2. 检查 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正确
3. 确认Supabase项目状态正常
4. 检查网络连接

---

### Q3: Apify爬虫任务失败

**错误信息**:
```
Apify Actor run failed
```

**解决方案**:
1. 检查 `APIFY_API_TOKEN` 是否有效
2. 确认Apify账号有足够的额度
3. 检查Actor名称是否正确 (`apify/tiktok-scraper`)
4. 查看Apify Dashboard的运行日志

---

### Q4: 视频生成失败

**错误信息**:
```
Video generation failed
```

**可能原因**:
1. FAL.AI API Key无效
2. 账号额度不足
3. Prompt包含敏感内容被审查拦截
4. 模型暂时不可用

**解决方案**:
1. 验证FAL.AI API Key
2. 检查账户余额
3. 修改Prompt内容
4. 尝试更换模型 (`minimax` → `runway-gen3`)

---

### Q5: YouTube授权失败

**错误信息**:
```
YouTube OAuth failed
```

**解决方案**:
1. 检查 `YOUTUBE_CLIENT_ID` 和 `YOUTUBE_CLIENT_SECRET`
2. 确认重定向URI配置正确
3. 在Google Cloud Console中检查:
   - YouTube Data API v3已启用
   - OAuth凭据状态正常
   - 重定向URI包含 `http://localhost:3000/api/auth/youtube/callback`

---

### Q6: 数据库权限错误

**错误信息**:
```
Row Level Security policy violation
```

**解决方案**:
1. 确认已执行所有RLS策略SQL
2. 检查用户是否已登录
3. 验证JWT Token是否有效
4. 在Supabase Dashboard > Authentication中检查用户状态

---

### Q7: Webhook验证失败

**错误信息**:
```
Webhook signature verification failed
```

**解决方案**:
1. 确认 `WEBHOOK_SECRET` 配置正确
2. 检查签名算法是否一致 (HMAC-SHA256)
3. 查看Webhook日志

---

## 8. 下一步

✅ **开发环境已就绪！**

接下来你可以:

1. 📖 阅读 [架构文档](./ARCHITECTURE.md) 了解系统设计
2. 🔌 查看 [API文档](./API.md) 了解接口使用
3. 🔒 阅读 [安全文档](./SECURITY_COMPLETE.md) 了解安全实践
4. 🚀 查看 [部署指南](./DEPLOYMENT.md) 了解生产部署
5. 📝 参考 [实现清单](./IMPLEMENTATION_CHECKLIST.md) 开始开发

---

## 9. 获取帮助

- **文档**: https://github.com/372768498/shipinzidonghua1119/tree/main/docs
- **Issues**: https://github.com/372768498/shipinzidonghua1119/issues
- **讨论**: https://github.com/372768498/shipinzidonghua1119/discussions

---

<div align="center">

**Happy Coding! 🎉**

[返回首页](../README.md) | [查看PRD](./PRD.md) | [查看API文档](./API.md)

</div>