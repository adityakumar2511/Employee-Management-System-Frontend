import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return { valid: true, payload }
  } catch {
    return { valid: false, payload: null }
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("accessToken")?.value
  const refreshToken = request.cookies.get("refreshToken")?.value

  const isAuthPage = pathname.startsWith("/auth")
  const isAdminPage = pathname.startsWith("/admin")
  const isEmployeePage = pathname.startsWith("/employee")

  // ─── Protected page — koi bhi token nahi hai toh login ───────────────────
  if ((isAdminPage || isEmployeePage) && !token && !refreshToken) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ─── accessToken nahi but refreshToken hai — through jaane do ────────────
  // Axios interceptor client-side pe refresh kar lega
  if ((isAdminPage || isEmployeePage) && !token && refreshToken) {
    return NextResponse.next()
  }

  // ─── Auth page — already logged in ───────────────────────────────────────
  if (isAuthPage && token) {
    const { valid, payload } = await verifyToken(token)

    if (!valid) {
      // Token invalid — cookie clear karo, login dikhao
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      )
      response.cookies.delete("accessToken")
      response.cookies.delete("refreshToken")
      return response
    }

    // Valid token — role ke hisaab se dashboard pe bhejo
    const dest =
      payload.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard"
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // ─── Role-based access control ────────────────────────────────────────────
  if (token && (isAdminPage || isEmployeePage)) {
    const { valid, payload } = await verifyToken(token)

    if (!valid) {
      // Expired token — agar refreshToken hai toh through jaane do
      if (refreshToken) {
        return NextResponse.next()
      }
      // Dono nahi — login
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      )
      response.cookies.delete("accessToken")
      response.cookies.delete("refreshToken")
      return response
    }

    // Admin page par employee aaya
    if (isAdminPage && payload.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/employee/dashboard", request.url)
      )
    }

    // Employee page par admin aaya
    if (isEmployeePage && payload.role !== "EMPLOYEE") {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/auth/:path*"],
}