import { cn } from "@/lib/utils"

/**
 * Full-bleed band behind a page section: top rule + tinted wash so blocks read as
 * separate “chapters” instead of one continuous dotted canvas.
 */
const landing: Record<string, string> = {
  metrics: cn(
    "border-t-2 border-[#1B4965]/40",
    "bg-gradient-to-b from-[rgba(27,73,101,0.12)] via-[#e9f0f4] to-[#f0f5f7]",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
  ),
  coverage: cn(
    "border-t-2 border-[#1E6080]/40",
    "bg-gradient-to-b from-[rgba(30,96,128,0.11)] via-[#e8f1f3] to-[#f0f5f7]",
  ),
  principles: cn(
    "border-t-2 border-[#2A8F9C]/40",
    "bg-gradient-to-b from-[rgba(42,143,156,0.10)] via-[#eaf3f4] to-[#f0f5f7]",
  ),
  credibility: cn(
    "border-t-2 border-[#3AAFA9]/40",
    "bg-gradient-to-b from-[rgba(58,175,169,0.10)] via-[#ecf6f5] to-[#f0f5f7]",
  ),
  clientele: cn(
    "border-t-2 border-[#4FBDBA]/40",
    "bg-gradient-to-b from-[rgba(79,189,186,0.08)] via-[#eef5f4] to-[#f0f5f7]",
  ),
  platform: cn(
    "border-t-2 border-[#2563EB]/30",
    "bg-gradient-to-b from-[rgba(37,99,235,0.07)] via-[#eaedf5] to-[#f0f5f7]",
  ),
  keystats: cn(
    "border-t-2 border-[#6D28D9]/25",
    "bg-gradient-to-b from-[rgba(109,40,217,0.08)] via-[#f0ebf5] to-[#f0f5f7]",
  ),
  colophon: cn(
    "border-t-2 border-[#0E7490]/30",
    "bg-gradient-to-b from-[rgba(14,116,144,0.08)] to-[#f0f5f7]",
  ),
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
