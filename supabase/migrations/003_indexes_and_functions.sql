-- Supabase Migration: İndeksler ve Fonksiyonlar
-- 003_indexes_and_functions.sql

-- Performans indeksleri
CREATE INDEX idx_children_parent   ON children(parent_id);
CREATE INDEX idx_progress_child    ON progress(child_id);
CREATE INDEX idx_progress_module   ON progress(module_id);
CREATE INDEX idx_conv_child_date   ON conversations(child_id, created_at DESC);
CREATE INDEX idx_sub_parent_status ON subscriptions(parent_id, status);

-- Haftalık özet fonksiyonu
CREATE OR REPLACE FUNCTION get_weekly_summary(p_child_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_sessions',    COUNT(DISTINCT c.session_id),
    'total_time_min',    COALESCE(ROUND(SUM(p.time_spent_sec) / 60.0), 0),
    'modules_completed', COUNT(*) FILTER (WHERE p.completed = TRUE),
    'stars_earned',      COALESCE(SUM(p.score), 0),
    'best_module',       (
      SELECT module_id FROM progress
      WHERE child_id = p_child_id
      ORDER BY best_score DESC LIMIT 1
    )
  )
  FROM progress p
  LEFT JOIN conversations c ON c.child_id = p.child_id
  WHERE p.child_id = p_child_id
    AND (c.created_at IS NULL OR c.created_at >= NOW() - INTERVAL '7 days');
$$ LANGUAGE SQL SECURITY DEFINER;

-- Yıldız artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_stars(p_child_id UUID, p_stars INT)
RETURNS VOID AS $$
  UPDATE children
  SET total_stars = total_stars + p_stars
  WHERE id = p_child_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parents_updated_at
  BEFORE UPDATE ON parents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
