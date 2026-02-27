"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth.service"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { ArrowLeft, Mail, Key, ShieldCheck } from "lucide-react"

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
})

const resetSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1) // 1: email, 2: otp, 3: reset
  const [email, setEmail] = useState("")
  const [otpToken, setOtpToken] = useState("")

  const emailForm = useForm({ resolver: zodResolver(emailSchema) })
  const otpForm = useForm({ resolver: zodResolver(otpSchema) })
  const resetForm = useForm({ resolver: zodResolver(resetSchema) })

  const onEmailSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email)
      setEmail(data.email)
      setStep(2)
      toast.success("OTP sent to your email!")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP")
    }
  }

  const onOtpSubmit = async (data) => {
    try {
      const res = await authService.verifyOTP({ email, otp: data.otp })
      setOtpToken(res.data.token)
      setStep(3)
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP")
    }
  }

  const onResetSubmit = async (data) => {
    try {
      await authService.resetPassword({ token: otpToken, newPassword: data.newPassword })
      toast.success("Password reset successfully!")
      router.push("/auth/login")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password")
    }
  }

  const steps = [
    { icon: Mail, label: "Email" },
    { icon: Key, label: "OTP" },
    { icon: ShieldCheck, label: "Reset" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link href="/auth/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${
                i + 1 === step ? "bg-primary text-white" :
                i + 1 < step ? "bg-green-500 text-white" :
                "bg-muted text-muted-foreground"
              }`}>
                {i + 1 < step ? "✓" : <Icon className="h-4 w-4" />}
              </div>
              <span className={`text-xs hidden sm:block ${i + 1 === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {label}
              </span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i + 1 < step ? "bg-green-500" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>Forgot Password?</h1>
            <p className="text-muted-foreground text-sm mb-6">Enter your email to receive a 6-digit OTP</p>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <div>
                <Label required>Email Address</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...emailForm.register("email")}
                  error={emailForm.formState.errors.email}
                  className="mt-1.5"
                />
                {emailForm.formState.errors.email && (
                  <p className="form-error">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" loading={emailForm.formState.isSubmitting}>
                Send OTP
              </Button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>Verify OTP</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Enter the 6-digit OTP sent to <strong>{email}</strong>
            </p>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              <div>
                <Label required>6-Digit OTP</Label>
                <Input
                  placeholder="000000"
                  maxLength={6}
                  {...otpForm.register("otp")}
                  error={otpForm.formState.errors.otp}
                  className="mt-1.5 text-center text-2xl tracking-widest font-mono"
                />
                {otpForm.formState.errors.otp && (
                  <p className="form-error">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" loading={otpForm.formState.isSubmitting}>
                Verify OTP
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-primary hover:underline"
                onClick={() => emailForm.handleSubmit(onEmailSubmit)({ email })}
              >
                Resend OTP
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>Set New Password</h1>
            <p className="text-muted-foreground text-sm mb-6">Choose a strong password with at least 8 characters</p>
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <div>
                <Label required>New Password</Label>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  {...resetForm.register("newPassword")}
                  error={resetForm.formState.errors.newPassword}
                  className="mt-1.5"
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="form-error">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div>
                <Label required>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat new password"
                  {...resetForm.register("confirmPassword")}
                  error={resetForm.formState.errors.confirmPassword}
                  className="mt-1.5"
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="form-error">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" loading={resetForm.formState.isSubmitting}>
                Reset Password
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
