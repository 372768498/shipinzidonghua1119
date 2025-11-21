# 🎯 SPRINT_PLAN - Sprint规划

> **更新时间**: 2024-11-21  
> **当前Sprint**: Sprint 2  
> **项目阶段**: MVP开发

---

## 🚀 Sprint 2 - MVP核心功能集成 (11.22 - 11.29, 7天)

### 🎯 Sprint目标
**完成MVP三大核心环节的真实API集成 + 清理技术债务**

**成功标准**:
- ✅ 至少1个真实API集成完成（优先视频生成）
- ✅ Publish模块UI完成
- ✅ 高优先级技术债务解决4/5
- ✅ 端到端测试通过

### 📋 Sprint Backlog

#### Day 1 (11.22 周五) - 清理+Publish契约
**目标**: 清理技术债务 + 开始Publish模块

**任务清单**:
- [ ] 🔴 **立即**: 删除旧文件
  ```bash
  rm -rf app/discover
  rm -rf app/monitoring
  git commit -m "chore: remove old directories"
  ```
  - 预计: 5分钟
  - 优先级: Critical
  - 对应债务: #4

- [ ] 📐 创建 `contracts/publish.contract.ts`
  - YouTube视频上传类型定义
  - OAuth流程类型
  - 发布任务状态管理
  - Mock数据
  - 预计: 2小时

- [ ] 📐 创建 `contracts/PUBLISH_PROMPT.md`
  - Gemini开发指令
  - UI布局规范
  - 预计: 1小时

- [ ] 🔴 环境变量管理规范化
  - 创建 `.env.example`
  - 使用 zod 验证环境变量
  - 移除所有hard-coded keys
  - 预计: 3小时
  - 对应债务: #12

**交付物**:
- ✅ 旧文件清理完成
- ✅ Publish契约文件
- ✅ 环境变量管理优化

---

#### Day 2-3 (11.23-24 周末) - Publish UI + 统一规范
**目标**: 完成Publish模块UI + 重构技术债务

**任务清单**:
- [ ] 🎨 发给Gemini开发 `app/dashboard/publish/page.tsx`
  - YouTube频道连接
  - 视频上传表单
  - 发布队列管理
  - 预计: Gemini 20分钟生成 + 1小时调试

- [ ] 🔴 统一前端类型定义
  - 重构discover页面使用contracts
  - 重构generate页面使用contracts
  - 重构monitoring页面使用contracts
  - 预计: 4小时
  - 对应债务: #5

- [ ] 🟡 统一API响应格式
  - 创建 `types/api.ts` 定义标准格式
  ```typescript
  interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: { code: string; message: string }
    meta?: { total?: number; page?: number }
  }
  ```
  - 重构所有API endpoint
  - 预计: 3小时
  - 对应债务: #8

- [ ] 🔴 创建全局错误处理系统
  - 创建 `components/ErrorBoundary.tsx`
  - 创建 `lib/error-handler.ts`
  - 集成到 `app/layout.tsx`
  - 预计: 4小时
  - 对应债务: #3

**交付物**:
- ✅ Publish UI完成
- ✅ 前端类型统一
- ✅ API响应格式统一
- ✅ 全局错误处理

---

#### Day 4-5 (11.25-26 周一周二) - 视频生成真实API
**目标**: 集成FAL.AI视频生成

**任务清单**:
- [ ] 🔌 完善 `lib/fal-client.ts`
  - FAL.AI SDK封装
  - 错误处理
  - 重试机制
  - 预计: 3小时

- [ ] 🔌 创建 `lib/gemini-analyzer.ts`
  - 分析爆款视频
  - 提取关键要素
  - 生成视频prompt
  - 预计: 4小时

- [ ] 🔌 创建 `lib/video-prompt-generator.ts`
  - Prompt模板系统
  - 参数替换
  - 风格控制
  - 预计: 2小时

- [ ] ⚙️ 重写 `app/api/generate/create/route.ts`
  - 调用Gemini分析
  - 生成优化prompt
  - 调用FAL.AI
  - Fire & Forget模式
  - 预计: 3小时

- [ ] ⚙️ 创建 `app/api/webhooks/fal/route.ts`
  - FAL.AI回调处理
  - 更新任务状态
  - Supabase Realtime通知
  - 预计: 2小时

- [ ] 📦 集成Supabase存储
  - 保存生成任务到数据库
  - 实时状态更新
  - 预计: 2小时

**交付物**:
- ✅ FAL.AI视频生成集成完成
- ✅ Gemini分析集成完成
- ✅ Fire & Forget异步流程
- ✅ 数据库持久化

---

#### Day 6 (11.27 周三) - YouTube OAuth + 上传
**目标**: 集成YouTube Data API

**任务清单**:
- [ ] 🔐 YouTube OAuth流程
  - Google Cloud项目设置
  - OAuth 2.0配置
  - NextAuth配置
  - 预计: 3小时

- [ ] ⚙️ 创建 `lib/youtube-client.ts`
  - YouTube Data API封装
  - 视频上传
  - 元数据管理
  - 预计: 4小时

- [ ] ⚙️ 重写 `app/api/publish/upload/route.ts`
  - 从Supabase获取视频
  - 上传到YouTube
  - 更新状态
  - 预计: 3小时

**交付物**:
- ✅ YouTube OAuth完成
- ✅ 视频上传功能
- ✅ Publish API集成

---

#### Day 7 (11.28 周四) - 端到端测试
**目标**: 完整流程测试 + Bug修复

**任务清单**:
- [ ] 🧪 端到端测试
  1. 爬取爆款视频 (Discover)
  2. 生成新视频 (Generate)
  3. 发布到YouTube (Publish)
  - 预计: 4小时

- [ ] 🐛 Bug修复
  - 根据测试结果修复问题
  - 预计: 4小时

- [ ] 📝 更新文档
  - 更新PROJECT_SNAPSHOT
  - 更新WORKLOG
  - 创建API使用文档
  - 预计: 2小时

**交付物**:
- ✅ MVP核心链路打通
- ✅ 测试报告
- ✅ 文档更新

---

### 📊 Sprint 2 Metrics

**计划工时**: 7天  
**关键里程碑**:
- Day 1: 清理完成
- Day 3: Publish UI完成
- Day 5: Generate真实API完成
- Day 7: MVP端到端测试通过

**风险**:
- 🔴 FAL.AI API不稳定 → 准备fallback方案
- 🟡 YouTube审核延迟 → 先用测试频道
- 🟡 时间不够 → 优先核心功能，推迟优化

**技术债务解决进度**:
- 🔴 高优先级: 4/5 → 目标 5/5
- 🟡 中优先级: 0/8 → 目标 3/8

---

## 🎯 Sprint 3 - 用户体验提升 (11.29 - 12.06, 7天)

### Sprint目标
**完善用户体验 + 安全性 + 稳定性**

### 主要任务
- [ ] 用户认证系统 (NextAuth + Supabase)
- [ ] Loading状态统一管理
- [ ] 数据持久化 (React Query)
- [ ] 组件库建设 (shadcn/ui)
- [ ] 错误处理优化
- [ ] API速率限制

### 成功标准
- ✅ 用户可以注册登录
- ✅ 所有页面有完善的Loading状态
- ✅ 刷新不丢失数据
- ✅ UI组件统一
- ✅ 中优先级债务解决 5/8

---

## 🎯 Sprint 4 - 监控和安全 (12.06 - 12.13, 7天)

### Sprint目标
**建立监控体系 + 安全加固**

### 主要任务
- [ ] 分析埋点 (PostHog/Mixpanel)
- [ ] 错误监控 (Sentry)
- [ ] 性能监控
- [ ] API速率限制
- [ ] 安全审计
- [ ] E2E测试套件

### 成功标准
- ✅ 能追踪用户行为
- ✅ 自动捕获错误
- ✅ 核心流程有E2E测试
- ✅ 通过安全审计

---

## 🎯 Sprint 5 - 优化和polish (12.13 - 12.20, 7天)

### Sprint目标
**性能优化 + 体验polish**

### 主要任务
- [ ] 性能优化
  - 图片优化
  - 代码分割
  - 懒加载
  - Bundle优化
- [ ] SEO优化
- [ ] 国际化 (可选)
- [ ] 移动端适配
- [ ] 细节polish

### 成功标准
- ✅ Lighthouse分数 > 90
- ✅ 移动端可用
- ✅ 所有低优先级债务评估完成

---

## 📈 长期路线图

### Q1 2025 - MVP上线
- Sprint 2-5: 功能完善
- 内测 + 反馈收集
- 公开Beta

### Q2 2025 - 功能扩展
- 多平台支持 (Instagram, Twitter)
- 更多AI模型
- 高级编辑功能
- 团队协作

### Q3 2025 - 规模化
- 性能优化
- 成本优化
- 企业功能
- API开放

---

## 💡 Sprint管理原则

### 每日站会 (可选)
- 昨天完成了什么
- 今天计划做什么
- 有什么阻碍

### Sprint Review
- 演示完成的功能
- 收集反馈
- 更新产品Backlog

### Sprint Retro
- 什么做得好
- 什么可以改进
- 行动项

### Definition of Done
- [ ] 代码已提交
- [ ] 功能测试通过
- [ ] 文档已更新
- [ ] 无Critical bug
- [ ] Code review通过

---

## 🎯 关键指标

### Sprint 2目标
- **功能完成度**: 70% → 85%
- **技术债务**: 13/23 → 8/23
- **API集成**: 0/3 → 2/3
- **测试覆盖**: 0% → 20%

### 项目总体目标
- **MVP上线**: 2025-01-01
- **首批用户**: 100人
- **功能完整度**: 100%
- **技术债务**: < 5项高优先级

---

## 🔗 相关文档

- [PROJECT_SNAPSHOT.md](./PROJECT_SNAPSHOT.md) - 项目状态
- [TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md) - 技术债务
- [WORKLOG.md](./WORKLOG.md) - 工作日志
- [README.md](./README.md) - 项目介绍

---

**创建时间**: 2024-11-21  
**下次更新**: Sprint 2结束  
**维护者**: Jilo.ai Team  
**当前状态**: 🚀 Sprint 2即将开始
