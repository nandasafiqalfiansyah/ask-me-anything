import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  badge?: string
  trend?: string
  color?: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan' | 'indigo'
  onClick?: () => void
}

const colorStyles = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  badge,
  trend,
  color = 'blue',
  onClick
}: StatCardProps) {
  const iconTheme = colorStyles[color] || colorStyles.blue

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-5 shadow-xs transition-all duration-200 ${
        onClick
          ? 'cursor-pointer hover:-translate-y-1 hover:border-primary/40 hover:shadow-md'
          : 'hover:border-border'
      }`}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='space-y-1'>
          <p className='text-xs font-medium tracking-wider uppercase text-muted-foreground'>
            {label}
          </p>
          <div className='flex items-baseline gap-2'>
            <span className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
              {value}
            </span>
            {badge && (
              <span className='inline-flex items-center rounded-md px-1.5 py-0.5 text-[0.68rem] font-medium bg-muted text-muted-foreground'>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className='text-xs text-muted-foreground/80 line-clamp-1'>
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-110 ${iconTheme}`}
          >
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className='mt-3 flex items-center gap-1.5 border-t border-border/50 pt-2.5 text-xs text-muted-foreground'>
          <span>{trend}</span>
        </div>
      )}
    </div>
  )
}

