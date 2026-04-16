"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Shield, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: mode, email, password, name })
    });
    const data = await res.json();

    if (data.success) {
      if (mode === "register") {
        setMode("login");
        setError("Account created! Please login.");
      } else {
        router.push("/chat");
      }
    } else {
      setError(data.error || "Authentication failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF6B35] rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">PolicySaathi</h1>
          <p className="text-[#636E72]">{mode === "login" ? "Sign in to access your policies" : "Create your account"}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            {/* Google */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/chat" })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 text-[#1A1A2E] rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => alert("WhatsApp login coming soon!")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#20BD5A] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.132-.098.297-.223.446-.364.148-.149.297-.297.347-.496.149-.198.198-.347.198-.496 0-.149-.099-.521-.149-.867-.05-.298-.298-.743-.446-1.182-.149-.37-.198-.595-.347-.818-.148-.222-.327-.347-.595-.595-.074-.074-.173-.148-.248-.223-.074-.149-.248-.273-.347-.298-.297-.074-.595-.074-.818-.074-.222 0-.595.025-.818.297-.297.37-.595.743-.595.966 0 .148.025.37.074.496.149.521.446 1.182.743 1.818.104.22.1689 1.262.595 1.818.074.149.149.347.248.521.074.149.173.298.248.372.198.149.347.297.521.446.149.149.297.322.446.521.149.149.223.298.297.446.074.148.149.322.173.496 0 .372-.025.743-.074 1.096-.074.521-.173 1.096-.347 1.461-.149.37-.37 1.096-.595 1.461-.149.223-.347.496-.595.743-.223.223-.446.446-.743.595-.297.149-.595.347-.966.695-.37.349-1.095.966-1.605 1.461-.347.37-.595.595-.818.743-.223.149-.521.223-.818.347-.297.123-.595.149-.866.124-.273-.025-.595-.025-.866-.025-.37 0-.743.025-1.096.074-.521.074-1.096.173-1.507.347-.37.149-1.095.743-1.507 1.461-.37.743-.595 1.461-.595 1.608 0 .148.025.37.074.496.149.521.446 1.157.743 1.608.297.446.595 1.157.595 1.607 0 .148-.025.37-.074.521-.074.148-.223.347-.372.521zM12 2.687c-5.148 0-9.313 4.165-9.313 9.313 0 5.148 4.165 9.313 9.313 9.313 5.148 0 9.313-4.165 9.313-9.313 0-5.148-4.165-9.313-9.313-9.313z"/>
              </svg>
              Continue with WhatsApp
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#636E72]">or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          {mode === "login" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF6B35] text-white rounded-xl font-medium hover:bg-[#E55A2B] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF6B35] text-white rounded-xl font-medium hover:bg-[#E55A2B] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-[#FF6B35] text-sm hover:underline"
            >
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-[#636E72] mt-6">
          This is AI guidance, not legal advice.
        </p>
      </div>
    </div>
  );
}