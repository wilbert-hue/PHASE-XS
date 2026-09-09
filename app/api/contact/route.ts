import { NextResponse } from "next/server"
import { sendContactNotification } from "@/lib/mailer"
import {
  getClientIp,
  normalizeContactEmail,
  shouldSkipTurnstileVerification,
  turnstileSecretConfigured,
  verifyTurnstileToken,
} from "@/lib/contact-protection"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      fullName,
      email,
      company,
      jobTitle,
      country,
      contact,
      requirements,
      cfTurnstileResponse,
    } = body || {}

    if (!fullName || !email || !company || !jobTitle || !country || !contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const emailNorm = normalizeContactEmail(String(email))
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)
    if (!emailOk) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    // Turnstile: only verify if a secret key is configured. If none is set,
    // skip CAPTCHA silently so the form still works without Cloudflare.
    if (turnstileSecretConfigured() && !shouldSkipTurnstileVerification()) {
      const clientIp = getClientIp(req)
      const captcha = typeof cfTurnstileResponse === "string" ? cfTurnstileResponse : undefined
      const turnstile = await verifyTurnstileToken(captcha, clientIp)
      if (!turnstile.ok) {
        return NextResponse.json({ error: turnstile.reason }, { status: 400 })
      }
    }

    await sendContactNotification({
      fullName: String(fullName).slice(0, 200),
      email: emailNorm,
      company: String(company).slice(0, 200),
      jobTitle: String(jobTitle).slice(0, 200),
      country: String(country).slice(0, 100),
      contact: String(contact).slice(0, 50),
      requirements: String(requirements || ""),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/contact] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
