-- 004: Parents tablosuna settings JSONB kolonu ekle
-- Supabase Dashboard → SQL Editor'da çalıştırın

ALTER TABLE parents ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"notificationsEnabled": true, "dailyLimit": 30}'::jsonb;
