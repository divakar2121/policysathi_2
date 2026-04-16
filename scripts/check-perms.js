import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStatus() {
  // Try to fetch policies (should work)
  const { data, error } = await supabase.from('policies').select('*');
  console.log('Current policies:', data?.length || 0, 'rows');
  if (error) console.log('Error reading policies:', error.message);

  // Check RLS policies
  const { data: policies, error: rlsError } = await supabase
    .from('pg_policies')
    .select('*')
    .ilike('tablename', 'policies');
  console.log('RLS Policies on policies table:', policies);
  if (rlsError) console.log('Error reading pg_policies:', rlsError.message);
}

checkStatus().catch(console.error);
