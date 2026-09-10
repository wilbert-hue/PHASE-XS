import nodemailer from "nodemailer"

type ContactPayload = {
  fullName: string
  email: string
  company: string
  jobTitle: string
  country: string
  contact: string
  requirements?: string
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
          <tr><td style="padding:8px 0;font-weight:bold;">Company</td><td>${escape(data.company)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Job Title</td><td>${escape(data.jobTitle)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Country</td><td>${escape(data.country)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Contact Number</td><td>${escape(data.contact)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;vertical-align:top;">Requirements</td><td style="white-space:pre-wrap;">${escape(data.requirements || "—")}</td></tr>
        </table>
        <p style="margin-top:20px;font-size:12px;color:#3d6070;">Submitted at ${new Date().toISOString()}</p>
      </div>
    </div>
  `

  const confirmationHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color:#1B4965; background:#ffffff;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1B4965 0%,#1E6080 60%,#2A8F9C 100%);padding:28px 32px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td>
              <p style="margin:0;font-family:monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Clinical Intelligence Platform</p>
              <h1 style="margin:6px 0 0;font-size:26px;font-weight:700;letter-spacing:0.06em;color:#ffffff;font-family:Arial,sans-serif;">PHASE-XS</h1>
            </td>
          </tr>
        </table>
      </div>

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
            <tr><td style="padding:5px 0;width:130px;color:#3d6070;">Company</td><td style="font-weight:600;">${escape(data.company)}</td></tr>
            <tr><td style="padding:5px 0;color:#3d6070;">Role</td><td style="font-weight:600;">${escape(data.jobTitle)}</td></tr>
            <tr><td style="padding:5px 0;color:#3d6070;">Country</td><td style="font-weight:600;">${escape(data.country)}</td></tr>
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

      <!-- Footer -->
      <div style="padding:18px 32px;background:#1B4965;text-align:center;">
        <p style="margin:0;font-family:monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.5);">
          This is an automated confirmation. Please do not reply to this email.<br/>
          &copy; ${new Date().getFullYear()} Coherent Market Insights &mdash; PHASE-XS
        </p>
      </div>
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
        `Name: ${data.fullName}\nEmail: ${data.email}\nCompany: ${data.company}\n` +
        `Job Title: ${data.jobTitle}\nCountry: ${data.country}\nContact: ${data.contact}\n\n` +
        `Requirements:\n${data.requirements || "—"}`,
    }),
    // Confirmation to the submitter
    t.sendMail({
      from: `"PHASE-XS" <${from}>`,
      to: data.email,
      subject: `We received your inquiry — PHASE-XS`,
      html: confirmationHtml,
      text:
        `Hi ${data.fullName},\n\n` +
        `Thank you for your interest in PHASE-XS, the clinical intelligence platform built to accelerate drug development decisions with precision-grade trial data.\n\n` +
        `We have received your inquiry and a member of our team will reach out to you at ${data.email} within 24 business hours.\n\n` +
        `Submission Summary:\n` +
        `  Company: ${data.company}\n  Role: ${data.jobTitle}\n  Country: ${data.country}\n` +
        (data.requirements ? `  Requirements: ${data.requirements}\n` : "") +
        `\nIn the meantime, feel free to explore phasexs.com to learn more about our coverage.\n\n` +
        `Warm regards,\nThe PHASE-XS Team\nA venture of Coherent Market Insights`,
    }),
  ])
}

function escape(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
}
