import type { Db } from "mongodb"

const IP_COLLECTION = "contact_ip_attempts"
const SUBMISSION_COLLECTION = "contact_submissions"

let indexesOnce: Promise<void> | undefined

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) {
    const first = xff.split(",")[0]?.trim()
    if (first) return first.slice(0, 128)
  }
  const real = req.headers.get("x-real-ip")?.trim()
  if (real) return real.slice(0, 128)
  return "unknown"
}

export function normalizeContactEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function ensureContactProtectionIndexes(db: Db): Promise<void> {
  indexesOnce ??= (async () => {
    await db.collection(IP_COLLECTION).createIndex({ createdAt: 1 }, { expireAfterSeconds: 172800 })
    await db.collection(SUBMISSION_COLLECTION).createIndex({ createdAt: -1 })
    await db.collection(SUBMISSION_COLLECTION).createIndex({ email: 1 })
  })()
  return indexesOnce
}

function envInt(key: string, fallback: number): number {
  const v = Number(process.env[key])
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback
}

export function rateLimitIpWindowMs(): number {
  return envInt("CONTACT_RATE_LIMIT_IP_WINDOW_MS", 60 * 60 * 1000)
}

export function rateLimitIpMax(): number {
  return envInt("CONTACT_RATE_LIMIT_IP_MAX", 25)
}

export function rateLimitEmailWindowMs(): number {
  return envInt("CONTACT_RATE_LIMIT_EMAIL_WINDOW_MS", 24 * 60 * 60 * 1000)
}

export function rateLimitEmailMax(): number {
  return envInt("CONTACT_RATE_LIMIT_EMAIL_MAX", 5)
}

/** Successful submissions only — prevents inbox spam from repeat addresses. */
export async function emailSubmissionCountInWindow(db: Db, emailNorm: string): Promise<number> {
  const windowStart = new Date(Date.now() - rateLimitEmailWindowMs())
  return db.collection(SUBMISSION_COLLECTION).countDocuments({
    email: emailNorm,
    createdAt: { $gte: windowStart },
  })
}

/** All attempts once basic validation passes (including failed CAPTCHA). */
export async function ipAttemptCountInWindow(db: Db, ip: string): Promise<number> {
  const windowStart = new Date(Date.now() - rateLimitIpWindowMs())
  return db.collection(IP_COLLECTION).countDocuments({
    ip,
    createdAt: { $gte: windowStart },
  })
}

export async function recordIpAttempt(db: Db, ip: string): Promise<void> {
  await db.collection(IP_COLLECTION).insertOne({
    ip: ip.slice(0, 128),
    createdAt: new Date(),
  })
}

export function shouldSkipTurnstileVerification(): boolean {
  return (
    process.env.CONTACT_SKIP_TURNSTILE === "true" && process.env.NODE_ENV !== "production"
  )
}

export function turnstileSecretConfigured(): boolean {
  return Boolean(process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY?.trim())
}

type SiteverifyPayload = {
  success?: boolean
  "error-codes"?: string[]
}

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (shouldSkipTurnstileVerification()) {
    return { ok: true }
  }

  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY?.trim()
  if (!secret) {
    console.error("[contact-protection] CLOUDFLARE_TURNSTILE_SECRET_KEY missing in production-like run")
    return { ok: false, reason: "Captcha not configured on server" }
  }

  if (!token || typeof token !== "string" || !token.trim()) {
    return { ok: false, reason: "Complete the verification challenge" }
  }

  try {
    const body = new URLSearchParams({
      secret,
      response: token.trim(),
    })
    if (remoteIp && remoteIp !== "unknown") {
      body.set("remoteip", remoteIp)
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })

    const data = (await res.json()) as SiteverifyPayload
    if (!res.ok || !data.success) {
      const codes = data["error-codes"]?.join(", ") || res.statusText
      console.warn("[contact-protection] turnstile rejected", codes)
      return { ok: false, reason: "Verification failed. Try again." }
    }
    return { ok: true }
  } catch (e) {
    console.error("[contact-protection] turnstile verify error", e)
    return { ok: false, reason: "Verification service unavailable. Try again shortly." }
  }
}
