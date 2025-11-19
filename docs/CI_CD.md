# 🚀 CI/CD配置文档 (Continuous Integration & Deployment)

> **文档目的**: 定义Jilo.ai的自动化测试、构建和部署流程  
> **创建日期**: 2024-11-19  
> **版本**: V1.0  
> **平台**: GitHub Actions + Vercel

---

## 📋 目录

1. [CI/CD概述](#cicd概述)
2. [GitHub Actions配置](#github-actions配置)
3. [环境管理](#环境管理)
4. [部署流程](#部署流程)
5. [监控和回滚](#监控和回滚)

---

## CI/CD概述

### 🎯 目标

- **自动化测试**: 每次提交自动运行测试
- **代码质量检查**: 自动Lint和类型检查
- **自动化部署**: 代码合并后自动部署
- **快速反馈**: 5-10分钟内获得CI结果

### 🏗️ 整体架构

```
GitHub Push/PR
      ↓
GitHub Actions (CI)
  ├── Lint检查
  ├── TypeScript检查
  ├── 单元测试
  ├── 构建测试
  └── 安全扫描
      ↓
    通过? ────→ No → 阻止合并
      ↓ Yes
    合并到main
      ↓
Vercel (CD)
  ├── 构建应用
  ├── 运行E2E测试
  └── 部署生产环境
```

---

## GitHub Actions配置

### 📝 工作流文件

创建 `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Job 1: 代码质量检查
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: TypeScript Check
        run: npm run type-check
  
  # Job 2: 单元测试
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
  
  # Job 3: 构建测试
  build:
    name: Build Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
  
  # Job 4: 安全扫描
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        continue-on-error: true
```

### 🔐 环境变量配置

在GitHub Settings → Secrets and variables → Actions中配置：

```bash
# 必需的Secrets
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# API密钥
FAL_AI_API_KEY
GOOGLE_GEMINI_API_KEY
APIFY_API_KEY

# 第三方服务
SNYK_TOKEN  # 安全扫描
CODECOV_TOKEN  # 代码覆盖率
```

---

## 环境管理

### 🌍 多环境配置

我们维护3个环境：

```
┌─────────────┬──────────────┬─────────────┐
│ Development │   Staging    │ Production  │
│  (本地开发)  │  (预发布)     │  (生产)     │
├─────────────┼──────────────┼─────────────┤
│ localhost   │ staging.jilo │ jilo.ai     │
│             │   .vercel    │             │
├─────────────┼──────────────┼─────────────┤
│ develop分支  │ develop分支  │ main分支    │
├─────────────┼──────────────┼─────────────┤
│ 本地数据库   │ Staging DB   │ Prod DB     │
└─────────────┴──────────────┴─────────────┘
```

### 📄 环境变量文件

```bash
# .env.local (本地开发)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
FAL_AI_API_KEY=...

# .env.staging (Staging)
NEXT_PUBLIC_APP_URL=https://staging.jilo.vercel.app
NEXT_PUBLIC_SUPABASE_URL=...
# ... staging环境的密钥

# .env.production (Production)
NEXT_PUBLIC_APP_URL=https://jilo.ai
NEXT_PUBLIC_SUPABASE_URL=...
# ... 生产环境的密钥
```

### 🔒 环境变量安全

```bash
# ✅ DO
- 使用Vercel Environment Variables
- 不同环境使用不同的API密钥
- 定期轮换密钥
- 使用Secret Scanner防止泄露

# ❌ DON'T
- 不要提交.env文件到Git
- 不要在代码中硬编码密钥
- 不要在生产环境使用开发密钥
```

---

## 部署流程

### 🚢 Vercel自动部署

#### 配置vercel.json

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app-url",
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

#### 部署触发器

```yaml
# develop分支 → Staging环境
develop分支的Push
  ↓
自动部署到 staging.jilo.vercel.app
  ↓
运行smoke tests
  ↓
通知团队

# main分支 → Production环境
main分支的Push
  ↓
自动部署到 jilo.ai
  ↓
运行E2E tests
  ↓
通知团队
```

### 📊 部署检查清单

```markdown
## 部署前检查

- [ ] 所有测试通过
- [ ] Code Review完成
- [ ] CHANGELOG已更新
- [ ] 数据库迁移已准备
- [ ] 环境变量已配置
- [ ] 回滚方案已准备

## 部署后验证

- [ ] 健康检查通过
- [ ] 关键功能测试
- [ ] 错误日志检查
- [ ] 性能指标正常
- [ ] 用户反馈监控
```

---

## 监控和回滚

### 📈 监控

```yaml
# 配置Vercel Analytics
vercel.json:
  "analytics": true

# 监控指标
- Response Time
- Error Rate
- Request Count
- Build Time
```

### ⏮️ 回滚策略

#### 快速回滚（Vercel）

```bash
# 1. 通过Vercel Dashboard回滚
Vercel Dashboard → Deployments → 选择之前的版本 → Promote to Production

# 2. 通过CLI回滚
vercel rollback <deployment-url>

# 3. 通过Git回滚
git revert <commit-hash>
git push origin main
# Vercel会自动部署新的commit
```

#### 数据库回滚

```bash
# 如果有数据库迁移，需要手动回滚
# Supabase Dashboard → SQL Editor

-- 回滚示例
DROP TABLE IF EXISTS new_table;
ALTER TABLE old_table ADD COLUMN ...
```

### 🚨 回滚决策流程

```
生产环境问题
  ↓
评估严重程度
  ↓
Critical? ─Yes→ 立即回滚
  ↓ No
尝试热修复
  ↓
修复成功? ─No→ 回滚
  ↓ Yes
监控稳定性
```

---

## 🔧 实用脚本

### package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "prepare": "husky install",
    "pre-commit": "lint-staged",
    "deploy:staging": "vercel --prod --scope=staging",
    "deploy:prod": "vercel --prod"
  }
}
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run type-check
npm run test
```

---

## 🏆 最佳实践

### ✅ DO

```bash
# 1. 小步快跑，频繁部署
每天部署多次，而不是积累大量改动

# 2. 自动化一切
测试、构建、部署都应该自动化

# 3. 监控关键指标
错误率、响应时间、用户体验

# 4. 保留回滚能力
任何时候都能快速回滚

# 5. 环境隔离
开发、Staging、生产环境完全隔离
```

### ❌ DON'T

```bash
# 1. 不要跳过测试
即使很紧急，也不要跳过CI检查

# 2. 不要在生产环境调试
使用Staging环境复现和修复问题

# 3. 不要手动部署
避免"在我机器上能跑"的问题

# 4. 不要忽略警告
小问题会积累成大问题
```

---

## 📊 CI/CD度量

跟踪这些指标：

```markdown
- **构建时间**: 目标 <5分钟
- **部署频率**: 目标 每天5+次
- **部署成功率**: 目标 >95%
- **回滚频率**: 越少越好
- **平均修复时间**: <30分钟
```

---

<div align="center">

**文档版本**: V1.0  
**最后更新**: 2024-11-19

[返回文档目录](../README.md) | [查看Git工作流程](./GIT_WORKFLOW.md) | [查看代码审查](./CODE_REVIEW.md)

</div>
