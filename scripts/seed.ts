import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Clear existing data
async function clearTables() {
  console.log('Clearing existing data...');
  await supabase.from('chat_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('claims').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('policies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Tables cleared');
}

// Seed policies
const policies = [
  {
    user_id: 'user_001',
    file_name: 'Health_MAX_2024.pdf',
    insurer: 'Star Health',
    plan_name: 'Star Comprehensive',
    sum_insured: 500000,
    premium: 25000,
    policy_type: 'Individual',
    policy_year: 2024,
    age: 35,
    exclusions: ['Cosmetic surgeries'],
    waiting_periods: { ped: 2, initial: 30, specific: 0, maternity: 36 },
    sub_limits: { room_rent: '1500/day', icu: '3000/day' },
    copay: 10,
    no_claim_bonus: 50,
    restoration: 'Yes',
    network_hospitals: 5000,
    cashless_hospitals: 'Major cities',
    features: ['AYUSH coverage', 'Free health checkups'],
    rating: 4,
    summary: 'Comprehensive health cover with decent network',
    analysis_date: '2024-01-15',
    raw_data: { pdf_size: '2.3MB' }
  },
  {
    user_id: 'user_002',
    file_name: 'Care_Plus_Policy.pdf',
    insurer: 'Care Health',
    plan_name: 'Care Plus',
    sum_insured: 750000,
    premium: 32000,
    policy_type: 'Family Floater',
    policy_year: 2024,
    age: 42,
    exclusions: ['Dental treatments'],
    waiting_periods: { ped: 3, initial: 30, specific: 0, maternity: 48 },
    sub_limits: { room_rent: '2000/day' },
    copay: 0,
    no_claim_bonus: 60,
    restoration: 'No',
    network_hospitals: 7500,
    cashless_hospitals: '500+ cities',
    features: ['Maternity after 3 years', 'OPD cover'],
    rating: 3,
    summary: 'Good family policy but limited room rent',
    analysis_date: '2024-02-10',
    raw_data: { pdf_size: '1.8MB' }
  },
  {
    user_id: 'user_003',
    file_name: 'ICICI_Prudent.pdf',
    insurer: 'ICICI Lombard',
    plan_name: 'Prudent Health',
    sum_insured: 1000000,
    premium: 45000,
    policy_type: 'Individual',
    policy_year: 2023,
    age: 28,
    exclusions: ['Infertility treatments'],
    waiting_periods: { ped: 1, initial: 30, specific: 0, maternity: 24 },
    sub_limits: { room_rent: '2500/day', icu: '4000/day', pre_post_hospitalization: '60 days' },
    copay: 5,
    no_claim_bonus: 70,
    restoration: 'Yes',
    network_hospitals: 10000,
    cashless_hospitals: 'Pan India',
    features: ['Global coverage', 'Second opinion'],
    rating: 5,
    summary: 'Premium policy with excellent coverage',
    analysis_date: '2023-11-05',
    raw_data: { pdf_size: '3.1MB' }
  },
  {
    user_id: 'user_004',
    file_name: 'HDFC_ERGO_Optima.pdf',
    insurer: 'HDFC ERGO',
    plan_name: 'Optima Secure',
    sum_insured: 2000000,
    premium: 68000,
    policy_type: 'Family Floater',
    policy_year: 2024,
    age: 50,
    exclusions: ['Weight loss surgeries'],
    waiting_periods: { ped: 2, initial: 30, specific: 0, maternity: 36 },
    sub_limits: { room_rent: 'No_sub_limit', icu: 'No_sub_limit' },
    copay: 0,
    no_claim_bonus: 75,
    restoration: 'Yes',
    network_hospitals: 15000,
    cashless_hospitals: 'All network',
    features: ['No room rent limit', 'Unlimited sum insured'],
    rating: 4,
    summary: 'Excellent for senior citizens',
    analysis_date: '2024-03-20',
    raw_data: { pdf_size: '2.7MB' }
  },
  {
    user_id: 'user_005',
    file_name: 'Bajaj_Allianz_Pro.pdf',
    insurer: 'Bajaj Allianz',
    plan_name: 'Pro Team Plus',
    sum_insured: 1500000,
    premium: 52000,
    policy_type: 'Individual',
    policy_year: 2023,
    age: 40,
    exclusions: ['Hearing aids'],
    waiting_periods: { ped: 2, initial: 30, specific: 0, maternity: 'Not covered' },
    sub_limits: { room_rent: '1800/day', ambulance: '2000' },
    copay: 10,
    no_claim_bonus: 55,
    restoration: 'Yes',
    network_hospitals: 8000,
    cashless_hospitals: 'Major metros',
    features: ['Critical illness rider', 'Personal accident'],
    rating: 3,
    summary: 'Decent value for money',
    analysis_date: '2023-09-12',
    raw_data: { pdf_size: '2.5MB' }
  },
  {
    user_id: 'user_001',
    file_name: 'Religare_Care.pdf',
    insurer: 'Care Health',
    plan_name: 'Care Supreme',
    sum_insured: 3000000,
    premium: 95000,
    policy_type: 'Family Floater',
    policy_year: 2024,
    age: 38,
    exclusions: [],
    waiting_periods: { ped: 1, initial: 30, specific: 0, maternity: 24 },
    sub_limits: { room_rent: 'Unlimited', icu: 'Unlimited' },
    copay: 0,
    no_claim_bonus: 80,
    restoration: 'Yes',
    network_hospitals: 20000,
    cashless_hospitals: 'All inclusive',
    features: ['Super top-up', 'Maternity cover'],
    rating: 5,
    summary: 'Super top-up policy with unlimited room rent',
    analysis_date: '2024-04-01',
    raw_data: { pdf_size: '2.9MB' }
  },
  {
    user_id: 'user_003',
    file_name: 'TATA_AIG_MediCare.pdf',
    insurer: 'TATA AIG',
    plan_name: 'MediCare Premier',
    sum_insured: 800000,
    premium: 38000,
    policy_type: 'Individual',
    policy_year: 2023,
    age: 45,
    exclusions: ['Experimental treatments'],
    waiting_periods: { ped: 3, initial: 45, specific: 0, maternity: 'Not covered' },
    sub_limits: { room_rent: '1600/day' },
    copay: 15,
    no_claim_bonus: 45,
    restoration: 'No',
    network_hospitals: 6500,
    cashless_hospitals: 'Tier1-2 cities',
    features: ['Domiciliary hospitalization', 'Road ambulance'],
    rating: 2,
    summary: 'Basic policy with long waiting periods',
    analysis_date: '2023-07-22',
    raw_data: { pdf_size: '2.1MB' }
  },
  {
    user_id: 'user_006',
    file_name: 'New_India_Assurance.pdf',
    insurer: 'New India Assurance',
    plan_name: 'National Mediclaim',
    sum_insured: 500000,
    premium: 18000,
    policy_type: 'Individual',
    policy_year: 2024,
    age: 29,
    exclusions: ['HIV/AIDS treatments'],
    waiting_periods: { ped: 4, initial: 30, specific: 0, maternity: 48 },
    sub_limits: { room_rent: '1200/day' },
    copay: 20,
    no_claim_bonus: 40,
    restoration: 'No',
    network_hospitals: 4000,
    cashless_hospitals: 'Govt hospitals',
    features: ['Pre-and-post hospitalization', 'AYUSH treatments'],
    rating: 2,
    summary: 'Economy option with basic coverage',
    analysis_date: '2024-01-08',
    raw_data: { pdf_size: '1.5MB' }
  },
  {
    user_id: 'user_002',
    file_name: 'United_India_Protect.pdf',
    insurer: 'United India',
    plan_name: 'Family Protect',
    sum_insured: 1200000,
    premium: 48000,
    policy_type: 'Family Floater',
    policy_year: 2023,
    age: 33,
    exclusions: ['Gender reassignment'],
    waiting_periods: { ped: 2, initial: 30, specific: 0, maternity: 36 },
    sub_limits: { room_rent: '1900/day', disease_wise: { cataract: '20000' } },
    copay: 5,
    no_claim_bonus: 65,
    restoration: 'Yes',
    network_hospitals: 9000,
    cashless_hospitals: 'Pan India',
    features: ['Daily cash allowance', 'Health checkups'],
    rating: 3,
    summary: 'Mid-range family policy with sub-limits',
    analysis_date: '2023-12-03',
    raw_data: { pdf_size: '2.2MB' }
  },
  {
    user_id: 'user_004',
    file_name: 'Oriental_Privilege.pdf',
    insurer: 'Oriental Insurance',
    plan_name: 'Privilege Health',
    sum_insured: 2500000,
    premium: 72000,
    policy_type: 'Individual',
    policy_year: 2024,
    age: 55,
    exclusions: ['Congenital diseases'],
    waiting_periods: { ped: 1, initial: 30, specific: 12, maternity: 24 },
    sub_limits: { room_rent: '2200/day', icu: '4500/day', pre_post_hospitalization: '90 days' },
    copay: 0,
    no_claim_bonus: 72,
    restoration: 'Yes',
    network_hospitals: 12000,
    cashless_hospitals: 'All network',
    features: ['Organ donor expenses', 'Reconstruction surgery'],
    rating: 4,
    summary: 'Good for elderly with specific illness cover',
    analysis_date: '2024-02-28',
    raw_data: { pdf_size: '2.8MB' }
  }
];

// Seed claims data
const claims = [
  {
    user_id: 'user_001',
    treatment: 'Appendectomy',
    hospital: 'Apollo Hospitals, Chennai',
    amount: 85000,
    status: 'approved' as const,
    win_probability: 92,
    expected_amount: '₹85,000',
    analysis: { covered: true, loopholes: ['Pre-authorization obtained'], documents_needed: ['Surgical report', 'Bills'] }
  },
  {
    user_id: 'user_002',
    treatment: 'Cataract Surgery',
    hospital: 'LV Prasad Eye Institute, Hyderabad',
    amount: 125000,
    status: 'pending' as const,
    win_probability: 78,
    expected_amount: '₹1.0L - ₹1.2L',
    analysis: { covered: true, sub_limit_applies: true, loopholes: ['Room rent sub limit exceeded by ₹5000'] }
  },
  {
    user_id: 'user_003',
    treatment: 'Angioplasty',
    hospital: 'Fortis Escorts, Delhi',
    amount: 280000,
    status: 'approved' as const,
    win_probability: 95,
    expected_amount: '₹2.8L',
    analysis: { covered: true, waiting_period_ok: true, critical_illness_rider_applicable: true }
  },
  {
    user_id: 'user_004',
    treatment: 'Knee Replacement',
    hospital: 'Kokilaben Hospital, Mumbai',
    amount: 450000,
    status: 'pending' as const,
    win_probability: 88,
    expected_amount: '₹4.2L - ₹4.5L',
    analysis: { covered: true, prosthesis_limit: '₹50,000', loopholes: ['Prosthesis cost will be partially covered'] }
  },
  {
    user_id: 'user_005',
    treatment: 'Chemotherapy',
    hospital: 'Tata Memorial, Mumbai',
    amount: 650000,
    status: 'rejected' as const,
    win_probability: 35,
    expected_amount: 'N/A',
    analysis: { covered: false, reasons: ['Pre-existing cancer diagnosis - 4 months ago, waiting period not served'], loopholes: ['Check IRDAI moratorium provisions', 'Can appeal to ombudsman'] }
  },
  {
    user_id: 'user_001',
    treatment: 'Dental Implant',
    hospital: 'Clove Dental, Bangalore',
    amount: 45000,
    status: 'pending' as const,
    win_probability: 65,
    expected_amount: '₹20,000 - ₹30,000',
    analysis: { covered: false, reasons: ['Dental treatments explicit exclusion'], alternate_argument: ['Emergency dental procedure after accident - may consider'] }
  },
  {
    user_id: 'user_006',
    treatment: 'Gallbladder Surgery',
    hospital: 'Sakra Hospital, Bangalore',
    amount: 145000,
    status: 'pending' as const,
    win_probability: 82,
    expected_amount: '₹1.3L - ₹1.4L',
    analysis: { covered: true, pre_post_hospitalization_covered: 30, loopholes: ['Cashless facility may not be available - need reimbursement'] }
  },
  {
    user_id: 'user_002',
    treatment: 'Maternity - Normal Delivery',
    hospital: 'Manipal Hospital, Delhi',
    amount: 120000,
    status: 'pending' as const,
    win_probability: 95,
    expected_amount: '₹1.1L - ₹1.2L',
    analysis: { covered: true, waiting_period_served: true, sub_limit_check: 'Maternity cover limit usually ₹50,000 - may have shortfall', documents_needed: ['Marriage certificate', 'Delivery records'] }
  }
];

// Seed chat history
const chatMessages = [
  { user_id: 'user_001', role: 'user', content: 'What is the waiting period for pre-existing diseases?', policy_ids: [] },
  { user_id: 'user_001', role: 'assistant', content: 'The waiting period for Pre-Existing Diseases (PED) in your Star Health Comprehensive policy is 2 years. This means claims related to conditions diagnosed within 2 years before policy inception will not be covered.', policy_ids: [] },
  { user_id: 'user_002', role: 'user', content: 'Is maternity covered in my Care Plus policy?', policy_ids: [] },
  { user_id: 'user_002', role: 'assistant', content: 'Maternity is covered after a waiting period of 48 months (4 years) in your Care Plus policy. Please check if your policy has completed this waiting period.', policy_ids: [] },
  { user_id: 'user_003', role: 'user', content: 'How do I file a claim for my angioplasty?', policy_ids: [] },
  { user_id: 'user_003', role: 'assistant', content: `1. Pre-authorize: Call ICICI Lombard 48 hours before procedure (for planned) or within 24 hours (emergency).
2. Documents: Hospital bills, discharge summary, booking confirmation, ID proof, policy copy.
3. Submit: Online portal or at hospital TPA desk (Medi Assist).
4. Track: Use claim ID within 7-10 working days.`, policy_ids: [] },
  { user_id: 'user_004', role: 'user', content: 'What is the room rent limit?', policy_ids: [] },
  { user_id: 'user_004', role: 'assistant', content: 'Excellent news! Your HDFC ERGO Optima Secure policy has NO SUB-LIMIT on room rent. You can choose any room category without worrying about daily caps, which is one of the best features of this policy.', policy_ids: [] },
  { user_id: 'user_005', role: 'user', content: 'Why was my chemotherapy claim rejected?', policy_ids: [] },
  { user_id: 'user_005', role: 'assistant', content: `Your claim was rejected because the cancer diagnosis was made 4 months ago, and your policy has a 24-month waiting period for pre-existing diseases. However, you can consider:
1. IRDAI moratorium after 8 years continuous coverage (check if applicable)
2. File grievance with insurance ombudsman within 1 year
3. Get detailed medical opinion and re-submit with new evidence`, policy_ids: [] },
  { user_id: 'user_001', role: 'user', content: 'Is cosmetic surgery covered?', policy_ids: [] },
  { user_id: 'user_001', role: 'assistant', content: 'Cosmetic or aesthetic surgeries are explicitly excluded in your Star Health policy, unless they are medically necessary (e.g., post-accident reconstructive surgery). Pure cosmetic procedures like rhinoplasty, liposuction, or facelifts are not covered.', policy_ids: [] },
  { user_id: 'user_006', role: 'user', content: 'What is my sum insured?', policy_ids: [] },
  { user_id: 'user_006', role: 'assistant', content: 'Your New India Assurance National Mediclaim policy has a sum insured of ₹5,00,000 (5 lakhs). This is the maximum amount the insurer will pay for covered medical expenses during the policy year.', policy_ids: [] },
  { user_id: 'user_002', role: 'user', content: 'Compare my two policies - Care Plus and United India', policy_ids: [] },
  { user_id: 'user_002', role: 'assistant', content: `Care Plus: ₹7.5L sum insured, 4-year PED, 4-year maternity, ₹5000 room rent/day
United India: ₹12L sum insured, 2-year PED, 3.5 year maternity, ₹1900 room rent/day + disease sub-limit for cataract (₹20,000)
Recommendation: Care Plus offers higher sum and better room rent, but United India has shorter waiting. Depends on your priority.`, policy_ids: [] },
  { user_id: 'user_003', role: 'user', content: 'Should I buy a top-up policy?', policy_ids: [] },
  { user_id: 'user_003', role: 'assistant', content: `Considering your ₹10L ICICI Prudent policy, a super top-up of ₹25L with deductible of ₹10L would cost ~₹8,000/year and give you coverage up to ₹35L total. Good if you want protection against high-cost treatments (cancer, transplants). Also check if your employer group policy provides additional cover.`, policy_ids: [] },
  { user_id: 'user_004', role: 'user', content: 'Can I add my parents to my existing policy?', policy_ids: [] },
  { user_id: 'user_004', role: 'assistant', content: `Currently your HDFC ERGO Optima Secure is an individual policy. To add parents:
1. Buy a separate senior citizen policy (easier)
2. Or convert to family floater at renewal (may require fresh underwriting)
3. Or buy a separate top-up for them
Note: Add before any illness diagnosis for best coverage.`, policy_ids: [] },
  { user_id: 'user_005', role: 'user', content: 'What documents are needed for OPD?', policy_ids: [] },
  { user_id: 'user_005', role: 'assistant', content: `For OPD claim (if covered):
1. Original consultation bills
2. Doctor prescription
3. Investigation reports
4. Payment proof
5. Policy copy
Note: Many policies exclude OPD or have limits. Check your Bajaj Allianz Pro - it covers limited OPD up to ₹5000/year.`, policy_ids: [] },
  { user_id: 'user_001', role: 'user', content: 'What is restoration benefit?', policy_ids: [] },
  { user_id: 'user_001', role: 'assistant', content: `Restoration means if you exhaust your sum insured during the policy year, the insurer replenishes it to the original amount (once or multiple times). Your Star Health policy offers restoration. Example: If you use ₹5L from ₹5L cover, you get another ₹5L for new illnesses in same year.`, policy_ids: [] }
];

async function main() {
  try {
    await clearTables();

    // Insert policies
    console.log('Inserting policies...');
    const { data: policiesData, error: policiesError } = await supabase
      .from('policies')
      .insert(policies)
      .select();

    if (policiesError) {
      console.error('Error inserting policies:', policiesError);
      throw policiesError;
    }
    console.log(`✓ Inserted ${policiesData.length} policies`);

    // Insert claims (need policy IDs)
    console.log('Inserting claims...');
    const policiesMap = new Map();
    for (const p of policiesData) {
      policiesMap.set(p.file_name, p.id);
    }

    const claimsWithIds = claims.map((claim, index) => {
      let policyId: string;
      switch (index) {
        case 0: policyId = policiesMap.get('Health_MAX_2024.pdf'); break;
        case 1: policyId = policiesMap.get('Care_Plus_Policy.pdf'); break;
        case 2: policyId = policiesMap.get('ICICI_Prudent.pdf'); break;
        case 3: policyId = policiesMap.get('HDFC_ERGO_Optima.pdf'); break;
        case 4: policyId = policiesMap.get('Bajaj_Allianz_Pro.pdf'); break;
        case 5: policyId = policiesMap.get('Religare_Care.pdf'); break;
        case 6: policyId = policiesMap.get('New_India_Assurance.pdf'); break;
        case 7: policyId = policiesMap.get('United_India_Protect.pdf'); break;
        default: policyId = policiesMap.get('Health_MAX_2024.pdf');
      }
      return { ...claim, policy_id: policyId };
    });

    const { data: claimsData, error: claimsError } = await supabase
      .from('claims')
      .insert(claimsWithIds)
      .select();

    if (claimsError) {
      console.error('Error inserting claims:', claimsError);
      throw claimsError;
    }
    console.log(`✓ Inserted ${claimsData.length} claims`);

    // Insert chat messages
    console.log('Inserting chat history...');
    const chatWithPolicyIds = chatMessages.map(msg => {
      const relatedPolicies: string[] = [];
      if (msg.content.includes('Star Health')) relatedPolicies.push(policiesMap.get('Health_MAX_2024.pdf'));
      if (msg.content.includes('Care Plus')) relatedPolicies.push(policiesMap.get('Care_Plus_Policy.pdf'));
      if (msg.content.includes('ICICI') || msg.content.includes('angioplasty')) relatedPolicies.push(policiesMap.get('ICICI_Prudent.pdf'));
      if (msg.content.includes('HDFC') || msg.content.includes('room rent')) relatedPolicies.push(policiesMap.get('HDFC_ERGO_Optima.pdf'));
      if (msg.content.includes('Bajaj') || msg.content.includes('chemotherapy')) relatedPolicies.push(policiesMap.get('Bajaj_Allianz_Pro.pdf'));
      if (msg.content.includes('New India') || msg.content.includes('sum insured')) relatedPolicies.push(policiesMap.get('New_India_Assurance.pdf'));
      if (msg.content.includes('United India')) relatedPolicies.push(policiesMap.get('United_India_Protect.pdf'));
      if (msg.content.includes('parents')) relatedPolicies.push(policiesMap.get('HDFC_ERGO_Optima.pdf'));
      return { ...msg, policy_ids: relatedPolicies.filter(Boolean) };
    });

    const { data: chatData, error: chatError } = await supabase
      .from('chat_history')
      .insert(chatWithPolicyIds)
      .select();

    if (chatError) {
      console.error('Error inserting chat history:', chatError);
      throw chatError;
    }
    console.log(`✓ Inserted ${chatData.length} chat messages`);

    console.log('\n✅ Database seeding complete!');
    console.log('\nSummary:');
    console.log(`  Policies: ${policiesData.length}`);
    console.log(`  Claims: ${claimsData.length}`);
    console.log(`  Chat Messages: ${chatData.length}`);

    // Verify counts
    const [{ count: pCount }] = await supabase.from('policies').select('*', { count: 'exact', head: true });
    const [{ count: cCount }] = await supabase.from('claims').select('*', { count: 'exact', head: true });
    const [{ count: chCount }] = await supabase.from('chat_history').select('*', { count: 'exact', head: true });

    console.log('\nVerification (total in DB):');
    console.log(`  Policies: ${pCount}`);
    console.log(`  Claims: ${cCount}`);
    console.log(`  Chat Messages: ${chCount}`);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
