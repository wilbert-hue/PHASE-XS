import { redirect } from "next/navigation"
import { auth0 } from "@/lib/auth0"
import { fetchTrialsFromPostgres } from "@/lib/trials-from-db"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const session = await auth0.getSession()
  if (!session?.user) {
    redirect("/auth/login?returnTo=/dashboard")
  }

  const trials = await fetchTrialsFromPostgres()
  return <DashboardClient user={session.user} trials={trials} />
}
