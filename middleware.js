import { NextResponse } from "next/server"

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Allow auth pages through
  if (pathname.startsWith("/auth")) return NextResponse.next()

  // Check for token in cookie (set by auth store)
  const token = request.cookies.get("accessToken")?.value

  if (!token && (pathname.startsWith("/admin") || pathname.startsWith("/employee"))) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*"],
}
