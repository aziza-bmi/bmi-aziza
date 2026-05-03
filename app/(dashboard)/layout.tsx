'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/dashboard/Sidebar'
import BottomNav from '@/components/dashboard/BottomNav'
import { Menu } from 'lucide-react'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center
                      bg-gradient-to-br from-indigo-50 to-blue-50
                      dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2
                          border-indigo-500 border-t-transparent
                          animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Yuklanmoqda...
          </p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const isCanvas = pathname === '/canvas'

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={`flex-1 flex flex-col w-full min-w-0 ${!isCanvas ? 'overflow-y-auto pb-16 lg:pb-0' : 'overflow-hidden'} lg:border-l lg:border-slate-200 lg:dark:border-slate-800`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-20 shrink-0 sticky top-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              Fazo
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className={`${!isCanvas ? 'w-full lg:px-6 lg:py-5' : 'w-full h-full'}`}>
          {children}
        </div>
      </main>

      {!isCanvas && <BottomNav />}
    </div>
  )
}
