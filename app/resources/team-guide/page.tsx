"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function TeamGuidePage() {
  const printRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Print button */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">CPA Loft — Team &amp; Staff Training Guide</h1>
          <p className="text-xs text-gray-400">Use your browser&apos;s Print dialog to save as PDF</p>
        </div>
        <Button
          size="sm"
          onClick={() => window.print()}
          className="gap-1.5 bg-forest-700 hover:bg-forest-800 text-white"
        >
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team &amp; Staff Training Guide</h1>
          <p className="text-gray-500">
            For CPA firms onboarding multiple team members. Covers role responsibilities, day-to-day workflows, and best practices for using CPA Loft as a team.
          </p>
          <p className="text-xs text-gray-400 mt-3">Version 1.0 · April 2026</p>
        </div>

        {/* Table of Contents */}
        <Section title="Contents">
          <ol className="list-decimal list-inside space-y-1 text-gray-600">
            {[
              "Platform Overview for New Staff",
              "Roles & Responsibilities",
              "Daily Workflows",
              "Client Management Best Practices",
              "Document Handling Standards",
              "Tax Deadline Tracking",
              "Client Portal — Staff Guide",
              "AI Assistant Guidelines",
              "Data Security & Confidentiality",
              "Common Questions & Troubleshooting",
            ].map((item, i) => (
              <li key={i} className="text-sm">{item}</li>
            ))}
          </ol>
        </Section>

        {/* 1 */}
        <Section num={1} title="Platform Overview for New Staff">
          <p>CPA Loft is your firm&apos;s practice management platform. Everything related to your clients — documents, deadlines, notes, communications — lives here. As a staff member, you will use it daily to:</p>
          <ul>
            <li>Look up client records and history</li>
            <li>Upload and manage documents</li>
            <li>Track and update tax deadlines</li>
            <li>Communicate with clients through document requests</li>
            <li>Use the AI Assistant for research and drafting</li>
          </ul>
          <SubSection title="Logging In">
            <p>You will receive a login invitation from your firm administrator. Click the link in the email, set your password, and bookmark your firm&apos;s CPA Loft URL. Use your work email and password each time you sign in. If you are locked out, use <strong>Forgot Password</strong> on the sign-in page.</p>
          </SubSection>
          <SubSection title="Navigating the Platform">
            <p>The left sidebar contains your main navigation:</p>
            <ul>
              <li><strong>Dashboard</strong> — overview of stats, recent documents, and quick actions</li>
              <li><strong>Clients</strong> — full client list and individual profiles</li>
              <li><strong>Documents</strong> — all uploaded files across all clients</li>
              <li><strong>Tax Deadlines</strong> — deadline tracker</li>
              <li><strong>AI Assistant</strong> — AI chat for research and analysis</li>
              <li><strong>Settings</strong> — account and firm settings (admin only for some sections)</li>
            </ul>
          </SubSection>
        </Section>

        {/* 2 */}
        <Section num={2} title="Roles & Responsibilities">
          <SubSection title="Firm Administrator (Lead CPA)">
            <ul>
              <li>Owns the CPA Loft account and billing</li>
              <li>Configures firm branding and settings</li>
              <li>Invites clients to the portal</li>
              <li>Reviews AI-generated document analyses</li>
              <li>Manages plan upgrades</li>
            </ul>
          </SubSection>
          <SubSection title="Staff CPA / Associate">
            <ul>
              <li>Manages assigned client files and documents</li>
              <li>Creates and updates tax deadlines</li>
              <li>Sends document requests to clients</li>
              <li>Uploads and categorises documents received from clients</li>
              <li>Uses the AI Assistant for research and drafting</li>
            </ul>
          </SubSection>
          <SubSection title="Administrative Staff">
            <ul>
              <li>Uploads client-provided documents</li>
              <li>Tracks document request status</li>
              <li>Updates client contact information</li>
              <li>Monitors upcoming deadlines and flags overdue items</li>
            </ul>
          </SubSection>
        </Section>

        {/* 3 */}
        <Section num={3} title="Daily Workflows">
          <SubSection title="Morning Check-in (5 minutes)">
            <ol>
              <li>Log in and check the <strong>Dashboard</strong> for any overdue deadlines (red badges).</li>
              <li>Review the <strong>Recent Documents</strong> section for any new uploads from clients.</li>
              <li>Check <strong>Tax Deadlines</strong> for items due within the next 7 days.</li>
            </ol>
          </SubSection>
          <SubSection title="Processing Incoming Documents">
            <ol>
              <li>Client uploads appear automatically in the <strong>Documents</strong> list tagged with the client name.</li>
              <li>Open the document to verify it is the correct file.</li>
              <li>If the category is incorrect, click the <strong>pencil icon</strong> to update it.</li>
              <li>If the document fulfils a document request, mark the request as complete in the client&apos;s profile.</li>
              <li>Add a note in the client&apos;s <strong>Notes</strong> tab if the document requires follow-up.</li>
            </ol>
          </SubSection>
          <SubSection title="Sending a Document Request">
            <ol>
              <li>Open the client&apos;s profile.</li>
              <li>Go to the <strong>Document Requests</strong> tab.</li>
              <li>Click <strong>New Request</strong>, enter a clear title (e.g., "2025 W-2 — All Employers"), an optional description, and a due date.</li>
              <li>Click <strong>Create Request</strong>. The client sees this in their portal immediately.</li>
            </ol>
          </SubSection>
          <SubSection title="Marking a Deadline Complete">
            <ol>
              <li>Go to <strong>Tax Deadlines</strong>.</li>
              <li>Find the deadline (use the client name or label to search).</li>
              <li>Click the deadline and select <strong>Mark Complete</strong>.</li>
              <li>The deadline turns green and is moved to the completed section.</li>
            </ol>
          </SubSection>
        </Section>

        {/* 4 */}
        <Section num={4} title="Client Management Best Practices">
          <ul>
            <li><strong>Keep contact details current.</strong> If a client changes their email or phone, update it in their profile immediately so portal invites and reminders reach them.</li>
            <li><strong>Use the Status field.</strong> Mark clients as Inactive when they are no longer active. They remain in the system for historical reference but are excluded from active counts.</li>
            <li><strong>Pin important notes.</strong> Use the pin feature in the Notes tab for information that every team member needs to see quickly (e.g., "Client only emails — do not call").</li>
            <li><strong>Add notes after every significant interaction.</strong> Note what was discussed, what was received, or what is pending. This creates a shared knowledge base for the whole team.</li>
            <li><strong>Use the Activity Log as a record.</strong> The Activity tab shows every action taken on a client — documents uploaded, requests created, deadlines changed. Reference this before client meetings.</li>
          </ul>
        </Section>

        {/* 5 */}
        <Section num={5} title="Document Handling Standards">
          <SubSection title="Naming Conventions">
            <p>Use the <strong>category field</strong> in CPA Loft rather than encoding information in filenames. The original filename is preserved, so you can always refer to it. Assign the correct category on upload:</p>
            <table>
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>Category to Use</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Form 1040, 1120, 1065, etc.", "Tax Return"],
                  ["W-2 from employer", "W-2"],
                  ["1099-NEC, 1099-INT, 1099-DIV", "1099"],
                  ["Bank or mortgage statement", "Bank Statement"],
                  ["Vendor or client invoice", "Invoice"],
                  ["Pay stub or payroll record", "Payroll"],
                  ["ID, passport, SSN card", "Identity Document"],
                  ["Anything else", "General"],
                ].map(([doc, cat]) => (
                  <tr key={doc}>
                    <td>{doc}</td>
                    <td>{cat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SubSection>
          <SubSection title="Security Guidelines">
            <ul>
              <li>Never share your login credentials with another person.</li>
              <li>Do not download client documents to personal devices.</li>
              <li>Do not send client documents via personal email — always use the portal or document requests.</li>
              <li>If a client sends documents to your personal email, upload them to CPA Loft and delete the email copy.</li>
            </ul>
          </SubSection>
        </Section>

        {/* 6 */}
        <Section num={6} title="Tax Deadline Tracking">
          <SubSection title="Colour-coded Status">
            <table>
              <thead>
                <tr><th>Colour</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {[
                  ["Blue", "Upcoming", "Monitor — due in the future"],
                  ["Red", "Overdue", "Immediate attention required"],
                  ["Green", "Completed", "No action needed"],
                ].map(([color, status, action]) => (
                  <tr key={status}>
                    <td>{color}</td>
                    <td>{status}</td>
                    <td>{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SubSection>
          <SubSection title="Deadline Templates (Pro)">
            <p>Your administrator may have set up templates for common deadline packages. When onboarding a new client, ask your administrator if a template applies (e.g., <em>Annual Individual Filing</em>) and they can apply it in one click, creating all relevant deadlines at once.</p>
          </SubSection>
          <SubSection title="Reminders">
            <p>Reminders are sent to the account email address. If you are not receiving reminders, check your spam folder and ensure reminders are enabled on the deadline record.</p>
          </SubSection>
        </Section>

        {/* 7 */}
        <Section num={7} title="Client Portal — Staff Guide">
          <SubSection title="What the Portal Does">
            <p>The client portal gives each client a private, branded web page where they can upload documents, view files shared with them, and respond to document requests — without needing to email anything.</p>
          </SubSection>
          <SubSection title="Sending a Portal Invitation">
            <p>Only the firm administrator can send portal invitations. If a client needs access, ask your administrator to open the client profile and click <strong>Enable Portal</strong>.</p>
          </SubSection>
          <SubSection title="Monitoring Portal Activity">
            <p>When a client uploads a document via the portal, it appears in the <strong>Documents</strong> list tagged with their name. Check the Activity Log on the client&apos;s profile for a full record of portal activity.</p>
          </SubSection>
        </Section>

        {/* 8 */}
        <Section num={8} title="AI Assistant Guidelines">
          <SubSection title="Appropriate Use">
            <p>The AI Assistant is a powerful research and drafting tool. Use it for:</p>
            <ul>
              <li>Answering tax code questions ("What are the 2025 standard deduction amounts?")</li>
              <li>Drafting client emails or reminder messages</li>
              <li>Summarising complex regulations in plain language</li>
              <li>Analysing uploaded documents (Premium) to identify key figures</li>
            </ul>
          </SubSection>
          <SubSection title="Important Limitations">
            <ul>
              <li>AI responses are a starting point — always verify against official IRS/state guidance before advising a client.</li>
              <li>Do not input confidential client PII (SSN, account numbers) into the AI chat.</li>
              <li>AI chat history is private to each user account — your conversations are not visible to other staff.</li>
            </ul>
          </SubSection>
          <SubSection title="Saved Prompts">
            <p>Each staff member can save their own frequently used prompts. Your administrator may share standard firm prompts (e.g., standard client communication templates) — ask them to share the text so you can save it in your own account.</p>
          </SubSection>
        </Section>

        {/* 9 */}
        <Section num={9} title="Data Security & Confidentiality">
          <ul>
            <li><strong>Lock your screen</strong> when stepping away from your workstation.</li>
            <li><strong>Do not share your login</strong> under any circumstances.</li>
            <li><strong>Report any suspected unauthorised access</strong> to your firm administrator immediately.</li>
            <li>All data is encrypted in transit (HTTPS) and at rest.</li>
            <li>Client portal links expire after 7 days if unused. If a client says their invite expired, ask your administrator to resend it.</li>
            <li>When a staff member leaves the firm, the administrator should immediately update or remove their access by contacting CPA Loft support.</li>
          </ul>
        </Section>

        {/* 10 */}
        <Section num={10} title="Common Questions & Troubleshooting">
          <table>
            <thead>
              <tr>
                <th>Issue</th>
                <th>Solution</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["I cannot log in", "Use Forgot Password on the sign-in page. If that fails, contact your administrator."],
                ["A document uploaded by a client is not showing", "Refresh the Documents page. Check that the client is linked to your account. Portal uploads can take up to 30 seconds."],
                ["The wrong category is on a document", "Click the pencil icon on the document card to change the category."],
                ["A deadline is marked Overdue but it was filed", "Open the deadline and click Mark Complete. Add a note with the filing date."],
                ["The client says they did not receive their portal invite", "Ask your administrator to check the client's email address is correct, then resend the invite from the client profile."],
                ["The AI gave an incorrect answer", "Do not rely on it alone. Cross-reference with official IRS publications or tax software. Report significant errors to your administrator."],
                ["I accidentally uploaded the wrong document", "Contact your administrator — they can delete and re-upload the correct file."],
              ].map(([issue, solution]) => (
                <tr key={issue}>
                  <td>{issue}</td>
                  <td>{solution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
          <span>CPA Loft · Team &amp; Staff Training Guide · v1.0</span>
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
      <div className="text-gray-600 space-y-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-0.5 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-1.5">
        {children}
      </div>
    </div>
  );
}
