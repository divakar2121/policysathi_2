import { NextResponse } from "next/server";
import fs from "fs";

const HEADLINES_FILE = "/home/deva/full_stack_app/irdai-analysis/data/headlines.json";

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
    execSync("python3 /home/deva/full_stack_app/irdai-analysis/daily_crawl.py", {
      timeout: 60000
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json({ success: false, error: "Crawl failed" });
  }
}