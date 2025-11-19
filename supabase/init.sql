-- =============================================
-- Jilo.ai数据库初始化脚本
-- =============================================
-- 运行此脚本前，请确保你已经创建了Supabase项目
-- 在Supabase Dashboard -> SQL Editor中运行此脚本

-- =============================================
-- 1. 启用必要的扩展
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. 创建枚举类型
-- =============================================

-- 视频生成任务状态
CREATE TYPE video_generation_status AS ENUM (
  'pending',
  'processing', 
  'completed',
  'failed',
  'cancelled'
);

-- AI模型类型
CREATE TYPE ai_model_type AS ENUM (
  'minimax',
  'runway',
  'kling'
);

-- 配额交易类型
CREATE TYPE quota_transaction_type AS ENUM (
  'video_generation',
  'monthly_reset',
  'purchase',
  'refund'
);

-- =============================================
-- 3. 创建表
-- =============================================

-- 3.1 用户表（扩展Supabase Auth）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  quota INTEGER NOT NULL DEFAULT 100, -- 每月视频生成配额
  plan TEXT NOT NULL DEFAULT 'free', -- free, pro, enterprise
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 视频生成任务表
CREATE TABLE IF NOT EXISTS public.video_generation_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- 生成配置
  prompt TEXT NOT NULL,
  ai_model ai_model_type NOT NULL DEFAULT 'minimax',
  duration INTEGER NOT NULL DEFAULT 30, -- 秒
  
  -- 任务状态
  status video_generation_status NOT NULL DEFAULT 'pending',
  progress INTEGER DEFAULT 0, -- 0-100
  
  -- 结果
  video_url TEXT,
  thumbnail_url TEXT,
  error_message TEXT,
  
  -- FAL.AI相关
  fal_request_id TEXT UNIQUE,
  
  -- 发布信息
  published_to_youtube BOOLEAN DEFAULT FALSE,
  youtube_video_id TEXT,
  youtube_url TEXT,
  published_at TIMESTAMPTZ,
  
  -- 时间戳
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 3.3 配额交易记录表
CREATE TABLE IF NOT EXISTS public.quota_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  amount INTEGER NOT NULL, -- 正数为增加，负数为减少
  type quota_transaction_type NOT NULL,
  description TEXT,
  
  -- 关联信息
  related_task_id UUID REFERENCES public.video_generation_tasks(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 爆款视频表
CREATE TABLE IF NOT EXISTS public.viral_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 视频信息
  platform TEXT NOT NULL, -- tiktok, youtube, instagram
  platform_video_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  
  -- 统计数据
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  
  -- AI分析
  viral_score INTEGER, -- 0-100
  ai_analysis JSONB, -- Gemini分析结果
  
  -- 元数据
  author_name TEXT,
  author_id TEXT,
  published_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(platform, platform_video_id)
);

-- 3.5 YouTube连接表
CREATE TABLE IF NOT EXISTS public.youtube_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- OAuth信息（加密存储）
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  
  -- YouTube频道信息
  channel_id TEXT NOT NULL,
  channel_name TEXT,
  channel_thumbnail TEXT,
  
  -- 状态
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, channel_id)
);

-- 3.6 Webhook日志表
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Webhook信息
  source TEXT NOT NULL, -- fal, apify
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  
  -- 处理状态
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- 幂等性
  idempotency_key TEXT UNIQUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 4. 创建索引
-- =============================================

-- users表索引
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_plan ON public.users(plan);

-- video_generation_tasks表索引
CREATE INDEX idx_video_tasks_user_id ON public.video_generation_tasks(user_id);
CREATE INDEX idx_video_tasks_status ON public.video_generation_tasks(status);
CREATE INDEX idx_video_tasks_fal_request_id ON public.video_generation_tasks(fal_request_id);
CREATE INDEX idx_video_tasks_created_at ON public.video_generation_tasks(created_at DESC);
CREATE INDEX idx_video_tasks_user_status ON public.video_generation_tasks(user_id, status);

-- quota_transactions表索引
CREATE INDEX idx_quota_trans_user_id ON public.quota_transactions(user_id);
CREATE INDEX idx_quota_trans_created_at ON public.quota_transactions(created_at DESC);

-- viral_videos表索引
CREATE INDEX idx_viral_videos_platform ON public.viral_videos(platform);
CREATE INDEX idx_viral_videos_viral_score ON public.viral_videos(viral_score DESC);
CREATE INDEX idx_viral_videos_scraped_at ON public.viral_videos(scraped_at DESC);
CREATE INDEX idx_viral_videos_views ON public.viral_videos(views DESC);

-- youtube_connections表索引
CREATE INDEX idx_youtube_conn_user_id ON public.youtube_connections(user_id);
CREATE INDEX idx_youtube_conn_is_active ON public.youtube_connections(is_active);

-- webhooks表索引
CREATE INDEX idx_webhooks_processed ON public.webhooks(processed);
CREATE INDEX idx_webhooks_source ON public.webhooks(source);
CREATE INDEX idx_webhooks_idempotency_key ON public.webhooks(idempotency_key);

-- =============================================
-- 5. 创建函数
-- =============================================

-- 5.1 原子化配额扣除函数
CREATE OR REPLACE FUNCTION public.atomic_deduct_quota(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_quota INTEGER;
BEGIN
  -- 🔒 关键: 使用FOR UPDATE锁定用户行
  SELECT quota INTO v_current_quota
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- 检查配额是否足够
  IF v_current_quota < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- 扣除配额
  UPDATE public.users
  SET 
    quota = quota - p_amount,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- 记录交易
  INSERT INTO public.quota_transactions (
    user_id,
    amount,
    type,
    description
  ) VALUES (
    p_user_id,
    -p_amount,
    'video_generation',
    'Video generation quota deduction'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5.2 更新updated_at触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5.3 创建新用户时初始化配额函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, quota, plan)
  VALUES (
    NEW.id,
    NEW.email,
    100, -- 免费用户初始配额
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. 创建触发器
-- =============================================

-- 6.1 更新updated_at触发器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_tasks_updated_at
  BEFORE UPDATE ON public.video_generation_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_viral_videos_updated_at
  BEFORE UPDATE ON public.viral_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_youtube_conn_updated_at
  BEFORE UPDATE ON public.youtube_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6.2 新用户注册触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 7. 启用行级安全 (RLS)
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_generation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 8. 创建RLS策略
-- =============================================

-- 8.1 users表策略
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 8.2 video_generation_tasks表策略
CREATE POLICY "Users can view own video tasks"
  ON public.video_generation_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own video tasks"
  ON public.video_generation_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video tasks"
  ON public.video_generation_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own video tasks"
  ON public.video_generation_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- 8.3 quota_transactions表策略
CREATE POLICY "Users can view own quota transactions"
  ON public.quota_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 8.4 viral_videos表策略（所有人可读）
CREATE POLICY "Anyone can view viral videos"
  ON public.viral_videos FOR SELECT
  TO authenticated
  USING (true);

-- 8.5 youtube_connections表策略
CREATE POLICY "Users can view own YouTube connections"
  ON public.youtube_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own YouTube connections"
  ON public.youtube_connections FOR ALL
  USING (auth.uid() = user_id);

-- 8.6 webhooks表策略（仅服务角色可访问）
CREATE POLICY "Service role can manage webhooks"
  ON public.webhooks FOR ALL
  TO service_role
  USING (true);

-- =============================================
-- 9. 创建测试数据（可选，生产环境删除）
-- =============================================

-- 插入一些测试爆款视频
INSERT INTO public.viral_videos (
  platform,
  platform_video_id,
  title,
  description,
  views,
  likes,
  viral_score,
  author_name
) VALUES
  ('tiktok', 'test123', '10个最实用的AI工具', '这些AI工具能让你效率翻倍', 1500000, 85000, 92, 'AI科技'),
  ('youtube', 'test456', 'ChatGPT使用技巧', '5分钟学会ChatGPT高级用法', 2300000, 120000, 95, '科技解说'),
  ('tiktok', 'test789', 'AI视频生成教程', '零基础也能做出专业视频', 980000, 56000, 88, '内容创作者')
ON CONFLICT (platform, platform_video_id) DO NOTHING;

-- =============================================
-- 完成！
-- =============================================

-- 验证表已创建
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 验证函数已创建
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;
