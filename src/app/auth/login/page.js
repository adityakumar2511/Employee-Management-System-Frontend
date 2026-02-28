"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useAuthStore from "@/store/authStore"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Eye, EyeOff, LogIn, Building2 } from "lucide-react"

const loginSchema = z.object({
  emailOrEmployeeId: z.string().min(1, "Email or Employee ID is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
})

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, user } = useAuthStore()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "EMPLOYEE" },
  })

  const role = watch("role")

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard")
    }
  }, [isAuthenticated, user, router])

  // const onSubmit = async (data) => {
  //   try {
  //     const result = await login(data)
  //     if (result.success) {
  //       toast.success("Welcome back! Logged in successfully.")
  //       // Direct redirect — useEffect pe depend mat karo
  //       router.replace(
  //         result.user.role === "ADMIN"
  //           ? "/admin/dashboard"
  //           : "/employee/dashboard"
  //       )
  //     }
  //   } catch (error) {
  //     const message =
  //       error.response?.data?.message || "Invalid credentials. Please try again."
  //     toast.error(message)
  //   }
  // }

  const onSubmit = async (data) => {
  try {
    const result = await login(data)
    if (result.success) {
      toast.success("Welcome back! Logged in successfully.")
      
      // router.replace ki jagah window.location use karo
      if (result.user.role === "ADMIN") {
        window.location.href = "/admin/dashboard"
      } else {
        window.location.href = "/employee/dashboard"
      }
    }
  } catch (error) {
    const message =
      error.response?.data?.message || "Invalid credentials. Please try again."
    toast.error(message)
  }
}

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "hsl(222 47% 11%)" }}
      >
        <div
          className="absolute top-0 right-0 h-96 w-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, hsl(217 91% 60%), transparent)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-64 w-64 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, hsl(217 91% 60%), transparent)",
            transform: "translate(-30%, 30%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p
                className="text-xl font-bold text-white"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                EMS Pro
              </p>
              <p className="text-xs text-blue-300">Employee Management System</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2
              className="text-4xl font-bold text-white leading-tight"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Manage your
              <br />
              team smarter
            </h2>
            <p className="text-blue-300 mt-3 text-base leading-relaxed">
              Complete HR solution — attendance tracking, payroll management,
              task assignments, and real-time insights.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { num: "500m", label: "Geo-fence radius" },
              { num: "Real-time", label: "Firebase updates" },
              { num: "Auto", label: "Salary calculation" },
              { num: "0 Cost", label: "Free deployment" },
            ].map(({ num, label }) => (
              <div
                key={label}
                className="rounded-xl p-4"
                style={{ background: "hsl(220 30% 18%)" }}
              >
                <p className="text-xl font-bold text-primary">{num}</p>
                <p className="text-xs text-blue-300 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-blue-400">
            © 2024 EMS Pro. 100% Free deployment stack.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <p
              className="text-xl font-bold"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              EMS Pro
            </p>
          </div>

          <div className="mb-8">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {/* Role toggle */}
          <div className="flex rounded-xl border p-1 mb-6 bg-muted/40">
            {["EMPLOYEE", "ADMIN"].map((r) => (
              <label
                key={r}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                  role === r
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  value={r}
                  className="sr-only"
                  {...register("role")}
                />
                {r === "EMPLOYEE" ? "👤 Employee" : "🛡️ Admin"}
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="emailOrEmployeeId" required>
                {role === "EMPLOYEE" ? "Employee ID" : "Email Address"}
              </Label>
              <Input
                id="emailOrEmployeeId"
                placeholder={
                  role === "EMPLOYEE" ? "EMP001" : "admin@company.com"
                }
                {...register("emailOrEmployeeId")}
                error={errors.emailOrEmployeeId}
                className="mt-1.5"
              />
              {errors.emailOrEmployeeId && (
                <p className="form-error">
                  {errors.emailOrEmployeeId.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting}>
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Having trouble? Contact your HR administrator.
          </p>
        </div>
      </div>
    </div>
  )
}