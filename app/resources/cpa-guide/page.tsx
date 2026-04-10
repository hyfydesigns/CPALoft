"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function CPAGuidePage() {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">CPA Loft — Solo CPA User Guide</h1>
          <p className="text-xs text-gray-400">Use your browser&apos;s Print dialog to save as PDF</p>
        </div>
        <Button size="sm" onClick={handlePrint} className="gap-1.5 bg-forest-700 hover:bg-forest-800 text-white">
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </Button>
      </div>

      {/* Printable content */}
      <div
        ref={printRef}
        className="max-w-[780px] mx-auto px-8 py-10 text-gray-800 text-[13px] leading-relaxed print:px-0 print:py-0 print:text-[11pt]"
      >
        {/* Cover */}
        <div className="mb-10 border-b-2 border-forest-700 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-forest-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-forest-700">CPA Loft</p>
              <p className="text-xs text-gray-400">Practice Management Platform</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Solo CPA User Guide</h1>
          <p className="text-gray-500">
            A complete reference for managing your practice — clients, documents, deadlines, AI assistant, and client portal.
          </p>
          <p className="text-xs text-gray-400 mt-3">Version 1.0 · April 2026</p>
        </div>

        {/* Table of Contents */}
        <Section title="Contents">
          <ol className="list-decimal list-inside space-y-1 text-gray-600">
            {[
              "Getting Started & Account Setup",
              "Client Management",
              "Document Management",
              "Tax Deadlines & Reminders",
              "Client Portal",
              "AI Assistant",
              "Billing & Plan Management",
              "Keyboard Shortcuts & Tips",
            ].map((item, i) => (
              <li key={i} className="text-sm">{item}</li>
            ))}
          </ol>
        </Section>

        {/* 1 */}
        <Section num={1} title="Getting Started & Account Setup">
          <SubSection title="Logging In">
            <p>Navigate to your CPA Loft URL and sign in with your registered email address and password. If you forget your password, use <strong>Forgot Password</strong> on the sign-in page to receive a reset link.</p>
          </SubSection>
          <SubSection title="Completing Your Profile">
            <p>Go to <strong>Settings</strong> (bottom-left sidebar) and fill in:</p>
            <ul>
              <li><strong>Full Name</strong> — shown on reports and emails</li>
              <li><strong>Firm Name</strong> — shown on the client portal header</li>
              <li><strong>Phone Number</strong> — optional contact detail</li>
              <li><strong>CPA Licence Number</strong> — for professional reference</li>
            </ul>
            <p>Click <strong>Save Changes</strong> when done.</p>
          </SubSection>
          <SubSection title="Setup Checklist">
            <p>Your dashboard shows a <strong>Getting Started</strong> checklist with 6 steps. Work through each step to get your practice fully configured:</p>
            <ol>
              <li>Complete your firm profile</li>
              <li>Add your first client</li>
              <li>Upload a document</li>
              <li>Set a tax deadline</li>
              <li>Invite a client to their portal</li>
              <li>Try the AI Assistant</li>
            </ol>
            <p>Each step links directly to the relevant section. You can dismiss the checklist once you are comfortable with the platform.</p>
          </SubSection>
        </Section>

        {/* 2 */}
        <Section num={2} title="Client Management">
          <SubSection title="Adding a Client">
            <p>Go to <strong>Clients → New Client</strong> and fill in the client form:</p>
            <ul>
              <li><strong>Name</strong> (required)</li>
              <li>Email, phone, company, and tax ID (optional but recommended)</li>
              <li>Status: Active, Inactive, or Pending</li>
              <li>Internal notes</li>
            </ul>
            <p>Click <strong>Create Client</strong>. The client now appears in your Clients list.</p>
          </SubSection>
          <SubSection title="Client Profile">
            <p>Click any client to open their full profile. You will find:</p>
            <ul>
              <li><strong>Documents tab</strong> — all files linked to this client</li>
              <li><strong>Deadlines tab</strong> — their upcoming and past tax deadlines</li>
              <li><strong>Document Requests tab</strong> — items you have asked them to provide</li>
              <li><strong>Notes tab</strong> — internal notes (can be pinned)</li>
              <li><strong>Activity tab</strong> — full audit log of actions</li>
            </ul>
          </SubSection>
          <SubSection title="Client Report (Premium)">
            <p>On any client profile, click <strong>Generate Report</strong> to produce a printable summary covering their info, documents, deadlines, requests, and activity. Open the report in a new tab and print or save as PDF.</p>
          </SubSection>
          <SubSection title="Exporting Clients">
            <p>Go to <strong>Clients</strong> and click <strong>Export CSV</strong> to download all client records as a spreadsheet.</p>
          </SubSection>
        </Section>

        {/* 3 */}
        <Section num={3} title="Document Management">
          <SubSection title="Uploading a Document">
            <p>Go to <strong>Documents → Upload Document</strong>. Select a file (PDF, Word, Excel, or image — up to 10 MB), then choose:</p>
            <ul>
              <li><strong>Document Category</strong> — Tax Return, W-2, 1099, Invoice, Bank Statement, etc.</li>
              <li><strong>Assign to Client</strong> — links the document to a client record</li>
            </ul>
            <p>Click <strong>Upload</strong>. The document appears in your Documents list immediately.</p>
          </SubSection>
          <SubSection title="Editing a Document">
            <p>Click the <strong>pencil icon</strong> on any document card to change its category or re-assign it to a different client.</p>
          </SubSection>
          <SubSection title="Viewing a Document">
            <p>Click any document card (or the <strong>eye icon</strong> that appears on hover) to open a full-screen preview. PDF files are rendered inline. Images are displayed directly. Other file types can be downloaded.</p>
          </SubSection>
          <SubSection title="Requesting Documents from Clients (Pro)">
            <p>Open a client profile and go to the <strong>Document Requests</strong> tab. Click <strong>New Request</strong> and provide a title, optional description, and optional due date. The client will see the request in their portal and can upload a file to fulfil it.</p>
          </SubSection>
          <SubSection title="AI Document Analysis (Premium)">
            <p>Open any PDF from the Documents page and click <strong>Analyse with AI</strong>. The platform extracts the document text (using OCR for scanned PDFs) and opens an AI chat pre-loaded with the content. The AI will summarise the document, highlight key figures, identify action items, and flag anything unusual.</p>
          </SubSection>
        </Section>

        {/* 4 */}
        <Section num={4} title="Tax Deadlines & Reminders">
          <SubSection title="Creating a Deadline">
            <p>Go to <strong>Tax Deadlines → New Deadline</strong>. Fill in:</p>
            <ul>
              <li><strong>Client</strong> — select from your client list</li>
              <li><strong>Label</strong> — e.g. "Q2 Estimated Tax", "Form 1040 Filing"</li>
              <li><strong>Due Date</strong></li>
              <li><strong>Enable Reminder</strong> — you will receive an email reminder before the due date</li>
              <li><strong>Notes</strong> — optional internal notes</li>
            </ul>
          </SubSection>
          <SubSection title="Managing Deadlines">
            <p>The Tax Deadlines page shows all deadlines sorted by date with colour-coded status: <strong>Upcoming</strong> (blue), <strong>Overdue</strong> (red), and <strong>Completed</strong> (green). Click any deadline to edit or mark it as complete.</p>
          </SubSection>
          <SubSection title="Deadline Templates (Pro)">
            <p>Go to <strong>Settings → Deadline Templates</strong> to create reusable sets of deadlines. For example, an <em>Annual Filing Package</em> template might contain Form 1040, State Return, and Estimated Taxes. Apply a template to any client in one click — all deadlines are created instantly with the correct dates for the selected year.</p>
          </SubSection>
        </Section>

        {/* 5 */}
        <Section num={5} title="Client Portal">
          <SubSection title="Enabling the Portal">
            <p>Open a client record and click <strong>Enable Portal</strong>. An invitation email is sent to the client&apos;s email address with a secure link. They set their own password and gain access to their personal portal.</p>
          </SubSection>
          <SubSection title="What Clients Can Do in the Portal">
            <ul>
              <li>View and download documents you have shared with them</li>
              <li>Upload documents directly (you will be notified)</li>
              <li>View and fulfil document requests you have created</li>
              <li>Change the category of documents they have uploaded</li>
            </ul>
          </SubSection>
          <SubSection title="Custom Portal Branding (Premium)">
            <p>Go to <strong>Settings → Branding</strong> to upload your firm logo and set a display name. These appear in the portal header, replacing the default CPA Loft branding.</p>
          </SubSection>
        </Section>

        {/* 6 */}
        <Section num={6} title="AI Assistant">
          <SubSection title="Starting a Conversation">
            <p>Click <strong>AI Assistant</strong> in the sidebar. Type any question in the input box and press <strong>Enter</strong> or click <strong>Send</strong>. The AI responds with formatted text including bullet points, tables, and headings where appropriate.</p>
          </SubSection>
          <SubSection title="Saved Prompts">
            <p>Click the <strong>Saved Prompts</strong> button to store frequently used questions. Give each prompt a title and content, then click it any time to pre-fill the input box.</p>
          </SubSection>
          <SubSection title="Chat History">
            <p>All your past conversations are listed in the left panel. Click any conversation to resume it. Conversations are titled automatically based on your first message.</p>
          </SubSection>
          <SubSection title="AI Usage Limits">
            <p>Your dashboard shows your AI usage for the current month. Free plan: 10 messages. Pro plan: 100 messages. Premium plan: unlimited.</p>
          </SubSection>
        </Section>

        {/* 7 */}
        <Section num={7} title="Billing & Plan Management">
          <SubSection title="Viewing Your Plan">
            <p>Go to <strong>Billing</strong> in the sidebar to see your current plan, features included, and renewal date.</p>
          </SubSection>
          <SubSection title="Upgrading">
            <p>Click <strong>Upgrade</strong> next to the plan you want. You will be taken to a secure Stripe checkout. After payment, your plan is activated immediately and you are redirected to your dashboard.</p>
          </SubSection>
          <SubSection title="Plan Comparison">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th>Pro</th>
                  <th>Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Clients", "5", "Unlimited", "Unlimited"],
                  ["Documents", "25", "Unlimited", "Unlimited"],
                  ["AI Messages/month", "10", "100", "Unlimited"],
                  ["Document Requests", "—", "✓", "✓"],
                  ["Deadline Templates", "—", "✓", "✓"],
                  ["Client Report", "—", "✓", "✓"],
                  ["Bulk Export", "—", "✓", "✓"],
                  ["AI Document Analysis", "—", "—", "✓"],
                  ["Custom Portal Branding", "—", "—", "✓"],
                  ["Practice Digest Email", "—", "—", "✓"],
                ].map(([feature, free, pro, premium]) => (
                  <tr key={feature}>
                    <td>{feature}</td>
                    <td>{free}</td>
                    <td>{pro}</td>
                    <td>{premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SubSection>
        </Section>

        {/* 8 */}
        <Section num={8} title="Keyboard Shortcuts & Tips">
          <SubSection title="Navigation">
            <table>
              <tbody>
                {[
                  ["Click sidebar item", "Navigate to section"],
                  ["Click any stat card on dashboard", "Jump to that section"],
                  ["Click document card / eye icon", "Open document preview"],
                  ["Esc", "Close any open dialog or modal"],
                ].map(([key, action]) => (
                  <tr key={key}>
                    <td><code>{key}</code></td>
                    <td>{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SubSection>
          <SubSection title="Pro Tips">
            <ul>
              <li>Use the <strong>Getting Started</strong> checklist on your dashboard to track onboarding progress — each step links directly to the relevant feature.</li>
              <li>Pin important client notes so they appear at the top of the Notes tab.</li>
              <li>Add a due date when creating document requests to help clients prioritise.</li>
              <li>The Practice Digest email (Premium) gives you a weekly summary of overdue deadlines and outstanding requests — great for staying on top of your workload.</li>
              <li>Use <strong>Saved Prompts</strong> in the AI Assistant to build a personal library of tax questions you ask regularly.</li>
            </ul>
          </SubSection>
        </Section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
          <span>CPA Loft · Solo CPA User Guide · v1.0</span>
          <span>For support, visit the Help Centre in your dashboard</span>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { font-size: 11pt; }
          h2 { page-break-before: always; }
          h2:first-of-type { page-break-before: avoid; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #d1d5db; padding: 4px 8px; text-align: left; }
          th { background: #f3f4f6; font-weight: 600; }
          tr:nth-child(even) { background: #f9fafb; }
          ul, ol { padding-left: 1.4em; }
          li { margin-bottom: 2px; }
          code { background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-family: monospace; }
        }
      `}</style>
    </>
  );
}

function Section({ num, title, children }: { num?: number; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 border-b-2 border-forest-700 pb-1 mb-4">
        {num ? `${num}. ` : ""}{title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-1.5">{title}</h3>
      <div className="text-gray-600 space-y-1.5 pl-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-0.5 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-1.5 [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs">
        {children}
      </div>
    </div>
  );
}
