"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Paperclip, Loader2, MessageCircle, FileText, Scale, Shield, X, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PolicyDetails {
  id: string;
  fileName: string;
  insurer: string;
  planName: string;
  sumInsured: number;
  premium: number;
  rating: number;
  exclusions: string[];
  waitingPeriods: { ped: number; initial: number; specific: number };
  subLimits: { roomRent?: string; icu?: string };
  summary: string;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [policies, setPolicies] = useState<PolicyDetails[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDetails | null>(null);
  const [showPolicyDropdown, setShowPolicyDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem("policysathi_policies");
    if (saved) {
      const parsed = JSON.parse(saved);
      setPolicies(parsed);
      if (parsed.length > 0 && !selectedPolicy) {
        setSelectedPolicy(parsed[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionClass = (window as Window).SpeechRecognition || (window as Window).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        recognitionRef.current = new SpeechRecognitionClass();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => prev + transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const policyContext = selectedPolicy 
      ? `\n\nCurrent Policy Context:\n- Insurer: ${selectedPolicy.insurer}\n- Plan: ${selectedPolicy.planName}\n- Sum Insured: ₹${selectedPolicy.sumInsured}\n- Premium: ₹${selectedPolicy.premium}/yr\n- Rating: ${selectedPolicy.rating}/10\n- Summary: ${selectedPolicy.summary}`
      : "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: policyContext,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMessage += decoder.decode(value);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return [...prev.slice(0, -1), { ...last, content: assistantMessage }];
          }
          return [...prev, { role: "assistant", content: assistantMessage }];
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="font-semibold text-[#1A1A2E]">PolicySaathi</span>
          </div>
        </div>
        
        {policies.length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-[#636E72] mb-2">Your Policies</h3>
            <div className="space-y-2">
              {policies.map((policy) => (
                <button
                  key={policy.id}
                  onClick={() => { setSelectedPolicy(policy); setShowPolicyDropdown(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedPolicy?.id === policy.id 
                      ? "bg-[#FF6B35]/10 text-[#FF6B35]" 
                      : "text-[#636E72] hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium truncate">{policy.planName}</div>
                  <div className="text-xs truncate">{policy.insurer}</div>
                </button>
              ))}
            </div>
            <a href="/policies" className="block mt-3 text-xs text-[#004E89] hover:underline">
              + Upload more policies
            </a>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2">
          <a href="/chat" className="flex items-center gap-3 px-4 py-3 bg-[#FF6B35]/10 text-[#FF6B35] rounded-lg font-medium">
            <MessageCircle className="w-5 h-5" />
            Chat
          </a>
          <a href="/policies" className="flex items-center gap-3 px-4 py-3 text-[#636E72] hover:bg-gray-50 rounded-lg font-medium">
            <Paperclip className="w-5 h-5" />
            Policies
          </a>
          <a href="/claims" className="flex items-center gap-3 px-4 py-3 text-[#636E72] hover:bg-gray-50 rounded-lg font-medium">
            <FileText className="w-5 h-5" />
            Claims
          </a>
          <a href="/analyze" className="flex items-center gap-3 px-4 py-3 text-[#636E72] hover:bg-gray-50 rounded-lg font-medium">
            <Scale className="w-5 h-5" />
            Lawyer Arena
          </a>
          <a href="/verify" className="flex items-center gap-3 px-4 py-3 text-[#636E72] hover:bg-gray-50 rounded-lg font-medium">
            <Shield className="w-5 h-5" />
            IRDAI Verify
          </a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        {selectedPolicy && (
          <header className="bg-white border-b border-gray-100 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#FF6B35]" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-[#1A1A2E]">{selectedPolicy.planName}</h1>
                  <p className="text-sm text-[#636E72]">{selectedPolicy.insurer} • ₹{selectedPolicy.sumInsured.toLocaleString()} SI</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowPolicyDropdown(!showPolicyDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100"
                >
                  <span className="text-[#636E72]">Switch Policy</span>
                  <ChevronDown className="w-4 h-4 text-[#636E72]" />
                </button>
                {showPolicyDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                    {policies.map((policy) => (
                      <button
                        key={policy.id}
                        onClick={() => { setSelectedPolicy(policy); setShowPolicyDropdown(false); }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${selectedPolicy?.id === policy.id ? 'bg-[#FF6B35]/5' : ''}`}
                      >
                        <div className="font-medium text-[#1A1A2E]">{policy.planName}</div>
                        <div className="text-sm text-[#636E72]">{policy.insurer} • ₹{policy.sumInsured.toLocaleString()}</div>
                      </button>
                    ))}
                    <a href="/policies" className="block px-4 py-2 text-sm text-[#004E89] border-t">
                      + Upload New Policy
                    </a>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {!selectedPolicy && (
          <header className="bg-white border-b border-gray-100 px-6 py-4">
            <h1 className="text-xl font-semibold text-[#1A1A2E]">Chat with PolicySaathi</h1>
            <p className="text-sm text-[#636E72]">
              <a href="/policies" className="text-[#FF6B35] hover:underline">Upload a policy</a> to get personalized guidance
            </p>
          </header>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-[#FF6B35]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">Welcome to PolicySaathi</h3>
              {selectedPolicy ? (
                <p className="text-[#636E72] max-w-md mx-auto">
                  Now discussing: {selectedPolicy.planName} ({selectedPolicy.insurer})
                  <br />
                  Ask me anything about this policy!
                </p>
              ) : (
                <p className="text-[#636E72] max-w-md mx-auto">
                  Ask me anything about health insurance — policy analysis, claim guidance, or coverage questions.
                  <br />
                  <a href="/policies" className="text-[#FF6B35] hover:underline">Upload a policy</a> for personalized help.
                </p>
              )}
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-[#FF6B35] text-white"
                    : "bg-white border border-gray-100 text-[#1A1A2E]"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-100 p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-full transition-colors ${
                isListening
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-[#636E72] hover:bg-gray-200"
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedPolicy ? `Ask about ${selectedPolicy.planName}...` : "Ask about your policy..."}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-[#FF6B35] text-white rounded-full hover:bg-[#E55A2B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          <p className="text-xs text-[#636E72] mt-2 text-center">
            This is AI guidance, not legal advice. Always consult a licensed advisor.
          </p>
        </div>
      </main>
    </div>
  );
}