# 🚀 Jilo.ai - AI视频内容自动化工厂

通过AI技术自动发现爆款视频、生成原创内容并自动发布到YouTube。

## 📋 项目状态

✅ 配置文件已完成  
✅ 基础项目结构已创建  
⏳ 核心功能开发中

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **AI服务**: FAL.AI, Google Gemini
- **爬虫**: Apify

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

# FAL.AI配置
FAL_AI_API_KEY=你的fal_ai密钥

# Google Gemini配置
GOOGLE_GEMINI_API_KEY=你的gemini密钥

# Apify配置
APIFY_API_KEY=你的apify密钥
\`\`\`

### 4. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📚 文档

完整的项目文档在 \`docs/\` 目录下：

- [产品需求文档](docs/PRD.md)
- [架构设计](docs/ARCHITECTURE.md)
- [API文档](docs/API.md)
- [数据库设计](docs/DATABASE.md)
- [开发指南](docs/DEVELOPMENT.md)
- [Git工作流程](docs/GIT_WORKFLOW.md)
- [代码审查规范](docs/CODE_REVIEW.md)
- [CI/CD配置](docs/CI_CD.md)

## 🏗️ 项目结构

\`\`\`
.
├── app/                  # Next.js App Router
│   ├── (auth)/          # 认证相关页面
│   ├── (dashboard)/     # Dashboard页面
│   ├── api/             # API路由
│   ├── globals.css      # 全局样式
│   ├── layout.tsx       # 根布局
│   └── page.tsx         # 首页
├── components/          # React组件
│   ├── ui/             # shadcn/ui组件
│   └── ...
├── lib/                 # 工具库
│   ├── supabase.ts     # Supabase客户端
│   └── utils.ts        # 工具函数
├── docs/               # 项目文档
├── public/             # 静态资源
└── ...
\`\`\`

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
npm run test         # 运行测试
npm run test:watch   # 监听模式运行测试
\`\`\`

## 🔒 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🤝 贡献指南

请查看 [DEVELOPMENT.md](docs/DEVELOPMENT.md) 和 [GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)

## 📄 许可证

私有项目

## 📞 联系方式

如有问题，请创建 Issue 或联系项目维护者。
