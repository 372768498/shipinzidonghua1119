# ✅ 实施检查清单

本文档提供Jilo.ai开发实施的完整检查清单，确保所有关键功能和安全修复已正确实施。

---

## 📋 阶段一：基础设置

### 1.1 项目初始化

- [ ] 克隆仓库到本地
- [ ] 安装依赖 (`pnpm install`)
- [ ] 复制 `.env.example` 为 `.env.local`
- [ ] 填写所有必需的环境变量

### 1.2 Supabase设置

- [ ] 创建Supabase项目
- [ ] 获取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
- [ ] 获取 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 启用 `uuid-ossp`, `pg_cron`, `pg_net` 扩展
- [ ] 运行数据库迁移 (所有文件)

### 1.3 第三方服务配置

- [ ] 获取 Apify API Token
- [ ] 获取 Gemini API Key
- [ ] 获取 FAL.AI API Key
- [ ] 设置 Google OAuth (Client ID + Secret)
- [ ] 设置 Stripe (Secret Key + Webhook Secret)

---

## 🛡️ 阶段二：安全修复

### 2.1 第一轮漏洞修复 (4个致命漏洞)

- [ ] **漏洞1**: 更新 `middleware.ts` 排除 `/api/webhooks/*`
  - 文件: `middleware.ts`
  - 验证: Webhook请求不被middleware处理

- [ ] **漏洞2**: 实施严格RLS策略
  - 文件: `supabase/migrations/003_strict_rls.sql`
  - 验证: 用户A无法查看用户B的数据

- [ ] **漏洞3**: FAL.AI视频永久存储
  - 文件: `app/api/webhooks/fal/route.ts`
  - 验证: 视频URL不会过期

- [ ] **漏洞4**: Webhook安全验证
  - 文件: `app/api/webhooks/*/route.ts`
  - 生成Secret: `APIFY_WEBHOOK_SECRET`, `FAL_WEBHOOK_SECRET`
  - 验证: 未Secret请求返回401

### 2.2 第二轮漏洞修复 (5个隐蔽漏洞)

- [ ] **漏洞5**: 原子级配额扣费
  - 文件: `supabase/migrations/004_atomic_quota.sql`
  - 函数: `check_and_decrement_quota()`
  - 验证: 并发50个请求只成功1个

- [ ] **漏洞6**: 僵尸任务清理
  - 文件: `supabase/functions/cleanup-zombie-jobs/`
  - Cron: 每小时运行
  - 验证: 超时2小时的任务被标记为`failed`

- [ ] **漏洞7**: YouTube Token加密
  - 文件: `lib/utils/crypto.ts`
  - 生成: `ENCRYPTION_KEY` (32字节hex)
  - 验证: Token在数据库中为JSON格式

- [ ] **漏洞8**: Webhook幂等性
  - 文件: `app/api/webhooks/*/route.ts`
  - 验证: 重复发送请求不重复处理

- [ ] **漏洞9**: Storage严格限制
  - 文件: `supabase/migrations/005_storage_security.sql`
  - 配置: 文件大小100MB，MIME类型限制
  - 验证: 上传不允许的文件类型失败

### 2.3 第三轮漏洞修复 (4个隐形炸弹)

- [ ] **炸弹1**: AI内容审查
  - 文件: `lib/safety/content-moderation.ts`
  - API集成: `app/api/generate/video/route.ts`
  - 验证: 违规提示词被拒绝

- [ ] **炸弹2**: YouTube Token智能刷新
  - 文件: `lib/api-clients/youtube.ts`
  - 实现: `oauth2Client.on('tokens')` 监听
  - 验证: Token过期自动刷新

- [ ] **炸弹3**: 数据库自动清理
  - 文件: `supabase/migrations/006_auto_cleanup.sql`
  - Cron: 每天6晨3点执行
  - 验证: 30天前的数据被删除

- [ ] **炸弹4**: 流式上传优化
  - 文件: `app/api/webhooks/fal/route.ts`
  - 配置: `runtime = 'nodejs'`, `maxDuration = 300`
  - 验证: 100MB视频上传成功

---

## 🛠️ 阶段三：核心功能开发

### 3.1 认证系统

- [ ] Supabase Auth集成
- [ ] 登录页面 (`app/(auth)/login/page.tsx`)
- [ ] 注册页面 (`app/(auth)/register/page.tsx`)
- [ ] 密码重置功能
- [ ] OAuth登录 (Google, GitHub)

### 3.2 用户配置管理

- [ ] 配置表设计 (`profiles`)
- [ ] 初始配额设置 (10/月)
- [ ] 配额自动重置 (Cron)
- [ ] 订阅级别管理

### 3.3 爬取功能 (Discover)

- [ ] API: `app/api/crawl/start/route.ts`
  - 配额检查
  - 调用Apify
  - 创建`crawl_jobs`记录

- [ ] Webhook: `app/api/webhooks/apify/route.ts`
  - Secret验证
  - 数据清洗
  - 计算爆款评分
  - 存储到`viral_videos`

- [ ] 前端: `app/(dashboard)/discover/page.tsx`
  - 爬取表单
  - Realtime订阅
  - 结果展示

### 3.4 视频生成功能 (Generate)

- [ ] API: `app/api/generate/video/route.ts`
  - 内容审查
  - 配额扣除 (RPC)
  - 调用FAL.AI
  - 创建`generated_videos`记录

- [ ] Webhook: `app/api/webhooks/fal/route.ts`
  - Secret验证
  - 下载视频 (流式)
  - 上传Supabase Storage
  - 更新数据库

- [ ] 前端: `app/(dashboard)/generate/page.tsx`
  - Prompt输入
  - 模型选择
  - 生成进度 (Realtime)
  - 结果预览

### 3.5 YouTube发布功能 (Publish)

- [ ] OAuth流程:
  - `app/api/youtube/oauth/authorize/route.ts`
  - `app/api/youtube/oauth/callback/route.ts`
  - Token加密存储

- [ ] 上传API: `app/api/publish/youtube/route.ts`
  - 获取YouTube客户端 (Token解密)
  - 上传视频
  - 记录发布状态

- [ ] 前端: `app/(dashboard)/publish/page.tsx`
  - YouTube账号管理
  - 视频列表
  - 发布表单

### 3.6 Stripe支付集成

- [ ] 价格设置 (Stripe Dashboard)
- [ ] Checkout API: `app/api/checkout/route.ts`
- [ ] Webhook: `app/api/webhooks/stripe/route.ts`
  - 签名验证
  - 订阅状态更新
  - 配额更新
- [ ] 前端: `app/(marketing)/pricing/page.tsx`

---

## 🎨 阶段四：UI/UX开发

### 4.1 布局组件

- [ ] `components/layout/Header.tsx`
- [ ] `components/layout/Sidebar.tsx`
- [ ] `components/layout/Footer.tsx`
- [ ] `app/(dashboard)/layout.tsx`

### 4.2 业务组件

- [ ] `components/dashboard/VideoCard.tsx`
- [ ] `components/dashboard/ProgressTracker.tsx`
- [ ] `components/dashboard/RealtimeStatus.tsx`
- [ ] `components/forms/CrawlForm.tsx`
- [ ] `components/forms/GenerateForm.tsx`

### 4.3 shadcn/ui组件

- [ ] Button, Input, Select
- [ ] Dialog, Toast
- [ ] Progress, Tabs
- [ ] Card, Badge

---

## 📊 阶段五：监控与日志

### 5.1 错误监控

- [ ] 集成 Sentry
- [ ] 配置 Source Maps
- [ ] 设置告警规则

### 5.2 性能监控

- [ ] Vercel Analytics
- [ ] Supabase 数据库监控
- [ ] API响应时间监控

### 5.3 日志系统

- [ ] 结构化日志输出
- [ ] 关键操作日志
- [ ] 错误日志追踪

---

## 🧪 阶段六：测试

### 6.1 单元测试

- [ ] 加密/解密函数
- [ ] 配额计算逻辑
- [ ] 爆款评分算法

### 6.2 API测试

- [ ] 爬取API
- [ ] 生成API
- [ ] 发布API
- [ ] Webhook端点

### 6.3 E2E测试

- [ ] 用户注册流程
- [ ] 爬取到生成流程
- [ ] 生成到发布流程

### 6.4 安全测试

- [ ] RLS策略验证
- [ ] Webhook伪造请求测试
- [ ] 配额并发攻击测试
- [ ] SQL注入测试

---

## 🚀 阶段七：部署

### 7.1 部署准备

- [ ] 环境变量检查
- [ ] 数据库迁移确认
- [ ] Storage配置确认
- [ ] Cron Jobs设置

### 7.2 Vercel部署

- [ ] 链接GitHub仓库
- [ ] 配置环境变量
- [ ] 设置自定义域名
- [ ] 验证部署成功

### 7.3 Webhook配置

- [ ] Apify Webhook URL
- [ ] FAL.AI Webhook URL
- [ ] Stripe Webhook URL
- [ ] 验证Webhook接收

### 7.4 生产验证

- [ ] 用户注册/登录
- [ ] 爬取功能
- [ ] 视频生成
- [ ] YouTube上传
- [ ] 支付流程
- [ ] Realtime更新

---

## 📝 阶段八：文档

### 8.1 技术文档

- [x] PRD.md
- [x] ARCHITECTURE.md
- [x] DATABASE.md
- [x] SECURITY_FIXES.md
- [x] DEPLOYMENT.md
- [x] DEVELOPMENT.md
- [ ] API_DOCUMENTATION.md
- [ ] TROUBLESHOOTING.md

### 8.2 用户文档

- [ ] 用户手册
- [ ] FAQ
- [ ] 视频教程
- [ ] 博客文章

---

## ✅ 最终检查

### 功能完整性

- [ ] 所有核心功能已实现
- [ ] 所有安全漏洞已修复
- [ ] 所有测试通过
- [ ] 所有文档已完成

### 性能指标

- [ ] 首页加载 < 2s
- [ ] API响应 < 500ms
- [ ] Lighthouse Score > 90

### 安全指标

- [ ] 所有端点有认证
- [ ] RLS策略已验证
- [ ] HTTPS已启用
- [ ] CSP已设置

### 业务准备

- [ ] 定价策略已确定
- [ ] 支付流程已测试
- [ ] 用户文档已完成
- [ ] 客服系统已就绪

---

## 🎯 下一步：产品上线

✅ 所有检查项完成后，即可：

1. **Beta测试**: 邀请100个早期用户
2. **收集反馈**: 迭代优化
3. **公开发布**: Product Hunt / HackerNews
4. **市场推广**: 内容营销 / SEO
5. **持续迭代**: 每周发布新版本

---

**祝你好运！🚀**
