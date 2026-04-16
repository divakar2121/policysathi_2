"use client";

import { useState, useRef } from "react";
import { Scale, Shield, AlertTriangle, Loader2, CheckCircle, FileText, BookOpen, Gavel, Building2, Clock, ArrowLeft } from "lucide-react";

interface PolicyDetails {
  insurer: string;
  planName: string;
  sumInsured: number;
  premium: number;
  exclusions: string[];
  waitingPeriods: { ped: number; initial: number };
  subLimits: { roomRent?: string };
  copay: number;
}

interface ClaimDetails {
  treatment: string;
  hospital: string;
  amount: number;
  date: string;
}

interface DebateTurn {
  speaker: "PolicyGuard" | "PolicyChallenger" | "Judge";
  content: string;
  timestamp?: number;
}

interface Verdict {
  verdict: string;
  win_probability: number;
  reasoning: string;
  loopholes: string[];
  risks: string[];
  legal_references: string[];
  next_step: string;
}

interface SampleCase {
  id: string;
  title: string;
  description: string;
  policy: PolicyDetails;
  claim: ClaimDetails;
}

const SAMPLE_CASES: SampleCase[] = [
  {
    id: "1",
    title: "Cataract Surgery",
    description: "Cataract surgery after 18 months",
    policy: { insurer: "HDFC Ergo", planName: "Optima Restore", sumInsured: 1000000, premium: 25000, exclusions: ["Pre-existing diseases", "Specific diseases first 24 months"], waitingPeriods: { ped: 36, initial: 30 }, subLimits: { roomRent: "1% of SI" }, copay: 10 },
    claim: { treatment: "Cataract Surgery (Phacoemulsification)", hospital: "Apollo Hospital, Chennai", amount: 85000, date: "2024-06-15" }
  },
  {
    id: "2",
    title: "Knee Replacement",
    description: "Joint replacement - pre-existing",
    policy: { insurer: "Star Health", planName: "Family Health Optima", sumInsured: 500000, premium: 18000, exclusions: ["Joint replacement first 24 months"], waitingPeriods: { ped: 36, initial: 30 }, subLimits: { roomRent: "1% of SI" }, copay: 20 },
    claim: { treatment: "Total Knee Replacement", hospital: "Fortis Hospital, Delhi", amount: 350000, date: "2024-08-20" }
  },
  {
    id: "3",
    title: "COVID-19",
    description: "COVID hospitalization",
    policy: { insurer: "ICICI Lombard", planName: "Complete Health", sumInsured: 500000, premium: 15000, exclusions: ["Initial 30 days"], waitingPeriods: { ped: 36, initial: 30 }, subLimits: { roomRent: "1% of SI" }, copay: 15 },
    claim: { treatment: "COVID-19 Pneumonia Treatment", hospital: "Max Hospital, Noida", amount: 180000, date: "2023-05-10" }
  }
];

export default function AnalyzePage() {
  const [policyDetails, setPolicyDetails] = useState<PolicyDetails>({ insurer: "", planName: "", sumInsured: 0, premium: 0, exclusions: [], waitingPeriods: { ped: 36, initial: 30 }, subLimits: { roomRent: "1% of SI" }, copay: 0 });
  const [claimDetails, setClaimDetails] = useState<ClaimDetails>({ treatment: "", hospital: "", amount: 0, date: "" });
  const [debate, setDebate] = useState<DebateTurn[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"input" | "hearing" | "verdict">("input");
  const [showExamples, setShowExamples] = useState(false);
  const debateEndRef = useRef<HTMLDivElement>(null);

  const loadSampleCase = (sampleCase: SampleCase) => {
    setPolicyDetails(sampleCase.policy);
    setClaimDetails(sampleCase.claim);
    setShowExamples(false);
  };

  const simulateHearing = async () => {
    setIsLoading(true);
    setStep("hearing");
    setDebate([]);
    setVerdict(null);

    try {
      const response = await fetch("/api/lawyer-debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policyDetails, claimDetails })
      });

      const data = await response.json();
      
      if (data.debate && data.debate.length > 0) {
        // Simulate hearing - arguments appear one by one
        for (let i = 0; i < data.debate.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          setDebate(prev => [...prev, { ...data.debate[i], timestamp: Date.now() }]);
          debateEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }

        // After all arguments, show verdict
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (data.verdict) {
          setVerdict(data.verdict);
          setStep("verdict");
        }
      }
    } catch (error) {
      console.error("Debate error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep("input");
    setDebate([]);
    setVerdict(null);
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {step !== "input" && (
              <button onClick={goBack} className="p-2 hover:bg-[#252540] rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
            )}
            <div className="w-12 h-12 bg-[#FFD700]/20 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-[#FFD700]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Lawyer Arena</h1>
              <p className="text-gray-400">{step === "verdict" ? "Case Complete" : "AI Courtroom Simulation"}</p>
            </div>
          </div>
          {step === "input" && (
            <button onClick={() => setShowExamples(!showExamples)} className="flex items-center gap-2 px-4 py-2 bg-[#004E89]/30 text-[#4DA8FF] rounded-lg hover:bg-[#004E89]/50 transition-colors">
              <BookOpen className="w-5 h-5" />
              Sample Cases
            </button>
          )}
        </div>

        {/* Sample Cases */}
        {showExamples && step === "input" && (
          <div className="mb-6 bg-[#252540] rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">Select a case:</h3>
            <div className="flex gap-3 flex-wrap">
              {SAMPLE_CASES.map((sample) => (
                <button key={sample.id} onClick={() => loadSampleCase(sample)} className="px-4 py-2 bg-[#FF6B35]/20 text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/30 transition-colors text-sm">
                  {sample.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        {step === "input" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#252540] rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-[#FF6B35]" /> Policy Details</h2>
              <div className="space-y-3">
                <input type="text" placeholder="Insurer" className="w-full px-4 py-2 bg-[#1A1A2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#FF6B35]" value={policyDetails.insurer} onChange={(e) => setPolicyDetails(p => ({ ...p, insurer: e.target.value }))} />
                <input type="text" placeholder="Plan Name" className="w-full px-4 py-2 bg-[#1A1A2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#FF6B35]" value={policyDetails.planName} onChange={(e) => setPolicyDetails(p => ({ ...p, planName: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Sum Insured (₹)" className="w-full px-4 py-2 bg-[#1A1A2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#FF6B35]" value={policyDetails.sumInsured || ""} onChange={(e) => setPolicyDetails(p => ({ ...p, sumInsured: Number(e.target.value) }))} />
                  <input type="number" placeholder="Co-pay %" className="w-full px-4 py-2 bg-[#1A1A2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#FF6B35]" value={policyDetails.copay} onChange={(e) => setPolicyDetails(p => ({ ...p, copay: Number(e.target.value) }))} />
                </div>
              </div>
            </div>

            <div className="bg-[#252540] rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-[#FF6B35]" /> Claim Details</h2>
              <div className="space-y-3">
                <input type="text" placeholder="Treatment" className="w-full px-4 py-2 bg-[#1A1A2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#FF6B35]" value={claimDetails.treatment} onChange={(e) => setClaimDetails(c => ({ ...c, treatment: e.target.value }))} />
                <input type="text" placeholder="Hospital" className="w-full px-4 py-2 bg-[#1A1A2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#FF6B35]" value={claimDetails.hospital} onChange={(e) => setClaimDetails(c => ({ ...c, hospital: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Amount (₹)" className="w-full px-4 py-2 bg-[#1A1A2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#FF6B35]" value={claimDetails.amount || ""} onChange={(e) => setClaimDetails(c => ({ ...c, amount: Number(e.target.value) }))} />
                  <input type="date" className="w-full px-4 py-2 bg-[#1A1A2E] border border-gray-700 rounded-lg text-white focus:border-[#FF6B35]" value={claimDetails.date} onChange={(e) => setClaimDetails(c => ({ ...c, date: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <button onClick={simulateHearing} disabled={isLoading || !policyDetails.insurer || !claimDetails.treatment} className="w-full py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8F5B] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gavel className="w-5 h-5" />}
                Start Court Hearing
              </button>
            </div>
          </div>
        )}

        {/* Courtroom Simulation */}
        {(step === "hearing" || step === "verdict") && (
          <div className="space-y-6">
            {/* Case Info Bar */}
            <div className="bg-[#252540] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-[#FFD700]/20 text-[#FFD700] rounded text-sm font-medium">Case No: PS/2024/001</div>
                <div className="text-white font-medium">{policyDetails.insurer} vs Claimant</div>
              </div>
              <div className="text-gray-400 text-sm">{claimDetails.treatment} • ₹{claimDetails.amount?.toLocaleString()}</div>
            </div>

            {/* Courtroom */}
            <div className="bg-[#252540] rounded-2xl p-6 border border-gray-800">
              {/* Judge's Bench */}
              <div className="text-center mb-6 pb-4 border-b border-gray-800">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#FFD700]/10 rounded-full border border-[#FFD700]/30">
                  <Gavel className="w-6 h-6 text-[#FFD700]" />
                  <span className="text-[#FFD700] font-semibold">COURT IN SESSION</span>
                </div>
              </div>

              {/* Two Sides */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left - Claimant's Counsel */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#00B894]">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Claimant's Counsel</span>
                  </div>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {debate.filter(d => d.speaker === "PolicyGuard").map((turn, i) => (
                      <div key={i} className="p-4 bg-[#00B894]/10 rounded-xl border-l-4 border-[#00B894]">
                        <p className="text-white text-sm">{turn.content}</p>
                        <p className="text-gray-500 text-xs mt-2">{turn.timestamp ? new Date(turn.timestamp).toLocaleTimeString() : ''}</p>
                      </div>
                    ))}
                    {step === "hearing" && isLoading && debate.filter(d => d.speaker === "PolicyGuard").length === 0 && (
                      <p className="text-gray-600 text-sm italic">Waiting for opening arguments...</p>
                    )}
                  </div>
                </div>

                {/* Right - Insurer's Counsel */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#E74C3C]">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">Insurer's Counsel</span>
                  </div>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {debate.filter(d => d.speaker === "PolicyChallenger").map((turn, i) => (
                      <div key={i} className="p-4 bg-[#E74C3C]/10 rounded-xl border-l-4 border-[#E74C3C]">
                        <p className="text-white text-sm">{turn.content}</p>
                        <p className="text-gray-500 text-xs mt-2">{turn.timestamp ? new Date(turn.timestamp).toLocaleTimeString() : ''}</p>
                      </div>
                    ))}
                    {step === "hearing" && isLoading && debate.filter(d => d.speaker === "PolicyChallenger").length === 0 && (
                      <p className="text-gray-600 text-sm italic">Waiting for response...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Judge's Observations */}
              {debate.filter(d => d.speaker === "Judge").length > 0 && (
                <div className="mt-6 p-4 bg-[#FFD700]/10 rounded-xl border border-[#FFD700]/30">
                  <div className="flex items-center gap-2 text-[#FFD700] mb-2">
                    <Gavel className="w-5 h-5" />
                    <span className="font-semibold">Judge's Observation</span>
                  </div>
                  {debate.filter(d => d.speaker === "Judge").map((turn, i) => (
                    <p key={i} className="text-white text-sm">{turn.content}</p>
                  ))}
                </div>
              )}

              {/* Loading */}
              {step === "hearing" && isLoading && (
                <div className="mt-4 text-center py-3 bg-[#1A1A2E] rounded-lg">
                  <Loader2 className="w-6 h-6 text-[#FF6B35] mx-auto animate-spin" />
                  <p className="text-gray-400 text-sm mt-2">Arguments in progress...</p>
                </div>
              )}
              
              <div ref={debateEndRef} />
            </div>
          </div>
        )}

        {/* Verdict */}
        {step === "verdict" && verdict && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Verdict Card */}
            <div className="bg-[#252540] rounded-2xl p-8 border border-gray-800">
              {/* Order */}
              <div className="text-center mb-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  verdict.verdict === "in_favor_of_claimant" ? "bg-[#00B894]/20" :
                  verdict.verdict === "in_favor_of_insurer" ? "bg-[#E74C3C]/20" : "bg-[#FFD700]/20"
                }`}>
                  <Scale className={`w-12 h-12 ${
                    verdict.verdict === "in_favor_of_claimant" ? "text-[#00B894]" :
                    verdict.verdict === "in_favor_of_insurer" ? "text-[#E74C3C]" : "text-[#FFD700]"
                  }`} />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {verdict.verdict === "in_favor_of_claimant" ? "ORDER: In Favor of Claimant" :
                   verdict.verdict === "in_favor_of_insurer" ? "ORDER: Insurer's Plea Upheld" : "ORDER: Partial Decision"}
                </h2>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-[#1A1A2E] rounded-xl">
                  <div className={`text-3xl font-bold mb-1 ${
                    verdict.win_probability >= 70 ? "text-[#00B894]" :
                    verdict.win_probability >= 40 ? "text-[#FDCB6E]" : "text-[#E74C3C]"
                  }`}>{verdict.win_probability}%</div>
                  <p className="text-gray-400 text-sm">Win Probability</p>
                </div>
                <div className="text-center p-4 bg-[#1A1A2E] rounded-xl">
                  <div className="text-3xl font-bold text-[#4DA8FF] mb-1 capitalize">{verdict.next_step.replace("_", " ")}</div>
                  <p className="text-gray-400 text-sm">Recommended Action</p>
                </div>
              </div>

              {/* Reasoning */}
              {verdict.reasoning && (
                <div className="p-4 bg-[#004E9]/20 rounded-xl mb-4">
                  <h4 className="text-[#4DA8FF] font-semibold mb-2">Judge's Reasoning</h4>
                  <p className="text-white text-sm">{verdict.reasoning}</p>
                </div>
              )}

              {/* Loopholes & Risks */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {verdict.loopholes && verdict.loopholes.length > 0 && (
                  <div className="p-4 bg-[#00B894]/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-[#00B894]" />
                      <span className="text-[#00B894] text-sm font-medium">Loopholes</span>
                    </div>
                    {verdict.loopholes.map((l, i) => <p key={i} className="text-gray-300 text-xs">• {l}</p>)}
                  </div>
                )}
                {verdict.risks && verdict.risks.length > 0 && (
                  <div className="p-4 bg-[#E74C3C]/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-[#E74C3C]" />
                      <span className="text-[#E74C3C] text-sm font-medium">Risks</span>
                    </div>
                    {verdict.risks.map((r, i) => <p key={i} className="text-gray-300 text-xs">• {r}</p>)}
                  </div>
                )}
              </div>

              {/* Legal References */}
              {verdict.legal_references && verdict.legal_references.length > 0 && (
                <div className="p-4 bg-[#1A1A2E] rounded-xl mb-6">
                  <h4 className="text-gray-400 text-sm mb-2">Legal References</h4>
                  <div className="flex flex-wrap gap-2">
                    {verdict.legal_references.map((ref, i) => (
                      <span key={i} className="px-3 py-1 bg-[#004E89]/30 text-[#4DA8FF] text-xs rounded-full">{ref}</span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={goBack} className="w-full py-3 border-2 border-[#FF6B35] text-[#FF6B35] rounded-xl font-medium hover:bg-[#FF6B35] hover:text-white transition-colors">
                New Case
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}