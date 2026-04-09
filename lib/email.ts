import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

function getSmtpConfig() {
  // Try process.env first, fallback to reading .env.local directly
  let host = process.env.SMTP_HOST;
  let port = process.env.SMTP_PORT;
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;
  let from = process.env.SMTP_FROM;

  if (!host || !user || !pass) {
    try {
      const envFile = path.join(process.cwd(), ".env.local");
      const content = fs.readFileSync(envFile, "utf-8");
      const get = (key: string) => {
        const match = content.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\\r\\n]+)["']?`, "m"));
        return match?.[1]?.trim() ?? "";
      };
      host = host || get("SMTP_HOST");
      port = port || get("SMTP_PORT");
      user = user || get("SMTP_USER");
      pass = pass || get("SMTP_PASS");
      from = from || get("SMTP_FROM");
    } catch {}
  }

  return { host, port: parseInt(port || "587"), user, pass, from: from || `CPA Loft <${user}>` };
}

export async function sendVerificationEmail(
  toEmail: string,
  toName: string,
  verifyUrl: string
) {
  const { host, port, user, pass, from } = getSmtpConfig();

  if (!host || !user || !pass) {
    console.warn("⚠️  SMTP not configured — skipping verification email. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local");
    // In development, log the verify URL so you can test without SMTP
    console.log("🔗 Verify URL (dev only):", verifyUrl);
    return { previewUrl: verifyUrl };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const firstName = toName.split(" ")[0] || toName;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Verify your CPA Loft account</title>
</head>
<body style="margin:0;padding:0;background:#f7fbfa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fbfa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,107,84,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a6b54 0%,#0f2e24 100%);padding:36px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#1a6b54;border:2px solid rgba(45,212,160,0.3);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="font-family:Georgia,serif;font-weight:700;color:#f7fbfa;font-size:22px;line-height:40px;">L</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#f7fbfa;font-weight:700;">CPA</span>
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2dd4a0;font-weight:300;"> Loft</span>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(247,251,250,0.7);font-size:13px;margin:12px 0 0 0;letter-spacing:0.5px;">Your accounting, elevated.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="color:#0f2e24;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,serif;">
                Welcome to CPA Loft, ${firstName}!
              </h1>
              <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Thanks for creating your account. One quick step — please verify your email address to activate your workspace and start using the AI assistant.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#1a6b54;border-radius:10px;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;color:#f7fbfa;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                      Verify My Email →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 8px;">
                This link expires in <strong>24 hours</strong>. If you didn't create a CPA Loft account, you can safely ignore this email.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e8f5f1;margin:28px 0;" />

              <p style="color:#9ca3af;font-size:12px;margin:0 0 6px;">
                If the button above doesn't work, copy and paste this URL into your browser:
              </p>
              <p style="color:#1a6b54;font-size:12px;word-break:break-all;margin:0;">
                ${verifyUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7fbfa;padding:20px 40px;text-align:center;border-top:1px solid #e8f5f1;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} CPA Loft ·
                <a href="#" style="color:#1a6b54;text-decoration:none;">Privacy</a> ·
                <a href="#" style="color:#1a6b54;text-decoration:none;">Terms</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const info = await transporter.sendMail({
    from,
    to: `${toName} <${toEmail}>`,
    subject: "Verify your CPA Loft email address",
    html,
    text: `Welcome to CPA Loft, ${firstName}!\n\nPlease verify your email by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
  });

  return { messageId: info.messageId };
}

export async function sendClientInviteEmail(
  toEmail: string,
  toName: string,
  cpaName: string,
  inviteUrl: string
) {
  const { host, port, user, pass, from } = getSmtpConfig();

  if (!host || !user || !pass) {
    console.warn("⚠️  SMTP not configured — skipping client invite email.");
    console.log("🔗 Client Invite URL (dev only):", inviteUrl);
    return { previewUrl: inviteUrl };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const firstName = toName.split(" ")[0] || toName;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>You've been invited to a client portal</title>
</head>
<body style="margin:0;padding:0;background:#f7fbfa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fbfa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,107,84,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a6b54 0%,#0f2e24 100%);padding:36px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#1a6b54;border:2px solid rgba(45,212,160,0.3);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="font-family:Georgia,serif;font-weight:700;color:#f7fbfa;font-size:22px;line-height:40px;">L</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#f7fbfa;font-weight:700;">CPA</span>
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2dd4a0;font-weight:300;"> Loft</span>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(247,251,250,0.7);font-size:13px;margin:12px 0 0 0;letter-spacing:0.5px;">Your accounting, elevated.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="color:#0f2e24;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,serif;">
                Hi ${firstName}, you're invited!
              </h1>
              <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 8px;">
                <strong>${cpaName}</strong> has added you as a client and set up a secure portal where you can share documents, view your files, and stay connected.
              </p>
              <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Click the button below to create your account and access your portal.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#1a6b54;border-radius:10px;">
                    <a href="${inviteUrl}" style="display:inline-block;padding:14px 32px;color:#f7fbfa;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                      Set Up My Account →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What to expect -->
              <div style="background:#f7fbfa;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="color:#0f2e24;font-size:13px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.5px;">What you can do in your portal</p>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding:4px 0;color:#4b5563;font-size:13px;">📁&nbsp; Securely upload documents to your accountant</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#4b5563;font-size:13px;">🔒&nbsp; Access your files any time, from anywhere</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#4b5563;font-size:13px;">📬&nbsp; Stay in sync with your accounting team</td>
                  </tr>
                </table>
              </div>

              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 8px;">
                This invite link expires in <strong>7 days</strong>. If you didn't expect this email, you can safely ignore it.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e8f5f1;margin:28px 0;" />

              <p style="color:#9ca3af;font-size:12px;margin:0 0 6px;">
                If the button above doesn't work, copy and paste this URL into your browser:
              </p>
              <p style="color:#1a6b54;font-size:12px;word-break:break-all;margin:0;">
                ${inviteUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7fbfa;padding:20px 40px;text-align:center;border-top:1px solid #e8f5f1;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                Sent on behalf of <strong>${cpaName}</strong> via CPA Loft ·
                <a href="#" style="color:#1a6b54;text-decoration:none;">Privacy</a> ·
                <a href="#" style="color:#1a6b54;text-decoration:none;">Terms</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const info = await transporter.sendMail({
    from,
    to: `${toName} <${toEmail}>`,
    subject: `${cpaName} has invited you to their client portal`,
    html,
    text: `Hi ${firstName},\n\n${cpaName} has added you as a client and set up a secure portal for you.\n\nClick the link below to create your account:\n${inviteUrl}\n\nThis link expires in 7 days.`,
  });

  return { messageId: info.messageId };
}

export async function sendClientWelcomeEmail(
  toEmail: string,
  toName: string,
  cpaName: string,
  portalUrl: string
) {
  const { host, port, user, pass, from } = getSmtpConfig();

  if (!host || !user || !pass) {
    console.warn("⚠️  SMTP not configured — skipping client welcome email.");
    console.log("🔗 Portal login URL (dev only):", portalUrl);
    return { previewUrl: portalUrl };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const firstName = toName.split(" ")[0] || toName;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to your client portal</title>
</head>
<body style="margin:0;padding:0;background:#f7fbfa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fbfa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,107,84,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a6b54 0%,#0f2e24 100%);padding:36px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#1a6b54;border:2px solid rgba(45,212,160,0.3);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="font-family:Georgia,serif;font-weight:700;color:#f7fbfa;font-size:22px;line-height:40px;">L</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#f7fbfa;font-weight:700;">CPA</span>
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2dd4a0;font-weight:300;"> Loft</span>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(247,251,250,0.7);font-size:13px;margin:12px 0 0 0;letter-spacing:0.5px;">Your accounting, elevated.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <!-- Welcome badge -->
              <div style="display:inline-block;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:20px;padding:4px 14px;margin-bottom:20px;">
                <span style="color:#059669;font-size:12px;font-weight:600;letter-spacing:0.3px;">✓ Account Active</span>
              </div>

              <h1 style="color:#0f2e24;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,serif;">
                Welcome aboard, ${firstName}!
              </h1>
              <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 8px;">
                Your client portal is ready. <strong>${cpaName}</strong> can now securely collaborate with you, and you can upload documents directly from your portal.
              </p>
              <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Sign in any time to manage your files and stay in sync with your accounting team.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#1a6b54;border-radius:10px;">
                    <a href="${portalUrl}" style="display:inline-block;padding:14px 32px;color:#f7fbfa;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                      Go to My Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Feature grid -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td width="48%" style="background:#f7fbfa;border-radius:12px;padding:16px;vertical-align:top;">
                    <p style="color:#0f2e24;font-size:20px;margin:0 0 6px;">📁</p>
                    <p style="color:#0f2e24;font-size:13px;font-weight:700;margin:0 0 4px;">Upload Documents</p>
                    <p style="color:#6b7280;font-size:12px;margin:0;">Share tax forms, statements & more securely.</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#f7fbfa;border-radius:12px;padding:16px;vertical-align:top;">
                    <p style="color:#0f2e24;font-size:20px;margin:0 0 6px;">🔒</p>
                    <p style="color:#0f2e24;font-size:13px;font-weight:700;margin:0 0 4px;">Secure Access</p>
                    <p style="color:#6b7280;font-size:12px;margin:0;">Your files are encrypted and private.</p>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #e8f5f1;margin:28px 0;" />

              <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">Your portal login:</p>
              <p style="color:#1a6b54;font-size:13px;font-weight:600;margin:0;">${toEmail}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7fbfa;padding:20px 40px;text-align:center;border-top:1px solid #e8f5f1;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                Managed by <strong>${cpaName}</strong> via CPA Loft ·
                <a href="#" style="color:#1a6b54;text-decoration:none;">Privacy</a> ·
                <a href="#" style="color:#1a6b54;text-decoration:none;">Terms</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const info = await transporter.sendMail({
    from,
    to: `${toName} <${toEmail}>`,
    subject: `Your client portal is ready — welcome, ${firstName}!`,
    html,
    text: `Welcome, ${firstName}!\n\nYour CPA Loft portal is now active. Sign in here:\n${portalUrl}\n\nManaged by ${cpaName}.`,
  });

  return { messageId: info.messageId };
}
