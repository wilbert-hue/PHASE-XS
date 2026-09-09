"use client"

import { useState, useEffect, useRef } from "react"

const navItems = [
  { id: "hero", label: "Home" },
  { id: "metrics", label: "Metrics" },
  { id: "coverage", label: "Coverage" },
  { id: "platform", label: "Platform" },
  { id: "about", label: "About" },
]

export function SideNav() {
  const [activeSection, setActiveSection] = useState("hero")
  const [hidden, setHidden] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3 },
    )

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  // Hide sidebar when footer is visible
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav
      ref={navRef}
      className="fixed left-0 top-0 z-40 w-16 md:w-20 hidden flex-col justify-center backdrop-blur-sm transition-all duration-300"
      style={{
        borderRight: "1px solid rgba(192, 212, 220, 0.3)",
        background: "rgba(240, 245, 247, 0.8)",
        height: "100vh",
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      <div className="flex flex-col gap-6 px-4">
        {navItems.map(({ id, label }, index) => {
          const colors = ["#1B4965", "#1E6080", "#2A8F9C", "#3AAFA9", "#4FBDBA"]
          const dotColor = colors[index % colors.length]
          return (
            <button key={id} onClick={() => scrollToSection(id)} className="group relative flex items-center gap-3">
              <span
                className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                style={{
                  background: activeSection === id ? dotColor : "rgba(61, 96, 112, 0.4)",
                  transform: activeSection === id ? "scale(1.25)" : "scale(1)",
                }}
              />
              <span
                className="absolute left-6 font-mono text-[10px] uppercase tracking-widest opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:left-8 whitespace-nowrap"
                style={{ color: activeSection === id ? dotColor : "#3d6070" }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
