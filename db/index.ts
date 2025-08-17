import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!

// For Next.js, use a singleton pattern to avoid multiple connections
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined
}

const client = globalForDb.conn ?? postgres(connectionString, {
  prepare: false,
})

if (process.env.NODE_ENV !== "production") globalForDb.conn = client

// CORRECT: Pass client directly
export const dbConnection = drizzle(client)