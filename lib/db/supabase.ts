import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface Policy {
  id: string;
  user_id?: string;
  file_name: string;
  insurer: string;
  plan_name: string;
  sum_insured: number;
  premium: number;
  policy_type: string;
  policy_year: number;
  age: number;
  exclusions: string[];
  waiting_periods: {
    ped: number;
    initial: number;
    specific: number;
    maternity: number;
  };
  sub_limits: {
    room_rent?: string;
    icu?: string;
    disease_wise?: Record<string, string>;
    ambulance?: string;
    pre_post_hospitalization?: string;
  };
  copay: number;
  no_claim_bonus: number;
  restoration: string;
  network_hospitals: number;
  cashless_hospitals: string;
  features: string[];
  rating: number;
  summary: string;
  analysis_date: string;
  raw_data?: Record<string, unknown>;
  created_at?: string;
}

export interface Claim {
  id: string;
  user_id?: string;
  policy_id: string;
  treatment: string;
  hospital: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  win_probability?: number;
  expected_amount?: string;
  analysis?: Record<string, unknown>;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  user_id?: string;
  role: "user" | "assistant";
  content: string;
  policy_ids?: string[];
  created_at?: string;
}

export async function savePolicy(policy: Policy): Promise<Policy> {
  const policyData = {
    ...policy,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("policies")
      .upsert([policyData], { onConflict: "id" })
      .select()
      .single();
    
    if (error) {
      console.error("Supabase save error:", error);
    }
    return data || policy;
  }

  const existing = getLocalPolicies();
  const idx = existing.findIndex(p => p.id === policy.id);
  
  if (idx >= 0) {
    existing[idx] = policyData;
  } else {
    existing.push(policyData);
  }
  
  localStorage.setItem("policies", JSON.stringify(existing));
  return policyData;
}

export function getLocalPolicies(): Policy[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("policies");
  return saved ? JSON.parse(saved) : [];
}

export async function getPolicies(): Promise<Policy[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      localStorage.setItem("policies", JSON.stringify(data));
      return data;
    }
  }
  return getLocalPolicies();
}

export async function deletePolicy(id: string): Promise<void> {
  if (supabase) {
    await supabase.from("policies").delete().eq("id", id);
  }
  
  const existing = getLocalPolicies().filter(p => p.id !== id);
  localStorage.setItem("policies", JSON.stringify(existing));
}

export async function saveClaim(claim: Claim): Promise<Claim> {
  const claimData = {
    ...claim,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("claims")
      .upsert([claimData], { onConflict: "id" })
      .select()
      .single();
    
    if (error) {
      console.error("Supabase save error:", error);
    }
    return data || claimData;
  }

  const existing = getLocalClaims();
  const idx = existing.findIndex(c => c.id === claim.id);
  
  if (idx >= 0) {
    existing[idx] = claimData;
  } else {
    existing.push(claimData);
  }
  
  localStorage.setItem("claims", JSON.stringify(existing));
  return claimData;
}

export function getLocalClaims(): Claim[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("claims");
  return saved ? JSON.parse(saved) : [];
}

export async function getClaims(): Promise<Claim[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("claims")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      localStorage.setItem("claims", JSON.stringify(data));
      return data;
    }
  }
  return getLocalClaims();
}

export async function saveChatMessage(message: ChatMessage): Promise<ChatMessage> {
  const msgData = {
    ...message,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("chat_history")
      .insert([msgData])
      .select()
      .single();
    
    if (error) {
      console.error("Supabase save error:", error);
    }
    return data || msgData;
  }

  const existing = getLocalChatHistory();
  existing.push(msgData);
  localStorage.setItem("chat_history", JSON.stringify(existing));
  
  return msgData;
}

export function getLocalChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("chat_history");
  return saved ? JSON.parse(saved) : [];
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(50);
    
    if (!error && data) {
      localStorage.setItem("chat_history", JSON.stringify(data));
      return data;
    }
  }
  return getLocalChatHistory();
}

export async function clearChatHistory(): Promise<void> {
  if (supabase) {
    await supabase.from("chat_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }
  localStorage.removeItem("chat_history");
}