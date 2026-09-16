"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export function ContactTab() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector("footer")
      if (!footer) return
      const footerTop = footer.getBoundingClientRect().top
      setHidden(footerTop < window.innerHeight)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <Link
      href="/contact"
      aria-label="Contact Us"
      className="group fixed right-0 top-1/2 z-50 -translate-y-1/2 hidden md:flex"
      style={{
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
        transition: "opacity 300ms",
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-4 font-mono text-[11px] uppercase tracking-widest text-white shadow-lg hover:px-4"
        style={{
          background: "linear-gradient(180deg, #1B4965 0%, #2A8F9C 100%)",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          borderTopRightRadius: "6px",
          borderBottomRightRadius: "6px",
          transition: "padding 200ms",
        }}
      >
        <span>Interested?</span>
        <span style={{ color: "#9FE7E3" }}>Contact Us →</span>
      </div>
    </Link>
  )
}
