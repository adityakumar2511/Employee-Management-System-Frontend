import { cn } from '@/lib/utils'
import { Skeleton } from './Loading'

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-primary/10',
  iconColor = 'text-primary',
  trend,
  trendValue,
  loading = false,
  className,
}) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 shadow-sm', className)}>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value ?? '—'}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend !== undefined && (
              <p
                className={cn(
                  'text-xs font-medium',
                  trend > 0 ? 'text-green-600' : 'text-red-500'
                )}
              >
                {trend > 0 ? '▲' : '▼'} {Math.abs(trendValue || trend)}%{' '}
                <span className="text-muted-foreground font-normal">
                  vs last month
                </span>
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn('rounded-full p-3', iconBg)}>
              <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
