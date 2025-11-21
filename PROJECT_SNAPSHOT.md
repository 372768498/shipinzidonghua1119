# 📸 PROJECT SNAPSHOT - Jilo.ai 项目速查表

> **目的**: 让Claude或新开发者在3分钟内理解全项目  
> **最后更新**: 2024-11-21  
> **版本**: V2.0

---

## 🎯 当前状态 (100字)

**阶段**: MVP开发 - V2优化阶段  
**进度**: 70%完成  
**当前Sprint**: YouTube Shorts评分系统V2升级 + 测试  
**关键问题**: 前端进度落后后端，YouTube发布功能未开始  
**代码/文档比**: 40%代码 / 60%文档 ⚠️ 需要调整

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

## 📁 代码地图 (1000字)

### 核心功能状态

#### ✅ 已完成
```
app/api/viral-discovery/
├── shorts-optimized/route.ts          [V2爆款发现系统] ✅
│   - 四种预设: viral/hot/potential/blueOcean
│   - 专业评分: 100分制
│   - 相对定义: 根据账号粉丝数动态调整

app/api/webhooks/
├── apify-shorts/route.ts              [V2 Webhook处理] ✅
│   - 幂等性保证
│   - 安全验证
│   - 详细评分原因

lib/
├── youtube-shorts-optimizer-v2.ts     [核心评分引擎] ✅
│   - 分享率优先 (18/25分)
│   - 账号分层评估
│   - 垂直领域调整
├── viral-definition-standards.ts     [专业标准定义] ✅
└── supabase.ts                        [数据库客户端] ✅
```

#### 🔄 部分完成
```
app/api/generate/
└── route.ts                           [视频生成API] 🔄
    - FAL.AI集成完成
    - 配额管理完成
    - 前端集成待完善

components/
└── dashboard/                         [Dashboard UI] 🔄 30%
    - 基础组件完成
    - 数据可视化待完成
```

#### ❌ 未开始
```
lib/
└── youtube-oauth.ts                   [YouTube发布] ❌
    - OAuth流程
    - 自动上传
    - Token管理

app/(dashboard)/
└── analytics/                         [数据分析] ❌
    - 统计图表
    - 趋势分析
```

### 重要文件快速索引

**修改爆款标准**:  
→ `lib/viral-definition-standards.ts` (第45-120行)

**修改预设配置**:  
→ `lib/youtube-shorts-optimizer-v2.ts` (第20-60行)

**调试Webhook**:  
→ `app/api/webhooks/apify-shorts/route.ts`

**查看数据库Schema**:  
→ `docs/DATABASE.md` 或 `supabase/migrations/`

**API文档**:  
→ `docs/API.md`

**故障排查**:  
→ `docs/TROUBLESHOOTING.md`

---

## 🎯 开发焦点 (500字)

### 当前Sprint (2024-11-21)

#### 已完成 ✅
- V2评分系统实现和部署
- 专业标准整合
- 完整测试套件
- API V2升级

#### 进行中 🔄
- 测试验证和调优
- 前端适配V2特性
- 文档更新

#### 下一步 ⏭️
1. **YouTube OAuth集成** (优先级1)
   - 实现OAuth流程
   - Token加密存储
   - 自动刷新机制
   - 预计: 3-5天

2. **Dashboard UI完善** (优先级2)
   - 数据可视化
   - 实时更新
   - 响应式设计
   - 预计: 5-7天

3. **用户认证UI** (优先级3)
   - 登录/注册页面
   - 配额显示
   - 个人设置
   - 预计: 2-3天

### 已知问题 ⚠️

1. **前端进度滞后**
   - 原因: 过度关注文档和后端优化
   - 影响: MVP完成时间延后
   - 解决: 调整开发节奏，代码优先

2. **测试覆盖不足**
   - 单元测试: 10%
   - 集成测试: 30%
   - E2E测试: 0%
   - 计划: 逐步补充关键路径测试

3. **YouTube发布功能空白**
   - 风险: 核心功能缺失
   - 优先级: 高
   - 计划: 本周开始实现

### 技术债务

**高优先级**:
- [ ] 添加单元测试 (评分系统、配额管理)
- [ ] Dashboard重构 (当前设计过于复杂)
- [ ] API错误处理标准化

**中优先级**:
- [ ] 文档精简 (从43个合并到20个)
- [ ] 性能优化 (添加缓存层)
- [ ] 日志系统完善

**低优先级**:
- [ ] 国际化支持
- [ ] PWA功能
- [ ] 离线模式

---

## 🔍 快速查找 (500字)

### 常见任务的文件位置

**爆款发现相关**:
```
修改评分算法 → lib/viral-definition-standards.ts
修改预设配置 → lib/youtube-shorts-optimizer-v2.ts (SHORTS_FILTER_PRESETS_V2)
启动爬取API → app/api/viral-discovery/shorts-optimized/route.ts
处理结果 → app/api/webhooks/apify-shorts/route.ts
```

**视频生成相关**:
```
生成API → app/api/generate/route.ts
FAL.AI集成 → lib/fal-client.ts
Webhook处理 → app/api/webhooks/fal/route.ts
```

**数据库相关**:
```
Schema设计 → docs/DATABASE.md
迁移文件 → supabase/migrations/
RPC函数 → supabase/functions/
客户端 → lib/supabase.ts
```

**安全相关**:
```
安全总览 → docs/SECURITY.md
加密工具 → lib/utils/crypto.ts
配额管理 → supabase/functions/check_and_decrement_quota.sql
内容审核 → lib/safety/content-moderation.ts
```

### 环境变量配置

**必需的环境变量**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI服务
GOOGLE_GEMINI_API_KEY=          # 内容分析
FAL_AI_API_KEY=                 # 视频生成

# 爬虫
APIFY_API_KEY=                  # 数据爬取

# 安全
APIFY_WEBHOOK_SECRET=           # Webhook验证
FAL_WEBHOOK_SECRET=             # Webhook验证
ENCRYPTION_KEY=                 # Token加密 (32字节hex)
```

查看完整配置: `.env.example`

### 开发命令

```bash
# 本地开发
npm run dev                     # 启动开发服务器
npm run build                   # 构建生产版本
npm run type-check              # TypeScript检查

# 测试
node test-apis.js               # 测试基础API
node test-shorts-optimizer.js   # 测试评分系统
node test-youtube-discovery.js  # 测试爬取功能

# 数据库
npx supabase db push            # 推送迁移
npx supabase db reset           # 重置数据库
```

---

## 📚 文档索引 (500字)

### 必读文档 (开始开发前必看)

1. **本文档** - `PROJECT_SNAPSHOT.md`  
   项目全貌，3分钟速览

2. **工作日志** - `WORKLOG.md`  
   最近的开发进度和决策

3. **快速开始** - `docs/QUICKSTART.md`  
   本地开发环境搭建

### 核心技术文档 (按需查阅)

**架构相关**:
- `docs/ARCHITECTURE.md` - 完整架构设计
- `docs/ADR.md` - 架构决策记录 (为什么这样设计)

**API开发**:
- `docs/API.md` - API接口文档
- `docs/DATABASE.md` - 数据库设计

**功能专题**:
- `docs/VIRAL_DEFINITION_STANDARDS.md` - V2爆款标准
- `docs/YOUTUBE_SHORTS_OPTIMIZATION.md` - Shorts优化
- `docs/AI_GENERATION_GUIDE.md` - AI视频生成

**安全与运维**:
- `docs/SECURITY.md` - 安全完整方案
- `docs/TROUBLESHOOTING.md` - 故障排查手册
- `docs/DEPLOYMENT.md` - 部署指南

### 历史文档 (了解背景)

- `docs/PROJECT_EVOLUTION.md` - 项目演进历史
- `docs/API_V2_UPGRADE_SUMMARY.md` - V2升级总结

### 文档使用建议

**简单任务** (修Bug、小功能):  
→ 只读本文档 + `WORKLOG.md`

**中等任务** (新功能、重构):  
→ 加读相关专题文档 (如`API.md`, `DATABASE.md`)

**复杂任务** (架构变更、安全审计):  
→ 加读`ARCHITECTURE.md`, `ADR.md`, `SECURITY.md`

---

## 💡 关键决策摘要 (500字)

### 为什么选择这个技术栈？

**Next.js + Vercel**:
- ✅ Serverless，无需管理服务器
- ✅ 自动扩容
- ✅ 全球CDN
- ❌ 60秒超时限制 (通过异步架构解决)

**Supabase**:
- ✅ PostgreSQL + Realtime
- ✅ 内置认证
- ✅ RLS行级安全
- ✅ 比Firebase便宜

**Gemini vs Claude**:
- ✅ 成本差40倍 ($0.375 vs $18/M tokens)
- ✅ 功能满足需求
- ❌ 可能稍慢 (影响不大)

**FAL.AI**:
- ✅ 统一接口访问多个AI模型
- ✅ 避免对接5+不同API
- ✅ 方便切换模型
- ❌ 增加一层抽象 (可接受)

### 重要的权衡

**文档 vs 代码**:
- 当前: 60%文档 / 40%代码 ⚠️
- 目标: 30%文档 / 70%代码
- 原因: 过度文档化导致进度慢

**完美 vs 快速**:
- 策略: MVP先求快，V1.0再求好
- 当前问题: 在MVP阶段追求完美
- 调整: 接受技术债，快速验证

**自建 vs 托管**:
- 决策: 优先使用托管服务
- 原因: 节省开发时间，专注核心业务
- 例子: Apify (爬虫), FAL.AI (AI), Supabase (数据库)

### 已避免的陷阱

✅ **Vercel超时**: 提前设计异步架构  
✅ **配额竞态**: 使用数据库行锁  
✅ **Token泄露**: AES-256加密存储  
✅ **成本爆炸**: Gemini替代Claude  
✅ **Webhook失败**: 签名验证 + 幂等性

---

## 🚀 下一步行动

### 本周目标 (2024-11-21 ~ 11-27)

**星期四-五** (11-21 ~ 11-22):
- [ ] 完成V2测试验证
- [ ] 前端适配V2评分展示
- [ ] 开始YouTube OAuth实现

**星期六-日** (11-23 ~ 11-24):
- [ ] YouTube OAuth完成60%
- [ ] 测试Token加密/解密
- [ ] 设计Dashboard基础布局

**下周一-三** (11-25 ~ 11-27):
- [ ] YouTube OAuth完成并测试
- [ ] Dashboard核心功能实现
- [ ] 整合测试全流程

### 两周目标 (11-28 ~ 12-04)

- [ ] MVP所有功能完成
- [ ] E2E测试覆盖核心流程
- [ ] 准备Beta测试
- [ ] Landing Page上线

---

## ⚠️ 需要注意的事项

### 开发时注意

1. **Webhook路径**: 不要被middleware拦截，检查`middleware.ts`的matcher配置

2. **配额扣除**: 必须使用RPC函数`check_and_decrement_quota`，不要直接UPDATE

3. **Token存储**: 必须用`encrypt()`加密，不要明文存储

4. **临时URL**: FAL.AI返回的URL会过期，必须下载并存储到Supabase Storage

5. **并发测试**: 关键功能都要测试并发场景，尤其是配额相关

### 部署时注意

1. **环境变量**: 特别是`ENCRYPTION_KEY`，丢失后无法解密已存储的Token

2. **RLS策略**: 必须启用，否则数据泄露

3. **Cron任务**: 在Supabase中配置，用于清理僵尸任务

4. **Webhook Secret**: 生产环境必须使用强随机密钥

5. **Storage限制**: 设置文件大小和类型限制

---

## 📞 获取帮助

**查找代码**:
1. 先在本文档的"快速查找"部分找文件路径
2. 使用VS Code全局搜索关键词
3. 查看Git提交历史了解修改原因

**理解设计**:
1. 先读本文档了解全貌
2. 查看`docs/ADR.md`了解决策原因
3. 查看具体功能的专题文档

**解决问题**:
1. 先查`docs/TROUBLESHOOTING.md`
2. 检查`WORKLOG.md`看是否是已知问题
3. 查看GitHub Issues

**联系**:
- GitHub Issues: https://github.com/372768498/shipinzidonghua1119/issues
- 工作日志: `WORKLOG.md`

---

## 🏁 最后

这个文档会在每个Sprint结束时更新。如果发现过时信息，请立即更新。

**记住**: 这是为了提高效率，不是增加负担。如果这个文档没有帮到你，说明需要改进！

---

**文档版本**: 1.0  
**创建日期**: 2024-11-21  
**维护者**: Jilo.ai Team
