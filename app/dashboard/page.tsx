import { redirect } from "next/navigation"
import { auth0 } from "@/lib/auth0"

export const dynamic = "force-dynamic"
import { loadDashboardInitialData } from "@/lib/dashboard-initial-data"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const session = await auth0.getSession()
  if (!session?.user) {
    redirect("/auth/login?returnTo=/dashboard")
  }

  const { initialUs, initialIn, initialUk, initialEs } = await loadDashboardInitialData()

  return (
    <DashboardClient
      user={session.user}
      initialUs={initialUs}
      initialIn={initialIn}
      initialUk={initialUk}
      initialEs={initialEs}
    />
  )
}
