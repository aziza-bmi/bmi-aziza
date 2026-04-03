import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center
                    py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-100
                      dark:bg-indigo-900/40 flex items-center
                      justify-center mb-4">
        <Icon size={28} className="text-indigo-500" />
      </div>
      <h3 className="text-base font-medium text-slate-700
                     dark:text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400
                    max-w-xs mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}
          className="btn-gradient px-6 py-2.5 rounded-xl text-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
