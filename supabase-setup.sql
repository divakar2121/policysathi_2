-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  file_name TEXT NOT NULL,
  insurer TEXT,
  plan_name TEXT,
  sum_insured NUMERIC,
  premium NUMERIC,
  policy_type TEXT,
  policy_year INTEGER,
  age INTEGER,
  exclusions TEXT[] DEFAULT '{}',
  waiting_periods JSONB DEFAULT '{"ped": 0, "initial": 0, "specific": 0, "maternity": 0}'::jsonb,
  sub_limits JSONB DEFAULT '{}'::jsonb,
  copay NUMERIC DEFAULT 0,
  no_claim_bonus NUMERIC DEFAULT 0,
  restoration TEXT,
  network_hospitals INTEGER,
  cashless_hospitals TEXT,
  features TEXT[] DEFAULT '{}',
  rating INTEGER DEFAULT 0,
  summary TEXT,
  analysis_date TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  policy_id UUID NOT NULL,
  treatment TEXT,
  hospital TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'pending',
  win_probability NUMERIC,
  expected_amount TEXT,
  analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  policy_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);