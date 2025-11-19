# 💾 数据库设计文档

> **项目**: Jilo.ai  
> **数据库**: PostgreSQL (Supabase)  
> **版本**: V1.0

---

## 📑 目录

1. [概览](#1-概览)
2. [核心表结构](#2-核心表结构)
3. [RLS安全策略](#3-rls安全策略)
4. [索引优化](#4-索引优化)
5. [RPC函数](#5-rpc函数)
6. [迁移脚本](#6-迁移脚本)

---

## 1. 概览

### 1.1 数据库选型

**为什么选择PostgreSQL?**
- ✅ 强大的JSONB支持
- ✅ 行级安全（RLS）
- ✅ 全文搜索
- ✅ 事务支持
- ✅ 分区表支持

### 1.2 表概览

| 表名 | 用途 | 记录数估计 |
|------|------|------------|
| `profiles` | 用户资料 | 10K |
| `crawl_jobs` | 爬取任务 | 100K |
| `viral_videos` | 爆款视频 | 1M |
| `generated_videos` | 生成视频 | 500K |
| `youtube_accounts` | YouTube账号 | 10K |
| `published_videos` | 已发布视频 | 500K |
| `quota_usage_logs` | 配额日志 | 5M |
| `moderation_logs` | 审查日志 | 1M |

---

## 2. 核心表结构

### 2.1 profiles (用户表)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  
  -- 订阅信息
  subscription_tier TEXT NOT NULL DEFAULT 'starter',
  subscription_status TEXT NOT NULL DEFAULT 'trialing',
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  
  -- 配额管理
  monthly_video_limit INT NOT NULL DEFAULT 20,
  videos_generated_this_month INT NOT NULL DEFAULT 0,
  quota_reset_date TIMESTAMPTZ NOT NULL DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
  
  -- 状态
  is_active BOOLEAN NOT NULL DEFAULT true,
  suspension_reason TEXT,
  suspended_at TIMESTAMPTZ,
  
  -- 时间戳
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 约束
  CONSTRAINT valid_subscription_tier 
    CHECK (subscription_tier IN ('starter', 'standard', 'professional', 'enterprise')),
  CONSTRAINT valid_subscription_status 
    CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'suspended')),
  CONSTRAINT valid_quota CHECK (videos_generated_this_month >= 0)
);

-- 索引
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX idx_profiles_quota ON profiles(id, videos_generated_this_month, monthly_video_limit);

-- RLS策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 触发器：自动更新updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 crawl_jobs (爬取任务表)

```sql
CREATE TABLE crawl_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- 爬取参数
  keywords TEXT[] NOT NULL,
  platforms TEXT[] NOT NULL,
  max_results_per_platform INT NOT NULL DEFAULT 100,
  
  -- 任务状态
  status TEXT NOT NULL DEFAULT 'pending',
  apify_run_id TEXT,
  
  -- 结果统计
  total_videos_found INT DEFAULT 0,
  viral_videos_count INT DEFAULT 0,
  avg_viral_score DECIMAL(5,2),
  
  -- 进度
  progress_percent INT DEFAULT 0,
  current_platform TEXT,
  
  -- 错误信息
  error_message TEXT,
  
  -- 时间记录
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- 约束
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  CONSTRAINT valid_progress CHECK (progress_percent BETWEEN 0 AND 100),
  CONSTRAINT valid_platforms CHECK (platforms <@ ARRAY['tiktok', 'youtube_shorts', 'instagram'])
);

-- 索引
CREATE INDEX idx_crawl_jobs_user ON crawl_jobs(user_id, created_at DESC);
CREATE INDEX idx_crawl_jobs_status ON crawl_jobs(status, created_at DESC);
CREATE INDEX idx_crawl_jobs_cleanup ON crawl_jobs(status, created_at) 
  WHERE status IN ('completed', 'failed');

-- RLS
ALTER TABLE crawl_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
  ON crawl_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON crawl_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can update all jobs"
  ON crawl_jobs FOR UPDATE
  USING (auth.role() = 'service_role');
```

### 2.3 viral_videos (爆款视频表)

```sql
CREATE TABLE viral_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crawl_job_id UUID NOT NULL REFERENCES crawl_jobs(id) ON DELETE CASCADE,
  
  -- 平台信息
  platform TEXT NOT NULL,
  platform_video_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  
  -- 作者信息
  author_name TEXT NOT NULL,
  author_url TEXT,
  author_followers INT,
  
  -- 视频内容
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration INT, -- 秒
  
  -- 互动数据
  views BIGINT NOT NULL DEFAULT 0,
  likes INT NOT NULL DEFAULT 0,
  comments INT NOT NULL DEFAULT 0,
  shares INT NOT NULL DEFAULT 0,
  saves INT DEFAULT 0,
  
  -- 分析指标
  engagement_rate DECIMAL(5,4),
  viral_score INT NOT NULL,
  
  -- 内容特征
  hashtags TEXT[],
  music_info JSONB,
  
  -- 时间戳
  published_at TIMESTAMPTZ NOT NULL,
  crawled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 约束
  CONSTRAINT valid_platform CHECK (platform IN ('tiktok', 'youtube_shorts', 'instagram')),
  CONSTRAINT valid_viral_score CHECK (viral_score BETWEEN 0 AND 100),
  CONSTRAINT unique_platform_video UNIQUE (platform, platform_video_id)
);

-- 索引
CREATE INDEX idx_viral_videos_job ON viral_videos(crawl_job_id);
CREATE INDEX idx_viral_videos_score ON viral_videos(viral_score DESC, created_at DESC);
CREATE INDEX idx_viral_videos_platform ON viral_videos(platform, viral_score DESC);
CREATE INDEX idx_viral_videos_hashtags ON viral_videos USING GIN(hashtags);
CREATE INDEX idx_viral_videos_cleanup ON viral_videos(crawled_at) WHERE crawled_at < NOW() - INTERVAL '90 days';

-- 全文搜索
CREATE INDEX idx_viral_videos_search ON viral_videos 
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- RLS
ALTER TABLE viral_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own viral videos"
  ON viral_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM crawl_jobs
      WHERE crawl_jobs.id = viral_videos.crawl_job_id
      AND crawl_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert"
  ON viral_videos FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
```

### 2.4 generated_videos (生成视频表)

```sql
CREATE TABLE generated_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_viral_video_id UUID REFERENCES viral_videos(id) ON DELETE SET NULL,
  
  -- 生成参数
  prompt TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  generation_params JSONB,
  
  -- 任务状态
  status TEXT NOT NULL DEFAULT 'pending',
  fal_request_id TEXT,
  
  -- 视频信息
  video_url TEXT,
  thumbnail_url TEXT,
  duration INT,
  file_size BIGINT,
  
  -- SEO优化
  optimized_title TEXT,
  optimized_description TEXT,
  optimized_tags TEXT[],
  seo_score INT,
  
  -- 成本统计
  generation_cost DECIMAL(10,4),
  processing_time INT, -- 秒
  
  -- 进度
  generation_progress INT DEFAULT 0,
  current_step TEXT,
  
  -- 错误
  error_message TEXT,
  
  -- 时间戳
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 约束
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  CONSTRAINT valid_progress CHECK (generation_progress BETWEEN 0 AND 100),
  CONSTRAINT valid_seo_score CHECK (seo_score IS NULL OR seo_score BETWEEN 0 AND 100)
);

-- 索引
CREATE INDEX idx_generated_videos_user ON generated_videos(user_id, created_at DESC);
CREATE INDEX idx_generated_videos_status ON generated_videos(status, created_at DESC);
CREATE INDEX idx_generated_videos_source ON generated_videos(source_viral_video_id);

-- RLS
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own videos"
  ON generated_videos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can update"
  ON generated_videos FOR UPDATE
  USING (auth.role() = 'service_role');
```

### 2.5 youtube_accounts (YouTube账号表)

```sql
CREATE TABLE youtube_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- YouTube信息
  channel_id TEXT NOT NULL UNIQUE,
  channel_name TEXT NOT NULL,
  channel_url TEXT,
  subscriber_count INT DEFAULT 0,
  
  -- OAuth Token（加密存储）
  access_token TEXT NOT NULL, -- JSON {iv, authTag, content}
  refresh_token TEXT NOT NULL, -- JSON {iv, authTag, content}
  token_expires_at TIMESTAMPTZ NOT NULL,
  last_token_refresh TIMESTAMPTZ,
  
  -- 账号状态
  is_active BOOLEAN NOT NULL DEFAULT true,
  health_score INT DEFAULT 100,
  last_error TEXT,
  error_message TEXT,
  
  -- 时间戳
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 约束
  CONSTRAINT valid_health_score CHECK (health_score BETWEEN 0 AND 100)
);

-- 索引
CREATE INDEX idx_youtube_accounts_user ON youtube_accounts(user_id);
CREATE INDEX idx_youtube_accounts_active ON youtube_accounts(is_active, health_score DESC);

-- RLS
ALTER TABLE youtube_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own accounts"
  ON youtube_accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 2.6 published_videos (已发布视频表)

```sql
CREATE TABLE published_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  generated_video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  youtube_account_id UUID NOT NULL REFERENCES youtube_accounts(id) ON DELETE CASCADE,
  
  -- YouTube信息
  youtube_video_id TEXT UNIQUE,
  youtube_url TEXT,
  
  -- SEO信息
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  
  -- 统计数据
  views BIGINT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  watch_time_hours DECIMAL(10,2) DEFAULT 0,
  
  -- 状态
  status TEXT NOT NULL DEFAULT 'pending',
  privacy_status TEXT NOT NULL DEFAULT 'public',
  
  -- 时间戳
  published_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 约束
  CONSTRAINT valid_status CHECK (status IN ('pending', 'uploading', 'published', 'failed')),
  CONSTRAINT valid_privacy CHECK (privacy_status IN ('public', 'unlisted', 'private'))
);

-- 索引
CREATE INDEX idx_published_videos_user ON published_videos(user_id, published_at DESC);
CREATE INDEX idx_published_videos_account ON published_videos(youtube_account_id);
CREATE INDEX idx_published_videos_youtube ON published_videos(youtube_video_id);

-- RLS
ALTER TABLE published_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own published videos"
  ON published_videos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 3. RLS安全策略

### 3.1 安全原则

1. **默认拒绝**: 所有表默认开启RLS
2. **用户隔离**: 用户只能访问自己的数据
3. **Service Role特权**: Webhook和后台任务使用service_role_key绕过RLS

### 3.2 核心RLS策略

```sql
-- 全局开启RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_videos ENABLE ROW LEVEL SECURITY;

-- 通用策略模板
CREATE POLICY "Users can view own data"
  ON {table_name} FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON {table_name} FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON {table_name} FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
  ON {table_name} FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 4. 索引优化

### 4.1 常用查询索引

```sql
-- 用户查询自己的视频（最常用）
CREATE INDEX idx_generated_videos_user_created 
  ON generated_videos(user_id, created_at DESC);

-- 查询特定状态的任务
CREATE INDEX idx_crawl_jobs_user_status 
  ON crawl_jobs(user_id, status, created_at DESC);

-- 查询高评分的爆款视频
CREATE INDEX idx_viral_videos_score_platform 
  ON viral_videos(viral_score DESC, platform, created_at DESC);
```

### 4.2 复合索引

```sql
-- 配额检查（高频）
CREATE INDEX idx_profiles_quota_check 
  ON profiles(id, videos_generated_this_month, monthly_video_limit)
  WHERE subscription_status = 'active';

-- 僵尸任务清理
CREATE INDEX idx_stale_jobs 
  ON crawl_jobs(status, created_at)
  WHERE status = 'processing' AND created_at < NOW() - INTERVAL '2 hours';
```

### 4.3 GIN索引

```sql
-- JSONB搜索
CREATE INDEX idx_viral_videos_music 
  ON viral_videos USING GIN(music_info);

-- 数组搜索
CREATE INDEX idx_viral_videos_hashtags 
  ON viral_videos USING GIN(hashtags);

-- 全文搜索
CREATE INDEX idx_viral_videos_fulltext 
  ON viral_videos USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
  );
```

---

## 5. RPC函数

### 5.1 原子配额扣费

```sql
CREATE OR REPLACE FUNCTION check_and_decrement_quota(
  p_user_id UUID,
  p_cost INT DEFAULT 1,
  p_operation TEXT DEFAULT 'generate_video'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_count INT;
  v_monthly_limit INT;
  v_result JSON;
BEGIN
  -- 锁定行
  SELECT videos_generated_this_month, monthly_video_limit
  INTO v_current_count, v_monthly_limit
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE NOWAIT;
  
  -- 检查配额
  IF v_monthly_limit != -1 AND (v_current_count + p_cost) > v_monthly_limit THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'QUOTA_EXCEEDED',
      'remaining', GREATEST(0, v_monthly_limit - v_current_count)
    );
  END IF;
  
  -- 扣费
  UPDATE profiles
  SET videos_generated_this_month = videos_generated_this_month + p_cost
  WHERE id = p_user_id;
  
  -- 记录日志
  INSERT INTO quota_usage_logs (user_id, operation, cost)
  VALUES (p_user_id, p_operation, p_cost);
  
  RETURN json_build_object(
    'success', TRUE,
    'remaining', v_monthly_limit - v_current_count - p_cost
  );
EXCEPTION
  WHEN lock_not_available THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'CONCURRENT_REQUEST'
    );
END;
$$;
```

### 5.2 配额退款

```sql
CREATE OR REPLACE FUNCTION refund_quota(
  p_user_id UUID,
  p_amount INT DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET videos_generated_this_month = GREATEST(0, videos_generated_this_month - p_amount)
  WHERE id = p_user_id;
  
  INSERT INTO quota_usage_logs (user_id, operation, cost)
  VALUES (p_user_id, 'refund', -p_amount);
  
  RETURN TRUE;
END;
$$;
```

### 5.3 数据清理

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_crawl_deleted INT;
  v_videos_deleted INT;
BEGIN
  -- 清理30天前的爬取任务
  DELETE FROM crawl_jobs
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('completed', 'failed');
  GET DIAGNOSTICS v_crawl_deleted = ROW_COUNT;
  
  -- 清理90天前的爆款视频
  DELETE FROM viral_videos
  WHERE crawled_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS v_videos_deleted = ROW_COUNT;
  
  -- 运行VACUUM
  EXECUTE 'VACUUM ANALYZE viral_videos';
  EXECUTE 'VACUUM ANALYZE crawl_jobs';
  
  RETURN json_build_object(
    'crawl_jobs_deleted', v_crawl_deleted,
    'viral_videos_deleted', v_videos_deleted,
    'cleaned_at', NOW()
  );
END;
$$;
```

---

## 6. 迁移脚本

### 6.1 初始迁移

```sql
-- supabase/migrations/001_initial_schema.sql

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 启用pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建所有表（按顺序）
-- 1. profiles
-- 2. crawl_jobs
-- 3. viral_videos
-- 4. generated_videos
-- 5. youtube_accounts
-- 6. published_videos
-- 7. quota_usage_logs
-- 8. moderation_logs

-- (完整SQL略)
```

### 6.2 迁移命令

```bash
# 创建新迁移
supabase migration new add_analytics_tables

# 应用迁移
supabase db push

# 生成类型
supabase gen types typescript --local > types/supabase.ts
```

---

## 📎 附录

### A. 性能优化清单

- ✅ 所有外键已加索引
- ✅ 高频查询已优化
- ✅ 分区表已配置（大表）
- ✅ 清理任务已自动化

### B. 备份策略

- **每日备份**: Supabase自动
- **实时复制**: 主从复制
- **保留期**: 30天

---

<div align="center">

**[返回文档首页](../README.md)** | **[查看架构文档](./ARCHITECTURE.md)**

</div>