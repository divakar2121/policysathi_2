import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Configurable paths via environment variables
const HEADLINES_FILE = process.env.HEADLINES_FILE_PATH || path.resolve(process.cwd(), './data/irdai/headlines.json');
const SCRAPER_SCRIPT = process.env.SCRAPER_SCRIPT_PATH || path.resolve(process.cwd(), './scripts/daily_crawl.py');

export async function GET() {
  try {
    if (fs.existsSync(HEADLINES_FILE)) {
      const data = fs.readFileSync(HEADLINES_FILE, "utf-8");
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({ headlines: [], last_update: null });
  } catch (error) {
    console.error("Headlines error:", error);
    return NextResponse.json({ headlines: [], last_update: null });
  }
}

export async function POST() {
  // Trigger fresh crawl
  const { execSync } = require("child_process");
  try {
    execSync(`python3 "${SCRAPER_SCRIPT}"`, {
      timeout: 60000,
      cwd: process.cwd()
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json({ success: false, error: "Crawl failed" });
  }
}