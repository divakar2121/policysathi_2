import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const USERS_FILE = "/home/deva/full_stack_app/policysathi/.users.json";

interface User {
  email: string;
  password: string;
  name: string;
  created: string;
}

// Load users
function loadUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }
  } catch (e) {}
  return [];
}

// Save users
function saveUsers(users: User[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Simple password hash (for demo - use bcrypt in production)
function hashpwd(pwd: string): string {
  return Buffer.from(pwd).toString("base64");
}

export async function POST(request: NextRequest) {
  const { action, email, password, name } = await request.json();
  
  if (action === "register") {
    const users = loadUsers();
    if (users.find(u => u.email === email)) {
      return NextResponse.json({ success: false, error: "Email already exists" });
    }
    users.push({ email, password: hashpwd(password), name, created: new Date().toISOString() });
    saveUsers(users);
    return NextResponse.json({ success: true });
  }
  
  if (action === "login") {
    const users = loadUsers();
    const user = users.find(u => u.email === email && u.password === hashpwd(password));
    if (user) {
      return NextResponse.json({ 
        success: true, 
        user: { email: user.email, name: user.name }
      });
    }
    return NextResponse.json({ success: false, error: "Invalid credentials" });
  }
  
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// Export conversation history
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  
  if (action === "export") {
    return NextResponse.json({
      message: "Conversations stored in browser localStorage. Data stays on device.",
      storageKeys: [
        "policysathi_policies",
        "policysathi_claims", 
        "policysathi_messages"
      ],
      instructions: [
        "1. Open browser DevTools (F12)",
        "2. Go to Application → Local Storage",
        "3. Export data as JSON"
      ]
    });
  }
  
  return NextResponse.json({ status: "Auth API ready" });
}