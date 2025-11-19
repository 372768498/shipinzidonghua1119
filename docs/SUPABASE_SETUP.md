# 🗄️ Supabase设置指南

完整的Supabase数据库配置指南，从创建项目到运行完成。

---

## 📋 目录

1. [创建Supabase项目](#步骤1创建supabase项目)
2. [运行数据库脚本](#步骤2运行数据库脚本)
3. [配置环境变量](#步骤3配置环境变量)
4. [验证设置](#步骤4验证设置)
5. [常见问题](#常见问题)

---

## 步骤1：创建Supabase项目

### 1.1 注册/登录Supabase

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 **"Start your project"** 或 **"Sign in"**
3. 使用GitHub账号登录（推荐）

### 1.2 创建新项目

1. 点击 **"New Project"**
2. 填写项目信息：
   ```
   Name: jilo-ai-production
   Database Password: [设置一个强密码并保存]
   Region: Northeast Asia (Seoul) [选择离你最近的]
   Pricing Plan: Free [开始可以用免费版]
   ```
3. 点击 **"Create new project"**
4. ⏳ 等待2-3分钟，项目初始化完成

---

## 步骤2：运行数据库脚本

### 2.1 打开SQL Editor

1. 在Supabase Dashboard左侧菜单，点击 **"SQL Editor"**
2. 点击 **"New query"**

### 2.2 复制SQL脚本

1. 打开项目文件：`supabase/init.sql`
2. 复制**全部内容**
3. 粘贴到SQL Editor中

### 2.3 运行脚本

1. 点击右下角 **"Run"** 按钮（或按 `Cmd/Ctrl + Enter`）
2. ⏳ 等待执行完成（约5-10秒）
3. ✅ 看到成功消息：`Success. No rows returned`

### 2.4 验证表已创建

运行验证查询：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

应该看到以下表：
- ✅ quota_transactions
- ✅ users
- ✅ video_generation_tasks
- ✅ viral_videos
- ✅ webhooks
- ✅ youtube_connections

---

## 步骤3：配置环境变量

### 3.1 获取API密钥

1. 在Supabase Dashboard，点击左下角 **"Project Settings"** ⚙️
2. 点击 **"API"** 标签
3. 找到以下信息：

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [点击"Reveal"查看]
```

### 3.2 配置本地环境变量

1. 在项目根目录，复制环境变量模板：
   ```bash
   cp .env.example .env.local
   ```

2. 编辑 `.env.local`，填入Supabase密钥：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 其他API密钥（稍后配置）
FAL_AI_API_KEY=your_fal_ai_api_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
APIFY_API_KEY=your_apify_api_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **重要**: 确保 `.env.local` 在 `.gitignore` 中（已配置）

---

## 步骤4：验证设置

### 4.1 测试数据库连接

创建测试文件 `test-supabase.js`：

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  // 测试查询
  const { data, error } = await supabase
    .from('viral_videos')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Connection successful!')
    console.log('Sample data:', data)
  }
}

testConnection()
```

运行测试：
```bash
node test-supabase.js
```

应该看到：
```
✅ Connection successful!
Sample data: [ ... ]
```

### 4.2 在Supabase Dashboard验证

1. 点击左侧 **"Table Editor"**
2. 查看各个表：
   - `users` - 用户表（初始为空）
   - `video_generation_tasks` - 视频任务表（初始为空）
   - `viral_videos` - 应该有3条测试数据

---

## 📊 数据库结构说明

### 核心表

#### 1. users - 用户表
```sql
id           UUID        用户ID（关联auth.users）
email        TEXT        邮箱
quota        INTEGER     月度配额（默认100）
plan         TEXT        套餐：free/pro/enterprise
created_at   TIMESTAMP   创建时间
```

#### 2. video_generation_tasks - 视频生成任务
```sql
id           UUID              任务ID
user_id      UUID              用户ID
prompt       TEXT              视频描述
ai_model     ENUM              AI模型：minimax/runway/kling
status       ENUM              状态：pending/processing/completed/failed
video_url    TEXT              生成的视频URL
created_at   TIMESTAMP         创建时间
```

#### 3. quota_transactions - 配额交易记录
```sql
id           UUID        交易ID
user_id      UUID        用户ID
amount       INTEGER     变化量（正数增加，负数减少）
type         ENUM        类型：video_generation/monthly_reset/purchase
created_at   TIMESTAMP   创建时间
```

#### 4. viral_videos - 爆款视频
```sql
id              UUID        视频ID
platform        TEXT        平台：tiktok/youtube/instagram
title           TEXT        标题
views           BIGINT      播放量
viral_score     INTEGER     爆款分（0-100）
ai_analysis     JSONB       AI分析结果
```

#### 5. youtube_connections - YouTube连接
```sql
id                      UUID    连接ID
user_id                 UUID    用户ID
access_token_encrypted  TEXT    加密的访问令牌
channel_id              TEXT    YouTube频道ID
```

#### 6. webhooks - Webhook日志
```sql
id               UUID       Webhook ID
source           TEXT       来源：fal/apify
event_type       TEXT       事件类型
payload          JSONB      完整payload
processed        BOOLEAN    是否已处理
idempotency_key  TEXT       幂等性密钥
```

---

## 🔒 安全特性

### 行级安全 (RLS)

所有表都启用了RLS，确保用户只能访问自己的数据：

- ✅ 用户只能查看/修改自己的视频任务
- ✅ 用户只能查看自己的配额交易记录
- ✅ 所有认证用户可以查看爆款视频（公开数据）
- ✅ Webhooks只能被服务角色访问

### 原子化配额扣除

使用PostgreSQL函数 `atomic_deduct_quota()` 确保并发安全：

```sql
SELECT atomic_deduct_quota(
  'user-id-here'::UUID,
  1  -- 扣除1个配额
);

-- 返回 TRUE = 扣除成功
-- 返回 FALSE = 配额不足
```

---

## 🧪 测试数据

数据库已插入3条测试爆款视频数据，可以在开发时使用。

要删除测试数据：
```sql
DELETE FROM viral_videos WHERE platform_video_id LIKE 'test%';
```

---

## 🔧 常见操作

### 查询用户配额
```sql
SELECT email, quota, plan 
FROM users 
WHERE id = 'user-id-here';
```

### 查看用户的视频任务
```sql
SELECT 
  prompt,
  status,
  video_url,
  created_at
FROM video_generation_tasks
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC
LIMIT 10;
```

### 查看配额使用历史
```sql
SELECT 
  amount,
  type,
  description,
  created_at
FROM quota_transactions
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC
LIMIT 20;
```

### 手动重置用户配额
```sql
-- 更新配额
UPDATE users 
SET quota = 100 
WHERE id = 'user-id-here';

-- 记录交易
INSERT INTO quota_transactions (user_id, amount, type, description)
VALUES (
  'user-id-here',
  100,
  'monthly_reset',
  'Manual quota reset'
);
```

---

## 常见问题

### Q1: 运行SQL脚本时出错？

**问题**: `relation "auth.users" does not exist`

**解决**: 
- Supabase Auth默认启用，不需要手动创建
- 确保在 **SQL Editor** 中运行，而不是在psql中

**问题**: `permission denied`

**解决**:
- 确保使用Supabase Dashboard的SQL Editor
- 不要使用普通数据库客户端

### Q2: 如何备份数据库？

```bash
# 使用Supabase Dashboard
1. Project Settings -> Database -> Backups
2. 点击 "Create backup"

# 或使用命令行
supabase db dump -f backup.sql
```

### Q3: 如何迁移数据库？

```bash
# 导出当前结构
supabase db dump -f schema.sql --schema public

# 在新项目导入
supabase db push
```

### Q4: RLS策略不生效？

检查：
```sql
-- 查看表的RLS状态
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 查看策略
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## 📚 延伸阅读

- [Supabase文档](https://supabase.com/docs)
- [PostgreSQL RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [数据库设计文档](../docs/DATABASE.md)

---

## ✅ 设置完成检查清单

- [ ] Supabase项目已创建
- [ ] SQL脚本运行成功
- [ ] 6个表已创建
- [ ] 环境变量已配置到 `.env.local`
- [ ] 测试连接成功
- [ ] 可以查看测试数据

---

<div align="center">

**下一步**: [创建认证系统](../docs/DEVELOPMENT.md#认证系统)

[返回主文档](../README.md)

</div>
