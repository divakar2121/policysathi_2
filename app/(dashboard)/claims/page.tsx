"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Search, Clock, CheckCircle, XCircle, AlertTriangle, Loader2, Shield } from "lucide-react";

interface PolicyDetails {
  id: string;
  insurer: string;
  planName: string;
  sumInsured: number;
  waitingPeriods: { ped: number; initial: number };
  subLimits: { roomRent?: string; icu?: string };
  copay: number;
}

interface Claim {
  id: string;
  policyId?: string;
  treatment: string;
  hospital: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  date: string;
  winProbability?: number;
  expectedAmount?: string;
  analysis?: {
    covered: boolean;
    waitingPeriodServed: boolean;
    keyClauses: string[];
    loopholes: string[];
    documents: string[];
    recommendation: string;
  };
}

interface NewClaimForm {
  policyId: string;
  treatment: string;
  hospital: string;
  amount: number;
  date: string;
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [policies, setPolicies] = useState<PolicyDetails[]>([]);
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newClaim, setNewClaim] = useState<NewClaimForm>({
    policyId: "",
    treatment: "",
    hospital: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    const savedClaims = localStorage.getItem("policysathi_claims");
    if (savedClaims) {
      setClaims(JSON.parse(savedClaims));
    }
    const savedPolicies = localStorage.getItem("policysathi_policies");
    if (savedPolicies) {
      setPolicies(JSON.parse(savedPolicies));
    }
  }, []);

  const saveClaims = (newClaims: Claim[]) => {
    setClaims(newClaims);
    localStorage.setItem("policysathi_claims", JSON.stringify(newClaims));
  };

  const filteredClaims = claims.filter(c => 
    c.treatment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.hospital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const analyzeClaim = async () => {
    if (!newClaim.policyId || !newClaim.treatment || !newClaim.hospital) {
      alert("Please fill in all fields");
      return;
    }

    setIsAnalyzing(true);
    const policy = policies.find(p => p.id === newClaim.policyId);

    try {
      const response = await fetch("/api/analyze-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyDetails: policy || {
            insurer: "Unknown",
            planName: "Unknown Policy",
            sumInsured: 500000,
            waitingPeriods: { ped: 36, initial: 30 },
            subLimits: { roomRent: "1% of SI" },
            copay: 10
          },
          claimDetails: {
            treatment: newClaim.treatment,
            hospital: newClaim.hospital,
            amount: newClaim.amount,
            date: newClaim.date
          }
        })
      });

      const data = await response.json();

      const newClaimObj: Claim = {
        id: Date.now().toString(),
        policyId: newClaim.policyId,
        treatment: newClaim.treatment,
        hospital: newClaim.hospital,
        amount: newClaim.amount,
        status: "pending",
        date: newClaim.date,
        winProbability: data.win_probability,
        expectedAmount: data.expected_amount,
        analysis: {
          covered: data.covered,
          waitingPeriodServed: data.waiting_period_served,
          keyClauses: data.key_clauses || [],
          loopholes: data.loopholes || [],
          documents: data.documents_needed || [],
          recommendation: data.recommendation
        }
      };

      saveClaims([newClaimObj, ...claims]);
      setShowNewClaim(false);
      setNewClaim({
        policyId: "",
        treatment: "",
        hospital: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0]
      });
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusIcon = (status: Claim["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-[#FDCB6E]" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-[#00B894]" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-[#E74C3C]" />;
    }
  };

  const getStatusBadge = (status: Claim["status"]) => {
    const styles = {
      pending: "bg-[#FDCB6E]/10 text-[#FDCB6E]",
      approved: "bg-[#00B894]/10 text-[#00B894]",
      rejected: "bg-[#E74C3C]/10 text-[#E74C3C]"
    };
    return styles[status];
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E]">Your Claims</h1>
            <p className="text-[#636E72]">Track and analyze your insurance claims</p>
          </div>
          <button
            onClick={() => setShowNewClaim(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Claim
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#636E72]" />
            <input
              type="text"
              placeholder="Search claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B35]"
            />
          </div>
        </div>

        {claims.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <div className="w-20 h-20 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-[#FF6B35]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">No Claims Yet</h3>
            <p className="text-[#636E72] mb-6">Analyze your first claim to see win probability</p>
            <button
              onClick={() => setShowNewClaim(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Analyze Claim
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#636E72]">Treatment</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#636E72]">Hospital</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#636E72]">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#636E72]">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#636E72]">Win Prob.</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#636E72]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#FF6B35]" />
                        </div>
                        <div>
                          <span className="font-medium text-[#1A1A2E]">{claim.treatment}</span>
                          {claim.analysis?.covered !== undefined && (
                            <div className="flex items-center gap-1 mt-1">
                              {claim.analysis.covered ? (
                                <CheckCircle className="w-3 h-3 text-[#00B894]" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 text-[#E74C3C]" />
                              )}
                              <span className={`text-xs ${claim.analysis.covered ? "text-[#00B894]" : "text-[#E74C3C]"}`}>
                                {claim.analysis.covered ? "Covered" : "Not Covered"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#636E72]">{claim.hospital}</td>
                    <td className="px-6 py-4 text-[#1A1A2E]">
                      <div>₹{claim.amount.toLocaleString()}</div>
                      {claim.expectedAmount && (
                        <div className="text-xs text-[#636E72]">Expected: {claim.expectedAmount}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusBadge(claim.status)}`}>
                        {getStatusIcon(claim.status)}
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {claim.winProbability && (
                        <span className={`font-medium ${claim.winProbability >= 70 ? "text-[#00B894]" : claim.winProbability >= 40 ? "text-[#FDCB6E]" : "text-[#E74C3C]"}`}>
                          {claim.winProbability}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#636E72]">{claim.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showNewClaim && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
              <h2 className="text-xl font-semibold text-[#1A1A2E] mb-4">Analyze New Claim</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-[#636E72] mb-2">Select Policy</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B35]"
                    value={newClaim.policyId}
                    onChange={(e) => setNewClaim(c => ({ ...c, policyId: e.target.value }))}
                  >
                    <option value="">Select a policy...</option>
                    {policies.map(p => (
                      <option key={p.id} value={p.id}>{p.insurer} - {p.planName} (₹{p.sumInsured.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-[#636E72] mb-2">Treatment/Procedure</label>
                  <input
                    type="text"
                    placeholder="e.g., Cataract Surgery"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B35]"
                    value={newClaim.treatment}
                    onChange={(e) => setNewClaim(c => ({ ...c, treatment: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-[#636E72] mb-2">Hospital</label>
                  <input
                    type="text"
                    placeholder="Hospital name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B35]"
                    value={newClaim.hospital}
                    onChange={(e) => setNewClaim(c => ({ ...c, hospital: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#636E72] mb-2">Claim Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="Amount"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B35]"
                      value={newClaim.amount || ""}
                      onChange={(e) => setNewClaim(c => ({ ...c, amount: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#636E72] mb-2">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B35]"
                      value={newClaim.date}
                      onChange={(e) => setNewClaim(c => ({ ...c, date: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowNewClaim(false)}
                  className="flex-1 py-3 border border-gray-200 text-[#636E72] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={analyzeClaim}
                  disabled={isAnalyzing || !newClaim.policyId || !newClaim.treatment}
                  className="flex-1 py-3 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A2B] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}