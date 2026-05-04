'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageCircle,
  BookOpen, FlaskConical, Trophy, Library
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Asosiy' },
  { href: '/chat',        icon: MessageCircle,   label: 'AI' },
  { href: '/lessons',     icon: BookOpen,        label: 'Darslar' },
  { href: '/quiz',        icon: FlaskConical,    label: 'Test' },
  { href: '/leaderboard', icon: Trophy,          label: 'Reyting' },
  { href: '/library',     icon: Library,         label: 'Kitoblar' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50
                    flex lg:hidden
                    bg-white/95 dark:bg-slate-900/95
                    backdrop-blur-xl
                    border-t border-slate-200 dark:border-slate-800
                    shadow-[0_-1px_12px_rgba(0,0,0,0.08)]
                    pb-safe md:pb-2
                    min-h-[4rem] h-auto px-2 pt-1 items-start justify-around">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href ||
                       pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center gap-1
                       flex-1 h-14 rounded-xl transition-all
                       ${active
                         ? 'text-indigo-600 dark:text-indigo-400'
                         : 'text-slate-400 dark:text-slate-500'}`}
          >
            <div className={`transition-all ${active ? '-translate-y-1' : ''}`}>
              <item.icon size={20} />
            </div>
            <span className={`text-[10px] font-medium leading-none transition-all ${active ? 'opacity-100' : 'opacity-80'}`}>
              {item.label}
            </span>
            {active && (
              <span className="absolute bottom-1 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
