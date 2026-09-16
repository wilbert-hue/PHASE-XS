"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { Footer } from "@/components/footer"
import { PERSONAL_DOMAINS } from "@/lib/personal-domains"

const recaptchaSiteKey = (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "").trim()

function isPersonalEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() || ""
  return PERSONAL_DOMAINS.has(domain)
}

const COUNTRY_CODES = [
  { code: "+93", name: "Afghanistan" },
  { code: "+355", name: "Albania" },
  { code: "+213", name: "Algeria" },
  { code: "+54", name: "Argentina" },
  { code: "+374", name: "Armenia" },
  { code: "+61", name: "Australia" },
  { code: "+43", name: "Austria" },
  { code: "+994", name: "Azerbaijan" },
  { code: "+973", name: "Bahrain" },
  { code: "+880", name: "Bangladesh" },
  { code: "+375", name: "Belarus" },
  { code: "+32", name: "Belgium" },
  { code: "+55", name: "Brazil" },
  { code: "+1", name: "Canada / USA" },
  { code: "+56", name: "Chile" },
  { code: "+86", name: "China" },
  { code: "+57", name: "Colombia" },
  { code: "+506", name: "Costa Rica" },
  { code: "+385", name: "Croatia" },
  { code: "+357", name: "Cyprus" },
  { code: "+420", name: "Czech Republic" },
  { code: "+45", name: "Denmark" },
  { code: "+20", name: "Egypt" },
  { code: "+372", name: "Estonia" },
  { code: "+358", name: "Finland" },
  { code: "+33", name: "France" },
  { code: "+995", name: "Georgia" },
  { code: "+49", name: "Germany" },
  { code: "+233", name: "Ghana" },
  { code: "+30", name: "Greece" },
  { code: "+852", name: "Hong Kong" },
  { code: "+36", name: "Hungary" },
  { code: "+354", name: "Iceland" },
  { code: "+91", name: "India" },
  { code: "+62", name: "Indonesia" },
  { code: "+98", name: "Iran" },
  { code: "+353", name: "Ireland" },
  { code: "+972", name: "Israel" },
  { code: "+39", name: "Italy" },
  { code: "+81", name: "Japan" },
  { code: "+962", name: "Jordan" },
  { code: "+7", name: "Kazakhstan / Russia" },
  { code: "+254", name: "Kenya" },
  { code: "+82", name: "South Korea" },
  { code: "+965", name: "Kuwait" },
  { code: "+371", name: "Latvia" },
  { code: "+961", name: "Lebanon" },
  { code: "+370", name: "Lithuania" },
  { code: "+352", name: "Luxembourg" },
  { code: "+60", name: "Malaysia" },
  { code: "+960", name: "Maldives" },
  { code: "+356", name: "Malta" },
  { code: "+52", name: "Mexico" },
  { code: "+31", name: "Netherlands" },
  { code: "+64", name: "New Zealand" },
  { code: "+234", name: "Nigeria" },
  { code: "+47", name: "Norway" },
  { code: "+968", name: "Oman" },
  { code: "+92", name: "Pakistan" },
  { code: "+507", name: "Panama" },
  { code: "+51", name: "Peru" },
  { code: "+63", name: "Philippines" },
  { code: "+48", name: "Poland" },
  { code: "+351", name: "Portugal" },
  { code: "+974", name: "Qatar" },
  { code: "+40", name: "Romania" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+65", name: "Singapore" },
  { code: "+421", name: "Slovakia" },
  { code: "+27", name: "South Africa" },
  { code: "+34", name: "Spain" },
  { code: "+94", name: "Sri Lanka" },
  { code: "+46", name: "Sweden" },
  { code: "+41", name: "Switzerland" },
  { code: "+886", name: "Taiwan" },
  { code: "+66", name: "Thailand" },
  { code: "+216", name: "Tunisia" },
  { code: "+90", name: "Turkey" },
  { code: "+380", name: "Ukraine" },
  { code: "+971", name: "UAE" },
  { code: "+44", name: "United Kingdom" },
  { code: "+598", name: "Uruguay" },
  { code: "+998", name: "Uzbekistan" },
  { code: "+84", name: "Vietnam" },
]

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "#ffffff",
  border: "1px solid rgba(27, 73, 101, 0.25)",
  color: "#1B4965",
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "13px",
  letterSpacing: "0.03em",
  outline: "none",
  borderRadius: 0,
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [agreed, setAgreed] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const recaptchaEnabled = recaptchaSiteKey.length > 0

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agreed) return alert("Please acknowledge the Privacy Policy.")
    if (recaptchaEnabled && !recaptchaToken) {
      return alert("Please complete the reCAPTCHA verification.")
    }

    const form = e.currentTarget
    const fd = new FormData(form)

    const rawEmail = String(fd.get("email") || "")
    if (isPersonalEmail(rawEmail)) {
      return alert("Please use your business email address. Personal email providers (Gmail, Yahoo, Outlook, etc.) are not accepted.")
    }

    const payload = {
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      jobTitle: fd.get("jobTitle"),
      countryCode: fd.get("countryCode"),
      contact: fd.get("contact"),
      requirements: fd.get("requirements"),
      recaptchaToken: recaptchaEnabled ? recaptchaToken ?? "" : "",
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
      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
    {/* Minimal contact page header — logo only, no nav links */}
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(240,245,247,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(42,143,156,0.18)",
        boxShadow: "0 2px 16px rgba(27,73,101,0.06)",
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 h-14 sm:h-16 flex items-center justify-between">
        {/* PHASE-XS logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 w-6 h-6 sm:w-7 sm:h-7">
            <circle cx="22" cy="22" r="19" stroke="#2A8F9C" strokeWidth="1.3" strokeDasharray="3 2.5"/>
            <circle cx="22" cy="22" r="11" stroke="#2A8F9C" strokeWidth="1" opacity="0.4"/>
            <line x1="22" y1="2"  x2="22" y2="9"  stroke="#2A8F9C" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="22" y1="35" x2="22" y2="42" stroke="#2A8F9C" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="2"  y1="22" x2="9"  y2="22" stroke="#2A8F9C" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="35" y1="22" x2="42" y2="22" stroke="#2A8F9C" strokeWidth="1.6" strokeLinecap="round"/>
            <circle cx="22" cy="22" r="2.5" fill="#2A8F9C"/>
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-[var(--font-bebas)] tracking-[0.1em] text-lg sm:text-xl" style={{ color: "#1B4965" }}>PHASE-XS</span>
            <span className="font-mono tracking-[0.22em] uppercase text-[7px] sm:text-[8px]" style={{ color: "#2A8F9C" }}>Clinical Intelligence</span>
          </div>
        </Link>

        {/* Center label */}
        <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.25em] absolute left-1/2 -translate-x-1/2" style={{ color: "#1B4965" }}>
          Inquiry Portal
        </span>

        {/* Coherent Market Insights logo */}
        <a
          href="https://www.coherentmarketinsights.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 opacity-90 hover:opacity-100 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/image.png" alt="Coherent Market Insights" className="h-9 sm:h-11 w-auto" />
        </a>
      </div>
    </header>
    <main className="relative min-h-screen overflow-hidden px-4 sm:px-6 lg:px-12 xl:px-20 pt-24 sm:pt-28 pb-16">
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

        <div className="mt-12">
          {/* Form */}
          <div>
            <div
              className="relative p-8"
              style={{
                background: "rgba(225, 235, 240, 0.85)",
                border: "1px solid rgba(27, 73, 101, 0.2)",
                backdropFilter: "blur(8px)",
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
                    <Field label="Job Title" name="jobTitle" required />
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-wider mb-1.5" style={{ color: "#1B4965" }}>
                        Country Code *
                      </label>
                      <select required name="countryCode" defaultValue="" style={inputStyle}>
                        <option value="" disabled>— Select Country Code —</option>
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code + c.name} value={c.code}>{c.code} — {c.name}</option>
                        ))}
                      </select>
                    </div>
                    <Field label="Contact Number" name="contact" placeholder="9876543210" required />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider mb-1.5" style={{ color: "#1B4965" }}>
                      Research Requirements
                    </label>
                    <textarea
                      name="requirements"
                      rows={4}
                      placeholder="Specify your business objectives and research scope..."
                      style={{ ...inputStyle, resize: "none" }}
                    />
                  </div>

                  {recaptchaEnabled && (
                    <div className="space-y-2">
                      <span className="block font-mono text-xs uppercase tracking-wider" style={{ color: "#1B4965" }}>
                        Verification
                      </span>
                      <div style={{ transform: "scale(0.82)", transformOrigin: "left top", height: 62 }}>
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey={recaptchaSiteKey}
                          onChange={(token) => setRecaptchaToken(token)}
                          onExpired={() => setRecaptchaToken(null)}
                          onErrored={() => setRecaptchaToken(null)}
                          theme="light"
                        />
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider" style={{ color: "#1B4965" }}>
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      style={{ accentColor: "#2A8F9C" }}
                    />
                    I acknowledge the{" "}
                    <a href="#" className="underline" style={{ color: "#2A8F9C" }}>Privacy Policy</a>
                  </label>

                  <div className="flex items-center gap-8 pt-2">
                    <button
                      type="submit"
                      disabled={submitting || (recaptchaEnabled && !recaptchaToken)}
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
                    <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#1E6080" }}>
                      Encrypted / Confidential
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

    </main>
    <Footer />
    </>
  )
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-wider mb-1.5" style={{ color: "#1B4965" }}>
        {label} {required && "*"}
      </label>
      <input required={required} type={type} name={name} placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

