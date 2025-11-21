# 🏃 SPRINT PLAN - Sprint规划

> **当前Sprint**: Sprint 2 - MVP核心功能完成  
> **开始日期**: 2024-11-22 (星期五)  
> **结束日期**: 2024-12-08 (星期日)  
> **时长**: 17天 (约3周)

---

## 🎯 Sprint目标

### 主要目标

1. **完成Publish模块** - 实现YouTube自动发布功能
2. **真实API集成** - 替换所有Mock API为真实服务
3. **用户认证** - 实现完整的认证和授权系统
4. **技术债务清理** - 修复至少5个高优先级债务

### 成功标准

- ✅ 核心链路端到端可用（爆款发现 → 视频生成 → YouTube发布）
- ✅ 至少1个真实用户能完整走通流程
- ✅ 技术债务从19个降到<15个
- ✅ 所有高优先级债务有修复计划

---

## 📅 3周计划

### Week 1: 基础设施 (11/22 - 11/28)

#### Day 1-2: 环境准备
- [ ] 清理旧文件（`app/discover/`, `app/monitoring/`）
- [ ] 完善数据库Schema
  - [ ] 创建 `generate_tasks` 表
  - [ ] 创建 `publish_jobs` 表
  - [ ] 创建 `youtube_channels` 表
- [ ] 配置环境变量
  - [ ] FAL.AI API Key
  - [ ] YouTube OAuth Client ID/Secret
  - [ ] Apify API Token

#### Day 3-4: FAL.AI视频生成集成
- [ ] 完善 `lib/fal-client.ts`
- [ ] 实现 `app/api/generate/create/route.ts` (真实)
- [ ] 实现 `app/api/webhooks/fal/route.ts` 回调
- [ ] 测试视频生成流程

#### Day 5-7: Apify爬虫集成
- [ ] 实现 `app/api/discover/scrape/route.ts` (真实)
- [ ] 实现 `app/api/webhooks/apify/route.ts` 回调
- [ ] 测试爬取流程

**Week 1 交付物**:
- ✅ 数据库Schema完整
- ✅ FAL.AI集成完成
- ✅ Apify集成完成
- 🎯 进度: 环节1、2打通

---

### Week 2: Publish模块 + 认证 (11/29 - 12/5)

#### Day 8-9: Publish契约和UI
- [ ] 创建 `contracts/publish.contract.ts`
- [ ] 创建Gemini开发指令
- [ ] Gemini生成 `app/dashboard/publish/page.tsx`
- [ ] 提交UI到仓库

#### Day 10-12: YouTube OAuth实现
- [ ] 研究YouTube Data API v3
- [ ] 实现OAuth流程
  - [ ] `app/api/auth/youtube/route.ts` - 授权跳转
  - [ ] `app/api/auth/youtube/callback/route.ts` - 回调处理
  - [ ] Token存储和刷新
- [ ] 频道绑定UI

#### Day 13-14: YouTube上传功能
- [ ] 实现 `lib/youtube-client.ts`
- [ ] 实现 `app/api/publish/upload/route.ts`
- [ ] 视频上传逻辑
  - 标题/描述生成
  - 缩略图生成
  - SEO优化
- [ ] 测试上传流程

**Week 2 交付物**:
- ✅ Publish模块UI完成
- ✅ YouTube OAuth可用
- ✅ 视频可以上传到YouTube
- 🎯 进度: 核心链路全部打通

---

### Week 3: 用户认证 + 优化 (12/6 - 12/8)

#### Day 15: Supabase Auth集成
- [ ] 配置Supabase Auth
- [ ] 实现登录/注册页面（真实）
- [ ] JWT验证中间件
- [ ] API route保护

#### Day 16: RLS和权限
- [ ] 配置Row Level Security
- [ ] 用户配额管理
- [ ] 多租户隔离

#### Day 17: 端到端测试和优化
- [ ] 完整流程测试
- [ ] 性能优化
- [ ] Bug修复
- [ ] Sprint回顾

**Week 3 交付物**:
- ✅ 用户认证系统
- ✅ 端到端流程可用
- ✅ Sprint 2完成
- 🎯 进度: MVP完成度90%+

---

## 📋 任务清单

### 高优先级任务 (Must Have)

#### 架构与基础
- [ ] #1 清理旧文件（5分钟）
- [ ] #2 完善数据库Schema（1天）
- [ ] #3 配置环境变量（0.5天）

#### 核心功能
- [ ] #4 FAL.AI视频生成集成（2天）
- [ ] #5 Apify爬虫集成（2天）
- [ ] #6 YouTube OAuth实现（3天）
- [ ] #7 YouTube上传功能（2天）
- [ ] #8 Supabase Auth集成（1天）

#### UI开发
- [ ] #9 Publish页面契约（0.5天）
- [ ] #10 Publish页面UI（Gemini，0.5天）

### 中优先级任务 (Should Have)

- [ ] #11 错误处理完善（2天）
- [ ] #12 Loading状态添加（1天）
- [ ] #13 类型统一重构（1天）
- [ ] #14 数据持久化（2天）

### 低优先级任务 (Nice to Have)

- [ ] #15 响应式优化（1天）
- [ ] #16 性能监控（1天）
- [ ] #17 API文档（1天）

---

## 👥 人员分配

### 团队构成

假设团队规模：2-3人

**开发者A** (Backend重点):
- FAL.AI集成
- Apify集成
- YouTube API
- 数据库Schema

**开发者B** (Frontend重点):
- Publish页面
- UI优化
- 类型统一
- 错误处理

**开发者C** (全栈):
- Supabase Auth
- OAuth流程
- 端到端测试
- 技术债务

---

## 🚧 风险管理

### 识别的风险

#### 风险1: YouTube API配额限制
- **概率**: 高
- **影响**: 中
- **缓解**: 
  - 申请扩大配额
  - 实现配额监控
  - 优化API调用

#### 风险2: FAL.AI不稳定
- **概率**: 中
- **影响**: 高
- **缓解**:
  - 实现重试机制
  - 考虑备用方案
  - 联系FAL.AI技术支持

#### 风险3: OAuth实现复杂
- **概率**: 中
- **影响**: 中
- **缓解**:
  - 提前研究文档
  - 参考成熟案例
  - 预留buffer时间

#### 风险4: 时间不足
- **概率**: 中
- **影响**: 高
- **缓解**:
  - 每日站会追踪进度
  - 及时调整优先级
  - 必要时延长Sprint

---

## 📊 进度追踪

### Daily Standup格式

**每天早上10:00**

1. 昨天完成了什么？
2. 今天计划做什么？
3. 遇到什么阻碍？

### Sprint燃尽图

```
剩余任务
  20│●
    │  ●
  15│    ●
    │      ●
  10│        ●
    │          ●
   5│            ●
    │              ●
   0└────────────────●─────> 时间
    D1  D3  D5  D7  D9  D11 D13 D15 D17
```

**理想燃尽**: 每天完成约1.2个任务

### 每周Review

**Week 1 Review** (11/28):
- 回顾完成情况
- 识别阻碍
- 调整Week 2计划

**Week 2 Review** (12/5):
- 回顾完成情况
- 评估MVP完成度
- 调整Week 3计划

**Sprint 2 Retrospective** (12/8):
- 总结经验教训
- 更新最佳实践
- 规划Sprint 3

---

## 🎯 Definition of Done (DoD)

### 功能级DoD

一个功能算"完成"必须满足：

- [ ] 代码已提交到main分支
- [ ] 本地测试通过
- [ ] API可以正常调用
- [ ] UI展示正常
- [ ] 无明显bug
- [ ] 相关文档已更新

### Sprint级DoD

Sprint算"完成"必须满足：

- [ ] 所有高优先级任务完成
- [ ] 核心链路端到端可用
- [ ] 演示环境可访问
- [ ] 技术债务文档已更新
- [ ] Sprint回顾会议完成

---

## 📈 成功指标

### 功能指标

- ✅ 视频生成成功率 > 80%
- ✅ YouTube上传成功率 > 90%
- ✅ 端到端流程完成时间 < 10分钟

### 技术指标

- ✅ API响应时间 < 200ms (p95)
- ✅ 页面加载时间 < 3s
- ✅ 技术债务减少 > 20%

### 团队指标

- ✅ 任务完成率 > 85%
- ✅ 代码提交频率 > 3次/天
- ✅ Daily standup参与率 100%

---

## 🎊 Sprint 2 愿景

> **从"能看"到"能用"**

**Sprint 1完成**:
- ✅ UI框架搭建
- ✅ Mock数据展示
- ✅ 路由架构完善

**Sprint 2目标**:
- 🎯 真实功能可用
- 🎯 用户能实际使用
- 🎯 核心价值验证

**Sprint 2完成后**:
- 🚀 MVP可以给真实用户试用
- 🚀 可以开始收集用户反馈
- 🚀 为产品上线做准备

---

## 🔗 相关文档

- [PROJECT_SNAPSHOT.md](./PROJECT_SNAPSHOT.md) - 项目快照
- [WORKLOG.md](./WORKLOG.md) - 工作日志
- [TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md) - 技术债务
- [contracts/](./contracts/) - 接口契约

---

**创建时间**: 2024-11-21 晚上  
**负责人**: Product Owner  
**Review时间**: 每周五下午5:00
