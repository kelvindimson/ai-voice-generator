// middleware.ts (simpler approach without database calls)
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for auth cookie (NextAuth sets this)
  const sessionToken = request.cookies.get("authjs.session-token") || request.cookies.get("__Secure-authjs.session-token") // For production
  
  const isOnDashboard = pathname.startsWith("/dashboard")
  const isOnApi = pathname.startsWith("/api/v1")
//   const isOnLogin = pathname === "/login"
  
  // Redirect to login if trying to access protected route without session
  if ((isOnDashboard || isOnApi) && !sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  
  // Redirect to dashboard if logged in and trying to access login
//   if (isOnLogin) {
//     return NextResponse.redirect(new URL("/dashboard", request.url))
//   }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login"
  ],
}