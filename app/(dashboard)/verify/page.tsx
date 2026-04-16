"use client";

import { useState, useEffect } from "react";
import { Search, Shield, CheckCircle, XCircle, Loader2, Building2, Users, Activity, Globe, AlertCircle } from "lucide-react";

type VerifyType = "all" | "insurer" | "intermediary";

interface VerifyResult {
  name: string;
  irdai_id: string;
  website?: string;
  email?: string;
  contact?: string;
  validity?: string;
  category: string;
}

export default function VerifyPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<VerifyType>("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VerifyResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Load stats on mount
    fetch("/api/verify")
      .then(r => r.json())
      .then(d => {
        if (d.success) setStats(d.stats);
      });
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setResults([]);
    
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "life_insurer":
      case "general_insurer":
      case "health_insurer":
        return <Building2 className="w-5 h-5" />;
      case "broker":
      case "corporate_agent":
        return <Users className="w-5 h-5" />;
      case "tpa":
        return <Activity className="w-5 h-5" />;
      case "web_aggregator":
        return <Globe className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "life_insurer": return "Life Insurer";
      case "general_insurer": return "General Insurer";
      case "health_insurer": return "Health Insurer";
      case "broker": return "Insurance Broker";
      case "corporate_agent": return "Corporate Agent";
      case "tpa": return "Third Party Administrator";
      case "web_aggregator": return "Web Aggregator";
      default: return cat;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 p-4 hidden md:block">
        <div className="text-lg font-bold text-[#1A1A2E] mb-6">PolicySaathi</div>
        <nav className="space-y-2">
          <a href="/chat" className="flex items-center gap-3 px-4 py-3 text-[#636E72] hover:bg-gray-50 rounded-lg font-medium">
            <Users className="w-5 h-5" />
            Chat
          </a>
          <a href="/policies" className="flex items-center gap-3 px-4 py-3 text-[#636E72] hover:bg-gray-50 rounded-lg font-medium">
            <Shield className="w-5 h-5" />
            Policies
          </a>
          <a href="/claims" className="flex items-center gap-3 px-4 py-3 text-[#636E72] hover:bg-gray-50 rounded-lg font-medium">
            <Activity className="w-5 h-5" />
            Claims
          </a>
          <a href="/analyze" className="flex items-center gap-3 px-4 py-3 text-[#636E72] hover:bg-gray-50 rounded-lg font-medium">
            <Globe className="w-5 h-5" />
            Lawyer Arena
          </a>
          <a href="/verify" className="flex items-center gap-3 px-4 py-3 bg-[#FF6B35]/10 text-[#FF6B35] rounded-lg font-medium">
            <CheckCircle className="w-5 h-5" />
            IRDAI Verify
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2">
              IRDAI Verification
            </h1>
            <p className="text-[#636E72]">
              Verify insurance companies, brokers, agents, and TPAs registered with IRDAI
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="text-2xl font-bold text-[#004E89]">{stats.life_insurers}</div>
                <div className="text-sm text-[#636E72]">Life Insurers</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="text-2xl font-bold text-[#004E89]">{stats.general_insurers}</div>
                <div className="text-sm text-[#636E72]">General</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="text-2xl font-bold text-[#004E89]">{stats.brokers}</div>
                <div className="text-sm text-[#636E72]">Brokers</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="text-2xl font-bold text-[#004E89]">{stats.corporate_agents}</div>
                <div className="text-sm text-[#636E72]">Agents</div>
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search insurer, broker, agent, or TPA name..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004E89]/20"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-[#004E89] text-white rounded-lg font-medium hover:bg-[#003A6A] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify"}
              </button>
            </div>

            {/* Type Filters */}
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "insurer", label: "Insurers Only" },
                { value: "intermediary", label: "Intermediaries Only" }
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value as VerifyType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    type === t.value
                      ? "bg-[#004E89] text-white"
                      : "bg-gray-100 text-[#636E72] hover:bg-gray-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {searched && (
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#1A1A2E]">
                  {results.length} result{results.length !== 1 ? "s" : ""} found
                </h2>
              </div>
              
              {results.length === 0 ? (
                <div className="p-8 text-center">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-[#636E72]">No entities found matching "{query}"</p>
                  <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {results.map((result, i) => (
                    <div key={i} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[#1A1A2E]">
                              {result.name.slice(0, 60)}
                            </span>
                            <span className="px-2 py-0.5 bg-[#004E89]/10 text-[#004E89] text-xs rounded-full">
                              {getCategoryLabel(result.category)}
                            </span>
                          </div>
                          <div className="text-sm text-[#636E72] space-y-1">
                            {result.irdai_id && (
                              <p>IRDAI ID: {result.irdai_id}</p>
                            )}
                            {result.website && (
                              <p className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <a href={result.website} target="_blank" className="text-[#004E89] hover:underline">
                                  {result.website}
                                </a>
                              </p>
                            )}
                            {result.email && (
                              <p>Email: {result.email}</p>
                            )}
                            {result.validity && (
                              <p>Valid: {result.validity}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Search Examples */}
          {!searched && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-[#1A1A2E] mb-4">Quick Search Examples</h3>
              <div className="flex flex-wrap gap-2">
                {["LIC", "HDFC", "Bajaj", "SBI", "Policybazaar", "Star Health"].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuery(q); setTimeout(handleSearch, 100); }}
                    className="px-4 py-2 bg-gray-100 text-[#636E72] rounded-lg text-sm hover:bg-gray-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}