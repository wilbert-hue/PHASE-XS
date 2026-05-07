import type React from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[15px] sm:text-[16px] antialiased leading-relaxed">
      {children}
    </div>
  )
}
