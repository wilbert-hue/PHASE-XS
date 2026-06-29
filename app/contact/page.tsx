"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Turnstile } from "@marsidev/react-turnstile"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { ScrambleTextOnHover } from "@/components/scramble-text"

const countries = [
  "United States", "United Kingdom", "India", "Australia", "Canada", "Germany",
  "France", "Japan", "China", "Singapore", "United Arab Emirates", "Other",
]

const turnstileSiteKey = (process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "").trim()

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "rgba(240, 245, 247, 0.4)",
  border: "1px solid rgba(42, 143, 156, 0.3)",
  color: "#1B4965",
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "12px",
  letterSpacing: "0.05em",
  outline: "none",
  borderRadius: 0,
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [agreed, setAgreed] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [offices, setOffices] = useState<{ label: string; address: string; phone: string }[]>([])
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)

  useEffect(() => {
    fetch("/api/offices")
      .then((r) => r.json())
      .then((d) => setOffices(d.offices || []))
      .catch(() => {})
  }, [])

  const turnstileWidgetEnabled = turnstileSiteKey.length > 0

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agreed) return alert("Please acknowledge the Privacy Policy.")
    if (turnstileWidgetEnabled && !turnstileToken) {
      return alert("Complete the verification challenge before submitting.")
    }

    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      company: fd.get("company"),
      jobTitle: fd.get("jobTitle"),
      country: fd.get("country"),
      contact: fd.get("contact"),
      requirements: fd.get("requirements"),
      cfTurnstileResponse: turnstileWidgetEnabled ? turnstileToken ?? "" : "",
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Submission failed")
      setSubmitted(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed"
      alert(message)
      setTurnstileToken(null)
      setTurnstileResetKey((k) => k + 1)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden pl-6 md:pl-28 pr-6 md:pr-12 py-16">
      <AnimatedNoise opacity={0.03} />

      {/* Gradient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 15% 50%, rgba(27, 73, 101, 0.10) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 75% 25%, rgba(42, 143, 156, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 85%, rgba(79, 189, 186, 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Left vertical label */}
      <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em] -rotate-90 origin-left block whitespace-nowrap"
          style={{ color: "#3AAFA9" }}
        >
          CONTACT
        </span>
      </div>

      {/* Left accent line */}
      <div
        className="absolute left-0 top-[15%] w-[2px] h-[40%] opacity-40"
        style={{
          background: "linear-gradient(to bottom, transparent, #1B4965, #2A8F9C, #4FBDBA, transparent)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest" style={{ color: "#3d6070" }}>
          <Link href="/" className="hover:text-[#1B4965] transition-colors" style={{ color: "#3AAFA9" }}>
            ← HOME
          </Link>
          <span style={{ color: "rgba(42, 143, 156, 0.5)" }}>/</span>
          <span style={{ color: "#1E6080" }}>CONTACT</span>
        </div>

        {/* Title */}
        <h1
          className="font-[var(--font-bebas)] text-[clamp(2.5rem,6vw,5rem)] leading-none tracking-wide"
          style={{ color: "#1B4965" }}
        >
          GET IN TOUCH
        </h1>
        <h2
          className="font-[var(--font-bebas)] text-[clamp(1rem,2vw,1.5rem)] mt-2 tracking-wide"
          style={{ color: "#1E6080" }}
        >
          Let's discuss your clinical research needs
        </h2>

        <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed" style={{ color: "#3d6070" }}>
          <span style={{ color: "#3AAFA9", fontWeight: 600 }}>Within 24 hours.</span>{" "}
          Fill the form and our team will reach out with tailored insights for your project.
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {/* Form */}
          <div className="md:col-span-2">
            <div
              className="relative p-8"
              style={{
                background: "rgba(240, 245, 247, 0.6)",
                border: "1px solid rgba(42, 143, 156, 0.3)",
                backdropFilter: "blur(4px)",
              }}
            >
              {/* Corner ticks */}
              <span className="absolute -top-px -left-px w-3 h-3 border-l-2 border-t-2" style={{ borderColor: "#3AAFA9" }} />
              <span className="absolute -top-px -right-px w-3 h-3 border-r-2 border-t-2" style={{ borderColor: "#3AAFA9" }} />
              <span className="absolute -bottom-px -left-px w-3 h-3 border-l-2 border-b-2" style={{ borderColor: "#3AAFA9" }} />
              <span className="absolute -bottom-px -right-px w-3 h-3 border-r-2 border-b-2" style={{ borderColor: "#3AAFA9" }} />

              <div className="mb-6 flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#3AAFA9" }} />
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#1E6080" }}>
                  Inquiry Form / Response within 24h
                </span>
              </div>

              {!turnstileWidgetEnabled && (
                <p
                  className="mb-4 font-mono text-[11px] leading-relaxed"
                  style={{ color: "#B45309", borderBottom: "1px solid rgba(180,83,9,0.25)", paddingBottom: 10 }}
                >
                  Set{" "}
                  <code style={{ fontSize: 10 }}>NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY</code> for production CAPTCHA,
                  or in local dev enable{" "}
                  <code style={{ fontSize: 10 }}>CONTACT_SKIP_TURNSTILE=true</code> (never in production) to omit the widget.
                  Cloudflare publishes always-pass widget keys for non-prod testing.
                </p>
              )}

              {submitted ? (
                <div className="py-16 text-center">
                  <h3 className="font-[var(--font-bebas)] text-4xl tracking-wide" style={{ color: "#1B4965" }}>
                    SIGNAL RECEIVED
                  </h3>
                  <p className="mt-3 font-mono text-xs uppercase tracking-widest" style={{ color: "#3d6070" }}>
                    Our team will contact you within 24 hours.
                  </p>
                  <Link
                    href="/"
                    className="mt-8 inline-flex items-center gap-3 px-6 py-3 font-mono text-xs uppercase tracking-widest text-white"
                    style={{
                      background: "linear-gradient(135deg, #1B4965, #1E6080)",
                      border: "1px solid rgba(42, 143, 156, 0.3)",
                    }}
                  >
                    Return Home <BitmapChevron />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Full Name" name="fullName" required />
                    <Field label="Business Email" name="email" type="email" required />
                    <Field label="Company" name="company" required />
                    <Field label="Job Title" name="jobTitle" required />
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "#3AAFA9" }}>
                        Country *
                      </label>
                      <select required name="country" defaultValue="" style={inputStyle}>
                        <option value="" disabled>— Select —</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <Field label="Contact Number" name="contact" required />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "#3AAFA9" }}>
                      Research Requirements
                    </label>
                    <textarea
                      name="requirements"
                      rows={4}
                      placeholder="Specify your business objectives and research scope..."
                      style={{ ...inputStyle, resize: "none" }}
                    />
                  </div>

                  {turnstileWidgetEnabled ? (
                    <div className="space-y-2">
                      <span className="block font-mono text-[10px] uppercase tracking-widest" style={{ color: "#3AAFA9" }}>
                        Verification
                      </span>
                      <Turnstile
                        key={turnstileResetKey}
                        siteKey={turnstileSiteKey}
                        onSuccess={(t) => setTurnstileToken(t)}
                        onExpire={() => setTurnstileToken(null)}
                        onError={() => setTurnstileToken(null)}
                      />
                    </div>
                  ) : null}

                  <label className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest" style={{ color: "#3d6070" }}>
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      style={{ accentColor: "#2A8F9C" }}
                    />
                    I acknowledge the{" "}
                    <a href="#" className="underline" style={{ color: "#3AAFA9" }}>Privacy Policy</a>
                  </label>

                  <div className="flex items-center gap-8 pt-2">
                    <button
                      type="submit"
                      disabled={submitting || (turnstileWidgetEnabled && !turnstileToken)}
                      className="group inline-flex items-center gap-3 px-6 py-3 font-mono text-xs uppercase tracking-widest text-white transition-all duration-300 hover:shadow-lg disabled:opacity-45 disabled:pointer-events-none"
                      style={{
                        background: "linear-gradient(135deg, #1B4965, #1E6080)",
                        border: "1px solid rgba(42, 143, 156, 0.3)",
                      }}
                      onMouseOver={(e) => {
                        if (e.currentTarget.disabled) return
                        e.currentTarget.style.background = "linear-gradient(135deg, #1E6080, #2A8F9C)"
                        e.currentTarget.style.borderColor = "rgba(58, 175, 169, 0.5)"
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "linear-gradient(135deg, #1B4965, #1E6080)"
                        e.currentTarget.style.borderColor = "rgba(42, 143, 156, 0.3)"
                      }}
                    >
                      <ScrambleTextOnHover text={submitting ? "Submitting..." : "Submit Request"} as="span" duration={0.6} />
                      <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
                    </button>
                    <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#3d6070" }}>
                      Encrypted / Confidential
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Offices */}
          <aside
            className="relative p-6"
            style={{
              border: "1px solid rgba(42, 143, 156, 0.3)",
              background: "rgba(27, 73, 101, 0.04)",
            }}
          >
            <span className="absolute -top-px -left-px w-3 h-3 border-l-2 border-t-2" style={{ borderColor: "#3AAFA9" }} />
            <span className="absolute -top-px -right-px w-3 h-3 border-r-2 border-t-2" style={{ borderColor: "#3AAFA9" }} />
            <span className="absolute -bottom-px -left-px w-3 h-3 border-l-2 border-b-2" style={{ borderColor: "#3AAFA9" }} />
            <span className="absolute -bottom-px -right-px w-3 h-3 border-r-2 border-b-2" style={{ borderColor: "#3AAFA9" }} />

            <h3 className="font-[var(--font-bebas)] text-2xl tracking-wide mb-4" style={{ color: "#1B4965" }}>
              OUR OFFICES
            </h3>
            <p className="font-mono text-[11px] mb-6" style={{ color: "#3AAFA9" }}>
              sales@coherentmarketinsights.com
            </p>

            <div className="space-y-5 font-mono text-[11px] leading-relaxed" style={{ color: "#3d6070" }}>
              {offices.length === 0 ? (
                <p style={{ color: "#3AAFA9" }}>Loading offices...</p>
              ) : (
                offices.map((o) => <Office key={o.label} label={o.label} addr={o.address} tel={o.phone} />)
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Floating tag */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-10">
        <div
          className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest"
          style={{
            border: "1px solid rgba(42, 143, 156, 0.3)",
            color: "#1E6080",
            background: "rgba(27, 73, 101, 0.04)",
          }}
        >
          v.01 / Secure Channel
        </div>
      </div>
    </main>
  )
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "#3AAFA9" }}>
        {label} {required && "*"}
      </label>
      <input required={required} type={type} name={name} style={inputStyle} />
    </div>
  )
}

function Office({ label, addr, tel }: { label: string; addr: string; tel: string }) {
  return (
    <div>
      <p className="uppercase tracking-widest text-[10px]" style={{ color: "#1E6080" }}>{label}</p>
      {addr && <p className="mt-1">{addr}</p>}
      <p className="mt-1" style={{ color: "#2A8F9C" }}>{tel}</p>
    </div>
  )
}
