import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testPolicy = {
  user_id: 'test_user',
  file_name: 'test.pdf',
  insurer: 'Test Insurer',
  plan_name: 'Test Plan',
  sum_insured: 100000,
  premium: 1000,
  policy_type: 'Individual',
  policy_year: 2024,
  age: 30,
  exclusions: [],
  waiting_periods: { ped: 2, initial: 30, specific: 0, maternity: 36 },
  sub_limits: {},
  copay: 0,
  no_claim_bonus: 0,
  restoration: 'No',
  network_hospitals: 100,
  cashless_hospitals: 'Test',
  features: [],
  rating: 3,
  summary: 'Test policy',
  analysis_date: '2024-01-01',
  raw_data: {}
};

const { data, error } = await supabase.from('policies').insert([testPolicy]).select();
console.log('Result:', { data, error });
