import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { dbConnection } from "./db"
import Google from "next-auth/providers/google"
const adapter = DrizzleAdapter(dbConnection)
 
export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter,
    session: {
      strategy: "database",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        Google({}),
    ],
    callbacks:{
        authorized: async ({ auth }) => {
            return !!auth
        }
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    secret: process.env.AUTH_SECRET!,
})