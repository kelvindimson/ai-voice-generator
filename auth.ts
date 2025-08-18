// auth.ts (simplified without middleware auth)
import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { dbConnection } from "./db"
import Google from "next-auth/providers/google"
import { accounts, sessions, users, verificationTokens } from "./db/schema"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(dbConnection, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google(
      {
      // clientId: process.env.AUTH_GOOGLE_ID!,
      // clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      // authorization: {
      //   params: {
      //     prompt: "consent",
      //     access_type: "offline",
      //     response_type: "code",
      //     scope: "openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      //   },
      // }
    }
  ),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: "/login"
  },
  // secret: process.env.AUTH_SECRET!,
//   debug: process.env.NODE_ENV === "development",
})