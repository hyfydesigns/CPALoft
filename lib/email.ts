import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `CPA Loft <${user}>`;

  return { host, port, user, pass, from };
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

export async function sendDocumentTaggedEmail(
  toEmail: string,
  toName: string,
  cpaName: string,
  docName: string,
  portalUrl: string
) {
  const { host, port, user, pass, from } = getSmtpConfig();

  if (!host || !user || !pass) {
    console.warn("⚠️  SMTP not configured — skipping document notification email.");
    console.log("🔗 Portal URL (dev only):", portalUrl);
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
  <title>New document shared with you</title>
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
                New document shared, ${firstName}
              </h1>
              <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
                <strong>${cpaName}</strong> has shared a document with you in your secure client portal.
              </p>

              <!-- Document card -->
              <div style="background:#f7fbfa;border:1px solid #e8f5f1;border-radius:12px;padding:16px 20px;margin-bottom:28px;display:flex;align-items:center;gap:12px;">
                <div style="background:#fee2e2;border-radius:8px;width:40px;height:40px;text-align:center;line-height:40px;font-size:18px;flex-shrink:0;">📄</div>
                <div>
                  <p style="color:#0f2e24;font-size:14px;font-weight:600;margin:0 0 2px;">${docName}</p>
                  <p style="color:#6b7280;font-size:12px;margin:0;">Shared by ${cpaName}</p>
                </div>
              </div>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#1a6b54;border-radius:10px;">
                    <a href="${portalUrl}" style="display:inline-block;padding:14px 32px;color:#f7fbfa;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                      View in My Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
                Sign in to your portal to view, download, and manage your documents securely.
              </p>

              <hr style="border:none;border-top:1px solid #e8f5f1;margin:28px 0;" />
              <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">Your portal login:</p>
              <p style="color:#1a6b54;font-size:13px;font-weight:600;margin:0;">${toEmail}</p>
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
    subject: `${cpaName} shared a document with you`,
    html,
    text: `Hi ${firstName},\n\n${cpaName} has shared a document with you: ${docName}\n\nView it in your portal:\n${portalUrl}`,
  });

  return { messageId: info.messageId };
}

export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetUrl: string
) {
  const { host, port, user, pass, from } = getSmtpConfig();

  if (!host || !user || !pass) {
    console.warn("⚠️  SMTP not configured — skipping password reset email.");
    console.log("🔗 Reset URL (dev only):", resetUrl);
    return { previewUrl: resetUrl };
  }

  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  const firstName = toName.split(" ")[0] || toName;

  const html = `
<!DOCTYPE html><html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f7fbfa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fbfa;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,107,84,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a6b54 0%,#0f2e24 100%);padding:36px 40px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
              <td style="background:#1a6b54;border:2px solid rgba(45,212,160,0.3);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                <span style="font-family:Georgia,serif;font-weight:700;color:#f7fbfa;font-size:22px;line-height:40px;">L</span>
              </td>
              <td style="padding-left:12px;vertical-align:middle;">
                <span style="font-family:Georgia,serif;font-size:22px;color:#f7fbfa;font-weight:700;">CPA</span>
                <span style="font-family:Georgia,serif;font-size:22px;color:#2dd4a0;font-weight:300;"> Loft</span>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="color:#0f2e24;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,serif;">Reset your password, ${firstName}</h1>
            <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
              We received a request to reset the password for your CPA Loft account. Click the button below to choose a new password.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:#1a6b54;border-radius:10px;">
                  <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#f7fbfa;font-size:15px;font-weight:600;text-decoration:none;">Reset My Password →</a>
                </td>
              </tr>
            </table>
            <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
            <hr style="border:none;border-top:1px solid #e8f5f1;margin:24px 0;"/>
            <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">If the button doesn't work, paste this URL in your browser:</p>
            <p style="color:#1a6b54;font-size:12px;word-break:break-all;margin:0;">${resetUrl}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f7fbfa;padding:20px 40px;text-align:center;border-top:1px solid #e8f5f1;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} CPA Loft</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const info = await transporter.sendMail({
    from,
    to: `${toName} <${toEmail}>`,
    subject: "Reset your CPA Loft password",
    html,
    text: `Hi ${firstName},\n\nReset your CPA Loft password here:\n${resetUrl}\n\nThis link expires in 1 hour.`,
  });
  return { messageId: info.messageId };
}

export async function sendCpaWelcomeBackEmail(
  toEmail: string,
  toName: string,
  loginUrl: string
) {
  const { host, port, user, pass, from } = getSmtpConfig();

  if (!host || !user || !pass) {
    console.warn("⚠️  SMTP not configured — skipping CPA welcome-back email.");
    console.log("🔗 Login URL:", loginUrl);
    return { previewUrl: loginUrl };
  }

  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  const firstName = toName.split(" ")[0] || toName;

  const html = `
<!DOCTYPE html><html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f7fbfa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fbfa;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,107,84,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a6b54 0%,#0f2e24 100%);padding:36px 40px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
              <td style="background:#1a6b54;border:2px solid rgba(45,212,160,0.3);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                <span style="font-family:Georgia,serif;font-weight:700;color:#f7fbfa;font-size:22px;line-height:40px;">L</span>
              </td>
              <td style="padding-left:12px;vertical-align:middle;">
                <span style="font-family:Georgia,serif;font-size:22px;color:#f7fbfa;font-weight:700;">CPA</span>
                <span style="font-family:Georgia,serif;font-size:22px;color:#2dd4a0;font-weight:300;"> Loft</span>
              </td>
            </tr></table>
            <p style="color:rgba(247,251,250,0.7);font-size:13px;margin:12px 0 0 0;">Your accounting, elevated.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <div style="display:inline-block;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:20px;padding:4px 14px;margin-bottom:20px;">
              <span style="color:#059669;font-size:12px;font-weight:600;">👋 Welcome Back</span>
            </div>
            <h1 style="color:#0f2e24;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,serif;">Your workspace is restored, ${firstName}!</h1>
            <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 8px;">Your CPA Loft account has been fully restored — including all your clients and documents.</p>
            <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">Sign in using your original credentials to pick up right where you left off.</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#1a6b54;border-radius:10px;">
                  <a href="${loginUrl}" style="display:inline-block;padding:14px 32px;color:#f7fbfa;font-size:15px;font-weight:600;text-decoration:none;">Sign In to CPA Loft →</a>
                </td>
              </tr>
            </table>
            <hr style="border:none;border-top:1px solid #e8f5f1;margin:28px 0;"/>
            <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">Restored account:</p>
            <p style="color:#1a6b54;font-size:13px;font-weight:600;margin:0;">${toEmail}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f7fbfa;padding:20px 40px;text-align:center;border-top:1px solid #e8f5f1;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} CPA Loft</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const info = await transporter.sendMail({
    from,
    to: `${toName} <${toEmail}>`,
    subject: "Your CPA Loft workspace has been restored",
    html,
    text: `Welcome back, ${firstName}!\n\nYour CPA Loft account has been restored. Sign in here:\n${loginUrl}`,
  });
  return { messageId: info.messageId };
}

export async function sendClientWelcomeBackEmail(
  toEmail: string,
  toName: string,
  cpaName: string,
  portalUrl: string
) {
  const { host, port, user, pass, from } = getSmtpConfig();

  if (!host || !user || !pass) {
    console.warn("⚠️  SMTP not configured — skipping welcome-back email.");
    console.log("🔗 Portal URL (dev only):", portalUrl);
    return { previewUrl: portalUrl };
  }

  const transporter = nodemailer.createTransport({
    host, port, secure: port === 465, auth: { user, pass },
  });

  const firstName = toName.split(" ")[0] || toName;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f7fbfa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fbfa;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,107,84,0.08);">
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
            <p style="color:rgba(247,251,250,0.7);font-size:13px;margin:12px 0 0 0;">Your accounting, elevated.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <div style="display:inline-block;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:20px;padding:4px 14px;margin-bottom:20px;">
              <span style="color:#059669;font-size:12px;font-weight:600;">👋 Welcome Back</span>
            </div>
            <h1 style="color:#0f2e24;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,serif;">
              Great to have you back, ${firstName}!
            </h1>
            <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 8px;">
              <strong>${cpaName}</strong> has restored your client account. Your portal is ready and your previous documents have been recovered.
            </p>
            <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
              You can set up a new password and access your portal using the link below.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#1a6b54;border-radius:10px;">
                  <a href="${portalUrl}" style="display:inline-block;padding:14px 32px;color:#f7fbfa;font-size:15px;font-weight:600;text-decoration:none;">
                    Access My Portal →
                  </a>
                </td>
              </tr>
            </table>
            <hr style="border:none;border-top:1px solid #e8f5f1;margin:28px 0;" />
            <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">Your portal login:</p>
            <p style="color:#1a6b54;font-size:13px;font-weight:600;margin:0;">${toEmail}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f7fbfa;padding:20px 40px;text-align:center;border-top:1px solid #e8f5f1;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              Managed by <strong>${cpaName}</strong> via CPA Loft
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const info = await transporter.sendMail({
    from,
    to: `${toName} <${toEmail}>`,
    subject: `Welcome back — your client portal has been restored`,
    html,
    text: `Welcome back, ${firstName}!\n\n${cpaName} has restored your client account. Access your portal here:\n${portalUrl}`,
  });

  return { messageId: info.messageId };
}

export async function sendDocumentRequestEmail(
  toEmail: string,
  toName: string,
  cpaName: string,
  requestTitle: string,
  requestDescription: string | null | undefined,
  portalUrl: string
) {
  const { host, port, user, pass, from } = getSmtpConfig();

  if (!host || !user || !pass) {
    console.warn("⚠️  SMTP not configured — skipping document request email.");
    console.log("🔗 Portal URL (dev only):", portalUrl);
    return { previewUrl: portalUrl };
  }

  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  const firstName = toName.split(" ")[0] || toName;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f7fbfa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fbfa;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,107,84,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a6b54 0%,#0f2e24 100%);padding:36px 40px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
              <td style="background:#1a6b54;border:2px solid rgba(45,212,160,0.3);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                <span style="font-family:Georgia,serif;font-weight:700;color:#f7fbfa;font-size:22px;line-height:40px;">L</span>
              </td>
              <td style="padding-left:12px;vertical-align:middle;">
                <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#f7fbfa;font-weight:700;">CPA</span>
                <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2dd4a0;font-weight:300;"> Loft</span>
              </td>
            </tr></table>
            <p style="color:rgba(247,251,250,0.7);font-size:13px;margin:12px 0 0 0;letter-spacing:0.5px;">Your accounting, elevated.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="color:#0f2e24;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,serif;">
              Document requested, ${firstName}
            </h1>
            <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
              <strong>${cpaName}</strong> has requested the following document from you:
            </p>
            <div style="background:#f7fbfa;border:1px solid #e8f5f1;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
              <p style="color:#0f2e24;font-size:15px;font-weight:700;margin:0 0 4px;">${requestTitle}</p>
              ${requestDescription ? `<p style="color:#6b7280;font-size:13px;margin:0;">${requestDescription}</p>` : ""}
            </div>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#1a6b54;border-radius:10px;">
                  <a href="${portalUrl}" style="display:inline-block;padding:14px 32px;color:#f7fbfa;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                    Upload in My Portal →
                  </a>
                </td>
              </tr>
            </table>
            <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
              Sign in to your client portal to upload the requested document securely.
            </p>
            <hr style="border:none;border-top:1px solid #e8f5f1;margin:28px 0;" />
            <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">Your portal login:</p>
            <p style="color:#1a6b54;font-size:13px;font-weight:600;margin:0;">${toEmail}</p>
          </td>
        </tr>
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
    </td></tr>
  </table>
</body>
</html>`;

  const info = await transporter.sendMail({
    from,
    to: `${toName} <${toEmail}>`,
    subject: `${cpaName} has requested a document from you`,
    html,
    text: `Hi ${firstName},\n\n${cpaName} has requested the following document:\n\n${requestTitle}${requestDescription ? `\n\n${requestDescription}` : ""}\n\nUpload it in your portal:\n${portalUrl}`,
  });

  return { messageId: info.messageId };
}

export async function sendDeadlineReminderEmail(
  toEmail: string,
  toName: string,
  cpaName: string,
  deadlineLabel: string,
  dueDate: string,
  clientName: string
) {
  const { host, port, user, pass, from } = getSmtpConfig();

  if (!host || !user || !pass) {
    console.warn("⚠️  SMTP not configured — skipping deadline reminder email.");
    return { previewUrl: null };
  }

  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  const firstName = toName.split(" ")[0] || toName;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f7fbfa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fbfa;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,107,84,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a6b54 0%,#0f2e24 100%);padding:36px 40px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
              <td style="background:#1a6b54;border:2px solid rgba(45,212,160,0.3);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                <span style="font-family:Georgia,serif;font-weight:700;color:#f7fbfa;font-size:22px;line-height:40px;">L</span>
              </td>
              <td style="padding-left:12px;vertical-align:middle;">
                <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#f7fbfa;font-weight:700;">CPA</span>
                <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2dd4a0;font-weight:300;"> Loft</span>
              </td>
            </tr></table>
            <p style="color:rgba(247,251,250,0.7);font-size:13px;margin:12px 0 0 0;letter-spacing:0.5px;">Your accounting, elevated.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <div style="display:inline-block;background:#fef3c7;border:1px solid #fcd34d;border-radius:20px;padding:4px 14px;margin-bottom:20px;">
              <span style="color:#92400e;font-size:12px;font-weight:600;letter-spacing:0.3px;">Upcoming Deadline</span>
            </div>
            <h1 style="color:#0f2e24;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,serif;">
              Tax deadline reminder, ${firstName}
            </h1>
            <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
              <strong>${cpaName}</strong> has set a reminder for an upcoming tax deadline for <strong>${clientName}</strong>.
            </p>
            <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
              <p style="color:#92400e;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Deadline</p>
              <p style="color:#78350f;font-size:18px;font-weight:700;margin:0 0 4px;">${deadlineLabel}</p>
              <p style="color:#92400e;font-size:13px;margin:0;">Due: <strong>${dueDate}</strong></p>
            </div>
            <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
              Please make sure all necessary documents and information are prepared before the due date.
            </p>
            <hr style="border:none;border-top:1px solid #e8f5f1;margin:28px 0;" />
            <p style="color:#9ca3af;font-size:12px;margin:0;">Managed by <strong>${cpaName}</strong> via CPA Loft.</p>
          </td>
        </tr>
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
    </td></tr>
  </table>
</body>
</html>`;

  const info = await transporter.sendMail({
    from,
    to: `${toName} <${toEmail}>`,
    subject: `Reminder: ${deadlineLabel} due on ${dueDate}`,
    html,
    text: `Hi ${firstName},\n\n${cpaName} has set a reminder for an upcoming tax deadline:\n\n${deadlineLabel}\nDue: ${dueDate}\nClient: ${clientName}\n\nPlease ensure all necessary documents are prepared before the due date.`,
  });

  return { messageId: info.messageId };
}

export async function sendPracticeDigestEmail(
  to: string,
  name: string,
  data: {
    deadlines: Array<{ label: string; dueDate: string; client?: { name: string } | null }>;
    requests: Array<{ title: string; client?: { name?: string } | null }>;
    uploads: Array<{ originalName: string; client?: { name: string } | null; createdAt: string }>;
  }
) {
  const { host, port, user, pass, from } = getSmtpConfig();

  if (!host || !user || !pass) {
    console.warn("⚠️  SMTP not configured — skipping practice digest email.");
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const deadlineRows = data.deadlines.length > 0
    ? data.deadlines.map(d => `<li><strong>${d.label}</strong>${d.client ? ` — ${d.client.name}` : ''} — due ${new Date(d.dueDate).toLocaleDateString()}</li>`).join("")
    : "<li>No upcoming deadlines in the next 14 days.</li>";

  const requestRows = data.requests.length > 0
    ? data.requests.map(r => `<li>${r.title}${r.client?.name ? ` — ${r.client.name}` : ''}</li>`).join("")
    : "<li>No pending document requests.</li>";

  const uploadRows = data.uploads.length > 0
    ? data.uploads.map(u => `<li>${u.originalName}${u.client ? ` — ${u.client.name}` : ''}</li>`).join("")
    : "<li>No recent uploads in the last 7 days.</li>";

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
      <div style="background:#1a3c34;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px">Practice Digest</h1>
        <p style="color:#a7c4bc;margin:4px 0 0">Hi ${name} — here's your practice summary</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="font-size:16px;color:#1a3c34;margin-top:0">📅 Upcoming Deadlines (next 14 days)</h2>
        <ul style="padding-left:20px;line-height:1.8">${deadlineRows}</ul>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <h2 style="font-size:16px;color:#1a3c34;margin-top:0">📋 Pending Document Requests</h2>
        <ul style="padding-left:20px;line-height:1.8">${requestRows}</ul>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <h2 style="font-size:16px;color:#1a3c34;margin-top:0">📁 Recent Uploads (last 7 days)</h2>
        <ul style="padding-left:20px;line-height:1.8">${uploadRows}</ul>
        <div style="margin-top:24px">
          <a href="${appUrl}/dashboard" style="background:#2d6a4f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">Open Dashboard →</a>
        </div>
      </div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: `Your CPA Loft Practice Digest — ${new Date().toLocaleDateString()}`,
    html,
    text: `Hi ${name},\n\nHere's your practice summary:\n\nUpcoming Deadlines:\n${data.deadlines.map(d => `- ${d.label}${d.client ? ` (${d.client.name})` : ''} — due ${new Date(d.dueDate).toLocaleDateString()}`).join('\n') || 'None'}\n\nPending Document Requests:\n${data.requests.map(r => `- ${r.title}${r.client?.name ? ` (${r.client.name})` : ''}`).join('\n') || 'None'}\n\nRecent Uploads:\n${data.uploads.map(u => `- ${u.originalName}${u.client ? ` (${u.client.name})` : ''}`).join('\n') || 'None'}\n\nView your dashboard: ${appUrl}/dashboard`,
  });
}
