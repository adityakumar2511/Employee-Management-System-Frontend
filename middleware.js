import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(request) {
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

  // Auth page — already logged in hai toh role ke hisaab se redirect karo
  if (isAuthPage && token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      const role = payload.role

      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      } else if (role === "EMPLOYEE") {
        return NextResponse.redirect(new URL("/employee/dashboard", request.url))
      }
    } catch {
      // Token invalid hai — cookie clear karo aur login pe bhejo
      const response = NextResponse.redirect(new URL("/auth/login", request.url))
      response.cookies.delete("accessToken")
      response.cookies.delete("refreshToken")
      return response
    }
  }

  // Role-based access control — admin page pe employee na jaye
  if (token && (isAdminPage || isEmployeePage)) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      const role = payload.role

      if (isAdminPage && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/employee/dashboard", request.url))
      }

      if (isEmployeePage && role !== "EMPLOYEE") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }
    } catch {
      // Token expired — login pe bhejo
      const response = NextResponse.redirect(new URL("/auth/login", request.url))
      response.cookies.delete("accessToken")
      response.cookies.delete("refreshToken")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/auth/:path*"],
}