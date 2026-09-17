import { cn } from "@/lib/utils"

/**
 * Full-bleed band behind a page section: top rule + tinted wash so blocks read as
 * separate “chapters” instead of one continuous dotted canvas.
 */
const landing: Record<string, string> = {
  metrics:     "border-t border-[#1B4965]/15 bg-white",
  coverage:    "border-t border-[#1E6080]/15 bg-white",
  principles:  "border-t border-[#2A8F9C]/15 bg-white",
  credibility: "border-t border-[#3AAFA9]/15 bg-white",
  clientele:   "border-t border-[#4FBDBA]/15 bg-white",
  platform:    "border-t border-[#2563EB]/12 bg-white",
  keystats:    "border-t border-[#6D28D9]/12 bg-white",
  colophon:    "border-t border-[#0E7490]/12 bg-white",
}

const dashboard: Record<string, string> = {
  filters: cn(
    "rounded-xl border border-[#1B4965]/20",
    "bg-gradient-to-br from-[rgba(27,73,101,0.08)] to-[rgba(42,143,156,0.04)]",
    "shadow-sm shadow-[rgba(27,73,101,0.08)]",
  ),
  data: cn(
    "rounded-xl border border-[#1E6080]/18",
    "bg-gradient-to-b from-[rgba(30,96,128,0.06)] to-[rgba(240,245,247,0.4)]",
    "p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]",
  ),
  table: cn(
    "rounded-xl border-2 border-[#2A8F9C]/30",
    "bg-gradient-to-b from-background to-[rgba(42,143,156,0.05)]",
    "p-4 sm:p-5 shadow-md shadow-[rgba(30,96,128,0.12)]",
  ),
}

type LandingVariant = keyof typeof landing
type DashboardVariant = keyof typeof dashboard

type PageSectionProps = {
  children: React.ReactNode
  className?: string
} & (
  | { page: "landing"; variant: LandingVariant }
  | { page: "dashboard"; variant: DashboardVariant }
)

export function PageSection(props: PageSectionProps) {
  const { children, className, page, variant } = props
  const styles = page === "landing" ? landing[variant] : dashboard[variant]
  return <div className={cn("relative w-full", styles, className)}>{children}</div>
}
