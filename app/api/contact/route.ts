import { NextResponse } from "next/server"
import { sendContactNotification } from "@/lib/mailer"
import {
  getClientIp,
  normalizeContactEmail,
} from "@/lib/contact-protection"
import { PERSONAL_DOMAINS } from "@/lib/personal-domains"

// Lookup: country code → country name
const CODE_TO_COUNTRY: Record<string, string> = {
  "+93": "Afghanistan", "+355": "Albania", "+213": "Algeria", "+54": "Argentina",
  "+374": "Armenia", "+61": "Australia", "+43": "Austria", "+994": "Azerbaijan",
  "+973": "Bahrain", "+880": "Bangladesh", "+375": "Belarus", "+32": "Belgium",
  "+55": "Brazil", "+1": "Canada / USA", "+56": "Chile", "+86": "China",
  "+57": "Colombia", "+506": "Costa Rica", "+385": "Croatia", "+357": "Cyprus",
  "+420": "Czech Republic", "+45": "Denmark", "+20": "Egypt", "+372": "Estonia",
  "+358": "Finland", "+33": "France", "+995": "Georgia", "+49": "Germany",
  "+233": "Ghana", "+30": "Greece", "+852": "Hong Kong", "+36": "Hungary",
  "+354": "Iceland", "+91": "India", "+62": "Indonesia", "+98": "Iran",
  "+353": "Ireland", "+972": "Israel", "+39": "Italy", "+81": "Japan",
  "+962": "Jordan", "+7": "Kazakhstan / Russia", "+254": "Kenya", "+82": "South Korea",
  "+965": "Kuwait", "+371": "Latvia", "+961": "Lebanon", "+370": "Lithuania",
  "+352": "Luxembourg", "+60": "Malaysia", "+960": "Maldives", "+356": "Malta",
  "+52": "Mexico", "+31": "Netherlands", "+64": "New Zealand", "+234": "Nigeria",
  "+47": "Norway", "+968": "Oman", "+92": "Pakistan", "+507": "Panama",
  "+51": "Peru", "+63": "Philippines", "+48": "Poland", "+351": "Portugal",
  "+974": "Qatar", "+40": "Romania", "+966": "Saudi Arabia", "+65": "Singapore",
  "+421": "Slovakia", "+27": "South Africa", "+34": "Spain", "+94": "Sri Lanka",
  "+46": "Sweden", "+41": "Switzerland", "+886": "Taiwan", "+66": "Thailand",
  "+216": "Tunisia", "+90": "Turkey", "+380": "Ukraine", "+971": "UAE",
  "+44": "United Kingdom", "+598": "Uruguay", "+998": "Uzbekistan", "+84": "Vietnam",
}

function deriveCompany(email: string): string {
  const domain = email.split("@")[1] || ""
  const host = domain.split(".")[0] || domain
  return host.charAt(0).toUpperCase() + host.slice(1)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      fullName,
      email,
      jobTitle,
      countryCode,
      contact,
      requirements,
      recaptchaToken,
    } = body || {}

    if (!fullName || !email || !jobTitle || !countryCode || !contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const emailNorm = normalizeContactEmail(String(email))
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)
    if (!emailOk) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    const emailDomain = emailNorm.split("@")[1]?.toLowerCase() || ""
    if (PERSONAL_DOMAINS.has(emailDomain)) {
      return NextResponse.json({ error: "Please use a business email address." }, { status: 400 })
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

    const codeStr = String(countryCode).slice(0, 10)
    const country = CODE_TO_COUNTRY[codeStr] || codeStr
    const company = deriveCompany(emailNorm)

    await sendContactNotification({
      fullName: String(fullName).slice(0, 200),
      email: emailNorm,
      jobTitle: String(jobTitle).slice(0, 200),
      countryCode: codeStr,
      country,
      company,
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
