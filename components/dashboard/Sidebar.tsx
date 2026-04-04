'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, BookOpen, MessageSquare, Award, Settings, LogOut, PenTool, User, PanelLeftClose, PanelLeftOpen, Trophy } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/lib/auth'
import ThemeToggle from '@/components/shared/ThemeToggle'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, userData } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Darslar', href: '/lessons', icon: BookOpen },
    { name: 'AI Muallim', href: '/chat', icon: MessageSquare },
    { name: 'Testlar', href: '/quiz', icon: Award },
    { name: 'Reyting', href: '/leaderboard', icon: Trophy },
    { name: 'Chizuvchi', href: '/canvas', icon: PenTool },
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Sozlamalar', href: '/settings', icon: Settings },
  ]

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col h-screen sticky top-0 hidden lg:flex shrink-0`}>
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 overflow-hidden whitespace-nowrap">
            GeoMind
          </Link>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className={`p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${isCollapsed ? 'mx-auto' : ''}`}>
          {isCollapsed ? <PanelLeftOpen size={20}/> : <PanelLeftClose size={20}/>}
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-grow overflow-y-auto hidden-scrollbar">
        {!isCollapsed && <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3 mt-2">Menyu</div>}
        
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${isActive ? 'text-indigo-100' : 'text-slate-400'} shrink-0`} />
              {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl mb-2">
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
              {(userData?.displayName || user?.displayName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-800 truncate">
                {userData?.displayName || user?.displayName || 'Foydalanuvchi'}
              </h4>
              <p className="text-xs text-slate-500 font-medium truncate">
                Daraja {userData?.level || 1}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm">
            <LogOut className="w-5 h-5 text-slate-400" />
            Chiqish
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
