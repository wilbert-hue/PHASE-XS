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

  const {
    initialUs,
    initialIn,
    initialUk,
    initialEs,
    initialBe,
    initialDk,
    initialFr,
    initialDe,
    initialIt,
    initialLu,
    initialNl,
    initialNo,
    initialPl,
    initialRu,
    initialSg,
    initialKr,
    initialSe,
  } = await loadDashboardInitialData()

  return (
    <DashboardClient
      user={session.user}
      initialUs={initialUs}
      initialIn={initialIn}
      initialUk={initialUk}
      initialEs={initialEs}
      initialBe={initialBe}
      initialDk={initialDk}
      initialFr={initialFr}
      initialDe={initialDe}
      initialIt={initialIt}
      initialLu={initialLu}
      initialNl={initialNl}
      initialNo={initialNo}
      initialPl={initialPl}
      initialRu={initialRu}
      initialSg={initialSg}
      initialKr={initialKr}
      initialSe={initialSe}
    />
  )
}
