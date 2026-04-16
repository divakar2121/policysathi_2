import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = "/home/deva/full_stack_app/irdai-analysis/data/entities_database.json";

let db: any = null;

async function loadDatabase() {
  if (!db) {
    try {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      db = JSON.parse(data);
    } catch (e) {
      console.error("Failed to load IRDAI DB:", e);
      db = { insurers: { life: [], general: [], health: [] }, intermediaries: { brokers: [], corporate_agents: [], tpas: [], web_aggregators: [] } };
    }
  }
  return db;
}

export async function POST(request: NextRequest) {
  try {
    const { query, type } = await request.json();
    const database = await loadDatabase();
    
    const searchTerm = query.toLowerCase();
    
    // Map common search terms to improve matching
    const termMap: Record<string, string> = {
      "lic": "life insurance corporation",
      "hdfc": "hdfc life",
      "icici": "icici prudential",
      "bajaj": "bajaj",
      "star health": "star health",
      "kotak": "kotak mahindra",
      "axis": "axis max",
      "sbi": "state bank",
      "reliance": "reliance",
      "tata": "tata aia"
    };
    const mappedTerm = termMap[searchTerm] || searchTerm;
    
    let results: any[] = [];
    
    if (type === "insurer" || type === "all") {
      for (const ins of database.insurers.life) {
        if (ins.name.toLowerCase().includes(mappedTerm)) {
          results.push({ ...ins, category: "life_insurer" });
        }
      }
      for (const ins of database.insurers.general) {
        if (ins.name.toLowerCase().includes(mappedTerm)) {
          results.push({ ...ins, category: "general_insurer" });
        }
      }
      for (const ins of database.insurers.health) {
        if (ins.name.toLowerCase().includes(mappedTerm)) {
          results.push({ ...ins, category: "health_insurer" });
        }
      }
    }
    
    if (type === "intermediary" || type === "all") {
      for (const brk of database.intermediaries.brokers) {
        if (brk.name.toLowerCase().includes(searchTerm)) {
          results.push({ ...brk, category: "broker" });
        }
      }
      for (const agt of database.intermediaries.corporate_agents) {
        if (agt.name.toLowerCase().includes(searchTerm)) {
          results.push({ ...agt, category: "corporate_agent" });
        }
      }
      for (const tpa of database.intermediaries.tpas) {
        if (tpa.name.toLowerCase().includes(searchTerm)) {
          results.push({ ...tpa, category: "tpa" });
        }
      }
      for (const wa of database.intermediaries.web_aggregators) {
        if (wa.name.toLowerCase().includes(searchTerm)) {
          results.push({ ...wa, category: "web_aggregator" });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      query,
      type,
      count: results.length,
      results: results.slice(0, 20)
    });
    
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}

export async function GET() {
  const database = await loadDatabase();
  
  return NextResponse.json({
    success: true,
    stats: {
      life_insurers: database.insurers.life.length,
      general_insurers: database.insurers.general.length,
      health_insurers: database.insurers.health.length,
      brokers: database.intermediaries.brokers.length,
      corporate_agents: database.intermediaries.corporate_agents.length,
      tpas: database.intermediaries.tpas.length,
      web_aggregators: database.intermediaries.web_aggregators.length,
      total: database.metadata?.total_entities || 0
    }
  });
}