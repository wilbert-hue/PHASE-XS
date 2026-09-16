"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const contactNumbers = [
  { region: "United States", number: "+1-252-477-1362" },
  { region: "United Kingdom", number: "+44-203-957-8553 / +44-203-949-5508" },
  { region: "Australia", number: "+61-8-7924-7805" },
  { region: "India", number: "+91-848-285-0837" },
]

const menuLinks = [
  { label: "About Us", href: "#" },
  { label: "Industries", href: "#" },
  { label: "Services", href: "#" },
  { label: "Contact Us", href: "#" },
]

const readerClubLinks = [
  { label: "Latest Insights", href: "#" },
  { label: "Press Release", href: "#" },
  { label: "Infographics", href: "#" },
  { label: "Guest Post Placement", href: "#" },
  { label: "News", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Blogs", href: "#", accent: true },
]

const helpLinks = [
  { label: "Become Reseller", href: "#" },
  { label: "How To Order?", href: "#" },
  { label: "Terms and Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Disclaimer", href: "#" },
  { label: "Sitemap", href: "#" },
  { label: "Feeds", href: "#" },
]

const offices = [
  {
    title: "U.S. Office:",
    address: "Coherent Market Insights Pvt Ltd, 533 Airport Boulevard, Suite 400, Burlingame, CA 94010, United States.",
  },
  {
    title: "UK Office:",
    address: "Coherent Market Insights Pvt Ltd, Office 15811, 182-184 High Street North, East Ham, London E6 2JA, United Kingdom.",
  },
  {
    title: "India Office (Headquarters):",
    address: "Coherent Market Insights Pvt Ltd, 401, 4th Floor, Bremen Business Center, Aundh, Pune, Maharashtra 411007, India.",
  },
]

const socialLinks = [
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "#",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Pinterest",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
      </svg>
    ),
  },
]

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!footerRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }, footerRef)

    return () => ctx.revert()
  }, [])

  return (
    <footer
      ref={footerRef}
      className="relative"
      style={{ background: "#0c1b24" }}
    >
      {/* Contact bar */}
      <div
        style={{
          background: "linear-gradient(135deg, #1B4965, #1E6080)",
        }}
      >
        <div className="flex flex-col md:flex-row items-stretch px-6 md:px-12 lg:px-20">
          {/* Contact Us label */}
          <div className="flex items-center pr-6 md:pr-8 py-4 flex-shrink-0">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/80">Contact Us</span>
          </div>

          {/* Numbers */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4">
            {contactNumbers.map((contact) => (
              <div
                key={contact.region}
                className="flex items-center gap-3 px-4 md:px-5 py-4"
                style={{
                  borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4FBDBA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest font-medium text-white">
                    {contact.region}
                  </p>
                  <p className="font-mono text-[10px] mt-0.5 text-white/80">
                    {contact.number}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content — compact to fit single viewport */}
      <div ref={contentRef} className="px-6 md:px-12 lg:px-20 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-6">

          {/* Column 1: Business Enquiry & Offices */}
          <div className="col-span-2 lg:col-span-2">
            <h5 className="font-mono text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: "#3AAFA9" }}>
              For Business Enquiry
            </h5>
            <a
              href="mailto:sales@coherentmarketinsights.com"
              className="font-mono text-xs transition-colors duration-200 inline-flex items-center gap-2"
              style={{ color: "#4FBDBA" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#4FBDBA")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 7L2 7" />
              </svg>
              sales@coherentmarketinsights.com
            </a>

            <div className="mt-5 space-y-4">
              {offices.map((office) => (
                <div key={office.title}>
                  <h6 className="font-mono text-[11px] font-medium mb-1 text-white">
                    {office.title}
                  </h6>
                  <div className="flex items-start gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2A8F9C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <p className="font-mono text-[11px] leading-relaxed text-white/80">
                      {office.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Menu */}
          <div>
            <h5 className="font-mono text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: "#3AAFA9" }}>
              Menu
            </h5>
            <ul className="space-y-2">
              {menuLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-mono text-[11px] transition-colors duration-200 text-white/80"
                    onMouseOver={(e) => (e.currentTarget.style.color = "#4FBDBA")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Reader Club */}
          <div>
            <h5 className="font-mono text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: "#3AAFA9" }}>
              Reader Club
            </h5>
            <ul className="space-y-2">
              {readerClubLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-mono text-[11px] transition-colors duration-200"
                    style={{ color: link.accent ? "#4FBDBA" : "rgba(255,255,255,0.45)" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#4FBDBA")}
                    onMouseOut={(e) => (e.currentTarget.style.color = link.accent ? "#4FBDBA" : "rgba(255,255,255,0.45)")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Help + HR + Social + Payments */}
          <div>
            <h5 className="font-mono text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: "#3AAFA9" }}>
              Help
            </h5>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-mono text-[11px] transition-colors duration-200 text-white/80"
                    onMouseOver={(e) => (e.currentTarget.style.color = "#4FBDBA")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* HR Contact */}
            <div className="mt-5">
              <h5 className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: "#3AAFA9" }}>
                HR Contact
              </h5>
              <a
                href="tel:+917262891127"
                className="font-mono text-[11px] inline-flex items-center gap-1.5 transition-colors duration-200 text-white/80"
                onMouseOver={(e) => (e.currentTarget.style.color = "#4FBDBA")}
                onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                +91-7262891127
              </a>
            </div>

            {/* Social */}
            <div className="mt-5">
              <h5 className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: "#3AAFA9" }}>
                Connect With Us
              </h5>
              <div className="flex gap-1.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-8 h-8 flex items-center justify-center transition-all duration-200"
                    style={{
                      border: "1px solid rgba(79, 189, 186, 0.2)",
                      color: "rgba(255,255,255,0.5)",
                      background: "transparent",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#2A8F9C"
                      e.currentTarget.style.borderColor = "#2A8F9C"
                      e.currentTarget.style.color = "#fff"
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "transparent"
                      e.currentTarget.style.borderColor = "rgba(79, 189, 186, 0.2)"
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)"
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Secure Payment */}
            <div className="mt-5">
              <h5 className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: "#3AAFA9" }}>
                Secure Payment By
              </h5>
              <div className="flex items-center gap-1.5">
                {["VISA", "DISCOVER", "MasterCard", "AMEX"].map((card) => (
                  <div
                    key={card}
                    className="px-2 py-1 font-mono text-[9px] font-medium tracking-wide"
                    style={{
                      border: "1px solid rgba(79, 189, 186, 0.15)",
                      color: "rgba(255,255,255,0.5)",
                      background: "rgba(27, 73, 101, 0.2)",
                    }}
                  >
                    {card}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accent line — full palette gradient */}
      <div
        className="h-[1px] mx-6 md:mx-12 lg:mx-20"
        style={{
          background: "linear-gradient(to right, #1B4965, #1E6080, #2A8F9C, #3AAFA9, #4FBDBA, transparent)",
        }}
      />

      {/* Bottom bar */}
      <div className="px-6 md:px-12 lg:px-20 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/80">
          © 2026 Coherent Market Insights. All Rights Reserved.
        </p>
        <p className="font-mono text-[10px]" style={{ color: "#2A8F9C" }}>
          Data-driven insights. Built with precision.
        </p>
      </div>
    </footer>
  )
}
