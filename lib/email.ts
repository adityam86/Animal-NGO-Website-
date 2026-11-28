import { AYUDAR_LEGAL, CONTACT_INFO } from "@/lib/data";

export interface EmailSendResult {
  sent: boolean;
  id?: string;
  reason?: string;
}

function escapeHtml(text: string): string {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCanonicalSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.ayudarindia.com").replace(/\/+$/, "");
}

function getAlertRecipient(): string {
  return process.env.ALERT_TO_EMAIL?.trim() || CONTACT_INFO.email;
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || `${AYUDAR_LEGAL.shortName} Welfare <onboarding@resend.dev>`;
}

export async function sendTransactionalEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`Resend API error ${res.status}: ${errText.slice(0, 200)}`);
      return { sent: false, reason: `HTTP ${res.status}` };
    }

    const data = (await res.json()) as { id?: string };
    return { sent: true, id: data.id };
  } catch (err) {
    console.warn("Email send skipped/failed:", err instanceof Error ? err.message : err);
    return { sent: false, reason: "Network or timeout error" };
  }
}

export async function sendRescueAlertEmail(params: {
  caseId: string;
  animalType: string;
  emergencyLevel: string;
  location: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string | null;
  description: string;
  hasPhoto: boolean;
  hasAudio: boolean;
}): Promise<void> {
  const site = getCanonicalSiteUrl();
  const trackUrl = `${site}/rescue/track?id=${encodeURIComponent(params.caseId)}`;
  const adminUrl = `${site}/admin/rescues?q=${encodeURIComponent(params.caseId)}`;

  const adminHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;color:#1A2820;line-height:1.55;">
      <h2 style="color:#B83232;margin-bottom:8px;">[${escapeHtml(params.emergencyLevel)}] Rescue Alert: ${escapeHtml(params.caseId)}</h2>
      <p><strong>Animal:</strong> ${escapeHtml(params.animalType)}</p>
      <p><strong>Location:</strong> ${escapeHtml(params.location)}</p>
      <p><strong>Reporter:</strong> ${escapeHtml(params.reporterName)} (${escapeHtml(params.reporterPhone)})</p>
      <p><strong>Details:</strong> ${escapeHtml(params.description)}</p>
      <p><strong>Attachments:</strong> Photo: ${params.hasPhoto ? "Yes" : "No"} | Voice Note: ${params.hasAudio ? "Yes" : "No"}</p>
      <p style="margin-top:16px;">
        <a href="${adminUrl}" style="background:#183627;color:#FAF7F2;padding:10px 16px;border-radius:4px;text-decoration:none;font-weight:600;">Open in Admin Dispatch</a>
      </p>
    </div>
  `;

  await sendTransactionalEmail({
    to: getAlertRecipient(),
    subject: `[${params.emergencyLevel}] New Rescue Alert (${params.caseId}) — ${params.animalType}`,
    html: adminHtml,
    replyTo: params.reporterEmail || undefined,
  });

  if (params.reporterEmail) {
    const reporterHtml = `
      <div style="font-family:system-ui,sans-serif;max-width:600px;color:#1A2820;line-height:1.6;">
        <h2 style="color:#183627;">Rescue Report Received (${escapeHtml(params.caseId)})</h2>
        <p>Dear ${escapeHtml(params.reporterName)},</p>
        <p>We received your rescue report for a <strong>${escapeHtml(params.animalType)}</strong> at <strong>${escapeHtml(params.location)}</strong>.</p>
        <p>You can track dispatch progress anytime: <a href="${trackUrl}">${trackUrl}</a></p>
        <p>For urgent road updates, call or WhatsApp <strong>${escapeHtml(CONTACT_INFO.primaryContact.name)}</strong> at <strong>${escapeHtml(CONTACT_INFO.emergencyPhone)}</strong>.</p>
        <p style="color:#66756D;font-size:12px;">${escapeHtml(AYUDAR_LEGAL.name)} · ${escapeHtml(CONTACT_INFO.address)}</p>
      </div>
    `;
    await sendTransactionalEmail({
      to: params.reporterEmail,
      subject: `Ayudar Rescue Case Received — ${params.caseId}`,
      html: reporterHtml,
    });
  }
}

export async function sendDonationReceiptEmail(params: {
  recordType: "donation" | "sponsorship";
  recordId: string;
  paymentId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  purpose: string;
  frequency: string;
  pan?: string | null;
}): Promise<void> {
  const site = getCanonicalSiteUrl();
  const verifyUrl = `${site}/verify-receipt?ref=${encodeURIComponent(params.paymentId)}`;

  const donorHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;color:#1A2820;line-height:1.6;border:1px solid #E2DACB;border-radius:6px;padding:24px;">
      <h2 style="color:#183627;margin-top:0;">Official 80G Contribution Receipt</h2>
      <p>Dear ${escapeHtml(params.donorName)}, thank you for supporting <strong>${escapeHtml(AYUDAR_LEGAL.name)}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
        <tr><td style="padding:6px 0;color:#66756D;">Receipt / Record ID</td><td style="font-weight:600;">${escapeHtml(params.recordId)}</td></tr>
        <tr><td style="padding:6px 0;color:#66756D;">Payment Reference</td><td style="font-weight:600;">${escapeHtml(params.paymentId)}</td></tr>
        <tr><td style="padding:6px 0;color:#66756D;">Amount Verified</td><td style="font-weight:700;color:#183627;">INR ${params.amount.toLocaleString("en-IN")} (${escapeHtml(params.frequency)})</td></tr>
        <tr><td style="padding:6px 0;color:#66756D;">Allocation</td><td>${escapeHtml(params.purpose)}</td></tr>
        <tr><td style="padding:6px 0;color:#66756D;">80G URN / Trust Reg.</td><td>${escapeHtml(AYUDAR_LEGAL.urn80G)} / ${escapeHtml(AYUDAR_LEGAL.regNo)}</td></tr>
        ${params.pan ? `<tr><td style="padding:6px 0;color:#66756D;">Donor PAN</td><td>${escapeHtml(params.pan)}</td></tr>` : ""}
      </table>
      <p><a href="${verifyUrl}" style="background:#D96B52;color:#FFFFFF;padding:10px 16px;border-radius:4px;text-decoration:none;font-weight:600;">Verify &amp; Print 80G Certificate</a></p>
      <p style="font-size:12px;color:#66756D;margin-top:18px;">${escapeHtml(CONTACT_INFO.address)} · ${escapeHtml(CONTACT_INFO.email)}</p>
    </div>
  `;

  await Promise.all([
    sendTransactionalEmail({
      to: params.donorEmail,
      subject: `Thank you for your ₹${params.amount.toLocaleString("en-IN")} contribution — 80G Receipt (${params.recordId})`,
      html: donorHtml,
    }),
    sendTransactionalEmail({
      to: getAlertRecipient(),
      subject: `[Verified ${params.recordType}] ₹${params.amount.toLocaleString("en-IN")} from ${params.donorName}`,
      html: `<p>Verified ${escapeHtml(params.recordType)} <strong>${escapeHtml(params.recordId)}</strong> (${escapeHtml(params.paymentId)}) for <strong>INR ${params.amount.toLocaleString("en-IN")}</strong> — ${escapeHtml(params.purpose)}.</p>`,
    }),
  ]);
}

export async function sendSubmissionAlertEmail(params: {
  category: "Adoption Application" | "Contact Inquiry" | "ABC / Vaccination Drive Request";
  subjectLine: string;
  senderName: string;
  senderEmail: string;
  summaryLines: string[];
}): Promise<void> {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;color:#1A2820;line-height:1.6;">
      <h2 style="color:#183627;">${escapeHtml(params.category)}</h2>
      <p><strong>From:</strong> ${escapeHtml(params.senderName)} (${escapeHtml(params.senderEmail)})</p>
      ${params.summaryLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    </div>
  `;
  await sendTransactionalEmail({
    to: getAlertRecipient(),
    subject: params.subjectLine,
    html,
    replyTo: params.senderEmail,
  });
}
