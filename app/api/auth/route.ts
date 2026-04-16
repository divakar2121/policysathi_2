import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

const USERS_FILE = "/home/deva/full_stack_app/policysathi/.users.json";

interface User {
  email: string;
  password: string;
  name: string;
  created: string;
}

function loadUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }
  } catch (e) {}
  return [];
}

function saveUsers(users: User[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

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

export async function GET() {
  return NextResponse.json({ status: "Auth API ready" });
}