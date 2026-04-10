"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
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

  BookOpen,
  ArrowRight,
  Upload,
  LogIn,
  Zap,
  Link2,
  ChevronRight,
  CalendarClock,
  ClipboardList,
  BookmarkCheck,
  Star,
  Pencil,
  Sparkles,
  Palette,
  LayoutTemplate,
  ClipboardCheck,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/ui/logo";

const categories = [
  { id: "getting-started", label: "Getting Started", icon: LogIn, color: "bg-forest-50 text-forest-600" },
  { id: "ai-assistant",    label: "AI Assistant",    icon: Brain,  color: "bg-purple-50 text-purple-600" },
  { id: "documents",       label: "Documents",       icon: FileText, color: "bg-red-50 text-red-600" },
  { id: "client-portal",   label: "Client Portal",   icon: Users,  color: "bg-green-50 text-green-600" },
  { id: "billing",         label: "Billing & Plans", icon: CreditCard, color: "bg-orange-50 text-orange-600" },
  { id: "pro-features",     label: "Pro Features",     icon: Star,     color: "bg-amber-50 text-amber-600" },
  { id: "premium-features", label: "Premium Features", icon: Sparkles, color: "bg-violet-50 text-violet-600" },
  { id: "security",         label: "Security",         icon: Shield,   color: "bg-slate-50 text-slate-600" },
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
    {
      q: "Can I back up and restore my account?",
      a: (
        <div className="space-y-2">
          <p>Yes. CPA Loft supports full account backup and restore:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Go to <strong>Dashboard → Settings → Danger Zone</strong> to download a ZIP backup of your entire account — all clients and their documents included.</li>
            <li>To restore, click <strong>Restore a deleted account from backup</strong> on the login page and upload your ZIP file. A preview shows exactly what will be restored before you confirm.</li>
            <li>Your original password is preserved in the backup so you can sign in immediately after restoring.</li>
          </ul>
          <p className="text-gray-500">Individual client backups work the same way — download a client ZIP before deleting, and restore it from the Clients page at any time.</p>
        </div>
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
        <div className="space-y-2">
          <p>You can preview documents from two places:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Documents page</strong> — click any file card to open the preview modal.</li>
            <li><strong>Dashboard</strong> — click any row in the <strong>Recent Documents</strong> section, or hover over a row and click the <strong>eye icon</strong> that appears on the right.</li>
          </ul>
          <p>PDFs open in a full inline viewer with the browser&apos;s native toolbar (zoom, scroll, print). Images are displayed directly. For Excel or Word files, use the Download button to open them locally.</p>
        </div>
      ),
    },
    {
      q: "Can I link a document to a specific client?",
      a: (
        <div className="space-y-2">
          <p>Yes, in two ways:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>At upload</strong> — select the client from the <strong>Tag upload to</strong> dropdown above the dropzone before uploading.</li>
            <li><strong>After upload</strong> — hover over any document card and click the <strong>pencil (edit) icon</strong> to open the Edit Document dialog, where you can change both the assigned client and the document type/category.</li>
          </ul>
          <p className="text-gray-500">When you assign a document to a client for the first time (or reassign it), they automatically receive an email notification. Documents uploaded by clients via the portal are automatically linked to their record.</p>
        </div>
      ),
    },
    {
      q: "Can I change the document type or category after uploading?",
      a: (
        <div className="space-y-2">
          <p>Yes. Both CPAs and clients can change a document&apos;s category after upload:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>CPA side</strong> — hover over any document card on the Documents page and click the <strong>pencil icon</strong>. The Edit Document dialog lets you update both the document type (Tax Returns, Financial Statements, Payroll, etc.) and the assigned client in one step.</li>
            <li><strong>Client side</strong> — in the Client Portal, each uploaded document has a small <strong>pencil icon</strong> next to its category badge. Click it to reveal an inline dropdown — select the new type and click the checkmark to save.</li>
          </ul>
        </div>
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
          <p>Invites are sent automatically — no manual step required:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Go to <strong>Clients</strong> and click <strong>Add Client</strong>.</li>
            <li>Enter the client&apos;s name and email address and save.</li>
            <li>An invite email is sent to them immediately with a sign-up link. Their status is set to <strong>Pending</strong> until they register.</li>
          </ol>
          <p className="text-gray-500">The invite link expires after 7 days. If it expires or the client didn&apos;t receive it, click <strong>Resend Invite</strong> on their client card to generate and send a fresh link instantly.</p>
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
            <li>Change the document type/category on any previously uploaded file</li>
            <li>Add a short note for context</li>
            <li>View and action pending Document Requests from their CPA (Pro plan)</li>
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
      q: "What happens after my client registers?",
      a: (
        <p>
          Once they complete registration through the invite link, their status automatically
          changes from <strong>Pending</strong> to <strong>Active</strong> and they receive a
          welcome email. They can then log in anytime at{" "}
          <Link href="/portal/login" className="text-forest-600 hover:underline">/portal/login</Link>{" "}
          using their email and password — no new invite needed.
        </p>
      ),
    },
    {
      q: "What if my client loses their invite link or it expires?",
      a: (
        <p>
          Go to the <strong>Clients</strong> page and click <strong>Resend Invite</strong> on
          their client card. A fresh 7-day invite link is generated and emailed to them
          instantly. If they already registered, they should use{" "}
          <Link href="/portal/login" className="text-forest-600 hover:underline">/portal/login</Link>{" "}
          to sign in directly.
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
            <li><strong>Pro</strong> — $49/mo. 500 AI messages, 100 documents, 50 clients, 10 GB storage. Includes Document Requests, Tax Deadline Tracker, Client Notes, Saved AI Prompts, and Bulk Download.</li>
            <li><strong>Premium</strong> — $149/mo. Unlimited everything, 100 GB storage. All Pro features plus Custom Portal Branding, AI Document Insights, Deadline Templates, Practice Digest Email, and Client Reports.</li>
          </ul>
          <p className="text-gray-500">
            See the{" "}
            <Link href="/#pricing" className="text-forest-600 hover:underline">pricing section</Link>{" "}
            for the full feature breakdown.
          </p>
        </div>
      ),
    },
    {
      q: "How do I upgrade my plan?",
      a: (
        <div className="space-y-2">
          <p>
            Go to <strong>Dashboard → Billing & Plans</strong> and click the upgrade button for
            the plan you want.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>New subscribers</strong> are taken to a secure Stripe checkout to enter payment details.</li>
            <li><strong>Existing subscribers</strong> upgrading or downgrading between paid plans are switched in place — no checkout page. The prorated difference is charged or credited immediately.</li>
          </ul>
          <p className="text-gray-500">Your new plan takes effect immediately in both cases.</p>
        </div>
      ),
    },
    {
      q: "What happens to my data if I downgrade?",
      a: (
        <div className="space-y-2">
          <p>
            <strong>Nothing is deleted.</strong> All your existing clients and documents are
            kept exactly as they are.
          </p>
          <p>
            If you&apos;re over the lower plan&apos;s limits, you&apos;ll see a warning banner
            on the affected pages and won&apos;t be able to add new clients or upload new
            documents until you&apos;re back under the limit — either by upgrading again or
            removing some records.
          </p>
          <p className="text-gray-500">We will never delete your data due to a plan change.</p>
        </div>
      ),
    },
    {
      q: "Can I cancel at any time?",
      a: (
        <p>
          Yes. There are no long-term contracts. Click <strong>Manage Subscription</strong> on
          the Billing page to cancel via the Stripe portal. You retain full access until the
          end of your current billing period, then your account switches to the Free plan.
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
  "pro-features": [
    {
      q: "What features are exclusive to Pro and Premium plans?",
      a: (
        <div className="space-y-2">
          <p>Pro and Premium plans unlock these practice management tools:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Document Requests</strong> — Request specific documents from clients with due dates</li>
            <li><strong>Tax Deadline Tracker</strong> — Track every filing deadline across all clients</li>
            <li><strong>Client Notes & Activity Timeline</strong> — Pin notes and view a full audit trail per client</li>
            <li><strong>Saved AI Prompts</strong> — Save and reuse your best AI research prompts</li>
            <li><strong>Bulk Document Download</strong> — Export all documents for a client as a ZIP</li>
          </ul>
          <p className="text-gray-500">All features are available on both Pro and Premium. Premium adds unlimited usage, higher storage, and team seats.</p>
        </div>
      ),
    },
    {
      q: "How do Document Requests work?",
      a: (
        <div className="space-y-2">
          <p>Document Requests let you tell clients exactly what you need, without back-and-forth emails:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Open a client&apos;s detail panel on the <strong>Clients</strong> page and click the <strong>Requests</strong> tab.</li>
            <li>Click <strong>New Request</strong>, enter a title, optional description, and due date.</li>
            <li>The client sees a checklist of all pending requests at the top of their portal the next time they log in.</li>
            <li>They upload the document and click <strong>Mark Done</strong> — the request status updates to <strong>Fulfilled</strong> on your end.</li>
          </ol>
          <p className="text-gray-500">You can track all pending and fulfilled requests directly in the client&apos;s Requests tab.</p>
        </div>
      ),
    },
    {
      q: "How does the Tax Deadline Tracker work?",
      a: (
        <div className="space-y-2">
          <p>The <strong>Deadlines</strong> page (accessible from the sidebar) gives you a centralized view of all filing deadlines across every client.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Add a deadline by clicking <strong>Add Deadline</strong> — select a client, choose a form type (quick-fill buttons for 1040, 1120S, 1065, extensions), and set a due date.</li>
            <li>Deadlines are color-coded: upcoming (blue), overdue (red), completed (green).</li>
            <li>Enable the <strong>Reminder</strong> toggle to receive an email reminder before the deadline.</li>
            <li>Filter by status using the tabs at the top of the page.</li>
            <li>You can also manage deadlines for a specific client in the <strong>Deadlines</strong> tab of their detail panel.</li>
          </ul>
        </div>
      ),
    },
    {
      q: "How do Client Notes and the Activity Timeline work?",
      a: (
        <div className="space-y-2">
          <p>Open any client&apos;s detail panel on the <strong>Clients</strong> page to access two tabs:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Notes tab</strong> — Write and save notes about the client. Pin important notes to the top. Notes are private to your account.</li>
            <li><strong>Activity tab</strong> — An automatic audit trail that logs key events: when the client was added, every document uploaded (by you or the client), document requests created, and more. Timestamps and metadata are recorded automatically.</li>
          </ul>
        </div>
      ),
    },
    {
      q: "How do I save and reuse AI prompts?",
      a: (
        <div className="space-y-2">
          <p>In the <strong>AI Assistant</strong>, you can build a personal library of prompts:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Save a prompt</strong> — hover over any of your messages and click the bookmark icon. Give it a title and save.</li>
            <li><strong>Reuse a prompt</strong> — saved prompts appear in the left sidebar under <strong>Saved Prompts</strong>. Click one to instantly paste it into the message box.</li>
            <li><strong>Delete a prompt</strong> — hover over a saved prompt in the sidebar and click the trash icon.</li>
          </ul>
          <p className="text-gray-500">Great for tax research templates, standard client scenario formats, or any prompt you use regularly.</p>
        </div>
      ),
    },
    {
      q: "How do I download all documents for a client?",
      a: (
        <p>
          On the <strong>Clients</strong> page, click the <strong>three-dot menu (⋯)</strong> on any client row and select <strong>Download All Documents</strong>. A ZIP file is generated and downloaded containing all active documents for that client, plus a <strong>client.json</strong> metadata file with document details and client info. This is also available as <strong>Download Backup ZIP</strong> when you go to delete a client, giving you a chance to save records before removing them.
        </p>
      ),
    },
  ],
  "premium-features": [
    {
      q: "What features are exclusive to the Premium plan?",
      a: (
        <div className="space-y-2">
          <p>Premium unlocks these advanced features on top of everything in Pro:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Custom Portal Branding</strong> — show your firm logo and name in your clients&apos; portal</li>
            <li><strong>AI Document Insights</strong> — analyze any document with AI directly from the preview modal</li>
            <li><strong>Deadline Templates</strong> — create reusable deadline sets and apply them to multiple clients at once</li>
            <li><strong>Practice Digest Email</strong> — send yourself an on-demand summary of upcoming deadlines, pending requests, and recent uploads</li>
            <li><strong>Client Report</strong> — generate a print-optimized summary per client for meetings and handoffs</li>
          </ul>
        </div>
      ),
    },
    {
      q: "How do I set up custom portal branding?",
      a: (
        <div className="space-y-2">
          <p>Go to <strong>Dashboard → Settings</strong> and scroll to the <strong>Portal Branding</strong> section (visible on Premium only):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Firm display name</strong> — enter the name you want clients to see in their portal header instead of &quot;CPA Loft&quot;.</li>
            <li><strong>Firm logo</strong> — click <strong>Upload Logo</strong> to choose a JPG or PNG (max 2 MB). The logo replaces the default CPA Loft mark in the portal header.</li>
            <li>Click <strong>Save Branding</strong> to apply. Changes are reflected immediately for all clients next time they load their portal.</li>
          </ul>
          <p className="text-gray-500">To remove the logo, click the <strong>Remove</strong> button next to the current logo preview.</p>
        </div>
      ),
    },
    {
      q: "How does AI Document Insights work?",
      a: (
        <div className="space-y-2">
          <p>On the <strong>Documents</strong> page or the <strong>Dashboard</strong> Recent Documents section, open any document preview. If you&apos;re on the Premium plan, an <strong>Analyze with AI</strong> button appears in the top-right corner of the modal.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Clicking it creates a new AI chat pre-loaded with the document&apos;s name, type, category, client, and upload date.</li>
            <li>The AI is prompted to summarize what the document likely contains, highlight key financial or tax information, and suggest action items.</li>
            <li>You&apos;re taken directly to the AI Assistant with that chat open — ready to ask follow-up questions.</li>
          </ul>
        </div>
      ),
    },
    {
      q: "How do Deadline Templates work?",
      a: (
        <div className="space-y-2">
          <p>Templates let you define a standard set of deadlines once and apply them to any number of clients instantly.</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>On the <strong>Deadlines</strong> page, click the <strong>Templates</strong> button in the header.</li>
            <li>Switch to the <strong>Create Template</strong> tab. Enter a template name (e.g. &quot;Individual Annual Pack&quot;) and add items — each item has a label, month, day, and optional reminder toggle.</li>
            <li>Save the template. It appears in the <strong>My Templates</strong> tab.</li>
            <li>Click <strong>Apply</strong> on any template, select a target year and which clients to apply it to, then click <strong>Create Deadlines</strong>.</li>
          </ol>
          <p className="text-gray-500">The deadlines are created immediately and appear on the Deadlines page and in each client&apos;s Deadlines tab.</p>
        </div>
      ),
    },
    {
      q: "How do I send a Practice Digest email?",
      a: (
        <p>
          On the <strong>Dashboard</strong>, click <strong>Practice Digest</strong> in the Quick Actions card. An email is sent immediately to your account&apos;s email address summarizing: upcoming deadlines in the next 14 days, all pending document requests, and recent uploads in the last 7 days. The digest includes a link back to your dashboard. This is an on-demand action — there is no automatic scheduled sending.
        </p>
      ),
    },
    {
      q: "How do I generate a Client Report?",
      a: (
        <div className="space-y-2">
          <p>On the <strong>Clients</strong> page, click the <strong>three-dot menu (⋯)</strong> on any client row and select <strong>View Report</strong>. This opens a dedicated report page for that client with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Client info (name, company, email, phone, tax ID, status)</li>
            <li>All active documents with type and upload date</li>
            <li>All deadlines sorted by due date with status badges</li>
            <li>Pending document requests</li>
            <li>Client notes (pinned first)</li>
            <li>Activity timeline (last 15 entries)</li>
          </ul>
          <p className="text-gray-500">Click <strong>Print Report</strong> in the top-right corner to open the browser print dialog. The layout is optimized for print — navigation and action buttons are hidden automatically.</p>
        </div>
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
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
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
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm" className="bg-forest-600 hover:bg-forest-700 gap-1.5">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">CPA Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-forest-600 hover:bg-forest-700">Get Started Free</Button>
                </Link>
              </>
            )}
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
                    isLoggedIn
                      ? { href: "/dashboard", label: "Go to Dashboard", icon: LogIn }
                      : { href: "/login",     label: "CPA Sign In",     icon: LogIn },
                    { href: "/portal/login",  label: "Client Portal",   icon: Link2 },
                    ...(!isLoggedIn ? [{ href: "/signup", label: "Create Account", icon: Zap }] : []),
                    { href: "/#pricing",      label: "View Pricing",    icon: CreditCard },
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
