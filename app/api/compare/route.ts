import { NextRequest, NextResponse } from "next/server";
import { getCompletion } from "@/lib/openrouter";

const BENCHMARK_POLICIES = {
  "Arogya Sanjeevani": {
    sumInsured: "1L-5L",
    roomRent: "1% of SI per day",
   icu: "2% of SI per day",
    pedWaiting: "48 months",
    initialWaiting: "30 days",
    maternity: "24 months",
    restoration: "100% once",
    copay: "5-15%",
    ncb: "20% per year (max 50%)",
    cashless: "Yes - all hospitals"
  },
  "Niva Bupa Reassure 2.0": {
    sumInsured: "3L-1Cr",
    roomRent: "Unlimited (premium) or 1%",
    icu: "Unlimited (premium) or 2%",
    pedWaiting: "36 months (reducible to 24)",
    initialWaiting: "30 days",
    maternity: "24 months",
    restoration: "100% unlimited",
    copay: "0-20%",
    ncb: "50% per year (max 100%)",
    cashless: "11000+ hospitals"
  },
  "HDFC Ergo Optima Restore": {
    sumInsured: "3L-50L",
    roomRent: "1% of SI per day",
    icu: "2% of SI per day",
    pedWaiting: "36 months (reducible)",
    initialWaiting: "30 days",
    maternity: "36 months",
    restoration: "100% unlimited",
    copay: "0-25%",
    ncb: "10% per year (max 50%)",
    cashless: "11000+ hospitals"
  },
  "Care Supreme": {
    sumInsured: "3L-1Cr",
    roomRent: "1% of SI per day",
    icu: "2% of SI per day",
    pedWaiting: "36 months (reducible)",
    initialWaiting: "30 days",
    maternity: "24 months",
    restoration: "100% unlimited",
    copay: "0-20%",
    ncb: "20% per year (max 100%)",
    cashless: "16000+ hospitals"
  }
};

export async function POST(request: NextRequest) {
  try {
    const { policies } = await request.json();

    if (!policies || policies.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 policies to compare" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are PolicySaathi's Insurance Comparison Expert. Compare health insurance policies objectively.

## Reference Benchmark Policies:
${JSON.stringify(BENCHMARK_POLICIES, null, 2)}

## OUTPUT FORMAT - JSON ONLY:
{
  "comparison": {
    "summary": "overall comparison summary",
    "bestFor": ["category 1", "category 2"],
    "winner": "policy name"
  },
  "detailedComparison": [
    {
      "metric": "Sum Insured",
      "values": {"policy1": "value", "policy2": "value"},
      "winner": "policy1/policy2/tie"
    },
    {
      "metric": "Room Rent",
      "values": {...},
      "winner": "..."
    },
    {
      "metric": "PED Waiting Period",
      "values": {...},
      "winner": "..."
    },
    {
      "metric": "Initial Waiting Period",
      "values": {...},
      "winner": "..."
    },
    {
      "metric": "Restoration",
      "values": {...},
      "winner": "..."
    },
    {
      "metric": "Co-pay",
      "values": {...},
      "winner": "..."
    },
    {
      "metric": "NCB",
      "values": {...},
      "winner": "..."
    },
    {
      "metric": "Network Hospitals",
      "values": {...},
      "winner": "..."
    },
    {
      "metric": "Premium Value",
      "values": {"policy": "premium", "si": "sum insured", "value": "rating"},
      "winner": "..."
    },
    {
      "metric": "Overall Rating",
      "values": {...},
      "winner": "..."
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Compare the policies and return ONLY valid JSON.`;

    const policiesJson = policies.map((p: { insurer: string; planName: string; sumInsured: number; premium: number; rating: number; waitingPeriods: { ped: number; initial: number }; subLimits: { roomRent?: string; icu?: string }; copay: number; noClaimBonus: number; restoration: string; networkHospitals: number }) => ({
      name: `${p.insurer} ${p.planName}`,
      sumInsured: p.sumInsured,
      premium: p.premium,
      rating: p.rating,
      pedWaiting: p.waitingPeriods?.ped || 36,
      initialWaiting: p.waitingPeriods?.initial || 30,
      roomRent: p.subLimits?.roomRent || "1% of SI",
      icu: p.subLimits?.icu || "2% of SI",
      copay: p.copay || 0,
      ncb: p.noClaimBonus || 0,
      restoration: p.restoration || "No",
      networkHospitals: p.networkHospitals || 0
    }));

    const result = await getCompletion({
      model: "deepseek/deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Compare these policies:\n\n${JSON.stringify(policiesJson, null, 2)}` }
      ],
      temperature: 0.3,
      max_tokens: 4096
    });

    try {
      const parsed = JSON.parse(result);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        comparison: {
          summary: "Comparison generated from policy data",
          bestFor: ["Value", "Coverage"],
          winner: policies[0].insurer + " " + policies[0].planName
        },
        recommendations: ["Compare premiums against coverage", "Check network hospitals in your city"]
      });
    }

  } catch (error) {
    console.error("Compare error:", error);
    return NextResponse.json(
      { error: "Failed to compare policies" },
      { status: 500 }
    );
  }
}