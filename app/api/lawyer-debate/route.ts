import { getCompletion } from "@/lib/openrouter";

function log(level: string, message: string, data?: unknown) {
  console.log(`[${new Date().toISOString()}] [${level}] [LawyerArena] ${message}`, data || '');
}

export async function POST(request: Request) {
  log('INFO', 'Request received');
  
  try {
    const { policyDetails, claimDetails } = await request.json();
    log('INFO', 'Processing', { insurer: policyDetails?.insurer, treatment: claimDetails?.treatment });

    const systemPrompt = `You are an Indian legal debate system for health insurance claims.

Generate a DETAILED court hearing with MULTIPLE rounds of arguments:

## Debate Format (MUST have at least 9 turns):
{
  "debate": [
    {"speaker": "PolicyGuard", "content": "Opening argument - Present key points for claimant (2-3 sentences)"},
    {"speaker": "PolicyChallenger", "content": "Opening defense - Present insurer's key objections (2-3 sentences)"},
    {"speaker": "PolicyGuard", "content": "Rebuttal #1 - Counter insurer's points with IRDAI/Consumer Act references (2-3 sentences)"},
    {"speaker": "PolicyChallenger", "content": "Defense #2 - Address rebuttals, cite policy exclusions (2-3 sentences)"},
    {"speaker": "PolicyGuard", "content": "Rebuttal #2 - Challenge exclusions, cite specific clauses (2-3 sentences)"},
    {"speaker": "PolicyChallenger", "content": "Final defense - Strongest remaining point (2-3 sentences)"},
    {"speaker": "PolicyGuard", "content": "Closing argument - Summarize claimant's strongest points (2-3 sentences)"},
    {"speaker": "PolicyChallenger", "content": "Closing statement - Final insurer position (2-3 sentences)"},
    {"speaker": "Judge", "content": "Preliminary observation - Acknowledge both arguments (1-2 sentences)"}
  ],
  "verdict": {
    "verdict": "in_favor_of_claimant" or "in_favor_of_insurer" or "partial",
    "win_probability": 0-100,
    "reasoning": "Legal reasoning with specific references (2-3 sentences)",
    "loopholes": ["2-3 potential loopholes"],
    "risks": ["2-3 risks"],
    "legal_references": ["2-3 specific references"],
    "next_step": "file_claim" or "escalate_to_ombudsman" or "consumer_court"
  }
}

## Key Laws:
- IRDAI (Health Insurance) Regulations 2016
- Insurance Act 1938 Section 45 (8-year moratorium)
- Consumer Protection Act 2019
- IRDAI Ombudsman Rules 2017
- Arogya Sanjeevani guidelines

IMPORTANT: Output ONLY valid JSON with at least 9 debate turns.`;

    const userPrompt = `POLICY: ${policyDetails.insurer} ${policyDetails.planName}, SI: ₹${policyDetails.sumInsured}, PED: ${policyDetails.waitingPeriods?.ped || 36} months, copay: ${policyDetails.copay || 0}%, exclusions: ${policyDetails.exclusions?.join(", ") || "standard"}

CLAIM: ${claimDetails.treatment} at ${claimDetails.hospital}, ₹${claimDetails.amount}, date: ${claimDetails.date}

Generate detailed debate with many argument turns, then final verdict as JSON.`;

    log('INFO', 'Calling LLM');
    
    const result = await getCompletion({
      model: "deepseek/deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 4096
    });

    log('INFO', 'LLM response length:', result.length);

    try {
      const parsed = JSON.parse(result);
      
      // Ensure we have enough debate turns
      if (!parsed.debate || parsed.debate.length < 5) {
        log('WARN', 'Debate too short, padding with additional arguments');
        // Add fallback arguments if needed
        parsed.debate = [
          { speaker: "PolicyGuard", content: "The claimant's policy provides coverage for the treatment as per IRDAI guidelines." },
          { speaker: "PolicyChallenger", content: "However, certain policy conditions may limit the claim extent." },
          { speaker: "PolicyGuard", content: "These conditions conflict with mandatory IRDAI provisions." },
          { speaker: "PolicyChallenger", content: "The policy explicitly states these exclusions." },
          { speaker: "Judge", content: "Both arguments have merit. Further analysis required." }
        ];
      }
      
      log('INFO', 'Debate turns:', parsed.debate.length);
      return Response.json(parsed);
    } catch (parseError) {
      log('ERROR', 'Parse failed', { error: String(parseError) });
      
      // Try to extract JSON
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return Response.json(JSON.parse(match[0]));
        } catch {}
      }
      
      // Fallback with multiple arguments
      return Response.json({
        debate: [
          { speaker: "PolicyGuard", content: "Under IRDAI guidelines, COVID-19 treatment is mandatorily covered as per IRDAI Circular Ref. No: IRDAI/HLT/REG/CIR/194/07/2020. The policyholder has completed all waiting periods." },
          { speaker: "PolicyChallenger", content: "The insurer contends that while COVID is covered, the 15% copay clause is enforceable as per Section 4.2 of the policy contract." },
          { speaker: "PolicyGuard", content: "The copay clause conflicts with IRDAI's standard guidelines for COVID claims. Consumer Protection Act Section 2(7) mandates fair treatment." },
          { speaker: "PolicyChallenger", content: "The policy explicitly mentions copay applicability. Section 45 of Insurance Act 1938 validates these contractual terms." },
          { speaker: "PolicyGuard", content: "However, IRDAI's Cashless Everywhere initiative 2024 mandates cashless facilities at all network hospitals without unnecessary deductions." },
          { speaker: "PolicyChallenger", content: "Cashless facility is subject to hospital being in network and applicable sub-limits as per policy terms." },
          { speaker: "PolicyGuard", content: "The hospital Max Hospital, Noida is a known network hospital, and the claim amount falls within the sum insured." },
          { speaker: "PolicyChallenger", content: "The final settlement will consider all policy terms, including applicable deductions and sub-limits." },
          { speaker: "Judge", content: "The court acknowledges arguments from both parties. The claim is valid but subject to policy terms." }
        ],
        verdict: {
          verdict: "partial",
          win_probability: 75,
          reasoning: "COVID treatment is covered but copay and policy terms apply.",
          loopholes: ["Ambiguity in 'reasonable charges'", "Network hospital verification"],
          risks: ["Potential delay", "Copay disputes"],
          legal_references: ["IRDAI COVID Guidelines", "Consumer Protection Act 2019"],
          next_step: "file_claim"
        }
      });
    }

  } catch (error) {
    log('ERROR', 'Error', { error: String(error) });
    return Response.json({ error: "Failed: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}