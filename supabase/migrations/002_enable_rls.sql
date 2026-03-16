-- Supabase Migration: Row Level Security
-- 002_enable_rls.sql

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
