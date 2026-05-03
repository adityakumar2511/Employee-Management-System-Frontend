import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

// ✅ Secret ek baar encode karo — har request pe nahi
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

  const isAuthPage = pathname.startsWith("/auth")
  const isAdminPage = pathname.startsWith("/admin")
  const isEmployeePage = pathname.startsWith("/employee")

  // ─── Protected page — token nahi hai toh login ───────────────────────────
  if ((isAdminPage || isEmployeePage) && !token) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ─── Auth page — already logged in ───────────────────────────────────────
  if (isAuthPage && token) {
    const { valid, payload } = await verifyToken(token)

    if (!valid) {
      // Token invalid — cookie clear, login dikhao
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      )
      response.cookies.delete("accessToken")
      response.cookies.delete("refreshToken")
      return response
    }

    // Valid token — role ke hisaab se dashboard
    const dest = payload.role === "ADMIN"
      ? "/admin/dashboard"
      : "/employee/dashboard"
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // ─── Role-based access control ────────────────────────────────────────────
  if (token && (isAdminPage || isEmployeePage)) {
    const { valid, payload } = await verifyToken(token)

    if (!valid) {
      // ✅ Expired token — cookies delete karke login
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      )
      response.cookies.delete("accessToken")
      response.cookies.delete("refreshToken")
      return response
    }

    if (isAdminPage && payload.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/employee/dashboard", request.url)
      )
    }

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