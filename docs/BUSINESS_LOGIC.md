# 💼 业务逻辑详细文档

> **文档版本**: V1.0  
> **创建日期**: 2024-11-19  
> **最后更新**: 2024-11-19

---

## 📑 目录

1. [配额管理系统](#1-配额管理系统)
2. [内容审核系统](#2-内容审核系统)
3. [任务调度系统](#3-任务调度系统)
4. [用户行为监控](#4-用户行为监控)
5. [数据清理策略](#5-数据清理策略)

---

## 1. 配额管理系统

### 1.1 核心原则

**原子性扣费**: 使用数据库级别的原子操作，防止并发超刷

```sql
-- ❌ 错误做法 (存在竞态条件)
SELECT remaining_quota FROM user_subscriptions WHERE user_id = $1;
-- 检查配额
IF remaining_quota > 0 THEN
  UPDATE user_subscriptions SET remaining_quota = remaining_quota - 1;
END IF;

-- ✅ 正确做法 (原子操作)
UPDATE user_subscriptions 
SET remaining_quota = remaining_quota - 1
WHERE user_id = $1 
  AND remaining_quota > 0
RETURNING *;
```

### 1.2 PostgreSQL RPC函数

#### 函数1: 扣除配额

```sql
CREATE OR REPLACE FUNCTION deduct_quota(
  p_user_id UUID,
  p_amount INT DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
  v_result JSON;
BEGIN
  -- 使用 FOR UPDATE 加行锁，防止并发
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- 检查订阅是否存在
  IF NOT FOUND THEN
    v_result := json_build_object(
      'success', false,
      'error', 'subscription_not_found',
      'message', '未找到订阅信息'
    );
    RETURN v_result;
  END IF;
  
  -- 检查订阅是否过期
  IF v_subscription.expires_at < NOW() THEN
    v_result := json_build_object(
      'success', false,
      'error', 'subscription_expired',
      'message', '订阅已过期',
      'expired_at', v_subscription.expires_at
    );
    RETURN v_result;
  END IF;
  
  -- 检查配额是否充足
  IF v_subscription.remaining_quota < p_amount THEN
    v_result := json_build_object(
      'success', false,
      'error', 'insufficient_quota',
      'message', '配额不足',
      'remaining', v_subscription.remaining_quota,
      'required', p_amount
    );
    RETURN v_result;
  END IF;
  
  -- 原子扣除配额
  UPDATE user_subscriptions
  SET 
    remaining_quota = remaining_quota - p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- 记录配额使用日志
  INSERT INTO quota_logs (
    user_id,
    amount,
    type,
    description
  ) VALUES (
    p_user_id,
    -p_amount,
    'deduct',
    'Video generation'
  );
  
  -- 返回成功结果
  v_result := json_build_object(
    'success', true,
    'remaining_quota', v_subscription.remaining_quota - p_amount,
    'plan', v_subscription.plan_type
  );
  
  RETURN v_result;
END;
$$;
```

#### 函数2: 退还配额

```sql
CREATE OR REPLACE FUNCTION refund_quota(
  p_user_id UUID,
  p_amount INT DEFAULT 1,
  p_reason TEXT DEFAULT 'Generation failed'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- 增加配额
  UPDATE user_subscriptions
  SET 
    remaining_quota = remaining_quota + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- 记录退还日志
  INSERT INTO quota_logs (
    user_id,
    amount,
    type,
    description
  ) VALUES (
    p_user_id,
    p_amount,
    'refund',
    p_reason
  );
  
  v_result := json_build_object(
    'success', true,
    'refunded', p_amount,
    'reason', p_reason
  );
  
  RETURN v_result;
END;
$$;
```

### 1.3 API层调用

```typescript
// app/api/generate/route.ts

export async function POST(req: Request) {
  const { userId, prompt, model } = await req.json();
  
  // 1. 原子扣除配额
  const { data: quotaResult } = await supabase
    .rpc("deduct_quota", {
      p_user_id: userId,
      p_amount: 1
    });
  
  // 2. 检查结果
  if (!quotaResult.success) {
    return Response.json(
      { 
        error: quotaResult.error,
        message: quotaResult.message,
        remaining: quotaResult.remaining || 0
      },
      { status: 403 }
    );
  }
  
  // 3. 创建任务
  try {
    const task = await createVideoTask({
      userId,
      prompt,
      model
    });
    
    return Response.json({
      taskId: task.id,
      remainingQuota: quotaResult.remaining_quota
    });
    
  } catch (error) {
    // 4. 生成失败，退还配额
    await supabase.rpc("refund_quota", {
      p_user_id: userId,
      p_amount: 1,
      p_reason: `Generation error: ${error.message}`
    });
    
    throw error;
  }
}
```

### 1.4 配额重置

```sql
-- 每月重置配额 (Cron Job)
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE user_subscriptions
  SET 
    remaining_quota = monthly_quota,
    updated_at = NOW()
  WHERE 
    -- 订阅未过期
    expires_at > NOW()
    -- 且本月未重置过
    AND DATE_TRUNC('month', last_reset_at) < DATE_TRUNC('month', NOW());
  
  -- 更新重置时间
  UPDATE user_subscriptions
  SET last_reset_at = NOW()
  WHERE expires_at > NOW();
  
  -- 记录日志
  INSERT INTO system_logs (event, details)
  VALUES ('quota_reset', json_build_object(
    'reset_at', NOW(),
    'affected_users', (SELECT COUNT(*) FROM user_subscriptions WHERE expires_at > NOW())
  ));
END;
$$;

-- 设置为每月1号凌晨执行
-- (通过GitHub Actions或Vercel Cron触发)
```

---

## 2. 内容审核系统

### 2.1 三层审查机制

```
第1层: 关键词黑名单 (毫秒级)
   ↓
第2层: Gemini AI审查 (秒级)
   ↓
第3层: 用户行为监控 (分钟级)
```

### 2.2 第1层: 关键词黑名单

```typescript
// lib/moderation/blacklist.ts

const BLACKLIST_KEYWORDS = [
  // 成人内容
  "porn", "sex", "nude", "nsfw",
  "色情", "裸体", "成人", "18+",
  
  // 暴力内容
  "violence", "blood", "gore", "weapon",
  "暴力", "血腥", "武器", "杀人",
  
  // 敏感政治
  "政治", "敏感", "反动", "分裂",
  
  // 赌博
  "赌博", "博彩", "赌场", "gambling",
  
  // 虚假信息
  "假新闻", "阴谋论", "谣言"
];

function checkBlacklist(text: string): {
  violated: boolean;
  keywords: string[];
} {
  const lowerText = text.toLowerCase();
  const found = BLACKLIST_KEYWORDS.filter(kw => 
    lowerText.includes(kw.toLowerCase())
  );
  
  return {
    violated: found.length > 0,
    keywords: found
  };
}

export async function quickModeration(prompt: string) {
  const result = checkBlacklist(prompt);
  
  if (result.violated) {
    // 记录违规日志
    await logViolation({
      type: "blacklist",
      content: prompt,
      keywords: result.keywords
    });
    
    throw new Error(
      "内容包含敏感词: " + result.keywords.join(", ")
    );
  }
  
  return { safe: true };
}
```

### 2.3 第2层: Gemini AI审查

```typescript
// lib/moderation/ai-review.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function aiModeration(prompt: string, videoUrl?: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" 
  });
  
  const moderationPrompt = `
你是一个专业的内容审核AI。请审查以下视频生成Prompt是否安全:

"${prompt}"

审查维度:
1. 成人内容 (色情、裸体等)
2. 暴力内容 (血腥、武器等)
3. 仇恨言论 (歧视、侮辱等)
4. 虚假信息 (谣言、阴谋论等)
5. 违法内容 (毒品、赌博等)
6. 版权侵权 (明确复制特定作品)

返回JSON格式:
{
  "safe": true/false,
  "violations": ["违规类型1", "违规类型2"],
  "severity": "low" | "medium" | "high",
  "explanation": "详细说明",
  "recommendations": "改进建议"
}
`;
  
  const result = await model.generateContent(moderationPrompt);
  const analysis = JSON.parse(result.response.text());
  
  // 如果提供了视频URL，进一步审查视频内容
  if (!analysis.safe && videoUrl) {
    const videoCheck = await moderateVideo(videoUrl);
    analysis.videoCheck = videoCheck;
  }
  
  return analysis;
}

async function moderateVideo(videoUrl: string) {
  // 下载视频前10秒
  const videoData = await fetchVideoSample(videoUrl, { duration: 10 });
  
  // 使用Gemini Vision分析
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" 
  });
  
  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "video/mp4",
        data: videoData
      }
    },
    {
      text: "审查这个视频是否包含违规内容（成人、暴力、违法等）"
    }
  ]);
  
  return JSON.parse(result.response.text());
}
```

### 2.4 第3层: 用户行为监控

```typescript
// lib/moderation/user-monitoring.ts

export async function checkUserRisk(userId: string) {
  // 1. 获取用户历史违规记录
  const { data: violations } = await supabase
    .from("moderation_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("violated", true)
    .order("created_at", { ascending: false })
    .limit(10);
  
  // 2. 计算风险分数
  let riskScore = 0;
  
  // 近7天违规 (+50分)
  const recentViolations = violations?.filter(v => 
    new Date(v.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  riskScore += (recentViolations?.length || 0) * 50;
  
  // 高严重度违规 (+100分)
  const severeViolations = violations?.filter(v => 
    v.severity === "high"
  );
  riskScore += (severeViolations?.length || 0) * 100;
  
  // 3. 获取用户生成频率
  const { data: recentTasks } = await supabase
    .from("video_tasks")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  
  // 24小时内超过50个任务 (+30分)
  if (recentTasks && recentTasks.length > 50) {
    riskScore += 30;
  }
  
  // 4. 确定风险等级
  let level: "low" | "medium" | "high";
  if (riskScore >= 200) {
    level = "high"; // 封禁账号
  } else if (riskScore >= 100) {
    level = "medium"; // 人工审核
  } else {
    level = "low"; // 正常
  }
  
  return {
    level,
    score: riskScore,
    recentViolations: recentViolations?.length || 0,
    severeViolations: severeViolations?.length || 0,
    dailyTasks: recentTasks?.length || 0
  };
}
```

### 2.5 综合审核流程

```typescript
// lib/moderation/index.ts

export async function moderateContent({
  userId,
  prompt,
  videoUrl
}: {
  userId: string;
  prompt: string;
  videoUrl?: string;
}) {
  // 第1层: 黑名单检查 (毫秒级)
  const blacklistResult = await quickModeration(prompt);
  if (!blacklistResult.safe) {
    return {
      approved: false,
      reason: "包含敏感关键词",
      layer: 1
    };
  }
  
  // 第2层: AI审查 (秒级)
  const aiResult = await aiModeration(prompt, videoUrl);
  if (!aiResult.safe) {
    // 记录违规
    await logViolation({
      user_id: userId,
      content: prompt,
      violated: true,
      violations: aiResult.violations,
      severity: aiResult.severity,
      layer: 2
    });
    
    return {
      approved: false,
      reason: aiResult.explanation,
      severity: aiResult.severity,
      recommendations: aiResult.recommendations,
      layer: 2
    };
  }
  
  // 第3层: 用户行为监控 (分钟级)
  const userRisk = await checkUserRisk(userId);
  if (userRisk.level === "high") {
    // 封禁账号
    await supabase
      .from("users")
      .update({ status: "banned" })
      .eq("id", userId);
    
    return {
      approved: false,
      reason: "账号已被封禁",
      userRisk,
      layer: 3
    };
  }
  
  if (userRisk.level === "medium") {
    // 标记为需要人工审核
    return {
      approved: false,
      reason: "内容需要人工审核",
      userRisk,
      layer: 3,
      requiresManualReview: true
    };
  }
  
  // 全部通过
  return {
    approved: true,
    userRisk
  };
}
```

---

## 3. 任务调度系统

### 3.1 任务状态机

```
pending → processing → completed
   ↓          ↓            ↓
   → cancelled  → failed → refunded
```

### 3.2 状态转换规则

```typescript
// lib/task-manager/state-machine.ts

type TaskStatus = 
  | "pending"      // 等待处理
  | "processing"   // 生成中
  | "completed"    // 已完成
  | "failed"       // 失败
  | "cancelled"    // 已取消
  | "timeout"      // 超时
  | "refunded";    // 已退款

const STATE_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["completed", "failed", "timeout"],
  completed: [], // 终态
  failed: ["refunded"],
  timeout: ["refunded"],
  cancelled: ["refunded"],
  refunded: [] // 终态
};

export async function transitionTaskState(
  taskId: string,
  newStatus: TaskStatus,
  metadata?: any
) {
  // 1. 获取当前状态
  const { data: task } = await supabase
    .from("video_tasks")
    .select("*")
    .eq("id", taskId)
    .single();
  
  if (!task) {
    throw new Error("Task not found");
  }
  
  // 2. 验证状态转换是否合法
  const allowedTransitions = STATE_TRANSITIONS[task.status as TaskStatus];
  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Invalid transition: ${task.status} → ${newStatus}`
    );
  }
  
  // 3. 更新状态
  await supabase
    .from("video_tasks")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
      ...metadata
    })
    .eq("id", taskId);
  
  // 4. 触发状态相关的业务逻辑
  await handleStateTransition(task, newStatus);
}

async function handleStateTransition(
  task: any,
  newStatus: TaskStatus
) {
  switch (newStatus) {
    case "failed":
    case "timeout":
      // 退还配额
      await refundQuota(task.user_id, 1, `Task ${newStatus}`);
      break;
      
    case "completed":
      // 发送通知
      await sendNotification(task.user_id, {
        title: "视频生成完成",
        body: "您的视频已经生成完成，快去查看吧！",
        link: `/dashboard/videos/${task.id}`
      });
      break;
      
    case "cancelled":
      // 记录取消原因
      await logTaskCancellation(task.id, task.user_id);
      break;
  }
}
```

### 3.3 超时检测

```typescript
// lib/task-manager/timeout-monitor.ts

const TIMEOUT_THRESHOLD = 15 * 60 * 1000; // 15分钟

export async function monitorTimeouts() {
  // 1. 查找所有超时任务
  const { data: timeoutTasks } = await supabase
    .from("video_tasks")
    .select("*")
    .eq("status", "processing")
    .lt(
      "created_at",
      new Date(Date.now() - TIMEOUT_THRESHOLD).toISOString()
    );
  
  if (!timeoutTasks || timeoutTasks.length === 0) {
    return;
  }
  
  console.log(`发现 ${timeoutTasks.length} 个超时任务`);
  
  // 2. 批量处理超时任务
  for (const task of timeoutTasks) {
    try {
      // 转换为超时状态
      await transitionTaskState(task.id, "timeout", {
        error: "Generation timeout after 15 minutes",
        timeout_at: new Date().toISOString()
      });
      
      console.log(`任务 ${task.id} 已标记为超时`);
    } catch (error) {
      console.error(`处理超时任务 ${task.id} 失败:`, error);
    }
  }
}

// 每5分钟执行一次
setInterval(monitorTimeouts, 5 * 60 * 1000);
```

---

## 4. 用户行为监控

### 4.1 异常行为检测

```typescript
// lib/monitoring/anomaly-detection.ts

export async function detectAnomalies(userId: string) {
  const anomalies: string[] = [];
  
  // 1. 检测频率异常
  const { data: recentTasks } = await supabase
    .from("video_tasks")
    .select("created_at")
    .eq("user_id", userId)
    .gte(
      "created_at",
      new Date(Date.now() - 60 * 60 * 1000).toISOString() // 过去1小时
    );
  
  if (recentTasks && recentTasks.length > 20) {
    anomalies.push("高频生成: 1小时内超过20个任务");
  }
  
  // 2. 检测相同Prompt重复
  const { data: tasks } = await supabase
    .from("video_tasks")
    .select("prompt")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  
  if (tasks) {
    const prompts = tasks.map(t => t.prompt);
    const uniquePrompts = new Set(prompts);
    
    if (uniquePrompts.size < prompts.length * 0.5) {
      anomalies.push("重复Prompt: 50%以上的任务使用相同Prompt");
    }
  }
  
  // 3. 检测失败率异常
  const { data: failedTasks } = await supabase
    .from("video_tasks")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "failed")
    .gte(
      "created_at",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    );
  
  const { data: allTasks } = await supabase
    .from("video_tasks")
    .select("id")
    .eq("user_id", userId)
    .gte(
      "created_at",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    );
  
  if (allTasks && failedTasks) {
    const failureRate = failedTasks.length / allTasks.length;
    if (failureRate > 0.5) {
      anomalies.push(`高失败率: ${(failureRate * 100).toFixed(1)}%`);
    }
  }
  
  return {
    hasAnomalies: anomalies.length > 0,
    anomalies,
    timestamp: new Date().toISOString()
  };
}
```

### 4.2 自动化响应

```typescript
// lib/monitoring/auto-response.ts

export async function autoRespond(userId: string, anomalies: string[]) {
  // 1. 高频生成 → 限流
  if (anomalies.some(a => a.includes("高频生成"))) {
    await applyRateLimit(userId, {
      maxTasksPerHour: 10,
      duration: 24 * 60 * 60 * 1000 // 24小时
    });
    
    await sendNotification(userId, {
      title: "使用频率过高",
      body: "为保证服务质量，已对您的账号应用限流（10个/小时）"
    });
  }
  
  // 2. 重复Prompt → 警告
  if (anomalies.some(a => a.includes("重复Prompt"))) {
    await sendNotification(userId, {
      title: "使用建议",
      body: "建议尝试不同的Prompt以获得更多样化的内容"
    });
  }
  
  // 3. 高失败率 → 客服介入
  if (anomalies.some(a => a.includes("高失败率"))) {
    await createSupportTicket({
      userId,
      type: "high_failure_rate",
      priority: "high",
      description: "用户失败率异常，需要技术支持介入"
    });
  }
}
```

---

## 5. 数据清理策略

### 5.1 临时文件清理

```typescript
// lib/cleanup/temp-files.ts

export async function cleanupTempFiles() {
  // 1. 清理Supabase Storage中的临时文件
  const { data: oldFiles } = await supabase
    .storage
    .from("temp")
    .list();
  
  if (oldFiles) {
    const expiredFiles = oldFiles.filter(file => {
      const createdAt = new Date(file.created_at);
      const age = Date.now() - createdAt.getTime();
      return age > 24 * 60 * 60 * 1000; // 超过24小时
    });
    
    if (expiredFiles.length > 0) {
      await supabase
        .storage
        .from("temp")
        .remove(expiredFiles.map(f => f.name));
      
      console.log(`清理了 ${expiredFiles.length} 个临时文件`);
    }
  }
  
  // 2. 清理失败任务的相关文件
  const { data: failedTasks } = await supabase
    .from("video_tasks")
    .select("id, video_url")
    .in("status", ["failed", "timeout", "cancelled"])
    .not("video_url", "is", null)
    .lt(
      "updated_at",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    );
  
  if (failedTasks) {
    for (const task of failedTasks) {
      try {
        await deleteVideoFile(task.video_url);
      } catch (error) {
        console.error(`清理任务 ${task.id} 的文件失败:`, error);
      }
    }
  }
}

// 每天凌晨2点执行
const schedule = "0 2 * * *";
```

### 5.2 日志归档

```sql
-- 归档30天以上的日志
CREATE OR REPLACE FUNCTION archive_old_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- 1. 复制到归档表
  INSERT INTO logs_archive
  SELECT * FROM logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- 2. 删除原表数据
  DELETE FROM logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- 3. 记录归档信息
  INSERT INTO system_logs (event, details)
  VALUES ('logs_archived', json_build_object(
    'archived_at', NOW(),
    'count', (SELECT COUNT(*) FROM logs_archive)
  ));
END;
$$;
```

---

<div align="center">

**文档版本**: V1.0  
**最后更新**: 2024-11-19  

[返回文档首页](../README.md) | [查看架构文档](./ARCHITECTURE.md) | [查看安全文档](./SECURITY_COMPLETE.md)

</div>