import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo, LogoMark } from "@/components/ui/logo";
import {
  Brain,
  FileText,
  Users,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
  BookOpen,
  MessageSquare,
  Upload,
  TrendingUp,
  Lock,
  ExternalLink,
  CalendarClock,
  ClipboardList,
  BookmarkCheck,
  Archive,
  StickyNote,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Tax Assistant",
    description:
      "Get instant, accurate answers to complex tax questions. IRC sections, treasury regs, and planning strategies at your fingertips.",
    color: "text-forest-600",
    bg: "bg-forest-50",
  },
  {
    icon: FileText,
    title: "Document Management",
    description:
      "Upload, organize, and preview tax returns, financial statements, and client documents in one secure location.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Users,
    title: "Client Upload Portal",
    description:
      "Invite clients via a secure link. They get their own portal to upload tax docs, W-2s, and receipts directly to you — no email attachments needed.",
    color: "text-mint",
    bg: "bg-forest-50",
  },
  {
    icon: BookOpen,
    title: "Accounting Standards",
    description:
      "Deep knowledge of US GAAP, IFRS, PCAOB standards, and government accounting. Always up to date.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: BarChart3,
    title: "Practice Analytics",
    description:
      "Track billable hours, client activity, document volumes, and AI usage across your practice.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description:
      "SOC 2 compliant infrastructure. End-to-end encryption. Your clients' data is always protected.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

const proFeatures = [
  {
    icon: ClipboardList,
    title: "Document Requests",
    description: "Request specific documents from clients. They see a checklist in their portal and can mark items complete as they upload.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: CalendarClock,
    title: "Tax Deadline Tracker",
    description: "Track every filing deadline by client — Form 1040, 1120S, extensions, and more. Get alerted before anything goes overdue.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: StickyNote,
    title: "Client Notes & Activity",
    description: "Pin important notes to any client and view a full activity timeline — every upload, document request, and status change logged automatically.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: BookmarkCheck,
    title: "Saved AI Prompts",
    description: "Save your best AI prompts and reuse them instantly. Build a personal library of tax research templates and client scenarios.",
    color: "text-forest-600",
    bg: "bg-forest-50",
  },
  {
    icon: Archive,
    title: "Bulk Document Download",
    description: "Export all documents for any client as a single ZIP file — complete with metadata. Perfect for handoffs and record-keeping.",
    color: "text-slate-600",
    bg: "bg-slate-50",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for solo CPAs just getting started",
    features: [
      "10 AI messages/month",
      "5 documents",
      "3 clients",
      "Client upload portal (3 clients)",
      "100 MB storage",
      "PDF preview",
      "Email support",
    ],
    cta: "Get Started Free",
    popular: false,
    href: "/signup",
  },
  {
    name: "Pro",
    price: 49,
    description: "For growing CPA practices",
    features: [
      "500 AI messages/month",
      "100 documents · 50 clients",
      "Document Requests for clients",
      "Tax Deadline Tracker",
      "Client Notes & Activity Timeline",
      "Saved AI Prompts",
      "Bulk document download (ZIP)",
      "10 GB storage",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    popular: true,
    href: "/signup?plan=pro",
  },
  {
    name: "Premium",
    price: 149,
    description: "For large firms and power users",
    features: [
      "Unlimited AI messages",
      "Unlimited documents & clients",
      "All Pro features included",
      "100 GB storage",
      "Team collaboration (5 seats)",
      "Custom integrations",
      "Dedicated account support",
    ],
    cta: "Start Premium Trial",
    popular: false,
    href: "/signup?plan=premium",
  },
];

const testimonials = [
  {
    quote:
      "CPA Loft has completely transformed how I handle complex tax research. What used to take 2-3 hours now takes minutes.",
    author: "Michael Torres, CPA",
    firm: "Torres & Partners",
    rating: 5,
  },
  {
    quote:
      "The AI assistant knows the IRC inside and out. It even cites specific code sections and treasury regulations. Incredible tool.",
    author: "Amanda Lee, CPA, CFP",
    firm: "Lee Financial Advisory",
    rating: 5,
  },
  {
    quote:
      "My client management used to be scattered across spreadsheets and folders. CPA Loft consolidated everything beautifully.",
    author: "David Kim, CPA",
    firm: "Kim Accounting Group",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Logo markSize={32} wordmarkSize="md" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-gray-600 hover:text-forest-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-gray-600 hover:text-forest-600 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-sm text-gray-600 hover:text-forest-600 transition-colors"
              >
                Testimonials
              </a>
              <Link
                href="/portal/login"
                className="text-sm text-gray-600 hover:text-forest-600 transition-colors flex items-center gap-1"
              >
                Client Portal
                <ExternalLink className="w-3 h-3 opacity-50" />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-forest-700 hover:text-forest-800 hover:bg-forest-50">
                  CPA Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-forest-600 hover:bg-forest-700">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-cloud to-white">
        <div className="max-w-7xl mx-auto text-center">
          <Badge
            variant="info"
            className="mb-6 px-4 py-1.5 text-sm font-medium bg-forest-50 text-forest-700 border-forest-100"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 text-mint" />
            Powered by Claude AI — Purpose-built for CPAs
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 leading-tight">
            Your accounting,
            <br />
            <span className="text-forest-600">elevated.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            CPA Loft combines cutting-edge AI with deep accounting expertise
            to help CPAs answer complex tax questions, manage clients, and
            organize documents — all in one professional platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-forest-600 hover:bg-forest-700 h-12 px-8 text-base"
              >
                Start Free Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base border-forest-200 text-forest-700 hover:bg-forest-50"
              >
                Demo Login
                <MessageSquare className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mb-12">
            Are you a client?{" "}
            <Link href="/portal/login" className="text-forest-600 hover:underline font-medium">
              Access your upload portal →
            </Link>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: "10,000+", label: "CPAs Trust CPA Loft" },
              { value: "2M+", label: "AI Queries Answered" },
              { value: "99.9%", label: "Uptime SLA" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-forest-700">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Preview */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-midnight to-forest-800 rounded-2xl p-1.5 shadow-2xl shadow-forest-900/20">
            <div className="bg-midnight rounded-xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-forest-900/50 border-b border-forest-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 bg-forest-900/60 rounded-md px-3 py-1 text-xs text-forest-300 text-center max-w-sm mx-auto">
                  app.cpaloft.com/dashboard
                </div>
              </div>
              {/* App preview */}
              <div className="flex h-80">
                {/* Sidebar */}
                <div className="w-52 bg-midnight border-r border-forest-800/40 p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-4">
                    <LogoMark size={24} />
                    <span className="font-semibold text-white text-sm font-serif">
                      CPA Loft
                    </span>
                  </div>
                  {[
                    { icon: BarChart3, label: "Dashboard", active: false },
                    { icon: Brain, label: "AI Assistant", active: true },
                    { icon: FileText, label: "Documents", active: false },
                    { icon: Users, label: "Clients", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                        item.active
                          ? "bg-forest-600 text-white"
                          : "text-forest-300 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </div>
                  ))}
                </div>
                {/* Chat area */}
                <div className="flex-1 flex flex-col p-4 gap-3 bg-gray-950">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-forest-800 flex items-center justify-center text-xs text-forest-300 shrink-0">
                      S
                    </div>
                    <div className="bg-forest-900/40 border border-forest-800/30 rounded-lg p-3 text-xs text-gray-300 max-w-xs">
                      What&apos;s the 2024 Section 179 deduction limit?
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-forest-600/20 border border-forest-600/30 rounded-lg p-3 text-xs text-forest-200 max-w-sm">
                      The 2024 Section 179 deduction limit is{" "}
                      <strong>$1,220,000</strong>, with a phase-out beginning at
                      $3,050,000. Bonus depreciation is at 60% for 2024...
                    </div>
                    <div className="w-6 h-6 rounded-full bg-forest-600 flex items-center justify-center text-xs text-white shrink-0">
                      AI
                    </div>
                  </div>
                  <div className="mt-auto bg-forest-900/40 border border-forest-800/30 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-xs text-forest-400">
                      Ask anything about tax law, GAAP, audit standards...
                    </span>
                    <div className="ml-auto w-6 h-6 bg-forest-600 rounded flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-mist/40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4 bg-forest-50 text-forest-700 border-forest-100">
              Features
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything a CPA needs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built from the ground up for accounting professionals. Every
              feature is designed to save you time and deliver better client
              outcomes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-forest-100 transition-all"
              >
                <div
                  className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4 bg-forest-50 text-forest-700 border-forest-100">
              How It Works
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Up and running in minutes
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Lock,
                title: "Create Your Account",
                description:
                  "Sign up in seconds. Choose your plan and get immediate access to all features.",
              },
              {
                step: "02",
                icon: Upload,
                title: "Import Your Documents",
                description:
                  "Upload client documents, tax returns, and financial statements. AI organizes them automatically.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Elevate Your Practice",
                description:
                  "Ask the AI anything, manage clients, and deliver better results faster.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 bg-forest-600 rounded-2xl flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-white border-2 border-forest-600 text-forest-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="py-20 bg-mist/40 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4 bg-forest-50 text-forest-700 border-forest-100">
              Pricing
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free, scale as you grow. All plans include a 14-day free
              trial of Pro features.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-8 border-2 relative ${
                  plan.popular
                    ? "border-forest-600 shadow-xl shadow-forest-100"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-forest-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 mb-1">/month</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle2 className="w-4 h-4 text-forest-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className="block">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-forest-600 hover:bg-forest-700"
                        : "bg-midnight hover:bg-forest-900"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4 bg-forest-50 text-forest-700 border-forest-100">
              Testimonials
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by CPAs nationwide
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:border-forest-100 hover:shadow-md transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {t.author}
                  </div>
                  <div className="text-gray-500 text-xs">{t.firm}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-midnight px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to elevate your practice?
          </h2>
          <p className="text-forest-200 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of CPAs using CPA Loft to deliver better results,
            faster. Start free — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-mint text-midnight hover:bg-mint/90 h-12 px-8 text-base font-semibold"
              >
                Start Free Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-forest-600 text-forest-200 hover:bg-forest-800/40 h-12 px-8 text-base"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <Logo markSize={28} wordmarkSize="sm" variant="light" />
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <Link href="/help" className="hover:text-white transition-colors">
                Help
              </Link>
              <a href="mailto:support@cpaloft.com" className="hover:text-white transition-colors">
                Contact
              </a>
              <Link href="/portal/login" className="hover:text-white transition-colors flex items-center gap-1">
                Client Portal
              </Link>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} CPA Loft. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
