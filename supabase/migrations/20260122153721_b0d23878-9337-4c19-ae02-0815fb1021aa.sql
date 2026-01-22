-- =====================================================
-- RAFIQ NIHON - CERTIFICATION TEST SCHEDULE & REGISTRATION
-- JLPT Test Information & Registration System
-- =====================================================

-- Test Institutions (Penyelenggara Ujian)
CREATE TABLE IF NOT EXISTS test_institutions (
  id TEXT PRIMARY KEY,
  name_ja TEXT NOT NULL,
  name_id TEXT NOT NULL,
  name_en TEXT,
  institution_type TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  country TEXT DEFAULT 'Indonesia',
  is_jlpt_official BOOLEAN DEFAULT false,
  is_nat_test BOOLEAN DEFAULT false,
  is_jft_basic BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Test Types
CREATE TABLE IF NOT EXISTS test_types (
  id TEXT PRIMARY KEY,
  name_ja TEXT NOT NULL,
  name_id TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  official_website TEXT,
  levels TEXT[],
  test_sections JSONB,
  passing_criteria JSONB,
  validity_years INT,
  recognition TEXT,
  icon_name TEXT DEFAULT 'Award',
  color TEXT DEFAULT '#3B82F6'
);

-- Test Schedules (Jadwal Ujian)
CREATE TABLE IF NOT EXISTS test_schedules (
  id TEXT PRIMARY KEY,
  test_type_id TEXT REFERENCES test_types(id),
  institution_id TEXT REFERENCES test_institutions(id),
  test_name TEXT NOT NULL,
  test_date DATE NOT NULL,
  test_time_start TIME,
  test_time_end TIME,
  levels_available TEXT[],
  registration_start DATE NOT NULL,
  registration_end DATE NOT NULL,
  announcement_date DATE,
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  capacity_per_level JSONB,
  current_registrations JSONB DEFAULT '{}',
  fee_amount DECIMAL(12, 2),
  fee_currency TEXT DEFAULT 'IDR',
  payment_methods TEXT[],
  payment_deadline DATE,
  requirements TEXT[],
  notes TEXT,
  status TEXT DEFAULT 'upcoming',
  external_registration_url TEXT,
  allow_in_app_registration BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Test Registrations
CREATE TABLE IF NOT EXISTS user_test_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  schedule_id TEXT REFERENCES test_schedules(id),
  test_level TEXT NOT NULL,
  full_name TEXT NOT NULL,
  full_name_katakana TEXT,
  birth_date DATE,
  gender TEXT,
  nationality TEXT,
  passport_number TEXT,
  id_card_number TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  photo_url TEXT,
  id_document_url TEXT,
  registration_status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  payment_amount DECIMAL(12, 2),
  payment_method TEXT,
  payment_proof_url TEXT,
  payment_date TIMESTAMPTZ,
  exam_number TEXT,
  seat_number TEXT,
  exam_room TEXT,
  submitted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, schedule_id, test_level)
);

-- Test Results
CREATE TABLE IF NOT EXISTS user_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  registration_id UUID REFERENCES user_test_registrations(id),
  test_type_id TEXT REFERENCES test_types(id),
  test_level TEXT NOT NULL,
  test_date DATE NOT NULL,
  total_score INT,
  section_scores JSONB,
  passing_score INT,
  is_passed BOOLEAN,
  certificate_number TEXT,
  certificate_url TEXT,
  certificate_issued_date DATE,
  certificate_expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Saved/Bookmarked Tests
CREATE TABLE IF NOT EXISTS user_saved_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  schedule_id TEXT REFERENCES test_schedules(id),
  reminder_set BOOLEAN DEFAULT false,
  reminder_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, schedule_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_test_schedules_date ON test_schedules(test_date);
CREATE INDEX IF NOT EXISTS idx_test_schedules_status ON test_schedules(status);
CREATE INDEX IF NOT EXISTS idx_user_registrations_user ON user_test_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_registrations_status ON user_test_registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_user_results_user ON user_test_results(user_id);

-- RLS Policies
ALTER TABLE test_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_test_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Test institutions viewable by everyone" ON test_institutions FOR SELECT USING (true);
CREATE POLICY "Test types viewable by everyone" ON test_types FOR SELECT USING (true);
CREATE POLICY "Test schedules viewable by everyone" ON test_schedules FOR SELECT USING (true);
CREATE POLICY "Users manage own registrations" ON user_test_registrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own results" ON user_test_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saved tests" ON user_saved_tests FOR ALL USING (auth.uid() = user_id);