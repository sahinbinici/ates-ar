-- Supabase Migration: Temel Tablolar
-- 001_create_tables.sql

-- Parents tablosu
CREATE TABLE parents (
  id          UUID REFERENCES auth.users PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  sub_plan    TEXT DEFAULT 'free'
              CHECK (sub_plan IN ('free', 'family', 'plus')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Children tablosu
CREATE TABLE children (
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
CREATE TABLE progress (
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
CREATE TABLE conversations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id    UUID REFERENCES children(id) ON DELETE CASCADE,
  session_id  TEXT NOT NULL,
  role        TEXT CHECK (role IN ('user', 'assistant')),
  content     TEXT,
  module_id   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions tablosu
CREATE TABLE subscriptions (
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
