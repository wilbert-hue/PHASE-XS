import nodemailer from "nodemailer"
import path from "path"

type ContactPayload = {
  fullName: string
  email: string
  jobTitle: string
  countryCode: string
  country: string   // derived from countryCode
  company: string   // derived from email domain
  contact: string
  requirements?: string
  ip?: string
}

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error("SMTP not configured (need SMTP_HOST, SMTP_USER, SMTP_PASS)")
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  })
}

export async function sendContactNotification(data: ContactPayload) {
  const to = process.env.CONTACT_TO_EMAIL || "raj@coherentmarketinsights.com, monica@coherentmarketinsights.com, mohit.s@coherentmarketinsights.com"
  const from = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER!

  const t = getTransporter()

  const internalHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color:#1B4965;">
      <div style="background:linear-gradient(135deg,#1B4965,#1E6080);color:#fff;padding:20px;">
        <h2 style="margin:0;font-family:Arial,sans-serif;">PHASE-XS · New Contact Request</h2>
      </div>
      <div style="padding:20px;background:#f0f5f7;border:1px solid rgba(42,143,156,0.3);border-top:none;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;font-weight:bold;width:160px;">Full Name</td><td>${escape(data.fullName)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Business Email</td><td><a href="mailto:${escape(data.email)}">${escape(data.email)}</a></td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Company (derived)</td><td>${escape(data.company)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Job Title</td><td>${escape(data.jobTitle)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Country Code</td><td>${escape(data.countryCode)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Country (derived)</td><td>${escape(data.country)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Contact Number</td><td>${escape(data.contact)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;vertical-align:top;">Requirements</td><td style="white-space:pre-wrap;">${escape(data.requirements || "—")}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#3d6070;">IP Address</td><td style="color:#3d6070;">${escape(data.ip || "unknown")}</td></tr>
        </table>
        <p style="margin-top:20px;font-size:12px;color:#3d6070;">Submitted at ${new Date().toISOString()}</p>
      </div>
    </div>
  `

  const confirmationHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color:#1B4965; background:#ffffff;">
      <!-- Header: Outlook-safe (bgcolor attr + nested table, no SVG, no gradient) -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td bgcolor="#1B4965" style="background:#1B4965;padding:24px 32px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <!-- Icon: CID-embedded PNG — renders in all clients including Outlook desktop -->
                <td width="52" valign="middle" style="padding-right:14px;">
                  <img src="cid:phasexs-logo" width="40" height="40" alt="[*]" style="display:block;width:40px;height:40px;" />
                </td>
                <!-- PHASE-XS + subtitle -->
                <td valign="middle">
                  <div style="font-size:28px;font-weight:700;letter-spacing:0.1em;color:#ffffff;font-family:Arial,sans-serif;line-height:1.1;">PHASE&#8209;XS</div>
                  <div style="margin-top:5px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#4FBDBA;font-family:Courier New,monospace;">Clinical Intelligence Platform</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Body -->
      <div style="padding:36px 32px;background:#f0f5f7;border-left:1px solid rgba(42,143,156,0.25);border-right:1px solid rgba(42,143,156,0.25);">
        <p style="margin:0 0 6px;font-family:monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#2A8F9C;">Inquiry Confirmed</p>
        <h2 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#1B4965;font-family:Arial,sans-serif;">Thank You, ${escape(data.fullName.split(" ")[0])}.</h2>

        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#1E6080;">
          Thank you for your interest in <strong>PHASE-XS</strong> — the clinical intelligence platform built to accelerate drug development decisions with precision-grade trial data.
        </p>

        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#1E6080;">
          We have received your inquiry and a member of our team will review your research requirements and reach out to you at <a href="mailto:${escape(data.email)}" style="color:#2A8F9C;font-weight:600;">${escape(data.email)}</a> within <strong>24 business hours</strong>.
        </p>

        <!-- Summary box -->
        <div style="margin:28px 0;padding:20px 24px;background:#ffffff;border:1px solid rgba(42,143,156,0.3);border-left:3px solid #2A8F9C;">
          <p style="margin:0 0 12px;font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#2A8F9C;">Your Submission Summary</p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#1B4965;">
            <tr><td style="padding:5px 0;width:130px;color:#3d6070;">Full Name</td><td style="font-weight:600;">${escape(data.fullName)}</td></tr>
            <tr><td style="padding:5px 0;color:#3d6070;">Email</td><td style="font-weight:600;">${escape(data.email)}</td></tr>
            <tr><td style="padding:5px 0;color:#3d6070;">Job Title</td><td style="font-weight:600;">${escape(data.jobTitle)}</td></tr>
            <tr><td style="padding:5px 0;color:#3d6070;">Country Code</td><td style="font-weight:600;">${escape(data.countryCode)}</td></tr>
            <tr><td style="padding:5px 0;color:#3d6070;">Contact Number</td><td style="font-weight:600;">${escape(data.contact)}</td></tr>
            ${data.requirements ? `<tr><td style="padding:5px 0;color:#3d6070;vertical-align:top;">Requirements</td><td style="font-weight:600;white-space:pre-wrap;">${escape(data.requirements)}</td></tr>` : ""}
          </table>
        </div>

        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#1E6080;">
          In the meantime, feel free to explore <a href="https://phasexs.com" style="color:#2A8F9C;font-weight:600;">phasexs.com</a> to learn more about our coverage across 40,000+ clinical trials spanning 17 countries.
        </p>

        <p style="margin:28px 0 0;font-size:15px;line-height:1.7;color:#1E6080;">
          Warm regards,<br/>
          <strong style="color:#1B4965;">The PHASE-XS Team</strong><br/>
          <span style="font-size:13px;color:#3d6070;">A venture of Coherent Market Insights</span>
        </p>
      </div>

      <!-- Footer: Outlook-safe -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td bgcolor="#1B4965" align="center" style="background:#1B4965;padding:18px 32px;">
            <p style="margin:0;font-family:Courier New,monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#7aabb8;">
              This is an automated confirmation. Please do not reply to this email.<br/>
              &copy; ${new Date().getFullYear()} Coherent Market Insights &mdash; PHASE-XS
            </p>
          </td>
        </tr>
      </table>
    </div>
  `

  await Promise.all([
    // Notification to internal team
    t.sendMail({
      from: `"PHASE-XS Contact" <${from}>`,
      to,
      replyTo: data.email,
      subject: `New PHASE-XS inquiry from ${data.fullName} (${data.company})`,
      html: internalHtml,
      text:
        `New PHASE-XS contact request\n\n` +
        `Name: ${data.fullName}\nEmail: ${data.email}\nCompany (derived): ${data.company}\n` +
        `Job Title: ${data.jobTitle}\nCountry Code: ${data.countryCode}\nCountry (derived): ${data.country}\nContact: ${data.contact}\n\n` +
        `Requirements:\n${data.requirements || "—"}\n\nIP Address: ${data.ip || "unknown"}`,
    }),
    // Confirmation to the submitter (only user-filled fields)
    t.sendMail({
      from: `"PHASE-XS" <${from}>`,
      to: data.email,
      subject: `We received your inquiry — PHASE-XS`,
      html: confirmationHtml,
      attachments: [
        {
          filename: "phase-xs-icon.png",
          path: path.join(process.cwd(), "public", "phase-xs-icon.png"),
          cid: "phasexs-logo",
        },
      ],
      text:
        `Hi ${data.fullName},\n\n` +
        `Thank you for your interest in PHASE-XS, the clinical intelligence platform built to accelerate drug development decisions with precision-grade trial data.\n\n` +
        `We have received your inquiry and a member of our team will reach out to you at ${data.email} within 24 business hours.\n\n` +
        `Submission Summary:\n` +
        `  Full Name: ${data.fullName}\n  Email: ${data.email}\n  Job Title: ${data.jobTitle}\n` +
        `  Country Code: ${data.countryCode}\n  Contact Number: ${data.contact}\n` +
        (data.requirements ? `  Requirements: ${data.requirements}\n` : "") +
        `\nIn the meantime, feel free to explore phasexs.com to learn more about our coverage.\n\n` +
        `Warm regards,\nThe PHASE-XS Team\nA venture of Coherent Market Insights`,
    }),
  ])
}

function escape(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
}
