'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import api from '@/lib/api'
import { authStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z
      .string()
      .min(8, 'Min 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[0-9]/, 'Must contain number')
      .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const requirements = [
  'At least 8 characters',
  'At least one uppercase letter',
  'At least one number',
  'At least one special character',
]

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const password = watch('newPassword', '')

  const checkReq = (req) => {
    if (req.includes('8')) return password.length >= 8
    if (req.includes('uppercase')) return /[A-Z]/.test(password)
    if (req.includes('number')) return /[0-9]/.test(password)
    if (req.includes('special')) return /[^A-Za-z0-9]/.test(password)
    return false
  }

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      // Update user — remove first login flag
      authStore.updateUser({ ...user, isFirstLogin: false })
      toast.success('Password changed successfully!')

      if (user?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/employee/dashboard')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 mb-3">
              <ShieldCheck className="h-7 w-7 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold">Set New Password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {user?.isFirstLogin
                ? 'Welcome! Please set a new password to continue.'
                : 'Update your account password.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Current Password"
              required
              error={errors.currentPassword?.message}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  {...register('currentPassword')}
                  type="password"
                  placeholder="Enter current password"
                  className="pl-10"
                />
              </div>
            </FormField>

            <FormField
              label="New Password"
              required
              error={errors.newPassword?.message}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  {...register('newPassword')}
                  type="password"
                  placeholder="Create strong password"
                  className="pl-10"
                />
              </div>
              {/* Requirements checklist */}
              <ul className="mt-2 space-y-1">
                {requirements.map((req) => (
                  <li
                    key={req}
                    className={`flex items-center gap-1.5 text-xs ${
                      checkReq(req) ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    <span>{checkReq(req) ? '✓' : '○'}</span>
                    {req}
                  </li>
                ))}
              </ul>
            </FormField>

            <FormField
              label="Confirm New Password"
              required
              error={errors.confirmPassword?.message}
            >
              <Input
                {...register('confirmPassword')}
                type="password"
                placeholder="Repeat new password"
              />
            </FormField>

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full mt-2"
            >
              Save New Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
