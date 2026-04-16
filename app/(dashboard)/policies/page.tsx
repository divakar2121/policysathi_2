"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Shield, Trash2, Search, Plus, X, CheckCircle, Loader2, BarChart3 } from "lucide-react";

interface PolicyDetails {
  id: string;
  fileName: string;
  insurer: string;
  planName: string;
  sumInsured: number;
  premium: number;
  policyType: string;
  policyYear: number;
  age: number;
  exclusions: string[];
  waitingPeriods: {
    ped: number;
    initial: number;
    specific: number;
    maternity: number;
  };
  subLimits: {
    roomRent?: string;
    icu?: string;
    diseaseWise?: Record<string, string>;
    ambulance?: string;
    prePostHospitalization?: string;
  };
  copay: number;
  noClaimBonus: number;
  restoration: string;
  networkHospitals: number;
  cashlessHospitals: string;
  features: string[];
  rating: number;
  analysisDate: string;
  summary: string;
}

interface CompareResult {
  comparison?: {
    summary: string;
    bestFor?: string[];
    winner: string;
  };
  detailedComparison?: Array<{
    metric: string;
    values: Record<string, string>;
    winner: string;
  }>;
  recommendations?: string[];
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyDetails[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("policysathi_policies");
    if (saved) {
      setPolicies(JSON.parse(saved));
    }
  }, []);

  const savePolicies = (newPolicies: PolicyDetails[]) => {
    setPolicies(newPolicies);
    localStorage.setItem("policysathi_policies", JSON.stringify(newPolicies));
  };

  const filteredPolicies = policies.filter(p => 
    p.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.insurer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const response = await fetch("/api/upload-policy", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      
      if (data.policies) {
        const newPolicies = [...policies, ...data.policies];
        savePolicies(newPolicies);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload policy. Please try again.");
    } finally {
      setIsUploading(false);
      setShowUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCompare = async () => {
    if (selectedPolicies.length < 2) {
      alert("Select at least 2 policies to compare");
      return;
    }

    setIsComparing(true);
    const policiesToCompare = policies.filter(p => selectedPolicies.includes(p.id));

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policies: policiesToCompare }),
      });

      const data = await response.json();
      setCompareResult(data);
    } catch (error) {
      console.error("Compare error:", error);
    } finally {
      setIsComparing(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedPolicies(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-[#00B894]";
    if (rating >= 5) return "text-[#FDCB6E]";
    return "text-[#E74C3C]";
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E]">Your Policies</h1>
            <p className="text-[#636E72]">Upload, analyze and compare health insurance policies</p>
          </div>
          <div className="flex gap-3">
            {selectedPolicies.length >= 2 && (
              <button
                onClick={() => { setShowCompare(true); handleCompare(); }}
                disabled={isComparing}
                className="flex items-center gap-2 px-4 py-2 bg-[#004E89] text-white rounded-lg font-medium hover:bg-[#003D6B] transition-colors"
              >
                {isComparing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
                Compare ({selectedPolicies.length})
              </button>
            )}
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Upload Policy
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#636E72]" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B35]"
            />
          </div>
          {policies.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectedPolicies.length === policies.length && policies.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPolicies(policies.map(p => p.id));
                  } else {
                    setSelectedPolicies([]);
                  }
                }}
                className="w-4 h-4"
              />
              <label htmlFor="selectAll" className="text-sm text-[#636E72]">Select All</label>
            </div>
          )}
        </div>

        {policies.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <div className="w-20 h-20 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-[#FF6B35]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">No Policies Uploaded</h3>
            <p className="text-[#636E72] mb-6">Upload your first policy to get AI-powered analysis</p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Policy
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map((policy) => (
              <div 
                key={policy.id} 
                className={`bg-white rounded-2xl p-6 shadow-sm card-hover relative ${selectedPolicies.includes(policy.id) ? 'ring-2 ring-[#FF6B35]' : ''}`}
              >
                <div className="absolute top-4 right-4">
                  <input
                    type="checkbox"
                    checked={selectedPolicies.includes(policy.id)}
                    onChange={() => toggleSelect(policy.id)}
                    className="w-5 h-5 accent-[#FF6B35]"
                  />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#FF6B35]" />
                  </div>
                  <button
                    onClick={() => savePolicies(policies.filter(pol => pol.id !== policy.id))}
                    className="p-2 text-[#636E72] hover:text-[#E74C3C] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-[#1A1A2E] mb-1">{policy.planName}</h3>
                <p className="text-sm text-[#636E72] mb-3">{policy.insurer}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#636E72]">Sum Insured</span>
                    <span className="font-medium">₹{policy.sumInsured.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#636E72]">Premium</span>
                    <span className="font-medium">₹{policy.premium.toLocaleString()}/yr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#636E72]">Room Rent</span>
                    <span className="font-medium">{policy.subLimits?.roomRent || "1% of SI"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#636E72]">PED Wait</span>
                    <span className="font-medium">{policy.waitingPeriods?.ped || 36} months</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`font-bold ${getRatingColor(policy.rating)}`}>
                    {policy.rating}/10
                  </span>
                  <span className="text-xs text-[#636E72]">
                    {new Date(policy.analysisDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#1A1A2E]">Upload Policy</h2>
                <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#FF6B35] transition-colors">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-12 h-12 text-[#FF6B35] mx-auto mb-4 animate-spin" />
                      <p className="text-[#636E72]">Analyzing policy...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-[#636E72] mx-auto mb-4" />
                      <p className="text-[#636E72] mb-2">Drop policy PDF(s) here</p>
                      <p className="text-sm text-[#636E72]">or click to browse (multiple files supported)</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setShowUpload(false)}
                  className="flex-1 py-3 border border-gray-200 text-[#636E72] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showCompare && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#1A1A2E]">Policy Comparison</h2>
                <button onClick={() => { setShowCompare(false); setCompareResult(null); setSelectedPolicies([]); }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {compareResult ? (
                <div>
                  {compareResult.comparison && (
                    <div className="p-4 bg-[#FF6B35]/10 rounded-xl mb-6">
                      <p className="font-semibold text-[#1A1A2E]">{compareResult.comparison.summary}</p>
                      <p className="text-sm text-[#636E72] mt-2">
                        Best for: {compareResult.comparison.bestFor?.join(", ")} | Winner: {compareResult.comparison.winner}
                      </p>
                    </div>
                  )}
                  
                  {compareResult.detailedComparison && (
                    <div className="space-y-4 mb-6">
                      {compareResult.detailedComparison.map((item, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-[#1A1A2E]">{item.metric}</span>
                            <span className="text-xs bg-[#00B894]/10 text-[#00B894] px-2 py-1 rounded">
                              Winner: {item.winner}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(item.values).map(([key, value]) => (
                              <div key={key} className={item.winner === key ? "text-[#00B894]" : "text-[#636E72]"}>
                                <span className="font-medium">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {compareResult.recommendations && (
                    <div className="p-4 bg-[#004E89]/10 rounded-xl">
                      <h4 className="font-semibold text-[#004E89] mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {compareResult.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-[#1A1A2E] flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[#00B894]" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 text-[#FF6B35] mx-auto mb-4 animate-spin" />
                  <p className="text-[#636E72]">Comparing policies...</p>
                </div>
              )}

              <button
                onClick={() => { setShowCompare(false); setCompareResult(null); setSelectedPolicies([]); }}
                className="w-full mt-6 py-3 border border-gray-200 text-[#636E72] rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}