'use client'
import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export default function GlassCard({
  children,
  className,
  hover = true,
  padding = 'md',
  ...props
}: GlassCardProps) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'glass-card',
        paddings[padding],
        hover && 'transition-all duration-300 hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
