# 🚀 Jilo.ai - AI视频内容自动化工厂

通过AI技术自动发现爆款视频、生成原创内容并自动发布到YouTube。

---

## ⚡ 快速导航 (必读)

**新手入门**:
- 📸 [PROJECT_SNAPSHOT.md](./PROJECT_SNAPSHOT.md) - **3分钟了解全项目** (开始开发前必读!)
- 📝 [WORKLOG.md](./WORKLOG.md) - 最近3天的开发进度
- 🚀 [docs/QUICKSTART.md](./docs/QUICKSTART.md) - 本地开发环境搭建

**核心文档**:
- 🏗️ [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - 架构设计
- 🔒 [docs/SECURITY.md](./docs/SECURITY.md) - 安全方案 (93.5/100)
- 📖 [docs/API.md](./docs/API.md) - API文档
- 🗄️ [docs/DATABASE.md](./docs/DATABASE.md) - 数据库设计

---

## 📋 项目状态

✅ 架构设计完成 (Fire & Forget异步架构)  
✅ 安全加固完成 (93.5/100企业级)  
✅ V2评分系统完成 (专业爆款标准)  
🔄 前端开发中 (30%)  
⏳ YouTube发布功能 (待开始)

**当前Sprint**: V2测试验证 + YouTube OAuth集成  
**进度**: MVP 70%完成

---

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **部署**: Vercel (Serverless)
- **数据库**: Supabase (PostgreSQL + Realtime)
- **认证**: Supabase Auth
- **AI分析**: Google Gemini 3.0 (成本优化)
- **视频生成**: FAL.AI (统一接口)
- **爬虫**: Apify (托管服务)

---

## 🚀 快速开始

### 1. 克隆仓库

\`\`\`bash
git clone https://github.com/372768498/shipinzidonghua1119.git
cd shipinzidonghua1119
\`\`\`

### 2. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 3. 配置环境变量

复制环境变量模板：

\`\`\`bash
cp .env.example .env.local
\`\`\`

然后编辑 \`.env.local\` 文件，填入你的API密钥：

\`\`\`env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=你的supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的supabase服务角色密钥

# AI服务
GOOGLE_GEMINI_API_KEY=你的gemini密钥
FAL_AI_API_KEY=你的fal_ai密钥

# 爬虫
APIFY_API_KEY=你的apify密钥

# 安全密钥
APIFY_WEBHOOK_SECRET=$(openssl rand -hex 32)
FAL_WEBHOOK_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
\`\`\`

### 4. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 5. 测试API (可选)

\`\`\`bash
node test-apis.js              # 测试基础API
node test-shorts-optimizer.js  # 测试V2评分系统
\`\`\`

---

## 📚 文档导航

### 必读文档 (开始前必看)

1. **[PROJECT_SNAPSHOT.md](./PROJECT_SNAPSHOT.md)** - 项目全貌速查表
2. **[WORKLOG.md](./WORKLOG.md)** - 工作日志和最近进度
3. **[docs/QUICKSTART.md](./docs/QUICKSTART.md)** - 快速开始指南

### 核心技术文档

**架构相关**:
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - 完整架构设计
- [docs/ADR.md](./docs/ADR.md) - 架构决策记录 (为什么这样设计)

**API开发**:
- [docs/API.md](./docs/API.md) - API接口文档
- [docs/DATABASE.md](./docs/DATABASE.md) - 数据库设计

**功能专题**:
- [docs/VIRAL_DEFINITION_STANDARDS.md](./docs/VIRAL_DEFINITION_STANDARDS.md) - V2爆款标准
- [docs/YOUTUBE_SHORTS_OPTIMIZATION.md](./docs/YOUTUBE_SHORTS_OPTIMIZATION.md) - Shorts优化
- [docs/AI_GENERATION_GUIDE.md](./docs/AI_GENERATION_GUIDE.md) - AI视频生成

**安全与运维**:
- [docs/SECURITY.md](./docs/SECURITY.md) - 安全完整方案 (⭐⭐⭐⭐⭐)
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - 故障排查手册
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - 部署指南

### 历史文档 (了解背景)

- [docs/PROJECT_EVOLUTION.md](./docs/PROJECT_EVOLUTION.md) - 项目演进历史
- [docs/ROADMAP.md](./docs/ROADMAP.md) - 产品路线图
- [docs/API_V2_UPGRADE_SUMMARY.md](./docs/API_V2_UPGRADE_SUMMARY.md) - V2升级总结

---

## 🏗️ 项目结构

\`\`\`
.
├── PROJECT_SNAPSHOT.md       # 项目快照 (⭐ 开始必读)
├── WORKLOG.md               # 工作日志
├── app/                     # Next.js App Router
│   ├── (auth)/             # 认证相关页面
│   ├── (dashboard)/        # Dashboard页面
│   ├── api/                # API路由
│   │   ├── viral-discovery/    # 爆款发现
│   │   ├── generate/           # 视频生成
│   │   └── webhooks/           # Webhook处理
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页
├── components/             # React组件
│   ├── ui/                # shadcn/ui组件
│   └── dashboard/         # Dashboard组件
├── lib/                   # 工具库
│   ├── supabase.ts        # Supabase客户端
│   ├── youtube-shorts-optimizer-v2.ts  # V2评分系统
│   ├── viral-definition-standards.ts   # 爆款标准
│   └── utils/             # 工具函数
├── docs/                  # 项目文档 (43个)
├── supabase/              # Supabase配置
│   ├── migrations/        # 数据库迁移
│   └── functions/         # Edge Functions
└── tests/                 # 测试文件
\`\`\`

---

## 📝 可用脚本

\`\`\`bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 代码质量
npm run lint         # 运行ESLint检查
npm run lint:fix     # 自动修复ESLint问题
npm run type-check   # TypeScript类型检查
npm run format       # 格式化代码

# 测试
node test-apis.js                 # 测试基础API
node test-shorts-optimizer.js     # 测试V2评分系统
node test-youtube-discovery.js    # 测试爬取功能
\`\`\`

---

## 🎯 核心特性

### ✅ 已完成

**V2爆款发现系统**:
- 四种预设模式 (viral/hot/potential/blueOcean)
- 100分制专业评分
- 分享率优先 (关键传播指标)
- 相对定义 (账号分层评估)
- 垂直领域调整 (不同类别不同标准)

**企业级安全**:
- Token AES-256-GCM加密
- 配额原子扣费 (防止并发超刷)
- Webhook签名验证
- RLS行级安全
- 三层内容审核

**异步架构**:
- Fire & Forget模式
- Webhook回调
- Supabase Realtime实时反馈

### 🔄 进行中

- 前端Dashboard UI
- YouTube OAuth集成
- 用户认证页面

### ⏳ 待开始

- YouTube自动发布
- 数据分析可视化
- 批量内容生成

---

## 🔒 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

---

## 🤝 开发指南

### 开始开发前

1. **必读**: [PROJECT_SNAPSHOT.md](./PROJECT_SNAPSHOT.md) (3分钟)
2. **查看**: [WORKLOG.md](./WORKLOG.md) (最近进度)
3. **搭建**: 按照上面的快速开始步骤

### 开发流程

1. **查找任务**: 查看 [WORKLOG.md](./WORKLOG.md) 的待办事项
2. **创建分支**: `git checkout -b feature/your-feature`
3. **开发**: 参考 [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)
4. **提交**: 遵循 [docs/GIT_WORKFLOW.md](./docs/GIT_WORKFLOW.md)
5. **更新日志**: 在 [WORKLOG.md](./WORKLOG.md) 记录进度

### 遇到问题?

1. 先查 [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
2. 再看 [docs/SECURITY.md](./docs/SECURITY.md) (如果是安全相关)
3. 检查 [WORKLOG.md](./WORKLOG.md) 看是否是已知问题
4. 创建 GitHub Issue

---

## 📊 项目指标

**代码质量**:
- TypeScript覆盖率: 100%
- 安全评分: 93.5/100 ⭐⭐⭐⭐⭐

**开发进度**:
- MVP完成度: 70%
- 文档完成度: 100%
- 测试覆盖率: 40%

**技术债务**:
- 前端UI需要完善
- 单元测试需要补充
- 文档需要精简 (43个 → 目标20个)

---

## 📄 许可证

私有项目

---

## 📞 联系方式

- **GitHub Issues**: [创建Issue](https://github.com/372768498/shipinzidonghua1119/issues)
- **安全问题**: security@jilo.ai
- **工作日志**: [WORKLOG.md](./WORKLOG.md)

---

## 🎉 致谢

感谢所有贡献者和支持这个项目的人！

---

**最后更新**: 2024-11-21  
**当前版本**: V2.0 (专业爆款标准)  
**下一个里程碑**: YouTube发布集成
