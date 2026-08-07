interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

function wrapLayout(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:#2563eb;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">
                📋 Job Tracker
              </h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-align:center;">
                You received this email because you have an account on Job Tracker.<br>
                If you didn't create this account, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export function welcomeEmailTemplate(username: string): EmailTemplate {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">
      Welcome, ${username}! 🎉
    </h2>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">
      Your Job Tracker account has been created successfully.
      Start tracking your job applications and never lose track
      of your progress again.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background:#2563eb;border-radius:6px;padding:12px 24px;">
          <a href="http://localhost:3000/dashboard"
             style="color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">
            Go to Dashboard →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#6b7280;font-size:14px;">
      Here's what you can do with Job Tracker:
    </p>
    <ul style="color:#374151;line-height:1.8;margin:12px 0;">
      <li>Track applications across multiple companies</li>
      <li>Monitor your interview pipeline</li>
      <li>Store resumes against each application</li>
      <li>Visualise your job search progress</li>
    </ul>
  `;

  return {
    subject: `Welcome to Job Tracker, ${username}!`,
    html: wrapLayout(content, "Welcome to Job Tracker"),
    text: `Welcome to Job Tracker, ${username}!\n\nYour account has been created successfully.\n\nStart tracking your applications at http://localhost:3000/dashboard`,
  };
}

const STATUS_CONFIG: Record<
  string,
  { emoji: string; color: string; message: string }
> = {
  applied: {
    emoji: "📨",
    color: "#2563eb",
    message: "Your application has been submitted.",
  },
  interview: {
    emoji: "🎙️",
    color: "#7c3aed",
    message: "You've been invited to interview. Prepare well!",
  },
  assessment: {
    emoji: "📝",
    color: "#d97706",
    message: "You have an assessment to complete.",
  },
  offer: {
    emoji: "🎉",
    color: "#059669",
    message: "Congratulations — you've received an offer!",
  },
  rejected: {
    emoji: "❌",
    color: "#dc2626",
    message: "Keep going — the right opportunity is out there.",
  },
};

export function statusChangeEmailTemplate(
  username: string,
  company: string,
  position: string,
  newStatus: string,
): EmailTemplate {
  const config = STATUS_CONFIG[newStatus] ?? {
    emoji: "📋",
    color: "#2563eb",
    message: "Your application status has been updated.",
  };

  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">
      Application Status Update ${config.emoji}
    </h2>
    <p style="margin:0 0 24px;color:#374151;line-height:1.6;">
      Hi ${username}, your application status has been updated.
    </p>
    <!-- Status Card -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f9fafb;border-radius:8px;border-left:4px solid ${config.color};margin:0 0 24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">
            Company
          </p>
          <p style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:600;">
            ${company}
          </p>
          <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">
            Position
          </p>
          <p style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:600;">
            ${position}
          </p>
          <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">
            New Status
          </p>
          <span style="display:inline-block;background:${config.color};color:#ffffff;
                       padding:4px 12px;border-radius:9999px;font-size:13px;font-weight:600;">
            ${config.emoji} ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
          </span>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#374151;line-height:1.6;">
      ${config.message}
    </p>
  `;

  return {
    subject: `${config.emoji} Application Update: ${company} — ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    html: wrapLayout(content, "Application Status Update"),
    text: `Hi ${username},\n\nYour application status for ${position} at ${company} has been updated to: ${newStatus}\n\n${config.message}`,
  };
}
