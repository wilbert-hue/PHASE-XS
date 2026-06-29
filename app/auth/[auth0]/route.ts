import { auth0 } from "@/lib/auth0"

export const dynamic = "force-dynamic"

export function GET(req: Request) {
  return auth0.handler(req)
}

export function POST(req: Request) {
  return auth0.handler(req)
}
