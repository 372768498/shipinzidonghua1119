-- 为监控系统表添加Row Level Security (RLS)

-- 1. 启用RLS
ALTER TABLE monitoring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_analysis ENABLE ROW LEVEL SECURITY;

-- 2. 创建策略：允许所有认证用户访问
CREATE POLICY "Allow authenticated users to read monitoring_tasks"
  ON monitoring_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert monitoring_tasks"
  ON monitoring_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update monitoring_tasks"
  ON monitoring_tasks FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete monitoring_tasks"
  ON monitoring_tasks FOR DELETE
  TO authenticated
  USING (true);

-- video_metrics_history策略
CREATE POLICY "Allow authenticated users to read video_metrics_history"
  ON video_metrics_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert video_metrics_history"
  ON video_metrics_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- trending_analysis策略
CREATE POLICY "Allow authenticated users to read trending_analysis"
  ON trending_analysis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert trending_analysis"
  ON trending_analysis FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. 允许service role完全访问（用于后端API）
CREATE POLICY "Allow service role full access to monitoring_tasks"
  ON monitoring_tasks FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Allow service role full access to video_metrics_history"
  ON video_metrics_history FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Allow service role full access to trending_analysis"
  ON trending_analysis FOR ALL
  TO service_role
  USING (true);
