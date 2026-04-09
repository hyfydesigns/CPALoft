"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Brain,
  FileText,
  Users,
  CreditCard,
  Shield,
  Mail,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Upload,
  LogIn,
  Zap,
  Link2,
  ChevronRight,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/ui/logo";

const categories = [
  { id: "getting-started", label: "Getting Started", icon: LogIn, color: "bg-forest-50 text-forest-600" },
  { id: "ai-assistant",    label: "AI Assistant",    icon: Brain,  color: "bg-purple-50 text-purple-600" },
  { id: "documents",       label: "Documents",       icon: FileText, color: "bg-red-50 text-red-600" },
  { id: "client-portal",   label: "Client Portal",   icon: Users,  color: "bg-green-50 text-green-600" },
  { id: "billing",         label: "Billing & Plans", icon: CreditCard, color: "bg-orange-50 text-orange-600" },
  { id: "security",        label: "Security",        icon: Shield, color: "bg-slate-50 text-slate-600" },
];

const faqs: Record<string, { q: string; a: React.ReactNode }[]> = {
  "getting-started": [
    {
      q: "How do I create an account?",
      a: (
        <p>
          Click <strong>Get Started Free</strong> on the homepage or go to{" "}
          <Link href="/signup" className="text-forest-600 hover:underline">/signup</Link>.
          Enter your name, work email, and password — you&apos;ll be in your dashboard within seconds.
          No credit card required for the Free plan.
        </p>
      ),
    },
    {
      q: "Is there a demo I can try without signing up?",
      a: (
        <p>
          Yes. Go to the{" "}
          <Link href="/login" className="text-forest-600 hover:underline">login page</Link> and
          use the pre-filled demo credentials (<strong>demo@cpaloft.com</strong> /{" "}
          <strong>demo1234</strong>) to explore the full app with sample data already loaded.
        </p>
      ),
    },
    {
      q: "What's the difference between the CPA login and the Client Portal?",
      a: (
        <div className="space-y-2">
          <p>There are two separate entry points:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>CPA login</strong> at{" "}
              <Link href="/login" className="text-forest-600 hover:underline">/login</Link> — for
              Certified Public Accountants who subscribe to CPA Loft. Full access to the AI
              assistant, document manager, client management, and analytics.
            </li>
            <li>
              <strong>Client Portal</strong> at{" "}
              <Link href="/portal/login" className="text-forest-600 hover:underline">/portal/login</Link>{" "}
              — for your clients. They can only upload documents to you; they cannot see the AI,
              other clients, or your practice data.
            </li>
          </ul>
        </div>
      ),
    },
    {
      q: "How do I reset my password?",
      a: (
        <p>
          On the login page, click <strong>Forgot password?</strong> next to the password field
          and enter your email address. A reset link will be sent to you. If you don&apos;t see it
          within a few minutes, check your spam folder.
        </p>
      ),
    },
  ],
  "ai-assistant": [
    {
      q: "What can the AI assistant help me with?",
      a: (
        <div className="space-y-2">
          <p>The AI is purpose-built for CPAs and has deep expertise in:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Federal and state tax law (IRC sections, Treasury regs, IRS rulings)</li>
            <li>Tax planning strategies — S-Corp elections, depreciation, QBI, SALT</li>
            <li>US GAAP, IFRS, and government accounting standards</li>
            <li>Audit and assurance (GAAS, PCAOB, SOX)</li>
            <li>BOI/FinCEN reporting, SECURE 2.0, Inflation Reduction Act credits</li>
            <li>Business valuation and forensic accounting concepts</li>
          </ul>
        </div>
      ),
    },
    {
      q: "Does the AI cite its sources?",
      a: (
        <p>
          Yes. The AI is instructed to reference specific IRC sections, Treasury regulations,
          GAAP codification topics, and other authoritative guidance whenever relevant. Always
          verify critical advice against primary sources — the AI will tell you when something
          warrants further research or professional judgment.
        </p>
      ),
    },
    {
      q: "What is the monthly message limit?",
      a: (
        <div className="space-y-1">
          <p>Limits reset on the 1st of each month:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Free</strong> — 10 messages/month</li>
            <li><strong>Pro</strong> — 500 messages/month</li>
            <li><strong>Premium</strong> — Unlimited</li>
          </ul>
          <p className="mt-2 text-gray-500">
            You can track your usage on the Dashboard. When approaching the limit, a banner will
            prompt you to upgrade.
          </p>
        </div>
      ),
    },
    {
      q: "Are my chat conversations saved?",
      a: (
        <p>
          Yes. Every conversation is saved automatically and appears in the left sidebar of the
          AI Assistant page. You can revisit, continue, or delete any past chat at any time.
          Chat history is private to your account.
        </p>
      ),
    },
    {
      q: "Can I use the AI for client-specific tax scenarios?",
      a: (
        <p>
          Absolutely — that&apos;s a primary use case. You can describe a client&apos;s situation
          in detail and ask the AI to analyze it. Avoid including actual SSNs, EINs, or other
          sensitive identifiers in your prompts. Use placeholders like &quot;my client, a
          Texas-based S-Corp with $2M revenue&quot; instead.
        </p>
      ),
    },
  ],
  "documents": [
    {
      q: "What file types can I upload?",
      a: (
        <p>
          CPA Loft accepts <strong>PDF</strong>, <strong>images</strong> (JPG, PNG),{" "}
          <strong>Excel</strong> (.xls, .xlsx), <strong>Word</strong> (.doc, .docx), and{" "}
          <strong>CSV</strong> files. Maximum file size is <strong>10 MB</strong> per file.
          You can upload multiple files at once.
        </p>
      ),
    },
    {
      q: "How do I preview a document?",
      a: (
        <p>
          On the Documents page, click any file card to open the preview modal. PDFs open in
          a full inline viewer with the browser&apos;s native toolbar (zoom, scroll, print).
          Images are displayed directly. For Excel or Word files, use the Download button to
          open them locally.
        </p>
      ),
    },
    {
      q: "Can I link a document to a specific client?",
      a: (
        <p>
          Yes. When uploading, select the client from the <strong>Client</strong> dropdown in
          the upload form. You can also filter the Documents page by client using the filter
          controls. Documents uploaded by clients via the portal are automatically linked to
          their record.
        </p>
      ),
    },
    {
      q: "How do I delete a document?",
      a: (
        <p>
          Hover over any document card — an action toolbar appears with a{" "}
          <strong>trash icon</strong>. Click it to permanently delete the file. This cannot be
          undone. The file is removed from storage immediately.
        </p>
      ),
    },
    {
      q: "What are the storage limits?",
      a: (
        <div>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Free</strong> — 100 MB</li>
            <li><strong>Pro</strong> — 10 GB</li>
            <li><strong>Premium</strong> — 100 GB</li>
          </ul>
          <p className="mt-2 text-gray-500">
            Storage usage is visible on the Dashboard. Upgrade your plan if you&apos;re
            approaching your limit.
          </p>
        </div>
      ),
    },
  ],
  "client-portal": [
    {
      q: "How do I invite a client to the portal?",
      a: (
        <div className="space-y-2">
          <ol className="list-decimal pl-5 space-y-1">
            <li>Go to the <strong>Clients</strong> page in your dashboard.</li>
            <li>Click the <strong>⋯</strong> menu on any client row.</li>
            <li>Select <strong>Invite to Client Portal</strong>.</li>
            <li>Copy the generated link and send it to your client via email or text.</li>
          </ol>
          <p className="text-gray-500">The link expires after 7 days. You can generate a new one at any time.</p>
        </div>
      ),
    },
    {
      q: "What can my clients do in the portal?",
      a: (
        <div className="space-y-2">
          <p>The client portal is intentionally minimal and focused:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Upload documents (PDF, Excel, Word, images — up to 10 MB each)</li>
            <li>Choose a document category (Tax Return, Financial Statement, Payroll, etc.)</li>
            <li>Add a short note for context</li>
            <li>View the list of files they&apos;ve previously uploaded</li>
          </ul>
          <p className="text-gray-500">
            Clients cannot see the AI assistant, other clients&apos; data, your practice
            analytics, or any other CPA-side features.
          </p>
        </div>
      ),
    },
    {
      q: "Where do client uploads appear in my account?",
      a: (
        <p>
          All files uploaded by a client appear in your <strong>Documents</strong> page,
          tagged with the client&apos;s name and marked as &quot;Uploaded by client.&quot;
          They show up immediately — no manual import needed.
        </p>
      ),
    },
    {
      q: "Can a client access the portal more than once?",
      a: (
        <p>
          Yes. Once a client registers via the invite link, they create a persistent account.
          They can log back in anytime at{" "}
          <Link href="/portal/login" className="text-forest-600 hover:underline">/portal/login</Link>{" "}
          using their email and password. You only need to send the invite once.
        </p>
      ),
    },
    {
      q: "What if my client loses their invite link or it expires?",
      a: (
        <p>
          Go to the <strong>Clients</strong> page, click <strong>⋯</strong> on the client row,
          and select <strong>Invite to Client Portal</strong> again. A fresh 7-day link is
          generated instantly. If they already registered, clicking the link will inform them
          to log in instead.
        </p>
      ),
    },
    {
      q: "How many clients can use the portal?",
      a: (
        <div>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Free</strong> — up to 3 clients</li>
            <li><strong>Pro</strong> — up to 50 clients</li>
            <li><strong>Premium</strong> — unlimited</li>
          </ul>
        </div>
      ),
    },
  ],
  "billing": [
    {
      q: "What plans are available?",
      a: (
        <div className="space-y-2">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Free</strong> — $0/mo. 10 AI messages, 5 documents, 3 clients.</li>
            <li><strong>Pro</strong> — $49/mo. 500 AI messages, 100 documents, 50 clients.</li>
            <li><strong>Premium</strong> — $149/mo. Unlimited everything + team seats.</li>
          </ul>
          <p className="text-gray-500">
            All paid plans include a 14-day free trial. See the{" "}
            <Link href="/#pricing" className="text-forest-600 hover:underline">pricing section</Link>{" "}
            for the full feature breakdown.
          </p>
        </div>
      ),
    },
    {
      q: "How do I upgrade my plan?",
      a: (
        <p>
          Go to <strong>Dashboard → Billing & Plans</strong> and click the upgrade button for
          the plan you want. You&apos;ll be taken to a secure Stripe checkout. Your new plan
          takes effect immediately.
        </p>
      ),
    },
    {
      q: "Can I downgrade or cancel at any time?",
      a: (
        <p>
          Yes. There are no long-term contracts. You can downgrade or cancel from the Billing
          page at any time. If you cancel, you retain access until the end of your current
          billing period.
        </p>
      ),
    },
    {
      q: "Is there a discount for annual billing?",
      a: (
        <p>
          Annual billing with a <strong>2 months free</strong> is available on Pro and
          Premium plans. Contact{" "}
          <a href="mailto:support@cpaloft.com" className="text-forest-600 hover:underline">
            support@cpaloft.com
          </a>{" "}
          to switch to annual billing.
        </p>
      ),
    },
  ],
  "security": [
    {
      q: "How is my data stored and protected?",
      a: (
        <p>
          All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Uploaded files
          are stored in isolated, access-controlled storage. Passwords are hashed with bcrypt
          (cost factor 12) — we never store plaintext passwords.
        </p>
      ),
    },
    {
      q: "Can my clients see each other's documents?",
      a: (
        <p>
          No. Every query is scoped to the authenticated user&apos;s ID. A client portal user
          can only see documents they personally uploaded. A CPA can only see their own
          clients and documents. There is no cross-account data access.
        </p>
      ),
    },
    {
      q: "Is CPA Loft suitable for sensitive tax data?",
      a: (
        <p>
          CPA Loft is designed with practitioner confidentiality in mind. We recommend
          following your firm&apos;s data handling policies and applicable state board rules.
          For maximum security, avoid including raw SSNs or full EINs in AI chat prompts —
          use placeholders instead. Uploaded documents are stored securely and only accessible
          by you and the client you link them to.
        </p>
      ),
    },
    {
      q: "What AI model powers the assistant?",
      a: (
        <p>
          CPA Loft uses <strong>Claude by Anthropic</strong> — one of the most capable and
          safety-focused AI models available. Prompts are sent to Anthropic&apos;s API over an
          encrypted connection. Anthropic does not train on API data by default. See{" "}
          <a
            href="https://www.anthropic.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest-600 hover:underline"
          >
            Anthropic&apos;s Privacy Policy
          </a>{" "}
          for details.
        </p>
      ),
    },
  ],
};

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("getting-started");

  const currentFaqs = faqs[activeCategory] ?? [];
  const filteredFaqs = search.trim()
    ? Object.values(faqs)
        .flat()
        .filter((faq) => faq.q.toLowerCase().includes(search.toLowerCase()))
    : currentFaqs;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo markSize={32} wordmarkSize="md" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">CPA Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-forest-600 hover:bg-forest-700">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-forest-50 to-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="info" className="mb-4">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Help Center
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How can we help?
          </h1>
          <p className="text-gray-500 mb-8">
            Guides and answers for CPAs and clients using CPA Loft.
          </p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="pl-12 h-12 text-base rounded-xl border-gray-200 shadow-sm focus:border-forest-600"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {search.trim() ? (
          /* Search results */
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-gray-500 mb-6">
              {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
            </p>
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium text-gray-500">No results found</p>
                <p className="text-sm mt-1">Try different keywords or{" "}
                  <a href="mailto:support@cpaloft.com" className="text-forest-600 hover:underline">
                    contact support
                  </a>
                </p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {filteredFaqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`search-${i}`}
                    className="border border-gray-100 rounded-xl px-5 bg-white shadow-sm"
                  >
                    <AccordionTrigger className="text-left text-gray-900 font-medium hover:no-underline py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Category sidebar */}
            <aside className="lg:w-60 shrink-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Topics
              </p>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                      activeCategory === cat.id
                        ? "bg-forest-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        activeCategory === cat.id ? "bg-white/20" : cat.color
                      }`}
                    >
                      <cat.icon className="w-4 h-4" />
                    </div>
                    {cat.label}
                    <ChevronRight
                      className={`w-4 h-4 ml-auto transition-transform ${
                        activeCategory === cat.id ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                ))}
              </nav>

              {/* Quick links */}
              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Links
                </p>
                <div className="space-y-2 text-sm">
                  {[
                    { href: "/login",         label: "CPA Sign In",      icon: LogIn },
                    { href: "/portal/login",  label: "Client Portal",    icon: Link2 },
                    { href: "/signup",        label: "Create Account",   icon: Zap },
                    { href: "/#pricing",      label: "View Pricing",     icon: CreditCard },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 text-gray-600 hover:text-forest-600 transition-colors"
                    >
                      <link.icon className="w-3.5 h-3.5" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            {/* FAQ content */}
            <main className="flex-1 min-w-0">
              {/* Category header */}
              {(() => {
                const cat = categories.find((c) => c.id === activeCategory)!;
                return (
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{cat.label}</h2>
                      <p className="text-sm text-gray-400">
                        {currentFaqs.length} article{currentFaqs.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <Accordion type="multiple" className="space-y-2">
                {currentFaqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border border-gray-100 rounded-xl px-5 bg-white shadow-sm"
                  >
                    <AccordionTrigger className="text-left text-gray-900 font-medium hover:no-underline py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Still need help */}
              <div className="mt-10 rounded-2xl border border-gray-100 bg-gradient-to-br from-forest-50 to-mist p-6">
                <h3 className="font-semibold text-gray-900 mb-1">Still need help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Can&apos;t find what you&apos;re looking for? Our support team typically
                  responds within one business day.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="mailto:support@cpaloft.com">
                    <Button className="bg-forest-600 hover:bg-forest-700 gap-2">
                      <Mail className="w-4 h-4" />
                      Email Support
                    </Button>
                  </a>
                  <a href="mailto:support@cpaloft.com?subject=Live%20Chat%20Request">
                    <Button variant="outline" className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Live Chat
                    </Button>
                  </a>
                </div>
              </div>
            </main>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <LogoMark size={24} /><span className="font-serif font-semibold text-gray-600">CPA <span className="text-forest-600">Loft</span></span>
            <span>Help Center</span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <Link href="/#pricing" className="hover:text-gray-700 transition-colors">Pricing</Link>
            <Link href="/portal/login" className="hover:text-gray-700 transition-colors">Client Portal</Link>
            <a href="mailto:support@cpaloft.com" className="hover:text-gray-700 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
