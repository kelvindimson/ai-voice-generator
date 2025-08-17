import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isOnApi = req.nextUrl.pathname.startsWith("/api/v1")
  const isOnLogin = req.nextUrl.pathname === "/login"

  // If trying to access protected route without auth, redirect to login
  if ((isOnDashboard || isOnApi) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/v1/:path*",
    "/login"
  ],
}