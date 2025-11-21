# 📸 PROJECT SNAPSHOT - Jilo.ai 项目速查表

> **目的**: 让Claude或新开发者在3分钟内理解全项目  
> **最后更新**: 2024-11-21  
> **版本**: V3.0 - MVP聚焦版

---

## 🎯 MVP核心链路 (必读!)

```
┌─────────────────────────────────────────────────────────────┐
│                     Jilo.ai MVP 核心链路                      │
└─────────────────────────────────────────────────────────────┘

  1️⃣ 爆款发现              2️⃣ 视频生成              3️⃣ 自动发布
┌──────────┐         ┌──────────┐         ┌──────────┐
│  APIFY   │────────>│  FAL.AI  │────────>│ YouTube  │
│  抓取爆款  │  分析    │  生成视频  │  上传    │  Shorts  │
└──────────┘         └──────────┘         └──────────┘
     ✅                   🔄                    ❌
   已完成               部分完成              未开始
```

### 各环节状态

| 环节 | 功能 | 状态 | 完成度 | 负责文件 |
|------|------|------|--------|----------|
| 1️⃣ | APIFY抓取爆款视频 | ✅ 已完成 | 100% | `app/api/viral-discovery/shorts-optimized/route.ts` |
| 1️⃣ | V2评分系统分析 | ✅ 已完成 | 100% | `lib/youtube-shorts-optimizer-v2.ts` |
| 2️⃣ | FAL.AI视频生成API | 🔄 部分完成 | 60% | `app/api/generate/route.ts` (需要创建) |
| 2️⃣ | 生成任务管理 | 🔄 部分完成 | 40% | 需要完善数据库和webhook |
| 3️⃣ | YouTube OAuth | ❌ 未开始 | 0% | `lib/youtube-oauth.ts` (需要创建) |
| 3️⃣ | YouTube上传API | ❌ 未开始 | 0% | `app/api/youtube/upload/route.ts` (需要创建) |

---

## 🎯 当前状态 (100字)

**阶段**: MVP开发 - **快速冲刺阶段**  
**进度**: 50%完成 (重新评估)  
**当前Sprint**: 完成视频生成集成 + YouTube发布功能  
**关键问题**: ❗ 视频生成和YouTube发布是MVP的核心缺失  
**开发策略**: 🚀 代码优先，快速验证，完成后再完善

---

## 🏗️ 核心架构 (500字)

### 技术栈
```
前端: Next.js 14 (App Router) + TypeScript + Tailwind CSS
部署: Vercel (Serverless)
数据库: Supabase (PostgreSQL + Realtime)
AI分析: Google Gemini 3.0 (成本优化，比Claude便宜40倍)
视频生成: FAL.AI (统一接口，支持Minimax/Runway/Kling)
爬虫: Apify (托管服务)
YouTube: Google APIs + OAuth 2.0
```

### 关键架构决策

#### 1. Fire & Forget 异步架构 ⚡
**问题**: Vercel最长60秒超时，但视频生成需3-10分钟  
**解决方案**:
```
Next.js API (立即返回) 
    ↓
FAL.AI异步处理 (3-10分钟)
    ↓
Webhook回调
    ↓
Supabase Realtime推送前端
```
**文档**: `docs/ADR.md#adr-001`  
**实现**: `app/api/generate/*/route.ts` + `app/api/webhooks/*/route.ts`

#### 2. Gemini vs Claude (成本优化) 💰
**对比**:
- Claude: $18/百万tokens
- Gemini: $0.375/百万tokens  
- 差距: 40倍！

**决策**: 使用Gemini进行内容分析  
**文档**: `docs/ADR.md#adr-003`  
**实现**: `lib/gemini-analyzer.ts`

#### 3. FAL.AI 统一视频生成 🎬
**问题**: 5+个AI模型，各有不同API  
**解决**: 通过FAL.AI统一接口访问所有模型  
**支持**: Minimax, Runway Gen-3, Kling AI, Luma, Sora等  
**文档**: `docs/AI_GENERATION_GUIDE.md`

### 安全等级
- 两次全面安全审计 ✅
- 13个漏洞全部修复 ✅
- 安全评分: 93.5/100 (企业级) ✅
- 详见: `docs/SECURITY.md`

---

## 📁 MVP代码地图 (重点)

### ✅ 环节1: 爆款发现 (已完成100%)

```
app/api/viral-discovery/
├── shorts-optimized/route.ts          [V2爆款发现API] ✅
│   - 四种预设: viral/hot/potential/blueOcean
│   - 触发Apify爬虫
│   - 立即返回任务ID

app/api/webhooks/
├── apify-shorts/route.ts              [Apify回调处理] ✅
│   - 接收爬取结果
│   - V2评分系统
│   - 存储到数据库

lib/
├── youtube-shorts-optimizer-v2.ts     [V2评分引擎] ✅
│   - 分享率优先 (18/25分)
│   - 账号分层评估
│   - 垂直领域调整
└── viral-definition-standards.ts     [评分标准] ✅
```

### 🔄 环节2: 视频生成 (需要完成40%)

```
app/api/generate/
├── route.ts                           [视频生成API] ❌ 需要创建
│   - 接收爆款视频信息
│   - 调用Gemini分析
│   - 生成新prompt
│   - 触发FAL.AI生成
│   - 立即返回任务ID

app/api/webhooks/
├── fal/route.ts                       [FAL.AI回调] ❌ 需要创建
│   - 接收生成结果
│   - 下载视频到Supabase Storage
│   - 更新任务状态

lib/
├── fal-client.ts                      [FAL.AI客户端] 🔄 需要完善
├── gemini-analyzer.ts                 [Gemini分析] ❌ 需要创建
└── video-prompt-generator.ts         [Prompt生成] ❌ 需要创建
```

### ❌ 环节3: YouTube发布 (需要从0开始)

```
app/api/youtube/
├── oauth/
│   ├── authorize/route.ts             [OAuth授权] ❌ 需要创建
│   └── callback/route.ts              [OAuth回调] ❌ 需要创建
└── upload/
    └── route.ts                       [上传视频] ❌ 需要创建

lib/
├── youtube-oauth.ts                   [OAuth管理] ❌ 需要创建
│   - 授权流程
│   - Token加密存储
│   - Token自动刷新
└── youtube-uploader.ts                [上传工具] ❌ 需要创建
    - 视频上传
    - 元数据设置
    - 错误重试
```

---

## 🎯 MVP快速开发计划

### 第1天-第2天: 视频生成集成 (环节2)

**目标**: 完成从爆款视频到生成新视频的完整流程

#### Day 1 上午 (4小时)
- [ ] 创建 `lib/gemini-analyzer.ts` - 分析爆款视频
- [ ] 创建 `lib/video-prompt-generator.ts` - 生成视频prompt
- [ ] 测试Gemini API和prompt生成

#### Day 1 下午 (4小时)
- [ ] 完善 `lib/fal-client.ts` - FAL.AI客户端
- [ ] 创建 `app/api/generate/route.ts` - 视频生成API
- [ ] 测试API端点

#### Day 2 上午 (4小时)
- [ ] 创建 `app/api/webhooks/fal/route.ts` - 处理生成回调
- [ ] 实现视频下载到Supabase Storage
- [ ] 更新数据库schema (如需要)

#### Day 2 下午 (4小时)
- [ ] 端到端测试: 爆款发现 → 视频生成
- [ ] 修复bug和优化
- [ ] 更新API文档

### 第3天-第5天: YouTube发布功能 (环节3)

**目标**: 完成从生成视频到自动上传YouTube的流程

#### Day 3 上午 (4小时)
- [ ] 研究YouTube Data API v3
- [ ] 创建Google Cloud项目和OAuth凭证
- [ ] 创建 `lib/youtube-oauth.ts` - OAuth流程

#### Day 3 下午 (4小时)
- [ ] 创建 `app/api/youtube/oauth/authorize/route.ts`
- [ ] 创建 `app/api/youtube/oauth/callback/route.ts`
- [ ] 实现Token加密存储

#### Day 4 上午 (4小时)
- [ ] 创建 `lib/youtube-uploader.ts` - 上传工具
- [ ] 创建 `app/api/youtube/upload/route.ts` - 上传API
- [ ] 实现Token自动刷新

#### Day 4 下午 (4小时)
- [ ] 测试OAuth流程
- [ ] 测试视频上传
- [ ] 处理各种错误情况

#### Day 5 全天 (8小时)
- [ ] 端到端测试: 完整MVP链路
- [ ] 修复bug
- [ ] 性能优化
- [ ] 更新所有文档

---

## 🔍 快速查找 (MVP相关)

### MVP核心文件

**环节1 - 爆款发现** (已完成):
```
启动爬取 → app/api/viral-discovery/shorts-optimized/route.ts
处理结果 → app/api/webhooks/apify-shorts/route.ts
评分引擎 → lib/youtube-shorts-optimizer-v2.ts
评分标准 → lib/viral-definition-standards.ts
```

**环节2 - 视频生成** (进行中):
```
生成API → app/api/generate/route.ts (需要创建)
FAL回调 → app/api/webhooks/fal/route.ts (需要创建)
FAL客户端 → lib/fal-client.ts (需要完善)
Gemini分析 → lib/gemini-analyzer.ts (需要创建)
Prompt生成 → lib/video-prompt-generator.ts (需要创建)
```

**环节3 - YouTube发布** (待开始):
```
OAuth授权 → app/api/youtube/oauth/authorize/route.ts (需要创建)
OAuth回调 → app/api/youtube/oauth/callback/route.ts (需要创建)
上传API → app/api/youtube/upload/route.ts (需要创建)
OAuth管理 → lib/youtube-oauth.ts (需要创建)
上传工具 → lib/youtube-uploader.ts (需要创建)
```

### 环境变量配置

**必需的环境变量** (MVP):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI服务
GOOGLE_GEMINI_API_KEY=          # 内容分析 ⭐
FAL_AI_API_KEY=                 # 视频生成 ⭐

# 爬虫
APIFY_API_KEY=                  # 数据爬取 ⭐

# YouTube (新增) ⭐⭐⭐
YOUTUBE_CLIENT_ID=              # OAuth客户端ID
YOUTUBE_CLIENT_SECRET=          # OAuth客户端密钥
YOUTUBE_REDIRECT_URI=           # OAuth回调地址

# 安全
APIFY_WEBHOOK_SECRET=           # Webhook验证
FAL_WEBHOOK_SECRET=             # Webhook验证 ⭐
ENCRYPTION_KEY=                 # Token加密 (32字节hex) ⭐
```

查看完整配置: `.env.example`

### 开发命令

```bash
# 本地开发
npm run dev                     # 启动开发服务器

# 测试 (MVP相关)
node test-apis.js               # 测试基础API
node test-shorts-optimizer.js   # 测试评分系统
node test-video-generation.js   # 测试视频生成 (待创建)
node test-youtube-upload.js     # 测试YouTube上传 (待创建)
```

---

## 📚 文档索引 (MVP相关)

### 必读文档 (开始开发前必看)

1. **本文档** - `PROJECT_SNAPSHOT.md` ⭐⭐⭐  
   项目全貌，MVP核心链路

2. **工作日志** - `WORKLOG.md`  
   最近的开发进度

3. **快速开始** - `docs/QUICKSTART.md`  
   本地开发环境搭建

### MVP开发必读

**视频生成**:
- `docs/AI_GENERATION_GUIDE.md` - FAL.AI使用指南
- `docs/GEMINI_INTEGRATION.md` - Gemini集成 (待创建)

**YouTube发布**:
- `docs/YOUTUBE_OAUTH_GUIDE.md` - OAuth完整流程 (待创建)
- `docs/YOUTUBE_UPLOAD_API.md` - 上传API文档 (待创建)

**架构相关**:
- `docs/ARCHITECTURE.md` - 完整架构设计
- `docs/ADR.md` - 架构决策记录

**安全与运维**:
- `docs/SECURITY.md` - 安全完整方案
- `docs/TROUBLESHOOTING.md` - 故障排查手册

---

## 💡 关键决策摘要

### MVP核心原则

**1. 快速验证 > 完美代码**
- 目标: 3-5天完成MVP核心链路
- 策略: 先实现，后优化
- 接受: 技术债务，简化UI

**2. 代码优先 > 文档齐全**
- 当前: 60%文档 / 40%代码 ⚠️
- MVP期间: 80%代码 / 20%文档
- 完成后: 补充文档

**3. 核心链路 > 完整功能**
- 聚焦: 爆款发现 → 视频生成 → YouTube发布
- 暂缓: Dashboard UI、数据分析、用户管理
- 原因: 先验证商业模式

### 技术选型 (MVP)

**FAL.AI**:
- ✅ 统一接口，简化开发
- ✅ 支持多个模型快速切换
- ✅ Webhook回调，适配Fire & Forget架构

**YouTube Data API v3**:
- ✅ 官方API，稳定可靠
- ✅ 支持自动上传和元数据管理
- ⚠️ 配额限制 (每日10,000单位)

**Gemini 3.0**:
- ✅ 成本低 ($0.375/M tokens)
- ✅ 功能满足视频分析需求
- ✅ 响应速度快

---

## 🚀 MVP冲刺计划

### 本周目标 (2024-11-21 ~ 11-27)

**Day 1-2** (11-21 ~ 11-22): 视频生成集成
- [x] ~~V2测试验证~~ (已完成)
- [ ] Gemini分析集成
- [ ] FAL.AI生成API
- [ ] Webhook处理

**Day 3-5** (11-23 ~ 11-25): YouTube发布
- [ ] YouTube OAuth流程
- [ ] Token管理
- [ ] 视频上传API
- [ ] 错误处理

**Day 6-7** (11-26 ~ 11-27): 整合测试
- [ ] 端到端测试
- [ ] Bug修复
- [ ] 文档更新
- [ ] 性能优化

### MVP完成标准

✅ **功能完整性**:
- [ ] 可以自动发现爆款视频
- [ ] 可以自动生成新视频
- [ ] 可以自动上传到YouTube Shorts

✅ **质量标准**:
- [ ] 核心API测试通过
- [ ] 端到端流程测试通过
- [ ] 错误处理完善
- [ ] 安全验证通过

✅ **文档完整性**:
- [ ] API文档更新
- [ ] 部署文档更新
- [ ] WORKLOG记录完整

---

## ⚠️ MVP开发注意事项

### 关键风险

1. **YouTube API配额限制** ⚠️
   - 每日10,000单位
   - 上传视频消耗1,600单位
   - 最多每日6个视频
   - 解决: 实现配额监控和预警

2. **视频生成时间** ⚠️
   - FAL.AI生成需要3-10分钟
   - Webhook可能失败
   - 解决: 实现重试机制和状态追踪

3. **Token安全** 🔒
   - YouTube OAuth Token必须加密
   - Token刷新必须可靠
   - 解决: AES-256加密 + 自动刷新

4. **成本控制** 💰
   - Gemini API调用成本
   - FAL.AI生成成本
   - 解决: 实现用户配额和成本追踪

### 开发陷阱

❌ **不要做**:
- 过度优化性能
- 完美的UI设计
- 复杂的权限系统
- 详尽的文档

✅ **应该做**:
- 快速实现核心功能
- 简单可用的UI
- 基础的错误处理
- 关键流程文档

---

## 📞 获取帮助

**MVP相关问题**:
1. 查看本文档的"MVP代码地图"
2. 查看`WORKLOG.md`最新进度
3. 查看相关功能文档

**技术问题**:
1. `docs/TROUBLESHOOTING.md`
2. `docs/SECURITY.md` (安全相关)
3. GitHub Issues

---

## 🏁 MVP里程碑

### 第一个里程碑: 视频生成 (2天)
- [ ] 完成环节2
- [ ] 可以从爆款视频生成新视频
- [ ] 视频存储到Supabase

### 第二个里程碑: YouTube发布 (3天)
- [ ] 完成环节3
- [ ] 可以自动上传到YouTube Shorts
- [ ] Token安全管理

### 第三个里程碑: MVP完成 (2天)
- [ ] 完整链路打通
- [ ] 端到端测试通过
- [ ] 文档更新完成

---

**文档版本**: V3.0 - MVP聚焦版  
**创建日期**: 2024-11-21  
**维护者**: Jilo.ai Team  
**下一步**: 立即开始环节2 - 视频生成集成！🚀
