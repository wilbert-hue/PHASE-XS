import { NextResponse } from "next/server"
import { sendContactNotification } from "@/lib/mailer"
import {
  getClientIp,
  normalizeContactEmail,
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
      recaptchaToken,
    } = body || {}

    if (!fullName || !email || !company || !jobTitle || !country || !contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const emailNorm = normalizeContactEmail(String(email))
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)
    if (!emailOk) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    const clientIp = getClientIp(req)

    // Verify reCAPTCHA if secret key is configured
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY?.trim()
    if (recaptchaSecret) {
      if (!recaptchaToken || typeof recaptchaToken !== "string") {
        return NextResponse.json({ error: "Please complete the reCAPTCHA verification." }, { status: 400 })
      }
      const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: recaptchaSecret, response: recaptchaToken, remoteip: clientIp }),
      })
      const verifyData = await verifyRes.json() as { success: boolean; "error-codes"?: string[] }
      if (!verifyData.success) {
        return NextResponse.json({ error: "reCAPTCHA verification failed. Please try again." }, { status: 400 })
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
      ip: clientIp,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[api/contact] error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
