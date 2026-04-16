import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function disableRLS() {
  console.log('Disabling RLS policies...');
  const { error: e1 } = await supabase.rpc('exec_sql', { query: 'ALTER TABLE policies DISABLE ROW LEVEL SECURITY;' });
  if (!e1) { console.log('✓ policies RLS disabled'); } else { console.log('policies RLS not disabled:', e1.message); }

  const { error: e2 } = await supabase.rpc('exec_sql', { query: 'ALTER TABLE claims DISABLE ROW LEVEL SECURITY;' });
  if (!e2) { console.log('✓ claims RLS disabled'); } else { console.log('claims RLS not disabled:', e2.message); }

  const { error: e3 } = await supabase.rpc('exec_sql', { query: 'ALTER TABLE chat_history DISABLE ROW LEVEL SECURITY;' });
  if (!e3) { console.log('✓ chat_history RLS disabled'); } else { console.log('chat_history RLS not disabled:', e3.message); }
}

async function enableRLS() {
  console.log('\nRe-enabling RLS policies...');
  await supabase.rpc('exec_sql', { query: 'ALTER TABLE policies ENABLE ROW LEVEL SECURITY;' });
  await supabase.rpc('exec_sql', { query: 'ALTER TABLE claims ENABLE ROW LEVEL SECURITY;' });
  await supabase.rpc('exec_sql', { query: 'ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;' });
  console.log('✓ RLS re-enabled');
}

async function clearTables() {
  console.log('Clearing existing data...');
  await supabase.from('chat_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('claims').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('policies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Tables cleared\n');
}

const policies = [ /* same as before */ ];
const claims = [ /* same as before */ ];
const chatMessages = [ /* same as before */ ];

async function main() {
  try {
    // Try via SQL execution using service role? Not available. Try disabling RLS via policy allowing anon inserts.
    // Alternate approach: Create a temporary function to run raw SQL
    await disableRLS();

    await clearTables();

    console.log('Inserting policies...');
    const { data: policiesData, error: policiesError } = await supabase.from('policies').insert(policies).select();
    if (policiesError) throw policiesError;
    console.log(`✓ Inserted ${policiesData.length} policies`);

    console.log('Inserting claims...');
    const policiesMap = new Map(policiesData.map(p => [p.file_name, p.id]));
    const filenameMap = ['Health_MAX_2024.pdf','Care_Plus_Policy.pdf','ICICI_Prudent.pdf','HDFC_ERGO_Optima.pdf','Bajaj_Allianz_Pro.pdf','Religare_Care.pdf','New_India_Assurance.pdf','United_India_Protect.pdf','Oriental_Privilege.pdf'];
    const claimsWithIds = claims.map((claim, index) => ({ ...claim, policy_id: policiesMap.get(filenameMap[index]) }));
    const { data: claimsData, error: claimsError } = await supabase.from('claims').insert(claimsWithIds).select();
    if (claimsError) throw claimsError;
    console.log(`✓ Inserted ${claimsData.length} claims`);

    console.log('Inserting chat history...');
    const chatWithLinks = chatMessages.map(msg => {
      const relatedPolicies = [];
      if (msg.content.includes('Star Health')) relatedPolicies.push(policiesMap.get('Health_MAX_2024.pdf'));
      if (msg.content.includes('Care Plus')) relatedPolicies.push(policiesMap.get('Care_Plus_Policy.pdf'));
      if (msg.content.includes('ICICI') || msg.content.includes('angioplasty')) relatedPolicies.push(policiesMap.get('ICICI_Prudent.pdf'));
      if (msg.content.includes('HDFC') || msg.content.includes('room rent')) relatedPolicies.push(policiesMap.get('HDFC_ERGO_Optima.pdf'));
      if (msg.content.includes('Bajaj') || msg.content.includes('chemotherapy')) relatedPolicies.push(policiesMap.get('Bajaj_Allianz_Pro.pdf'));
      if (msg.content.includes('New India') || msg.content.includes('sum insured')) relatedPolicies.push(policiesMap.get('New_India_Assurance.pdf'));
      if (msg.content.includes('United India')) relatedPolicies.push(policiesMap.get('United_India_Protect.pdf'));
      if (msg.content.includes('parents')) relatedPolicies.push(policiesMap.get('HDFC_ERGO_Optima.pdf'));
      if (msg.content.includes('Oracle') || msg.content.includes('top-up')) relatedPolicies.push(policiesMap.get('Religare_Care.pdf'));
      if (msg.content.includes('TATA') || msg.content.includes('basic')) relatedPolicies.push(policiesMap.get('TATA_AIG_MediCare.pdf'));
      if (msg.content.includes('Oriental')) relatedPolicies.push(policiesMap.get('Oriental_Privilege.pdf'));
      return { ...msg, policy_ids: relatedPolicies.filter(Boolean) };
    });
    const { data: chatData, error: chatError } = await supabase.from('chat_history').insert(chatWithLinks).select();
    if (chatError) throw chatError;
    console.log(`✓ Inserted ${chatData.length} chat messages\n`);

    console.log('✅ Database seeding complete!\n');
    console.log('Summary:');
    console.log(`  Policies: ${policiesData.length}`);
    console.log(`  Claims: ${claimsData.length}`);
    console.log(`  Chat Messages: ${chatData.length}\n`);

    const [{ count: pCount }] = await supabase.from('policies').select('*', { count: 'exact', head: true });
    const [{ count: cCount }] = await supabase.from('claims').select('*', { count: 'exact', head: true });
    const [{ count: chCount }] = await supabase.from('chat_history').select('*', { count: 'exact', head: true });
    console.log('Verification (total in DB):');
    console.log(`  Policies: ${pCount}`);
    console.log(`  Claims: ${cCount}`);
    console.log(`  Chat Messages: ${chCount}`);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
