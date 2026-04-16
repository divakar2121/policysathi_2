"use client";

import { useState, useEffect } from "react";
import { Bell, ExternalLink, RefreshCw } from "lucide-react";

interface Headline {
  id: string;
  title: string;
  url: string;
  source: string;
  timestamp: string;
}

export default function HeadlinesTicker() {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    fetchHeadlines();
    const interval = setInterval(fetchHeadlines, 300000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  const fetchHeadlines = async () => {
    try {
      const res = await fetch("/api/headlines");
      const data = await res.json();
      if (data.headlines) {
        setHeadlines(data.headlines);
        setLastUpdate(data.last_update);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const triggerCrawl = async () => {
    setLoading(true);
    await fetch("/api/headlines", { method: "POST" });
    await fetchHeadlines();
  };

  if (loading && headlines.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Ticker Bar */}
      <div className="bg-gradient-to-r from-[#004E89] to-[#003A6A] text-white py-2 px-4">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">IRDAI Updates</span>
          </div>
          
          {/* Scrolling headlines */}
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee flex gap-8">
              {headlines.slice(0, 5).map((h) => (
                <a
                  key={h.id}
                  href={h.url}
                  target="_blank"
                  className="text-sm text-white/90 hover:text-white whitespace-nowrap flex items-center gap-1"
                >
                  {h.title}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
          
          {/* View All Button */}
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 shrink-0"
          >
            View All ({headlines.length})
          </button>
        </div>
      </div>

      {/* Panel */}
      {showPanel && (
        <div className="absolute top-full right-0 w-96 bg-white shadow-xl border rounded-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-[#1A1A2E]">IRDAI Latest Updates</h3>
            <button
              onClick={triggerCrawl}
              className="p-2 hover:bg-gray-100 rounded"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="divide-y">
            {headlines.map((h) => (
              <a
                key={h.id}
                href={h.url}
                target="_blank"
                className="block p-3 hover:bg-gray-50"
              >
                <div className="text-sm text-[#1A1A2E] line-clamp-2">{h.title}</div>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                  <span>{h.source}</span>
                  <span>•</span>
                  <span>{new Date(h.timestamp).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
          
          {lastUpdate && (
            <div className="p-3 border-t text-xs text-gray-400">
              Last updated: {new Date(lastUpdate).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}