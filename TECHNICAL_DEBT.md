# 🐛 TECHNICAL DEBT - 技术债务清单

> **目的**: 系统化管理技术债务，优先级排序，防止债务失控  
> **更新频率**: 发现新债务时立即添加，每个Sprint结束时review  
> **格式**: 按优先级和分类组织

---

## 📊 债务概览

| 类别 | 高优先级 | 中优先级 | 低优先级 | 总计 |
|------|----------|----------|----------|------|
| 架构 | 0 | 1 | 0 | 1 |
| API | 3 | 2 | 0 | 5 |
| 前端 | 2 | 3 | 2 | 7 |
| 数据库 | 1 | 0 | 0 | 1 |
| 安全 | 1 | 0 | 0 | 1 |
| 测试 | 0 | 1 | 1 | 2 |
| 文档 | 0 | 1 | 1 | 2 |
| **总计** | **7** | **8** | **4** | **19** |

**利息估算**: 
- 高优先级: 每个需要2-5天修复
- 中优先级: 每个需要1-2天修复
- 低优先级: 每个需要0.5-1天修复
- **总工作量**: 约25-40天

---

## 🔥 高优先级（P0 - 必须修复）

### 1. ❌ Mock API未替换为真实服务

**描述**: 所有API端点都是Mock数据，未集成真实服务

**影响**: 
- 🚫 产品无法实际使用
- 🚫 无法验证核心流程
- 🚫 影响用户体验测试

**需要集成的服务**:
- `/api/discover/scrape` → Apify爬虫
- `/api/generate/create` → FAL.AI视频生成
- `/api/publish/*` → YouTube Data API
- `/api/dashboard/stats` → Supabase查询

**修复成本**: 8-10天

**修复计划**: Sprint 2 (Week 1-2)

**Owner**: Backend Team

---

### 2. ⚠️ 无用户认证和授权

**描述**: 所有页面和API都是公开的，没有任何认证机制

**影响**:
- 🔒 安全风险极高
- 🔒 无法追踪用户行为
- 🔒 无法实施配额管理
- 🔒 API可被任意调用

**需要实现**:
1. Supabase Auth集成
2. JWT token验证
3. API route保护
4. RLS (Row Level Security)
5. OAuth providers (Google, GitHub)

**修复成本**: 3-5天

**修复计划**: Sprint 2 (Week 2)

**Owner**: Security Team

---

### 3. 🐛 错误处理不完善

**描述**: 前端缺少统一的错误边界和错误处理

**影响**:
- ❌ 用户看到白屏或未捕获错误
- ❌ 无法追踪错误来源
- ❌ 开发调试困难

**需要实现**:
- React Error Boundary
- 全局错误拦截
- 统一错误Toast
- Sentry集成

**修复成本**: 2-3天

**修复计划**: Sprint 2 (Week 2)

**Owner**: Frontend Team

---

### 4. 📦 旧文件未清理

**描述**: 路由重构后，旧目录仍然存在

**位置**:
- `app/discover/` (已迁移到 `app/dashboard/discover/`)
- `app/monitoring/` (已迁移到 `app/dashboard/monitoring/`)

**影响**:
- 📁 代码冗余
- 📁 可能导致路由冲突
- 📁 维护困惑

**修复方法**:
```bash
rm -rf app/discover
rm -rf app/monitoring
git add -A
git commit -m "chore: remove old directories after route restructure"
```

**修复成本**: 5分钟

**修复计划**: 立即

**Owner**: DevOps

---

### 5. 💾 无数据持久化

**描述**: 前端state刷新后丢失，Mock数据存在内存

**影响**:
- 😓 用户体验差
- 😓 无法保存工作进度
- 😓 测试困难

**需要实现**:
- Supabase实时查询
- LocalStorage缓存
- 状态持久化中间件

**修复成本**: 2-3天

**修复计划**: Sprint 2 (Week 3)

**Owner**: Frontend Team

---

### 6. 🎨 UI组件类型不统一

**描述**: Gemini生成的UI使用自定义类型，未使用contracts

**现象**:
```typescript
// ❌ 错误: 页面内定义类型
interface Video {
  id: string
  title: string
  // ...
}

// ✅ 正确: 使用contracts
import { ViralVideo } from '@/contracts/discover.contract'
```

**影响**:
- 🔄 类型不同步
- 🔄 重复定义
- 🔄 维护困难

**需要修复的文件**:
- `app/dashboard/generate/page.tsx`
- `app/dashboard/monitoring/page.tsx`

**修复成本**: 1天

**修复计划**: Sprint 2 (Week 3)

**Owner**: Frontend Team

---

### 7. 🗄️ 数据库Schema不完整

**描述**: 缺少视频生成任务表和发布记录表

**缺失的表**:
- `generate_tasks` - 视频生成任务
- `publish_jobs` - 发布任务
- `youtube_channels` - YouTube频道绑定

**影响**:
- 🚫 无法存储生成任务
- 🚫 无法追踪发布状态
- 🚫 API无法实际工作

**修复成本**: 1-2天

**修复计划**: Sprint 2 (Week 1)

**Owner**: Database Team

---

## ⚠️ 中优先级（P1 - 应该修复）

### 8. 🔄 无Loading状态

**描述**: 部分API调用缺少loading UI

**影响**: 用户不知道系统是否在工作

**修复成本**: 1天

---

### 9. 📱 响应式设计不完整

**描述**: 部分页面在移动端体验差

**影响**: 移动用户体验差

**修复成本**: 2天

---

### 10. 🔗 硬编码配置

**描述**: API URLs、模型参数等硬编码在代码中

**需要移到**: `.env.local` 或配置文件

**修复成本**: 1天

---

### 11. 📊 无性能监控

**描述**: 缺少性能指标和监控

**需要集成**: Vercel Analytics, Sentry Performance

**修复成本**: 1-2天

---

### 12. 🎨 UI/UX不一致

**描述**: Dashboard和其他页面风格不统一

**影响**: 视觉体验不连贯

**修复成本**: 2-3天

---

### 13. 📝 API文档缺失

**描述**: 没有Swagger/OpenAPI文档

**影响**: 前后端协作困难

**修复成本**: 1-2天

---

### 14. 🔐 环境变量管理混乱

**描述**: `.env.example` 不完整，缺少说明

**修复成本**: 0.5天

---

### 15. ⚡ 未优化的Bundle大小

**描述**: Framer Motion等库未做code splitting

**影响**: 首屏加载慢

**修复成本**: 1天

---

## 📝 低优先级（P2 - 可以延后）

### 16. 🌍 无国际化支持

**描述**: 只有中文，无i18n

**修复成本**: 3-5天

---

### 17. 🧪 测试覆盖率0%

**描述**: 无单元测试、集成测试、E2E测试

**修复成本**: 5-10天

---

### 18. 🎨 无Design System

**描述**: UI组件未抽象成共享库

**修复成本**: 5-7天

---

### 19. 📖 用户文档缺失

**描述**: 无用户手册、FAQ、视频教程

**修复成本**: 3-5天

---

## 📈 债务趋势分析

### 债务增长曲线

```
债务数量
  20│                                    ● (19)
    │                          ●
  15│                    ●
    │              ●
  10│        ●
    │  ●
   5│
    └─────────────────────────────────────> 时间
    11/19  11/20  11/21 (今天)
```

**分析**:
- 📈 债务增长速度: 约6-7个/天
- ⚠️ 高优先级占比: 37% (偏高)
- 💡 主要来源: 快速MVP开发，架构重构

### 债务来源

1. **快速开发** (60%) - 为了速度牺牲质量
2. **架构重构** (25%) - 路由重构遗留问题
3. **新功能** (10%) - Generate模块新增
4. **技术选型** (5%) - Mock API策略

---

## 🎯 修复策略

### Sprint 2 计划 (下周)

**Week 1: 核心功能完整性**
- [ ] 集成FAL.AI视频生成
- [ ] 集成Apify爬虫
- [ ] 完成数据库Schema
- [ ] 清理旧文件

**Week 2: 安全和稳定性**
- [ ] 实现用户认证
- [ ] 添加错误处理
- [ ] 集成YouTube API

**Week 3: 用户体验**
- [ ] 修复类型不统一
- [ ] 添加Loading状态
- [ ] 数据持久化

### 每日债务Review

**建议实践**:
1. 每天早会review高优先级债务
2. 每完成一个功能，立即修复相关债务
3. 每个Sprint预留20%时间还债
4. 新增债务必须有Owner和修复计划

### 债务预警机制

**红线指标**:
- ⛔ 高优先级 > 10个 → 停止新功能开发
- ⚠️ 总债务 > 30个 → 启动债务清理Sprint
- ⚠️ 单个债务存在 > 2周 → 升级优先级

**当前状态**: 🟡 黄色预警 (高优先级7个)

---

## 🔗 相关文档

- [PROJECT_SNAPSHOT.md](./PROJECT_SNAPSHOT.md) - 项目快照
- [WORKLOG.md](./WORKLOG.md) - 工作日志
- [SPRINT_PLAN.md](./SPRINT_PLAN.md) - Sprint规划

---

**最后更新**: 2024-11-21 晚上  
**负责人**: Tech Lead  
**Review周期**: 每周一
