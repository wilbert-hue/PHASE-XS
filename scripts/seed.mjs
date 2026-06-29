// Run with: node scripts/seed.mjs
// Requires MONGODB_URI in your environment (or .env.local loaded manually).
import { MongoClient } from "mongodb"
import { readFileSync } from "fs"
import { resolve } from "path"

// Tiny .env.local loader (no extra deps)
try {
  const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "")
  }
} catch {}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "phase_xs"
if (!uri) {
  console.error("MONGODB_URI not set")
  process.exit(1)
}

const offices = [
  {
    order: 1,
    label: "U.S. Office",
    address: "533 Airport Boulevard, Suite 400, Burlingame, CA 94010, United States.",
    phone: "+1-252-477-1362",
  },
  {
    order: 2,
    label: "UK Office",
    address: "Office 15811, 182-184 High Street North, East Ham, London E6 2JA, United Kingdom.",
    phone: "+44-203-957-8553",
  },
  {
    order: 3,
    label: "India HQ",
    address: "401, 4th Floor, Bremen Business Center, Aundh, Pune, Maharashtra 411007, India.",
    phone: "+91-848-285-0837",
  },
  {
    order: 4,
    label: "Australia",
    address: "",
    phone: "+61-8-7924-7805",
  },
]

const client = new MongoClient(uri)
try {
  await client.connect()
  const db = client.db(dbName)
  await db.collection("offices").deleteMany({})
  await db.collection("offices").insertMany(offices)
  await db.collection("contact_submissions").createIndex({ createdAt: -1 })
  await db.collection("contact_submissions").createIndex({ email: 1 })
  await db.collection("contact_ip_attempts").createIndex({ createdAt: 1 }, { expireAfterSeconds: 172800 })
  console.log(`Seeded ${offices.length} offices into ${dbName}.offices`)
} catch (e) {
  console.error(e)
  process.exit(1)
} finally {
  await client.close()
}
