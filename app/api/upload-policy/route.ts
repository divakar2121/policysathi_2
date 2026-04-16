import { NextRequest, NextResponse } from "next/server";
import { getCompletion } from "@/lib/openrouter";

const INSURANCE_KNOWLEDGE = `
## INSURANCE KNOWLEDGE BASE (IRDAI Guidelines)

### Common Indian Health Insurance Providers:
- HDFC Ergo (Optima Restore, My Health Suraksha)
- ICICI Lombard (Complete Health, Maxiimize)
- Star Health (Comprehensive, Family Health Optima)
- Niva Bupa (Reassure 2.0, Health Companion)
- Care (Supreme, Advantage)
- Bajaj Allianz (Health Guard, Silver Health)
- Aditya Birla (Active, Joy)

### Standard Terms to Extract:
1. **Sum Insured (SI)** - usually in lakhs (5L, 10L, 15L, 25L, 50L)
2. **Premium** - yearly/quarterly/monthly
3. **Room Rent** - typically 1% of SI or capped at ₹5000-15000/day
4. **ICU** - 2% of SI or ₹10000-25000/day
5. **Waiting Periods**:
   - Initial: 30 days (except accidents)
   - PED: 36 months (reducible)
   - Specific diseases: 24 months
6. **Co-pay** - 10-30% typically
7. **NCB** - No Claim Bonus 10-50%
8. **Restoration** - 100% restoration of SI

### Key Exclusions:
- Pre-existing diseases (during waiting period)
- Specific diseases (cataracts, hernia, joint replacement, etc.)
- Cosmetic/dental treatments
- Alternative treatments (unless specified)
- War/nuclear risks
- Intentional self-injury
- Alcohol/drug abuse
- Pregnancy (unless specific)
`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    const results = [];

    for (const file of files) {
      const text = await file.text();
      
      const systemPrompt = `You are PolicySaathi's Expert Health Insurance Policy Analyst. 
You have deep knowledge of Indian health insurance policies, IRDAI regulations, and market trends.

${INSURANCE_KNOWLEDGE}

## TASK:
Extract ALL policy details from the uploaded document. Be thorough - extract EVERY piece of information visible.

## OUTPUT FORMAT - JSON ONLY:
{
  "id": "unique-id",
  "insurer": "insurer name (e.g., HDFC Ergo, Star Health, Niva Bupa)",
  "planName": "exact plan name from policy",
  "sumInsured": number (in rupees),
  "premium": number (yearly in rupees),
  "policyType": "individual/family/floater",
  "policyYear": number,
  "age": number,
  "exclusions": ["list all exclusions found"],
  "waitingPeriods": {
    "ped": number (months, typically 24-48),
    "initial": number (days, typically 30),
    "specific": number (months for specific diseases),
    "maternity": number (months, if applicable)
  },
  "subLimits": {
    "roomRent": "room rent limit",
    "icu": "ICU limit", 
    "diseaseWise": {"cataract": "limit", "jointReplacement": "limit", etc},
    "ambulance": "ambulance limit",
    "prePostHospitalization": "days"
  },
  "copay": number (percentage),
  "noClaimBonus": number (percentage increase),
  "restoration": "yes/no and percentage",
  "networkHospitals": number,
  "cashlessHospitals": "count or yes/no",
  "features": ["list key features"],
  "rating": 1-10,
  "analysisDate": "ISO date",
  "summary": "2-3 sentence summary for a non-technical person"
}

Analyze the policy document thoroughly and return ONLY valid JSON.`;

      const result = await getCompletion({
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract ALL details from this policy document:\n\n---DOCUMENT START---\n${text.slice(0, 15000)}\n---DOCUMENT END---` }
        ],
        temperature: 0.2,
        max_tokens: 4096
      });

      try {
        const parsed = JSON.parse(result);
        results.push({
          ...parsed,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          analysisDate: new Date().toISOString()
        });
      } catch {
        results.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          insurer: "Unknown",
          planName: file.name.replace(/\.pdf$/i, ""),
          sumInsured: 500000,
          premium: 15000,
          policyType: "Individual",
          policyYear: new Date().getFullYear(),
          age: 30,
          exclusions: ["Standard exclusions apply"],
          waitingPeriods: { ped: 36, initial: 30, specific: 24, maternity: 0 },
          subLimits: {},
          copay: 0,
          noClaimBonus: 0,
          restoration: "No",
          networkHospitals: 0,
          cashlessHospitals: "Yes",
          features: [],
          rating: 5,
          analysisDate: new Date().toISOString(),
          summary: "Could not fully parse. Please review manually."
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      policies: results
    });

  } catch (error) {
    console.error("Policy upload error:", error);
    return NextResponse.json(
      { error: "Failed to process policy: " + (error as Error).message },
      { status: 500 }
    );
  }
}