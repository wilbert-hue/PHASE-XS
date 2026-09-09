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

  const html = `
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

  await t.sendMail({
    from: `"PHASE-XS Contact" <${from}>`,
    to,
    replyTo: data.email,
    subject: `New PHASE-XS inquiry from ${data.fullName} (${data.company})`,
    html,
    text:
      `New PHASE-XS contact request\n\n` +
      `Name: ${data.fullName}\nEmail: ${data.email}\nCompany: ${data.company}\n` +
      `Job Title: ${data.jobTitle}\nCountry: ${data.country}\nContact: ${data.contact}\n\n` +
      `Requirements:\n${data.requirements || "—"}`,
  })
}

function escape(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
}
