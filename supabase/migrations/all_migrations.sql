-- =============================================
-- Ateş AR — Tüm Migration'lar (Tek Dosya)
-- Supabase Dashboard → SQL Editor'a yapıştırıp çalıştırın
-- =============================================

-- =============================================
-- 001: TABLOLAR
-- =============================================

-- Parents tablosu
CREATE TABLE IF NOT EXISTS parents (
  id          UUID REFERENCES auth.users PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  sub_plan    TEXT DEFAULT 'free'
              CHECK (sub_plan IN ('free', 'family', 'plus')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Children tablosu
CREATE TABLE IF NOT EXISTS children (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id   UUID REFERENCES parents(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  age         INT CHECK (age BETWEEN 6 AND 11),
  grade       INT CHECK (grade BETWEEN 1 AND 4),
  total_stars INT DEFAULT 0,
  avatar_idx  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Progress tablosu
CREATE TABLE IF NOT EXISTS progress (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id        UUID REFERENCES children(id) ON DELETE CASCADE,
  module_id       TEXT NOT NULL,
  score           INT DEFAULT 0,
  best_score      INT DEFAULT 0,
  attempts        INT DEFAULT 0,
  completed       BOOLEAN DEFAULT FALSE,
  time_spent_sec  INT DEFAULT 0,
  last_played_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, module_id)
);

-- Conversations tablosu
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id    UUID REFERENCES children(id) ON DELETE CASCADE,
  session_id  TEXT NOT NULL,
  role        TEXT CHECK (role IN ('user', 'assistant')),
  content     TEXT,
  module_id   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions tablosu
CREATE TABLE IF NOT EXISTS subscriptions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id       UUID REFERENCES parents(id) ON DELETE CASCADE,
  platform        TEXT CHECK (platform IN ('ios', 'android', 'web')),
  product_id      TEXT,
  status          TEXT CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at      TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  original_tx_id  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 002: ROW LEVEL SECURITY
-- =============================================

-- Parents: sadece kendi satırını görür
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent_self" ON parents
  FOR ALL USING (auth.uid() = id);

-- Children: sadece ebeveynin çocukları
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent_children" ON children
  FOR ALL USING (parent_id = auth.uid());

-- Progress: çocuğun ebeveyni üzerinden
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "child_progress" ON progress
  FOR ALL USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Conversations: aynı şekilde
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "child_conversations" ON conversations
  FOR ALL USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Subscriptions: ebeveynin abonelikleri
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent_subscriptions" ON subscriptions
  FOR ALL USING (parent_id = auth.uid());

-- =============================================
-- 003: İNDEKSLER VE FONKSİYONLAR
-- =============================================

-- Performans indeksleri
CREATE INDEX IF NOT EXISTS idx_children_parent   ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_progress_child    ON progress(child_id);
CREATE INDEX IF NOT EXISTS idx_progress_module   ON progress(module_id);
CREATE INDEX IF NOT EXISTS idx_conv_child_date   ON conversations(child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sub_parent_status ON subscriptions(parent_id, status);

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

-- Trigger (var ise önce sil)
DROP TRIGGER IF EXISTS parents_updated_at ON parents;
CREATE TRIGGER parents_updated_at
  BEFORE UPDATE ON parents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
