import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { sendContactNotification } from "@/lib/mailer"
import {
  emailSubmissionCountInWindow,
  ensureContactProtectionIndexes,
  getClientIp,
  ipAttemptCountInWindow,
  normalizeContactEmail,
  rateLimitEmailMax,
  rateLimitIpMax,
  recordIpAttempt,
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

    if (process.env.NODE_ENV === "production" && !shouldSkipTurnstileVerification()) {
      if (!turnstileSecretConfigured()) {
        console.error("[api/contact] production requires CLOUDFLARE_TURNSTILE_SECRET_KEY")
        return NextResponse.json({ error: "Contact form is temporarily unavailable" }, { status: 503 })
      }
    }

    const clientIp = getClientIp(req)
    const ua = req.headers.get("user-agent")

    let db
    try {
      db = await getDb()
    } catch {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    }

    await ensureContactProtectionIndexes(db)

    const emailCount = await emailSubmissionCountInWindow(db, emailNorm)
    if (emailCount >= rateLimitEmailMax()) {
      return NextResponse.json(
        { error: "Too many inquiries from this email address. Try again later." },
        { status: 429 },
      )
    }

    const ipCount = await ipAttemptCountInWindow(db, clientIp)
    if (ipCount >= rateLimitIpMax()) {
      return NextResponse.json(
        { error: "Too many requests from this network. Try again later." },
        { status: 429 },
      )
    }

    await recordIpAttempt(db, clientIp)

    const captcha =
      typeof cfTurnstileResponse === "string" ? cfTurnstileResponse : undefined
    const turnstile = await verifyTurnstileToken(captcha, clientIp)
    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.reason }, { status: 400 })
    }

    const result = await db.collection("contact_submissions").insertOne({
      fullName: String(fullName).slice(0, 200),
      email: emailNorm.slice(0, 200),
      company: String(company).slice(0, 200),
      jobTitle: String(jobTitle).slice(0, 200),
      country: String(country).slice(0, 100),
      contact: String(contact).slice(0, 50),
      requirements: String(requirements || "").slice(0, 4000),
      createdAt: new Date(),
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
      userAgent: ua,
    })

    try {
      await sendContactNotification({
        fullName: String(fullName).slice(0, 200),
        email: emailNorm,
        company: String(company).slice(0, 200),
        jobTitle: String(jobTitle).slice(0, 200),
        country: String(country).slice(0, 100),
        contact: String(contact).slice(0, 50),
        requirements: String(requirements || ""),
      })
    } catch (mailErr) {
      console.error("[api/contact] email send failed:", mailErr)
    }

    return NextResponse.json({ ok: true, id: result.insertedId })
  } catch (err) {
    console.error("[api/contact] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
