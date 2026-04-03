'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageCircle,
  BookOpen, FlaskConical, PenTool
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Asosiy' },
  { href: '/chat',      icon: MessageCircle,   label: 'AI' },
  { href: '/lessons',   icon: BookOpen,        label: 'Darslar' },
  { href: '/quiz',      icon: FlaskConical,    label: 'Test' },
  { href: '/canvas',    icon: PenTool,         label: 'Chizma' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50
                    lg:hidden
                    bg-white/90 dark:bg-slate-900/90
                    backdrop-blur-xl
                    border-t border-slate-200 dark:border-slate-700/40
                    flex items-center justify-around
                    h-16 px-2">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href ||
                       pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1
                       flex-1 py-2 rounded-xl transition-all
                       ${active
                         ? 'text-indigo-600 dark:text-indigo-400'
                         : 'text-slate-400 dark:text-slate-500'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all
                            ${active
                              ? 'bg-indigo-100 dark:bg-indigo-900/40'
                              : ''}`}>
              <item.icon size={20} />
            </div>
            <span className="text-[10px] font-medium leading-none">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
