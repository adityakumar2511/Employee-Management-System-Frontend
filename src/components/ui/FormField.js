import { cn } from '@/lib/utils'
import { Label } from './Label'

export function FormField({ label, error, required, children, className, hint }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
