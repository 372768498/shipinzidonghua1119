# 🔧 问题诊断手册 (Troubleshooting Guide)

> **文档目的**: 记录Jilo.ai常见问题、安全漏洞修复历史和排查方法  
> **创建日期**: 2024-11-19  
> **维护者**: 技术团队

---

## 📋 目录

1. [快速诊断](#快速诊断)
2. [安全审计历史](#安全审计历史)
3. [常见问题排查](#常见问题排查)
4. [紧急情况处理](#紧急情况处理)
5. [性能优化指南](#性能优化指南)

---

## 快速诊断

当系统出现问题时，按以下顺序快速定位：

### 🚨 症状分类

```
用户无法生成视频
  ↓
检查1: 配额是否充足？ → [配额问题](#配额相关问题)
  ↓
检查2: 视频生成卡在processing？ → [僵尸任务](#僵尸任务问题)
  ↓
检查3: Webhook是否收到回调？ → [Webhook问题](#webhook相关问题)
  ↓
检查4: FAL.AI API是否正常？ → [外部服务问题](#外部服务问题)
```

### 📊 健康检查清单

每日检查（自动化）:
- [ ] 僵尸任务数量 < 10
- [ ] Webhook失败率 < 1%
- [ ] API响应时间 < 500ms
- [ ] 配额系统误差 < 0.1%

每周检查（手动）:
- [ ] Supabase存储使用率 < 80%
- [ ] 过期视频清理是否正常
- [ ] 日志大小是否合理

---

## 安全审计历史

我们进行了两次全面的安全审计，发现并修复了9个关键漏洞。

### 🔍 第一次安全审计 (2024-11-18)

**主题**: 隐藏陷阱 - 看似正常但暗藏危机的设计缺陷

发现了4个关键问题：

#### 漏洞1: 中间件阻塞Webhook

**问题描述**:
```javascript
// middleware.ts
export function middleware(request: NextRequest) {
  // 所有请求都需要认证
  const session = getSession(request);
  if (!session) {
    return NextResponse.redirect('/login');
  }
}

export const config = {
  matcher: '/:path*'  // ❌ 匹配所有路径
}
```

**症状**:
- FAL.AI发送Webhook回调 → 被中间件拦截要求登录
- 视频生成完成但系统不知道
- 任务永远卡在`processing`状态

**修复方案**:
```javascript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ✅ Webhook路径跳过认证
  const PUBLIC_PATHS = [
    '/api/webhooks/fal',
    '/api/webhooks/apify',
    '/api/webhooks/youtube'
  ];
  
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }
  
  // 其他路径正常验证
  const session = getSession(request);
  if (!session) {
    return NextResponse.redirect('/login');
  }
}
```

**验证方法**:
```bash
# 测试Webhook是否可访问
curl -X POST https://jilo.ai/api/webhooks/fal \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 应该返回200或401（签名错误），而不是302（重定向到登录）
```

**影响**: 🔴 严重 - 系统核心功能完全失效

---

#### 漏洞2: 数据库RLS策略过于宽松

**问题描述**:
```sql
-- ❌ 危险的RLS策略
CREATE POLICY "Users can view all videos"
ON video_generation_tasks
FOR SELECT
USING (true);  -- 所有人都能看到所有视频！
```

**症状**:
- 用户A可以看到用户B的私密视频
- 数据泄露风险

**修复方案**:
```sql
-- ✅ 正确的RLS策略
CREATE POLICY "Users can only view own videos"
ON video_generation_tasks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role bypass"
ON video_generation_tasks
FOR ALL
TO service_role
USING (true);
```

**验证方法**:
```sql
-- 测试查询（以普通用户身份）
SELECT * FROM video_generation_tasks 
WHERE user_id != auth.uid();
-- 应该返回0行
```

**影响**: 🔴 严重 - 数据泄露

---

#### 漏洞3: 临时视频URL 24小时过期

**问题描述**:
```javascript
// ❌ 使用临时URL
const { data } = await supabase.storage
  .from('videos')
  .createSignedUrl(path, 86400); // 24小时后失效

await db.insert({ video_url: data.signedUrl });
```

**症状**:
- 第一天视频可以看
- 第二天视频全部404
- 用户投诉无法回看

**修复方案**:
```javascript
// ✅ 方案A: 使用永久公开URL（推荐）
const { data } = await supabase.storage
  .from('videos-public')
  .upload(path, file);

const publicUrl = supabase.storage
  .from('videos-public')
  .getPublicUrl(path);

// ✅ 方案B: 动态生成URL
async function getVideoUrl(videoId) {
  const video = await db.videos.findOne({ id: videoId });
  
  // 每次访问时生成新的签名URL
  const { data } = await supabase.storage
    .from('videos')
    .createSignedUrl(video.path, 3600);
    
  return data.signedUrl;
}
```

**验证方法**:
```bash
# 检查URL类型
echo "https://xxx.supabase.co/storage/v1/object/public/videos/xxx.mp4"
# 包含"public"的是永久URL ✅

echo "https://xxx.supabase.co/storage/v1/object/sign/videos/xxx.mp4?token=xxx"
# 包含"sign"和"token"的是临时URL ❌
```

**影响**: 🟡 中等 - 用户体验极差

---

#### 漏洞4: Webhook缺少认证

**问题描述**:
```javascript
// ❌ 无验证的Webhook
export async function POST(request: Request) {
  const body = await request.json();
  
  // 直接相信请求内容
  await processVideoComplete(body);
}
```

**症状**:
- 攻击者可以伪造"生成成功"的请求
- 配额被消耗但没有实际生成视频
- 损失金钱

**修复方案**:
参见 [ADR-004: Webhook安全设计](./ADR.md#adr-004-webhook回调机制设计)

**影响**: 🔴 严重 - 财务损失

---

### 🔍 第二次安全审计 (2024-11-19)

**主题**: 业务逻辑炸弹 - 并发场景下的致命缺陷

发现了5个业务逻辑漏洞：

#### 漏洞5: 配额管理竞态条件

**问题描述**:
```javascript
// ❌ 非原子化的配额检查
const user = await db.users.findOne({ id });
if (user.quota < 1) throw new Error('No quota');

await callFAL();  // 生成视频

await db.users.update({ 
  id, 
  quota: user.quota - 1 
});
```

**攻击场景**:
```bash
# 攻击脚本
for i in {1..100}; do
  curl -X POST /api/generate &  # 并发请求
done

# 配额只有10，却生成了100个视频！
```

**修复方案**:
参见 [ADR-005: 原子化配额管理](./ADR.md#adr-005-原子化配额管理方案)

**验证方法**:
```bash
# 并发测试工具
npm install -g autocannon

autocannon -c 100 -d 10 \
  -m POST \
  -H "Authorization: Bearer xxx" \
  https://jilo.ai/api/generate

# 检查实际生成数量是否等于配额扣除
```

**影响**: 🔴 严重 - 直接财务损失

---

#### 漏洞6: 僵尸任务问题

**问题描述**:
```javascript
// 创建任务
await db.insert({ 
  status: 'processing',
  created_at: new Date()
});

// 如果FAL.AI挂了，永远不会有回调
// 任务永远卡在processing状态
```

**症状**:
- Dashboard显示"生成中"但实际已失败
- 配额被扣除但没有视频
- 用户无法重试（因为任务还在处理中）

**修复方案**:
```javascript
// 1. 添加超时检测
async function markTimeoutTasks() {
  const timeout = new Date(Date.now() - 15 * 60 * 1000); // 15分钟
  
  await db.video_generation_tasks.update(
    { 
      status: 'processing',
      created_at: { $lt: timeout }
    },
    { 
      status: 'failed',
      error: 'Task timeout after 15 minutes',
      failed_at: new Date()
    }
  );
}

// 2. 定时任务 (vercel.json)
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "*/5 * * * *"  // 每5分钟
  }]
}

// 3. 允许重试
async function retryTask(taskId) {
  const task = await db.video_generation_tasks.findOne({ id: taskId });
  
  if (task.status === 'failed') {
    // 创建新任务
    return await createNewTask(task.prompt);
  }
}
```

**监控查询**:
```sql
-- 查找所有僵尸任务
SELECT id, created_at, prompt
FROM video_generation_tasks
WHERE status = 'processing'
  AND created_at < NOW() - INTERVAL '15 minutes'
ORDER BY created_at DESC;
```

**影响**: 🟡 中等 - 用户体验差，配额浪费

---

#### 漏洞7: YouTube Token明文存储

**问题描述**:
```javascript
// ❌ 明文存储敏感Token
await db.youtube_connections.insert({
  user_id: userId,
  access_token: googleAuth.access_token,  // 明文！
  refresh_token: googleAuth.refresh_token
});
```

**风险**:
- 数据库泄露 → 所有用户的YouTube账号被控制
- 内部人员可以直接读取Token

**修复方案**:
```javascript
import crypto from 'crypto';

// 加密工具
const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32字节

function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decrypt(encrypted: string, iv: string, authTag: string) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    KEY, 
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// ✅ 使用加密存储
const { encrypted, iv, authTag } = encrypt(googleAuth.access_token);

await db.youtube_connections.insert({
  user_id: userId,
  access_token: encrypted,
  access_token_iv: iv,
  access_token_tag: authTag
});
```

**验证方法**:
```sql
-- 检查数据库中的Token是否加密
SELECT access_token FROM youtube_connections LIMIT 1;
-- 应该看到乱码，而不是可读的Token
```

**影响**: 🔴 严重 - 账号安全风险

---

#### 漏洞8: Webhook缺少幂等性

**问题描述**:
```javascript
// ❌ 重复处理相同的Webhook
export async function POST(request: Request) {
  const body = await request.json();
  
  await db.videos.insert({
    id: body.video_id,
    url: body.url
  });
  
  await deductQuota(body.user_id);
}

// 如果网络抖动，FAL.AI重发3次Webhook
// 结果：插入3条重复记录，扣了3次配额！
```

**修复方案**:
参见 [ADR-004: Webhook幂等性设计](./ADR.md#adr-004-webhook回调机制设计)

**影响**: 🟡 中等 - 数据重复，配额错误

---

#### 漏洞9: 存储安全漏洞

**问题描述**:
```sql
-- ❌ 任何人都可以删除任何文件
CREATE POLICY "Anyone can delete"
ON storage.objects
FOR DELETE
USING (bucket_id = 'videos');
```

**攻击场景**:
```javascript
// 攻击者可以删除其他用户的视频
await supabase.storage
  .from('videos')
  .remove(['other-user-video.mp4']);
```

**修复方案**:
```sql
-- ✅ 只能删除自己的文件
CREATE POLICY "Users can only delete own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 文件路径规范: {user_id}/{video_id}.mp4
```

**影响**: 🔴 严重 - 数据破坏

---

## 常见问题排查

### 配额相关问题

#### 问题: 用户反馈"配额不足"但明明还有配额

**排查步骤**:
```sql
-- 1. 检查用户实际配额
SELECT id, email, quota 
FROM users 
WHERE email = 'user@example.com';

-- 2. 检查配额扣除记录
SELECT * FROM quota_transactions
WHERE user_id = 'xxx'
ORDER BY created_at DESC
LIMIT 20;

-- 3. 检查是否有未完成的任务占用配额
SELECT COUNT(*) 
FROM video_generation_tasks
WHERE user_id = 'xxx' 
  AND status = 'processing';
```

**可能原因**:
1. 僵尸任务占用配额（虽然失败但状态没更新）
2. 并发请求导致配额计算错误
3. 缓存未同步

**解决方案**:
```javascript
// 手动释放僵尸任务的配额
async function releaseZombieQuota(userId) {
  const zombies = await db.video_generation_tasks.find({
    user_id: userId,
    status: 'processing',
    created_at: { $lt: new Date(Date.now() - 15 * 60000) }
  });
  
  for (const task of zombies) {
    await db.video_generation_tasks.update(
      { id: task.id },
      { status: 'failed', error: 'Timeout' }
    );
  }
  
  // 配额不需要手动恢复（因为扣除是原子化的）
}
```

---

### Webhook相关问题

#### 问题: Webhook回调一直失败

**排查步骤**:
```bash
# 1. 检查Webhook日志
SELECT * FROM webhook_logs
WHERE success = false
ORDER BY created_at DESC
LIMIT 50;

# 2. 查看具体错误信息
SELECT error_message, COUNT(*) as count
FROM webhook_logs
WHERE success = false
GROUP BY error_message
ORDER BY count DESC;

# 3. 测试Webhook端点
curl -X POST https://jilo.ai/api/webhooks/fal \
  -H "Content-Type: application/json" \
  -H "x-fal-signature: test" \
  -d '{"status": "completed"}'
```

**常见错误**:

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `401 Unauthorized` | 签名验证失败 | 检查`WEBHOOK_SECRET`是否正确 |
| `404 Not Found` | 路由配置错误 | 检查Next.js路由文件 |
| `500 Internal Error` | 代码逻辑错误 | 查看服务器日志 |
| `Timeout` | 处理时间过长 | 优化Webhook处理逻辑 |

---

### 僵尸任务问题

#### 问题: 大量任务卡在processing状态

**诊断命令**:
```sql
-- 统计僵尸任务
SELECT 
  COUNT(*) as zombie_count,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/60) as avg_stuck_minutes
FROM video_generation_tasks
WHERE status = 'processing'
  AND created_at < NOW() - INTERVAL '15 minutes';
```

**批量修复**:
```javascript
// 手动运行清理脚本
async function cleanupZombieTasks() {
  const result = await db.video_generation_tasks.updateMany(
    {
      status: 'processing',
      created_at: { $lt: new Date(Date.now() - 15 * 60000) }
    },
    {
      status: 'failed',
      error: 'Task timeout - cleaned up by admin',
      updated_at: new Date()
    }
  );
  
  console.log(`Cleaned up ${result.modifiedCount} zombie tasks`);
  return result;
}
```

---

### 外部服务问题

#### 问题: FAL.AI生成失败率突然升高

**检查清单**:
```javascript
// 1. 检查FAL.AI服务状态
const status = await fetch('https://status.fal.ai');

// 2. 检查API Key是否有效
const models = await fal.subscribe('fal-ai/models/list');

// 3. 检查是否达到速率限制
// FAL.AI: 100 requests/minute

// 4. 降级到备用模型
const fallbackModels = [
  'fal-ai/minimax-video',  // 主力
  'fal-ai/kling-video',    // 备用
  'fal-ai/runway-gen3'     // 最后备用
];
```

---

## 紧急情况处理

### 🚨 情况1: 系统完全宕机

**症状**: 所有用户无法访问

**应急流程**:
1. **确认范围**
   ```bash
   # 检查Vercel状态
   curl https://jilo.ai/api/health
   
   # 检查Supabase状态
   curl https://xxx.supabase.co/rest/v1/
   ```

2. **回滚部署**
   ```bash
   # Vercel回滚到上一个版本
   vercel rollback
   ```

3. **通知用户**
   - 在社交媒体发布公告
   - 邮件通知所有用户
   - 显示维护页面

4. **问题修复**
   - 查看Vercel日志
   - 查看Supabase日志
   - 修复并重新部署

---

### 🚨 情况2: 配额系统崩溃

**症状**: 用户配额不准确，出现负数

**应急流程**:
1. **暂停所有生成任务**
   ```sql
   -- 临时禁用生成功能
   UPDATE system_config 
   SET value = 'false' 
   WHERE key = 'generation_enabled';
   ```

2. **审计配额数据**
   ```sql
   -- 找出异常配额
   SELECT user_id, quota 
   FROM users 
   WHERE quota < 0 OR quota > 1000000;
   ```

3. **修复数据**
   ```sql
   -- 重新计算配额
   UPDATE users u
   SET quota = (
     SELECT 
       u.plan_quota 
       - COUNT(v.id)
     FROM video_generation_tasks v
     WHERE v.user_id = u.id 
       AND v.status = 'completed'
       AND v.created_at >= DATE_TRUNC('month', NOW())
   );
   ```

4. **恢复服务**

---

### 🚨 情况3: 数据泄露

**症状**: 发现未授权访问或数据泄露

**应急流程**:
1. **立即隔离**
   - 禁用受影响的API Key
   - 暂停受影响用户的账号

2. **评估影响范围**
   ```sql
   -- 查找可疑访问
   SELECT * FROM audit_logs
   WHERE created_at > NOW() - INTERVAL '24 hours'
     AND action = 'unauthorized_access'
   ORDER BY created_at DESC;
   ```

3. **通知用户**
   - 发送安全警告邮件
   - 要求重置密码
   - 撤销所有第三方授权

4. **事后分析**
   - 编写事故报告
   - 改进安全措施
   - 更新文档

---

## 性能优化指南

### 数据库优化

#### 慢查询优化
```sql
-- 创建关键索引
CREATE INDEX idx_tasks_user_status ON video_generation_tasks(user_id, status);
CREATE INDEX idx_tasks_created ON video_generation_tasks(created_at DESC);
CREATE INDEX idx_webhooks_event ON webhook_logs(event_type, created_at);

-- 分析查询性能
EXPLAIN ANALYZE
SELECT * FROM video_generation_tasks
WHERE user_id = 'xxx' AND status = 'completed'
ORDER BY created_at DESC
LIMIT 20;
```

### API优化

#### 批量操作优化
```javascript
// ❌ N+1查询
for (const task of tasks) {
  const user = await db.users.findOne({ id: task.user_id });
  task.userName = user.name;
}

// ✅ 批量查询
const userIds = tasks.map(t => t.user_id);
const users = await db.users.find({ id: { $in: userIds } });
const userMap = Object.fromEntries(users.map(u => [u.id, u]));
tasks.forEach(task => {
  task.userName = userMap[task.user_id].name;
});
```

### 缓存策略

```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// 缓存用户配额（1分钟）
async function getUserQuota(userId) {
  const cached = await redis.get(`quota:${userId}`);
  if (cached) return JSON.parse(cached);
  
  const user = await db.users.findOne({ id: userId });
  await redis.setex(`quota:${userId}`, 60, JSON.stringify(user.quota));
  
  return user.quota;
}
```

---

<div align="center">

**文档版本**: V1.0  
**最后更新**: 2024-11-19  
**发现漏洞数**: 9个（已全部修复）

[返回目录](../README.md) | [查看ADR](./ADR.md) | [查看安全文档](./SECURITY_COMPLETE.md)

</div>
