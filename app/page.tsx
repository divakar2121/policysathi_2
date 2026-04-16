import Link from "next/link";
import { Shield, MessageCircle, FileText, Scale, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-[#FF6B35]" />
            <span className="text-xl font-bold text-[#1A1A2E]">PolicySaathi</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/chat" className="text-[#636E72] hover:text-[#FF6B35] transition-colors">Chat</Link>
            <Link href="/policies" className="text-[#636E72] hover:text-[#FF6B35] transition-colors">Policies</Link>
            <Link href="/analyze" className="text-[#636E72] hover:text-[#FF6B35] transition-colors">Lawyer Arena</Link>
            <Link href="/login" className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-colors">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#004E89]/10 text-[#004E89] rounded-full text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4" />
              IRDAI Compliant AI Assistant
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-[#1A1A2E] leading-tight mb-6">
              Your Personal{" "}
              <span className="text-[#FF6B35]">Health Insurance</span>{" "}
              Expert
            </h1>
            <p className="text-lg text-[#636E72] mb-8 max-w-2xl mx-auto">
              Upload your policy, analyze claims, and get AI-powered advocacy. 
              Understand coverage, fight rejections, and maximize your benefits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#E55A2B] transition-colors">
                Start Chatting <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/policies" className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#004E89] text-[#004E89] rounded-lg font-semibold hover:bg-[#004E89] hover:text-white transition-colors">
                Upload Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">How PolicySaathi Helps You</h2>
            <p className="text-[#636E72] max-w-2xl mx-auto">
              From policy analysis to claim advocacy — get expert guidance powered by IRDAI regulations and AI.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#F8F9FA] rounded-2xl card-hover">
              <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">Policy Analysis</h3>
              <p className="text-[#636E72]">
                Upload your policy PDF and get plain-language explanations of coverage, exclusions, and waiting periods.
              </p>
            </div>
            <div className="p-6 bg-[#F8F9FA] rounded-2xl card-hover">
              <div className="w-12 h-12 bg-[#004E89]/10 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-[#004E89]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">Claim Analysis</h3>
              <p className="text-[#636E72]">
                Get win probability, expected reimbursement amount, and loopholes to fight claim rejections.
              </p>
            </div>
            <div className="p-6 bg-[#F8F9FA] rounded-2xl card-hover">
              <div className="w-12 h-12 bg-[#FFD700]/10 rounded-xl flex items-center justify-center mb-4">
                <Scale className="w-6 h-6 text-[#FFD700]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">Lawyer Arena</h3>
              <p className="text-[#636E72]">
                AI-powered adversarial debate to pre-prepare your case for ombudsman or consumer court.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Banner */}
      <section className="py-12 bg-[#1A1A2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-2">Important Disclaimer</h3>
              <p className="text-gray-400">
                This is AI guidance, not legal advice. Always consult a licensed insurance advisor for important decisions.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white/10 rounded-lg text-sm text-gray-300">
                IRDAI Compliant
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-lg text-sm text-gray-300">
                Section 45 Coverage
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#F8F9FA] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#FF6B35]" />
              <span className="font-semibold text-[#1A1A2E]">PolicySaathi</span>
            </div>
            <p className="text-sm text-[#636E72]">
              © 2024 PolicySaathi. Built with IRDAI guidelines compliance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
