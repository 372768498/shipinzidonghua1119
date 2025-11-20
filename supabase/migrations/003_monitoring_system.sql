-- 视频指标历史记录表（用于绘制增长曲线）
CREATE TABLE IF NOT EXISTS video_metrics_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES viral_videos(id) ON DELETE CASCADE,
  
  -- 快照时间
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 指标数据
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  
  -- 增长率（相比上次）
  views_growth DECIMAL,
  likes_growth DECIMAL,
  comments_growth DECIMAL,
  
  -- 计算字段
  engagement_rate DECIMAL,
  viral_velocity DECIMAL, -- 爆款速度
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_metrics_video_time ON video_metrics_history(video_id, snapshot_at DESC);
CREATE INDEX idx_metrics_snapshot ON video_metrics_history(snapshot_at DESC);

-- 监控任务表
CREATE TABLE IF NOT EXISTS monitoring_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 任务类型
  task_type VARCHAR(50) NOT NULL, -- 'hashtag', 'user', 'video', 'keyword'
  
  -- 监控目标
  target_value TEXT NOT NULL, -- hashtag名称、用户ID、关键词等
  platform VARCHAR(20) NOT NULL, -- 'tiktok', 'youtube'
  
  -- 监控配置
  frequency VARCHAR(20) DEFAULT 'hourly', -- 'hourly', 'daily', 'weekly'
  is_active BOOLEAN DEFAULT true,
  
  -- Apify配置
  apify_actor_id TEXT,
  apify_run_input JSONB,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  
  -- 统计
  total_runs INTEGER DEFAULT 0,
  videos_tracked INTEGER DEFAULT 0,
  
  -- 预警配置
  alert_threshold JSONB, -- {views: 100000, growth_rate: 50}
  alert_webhook TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_monitoring_active ON monitoring_tasks(is_active, next_run_at);
CREATE INDEX idx_monitoring_platform ON monitoring_tasks(platform, task_type);

-- 趋势分析表
CREATE TABLE IF NOT EXISTS trending_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES viral_videos(id) ON DELETE CASCADE,
  
  -- 分析结果
  trend_status VARCHAR(20), -- 'rising', 'stable', 'declining'
  peak_views BIGINT,
  peak_time TIMESTAMPTZ,
  
  -- 预测数据
  predicted_24h_views BIGINT,
  predicted_7d_views BIGINT,
  predicted_viral_score INTEGER,
  
  -- 生命周期
  lifecycle_stage VARCHAR(20), -- 'emerging', 'viral', 'mature', 'declining'
  days_since_publish INTEGER,
  
  -- AI分析
  trend_factors JSONB,
  recommendations TEXT,
  
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trending_video ON trending_analysis(video_id);
CREATE INDEX idx_trending_status ON trending_analysis(trend_status, analyzed_at DESC);

-- 增加viral_videos表的字段
ALTER TABLE viral_videos ADD COLUMN IF NOT EXISTS is_monitored BOOLEAN DEFAULT false;
ALTER TABLE viral_videos ADD COLUMN IF NOT EXISTS monitoring_started_at TIMESTAMPTZ;
ALTER TABLE viral_videos ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMPTZ;
ALTER TABLE viral_videos ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 视图：最新指标
CREATE OR REPLACE VIEW latest_video_metrics AS
SELECT DISTINCT ON (video_id)
  vmh.*,
  vv.title,
  vv.platform,
  vv.viral_score
FROM video_metrics_history vmh
JOIN viral_videos vv ON vmh.video_id = vv.id
ORDER BY video_id, snapshot_at DESC;

-- 视图：增长最快的视频
CREATE OR REPLACE VIEW fastest_growing_videos AS
SELECT 
  vv.id,
  vv.title,
  vv.platform,
  vv.thumbnail_url,
  vv.video_url,
  vv.viral_score,
  latest.views as current_views,
  latest.views_growth as growth_rate,
  latest.snapshot_at as last_check
FROM viral_videos vv
JOIN latest_video_metrics latest ON vv.id = latest.video_id
WHERE vv.is_monitored = true
  AND latest.views_growth IS NOT NULL
ORDER BY latest.views_growth DESC;

COMMENT ON TABLE video_metrics_history IS '视频指标历史记录，用于绘制增长曲线';
COMMENT ON TABLE monitoring_tasks IS '自动监控任务配置';
COMMENT ON TABLE trending_analysis IS '视频趋势分析和预测';
