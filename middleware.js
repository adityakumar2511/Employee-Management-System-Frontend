import { NextResponse } from "next/server"

export function middleware(request) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get("accessToken")?.value

  const isAuthPage = pathname.startsWith("/auth")
  const isAdminPage = pathname.startsWith("/admin")
  const isEmployeePage = pathname.startsWith("/employee")

  // Protected page — token nahi hai toh login pe bhejo
  if ((isAdminPage || isEmployeePage) && !token) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Auth page — already logged in hai toh root pe bhejo
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/auth/:path*"],
}