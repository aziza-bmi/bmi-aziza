'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/dashboard/Sidebar'
import BottomNav from '@/components/dashboard/BottomNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

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
    <div className="fixed inset-0 flex overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar />
      <main className={`flex-1 flex flex-col ${!isCanvas ? 'overflow-y-auto pb-20 lg:pb-0 p-8' : 'overflow-hidden'}`}>
        <div className={`${!isCanvas ? 'max-w-6xl mx-auto w-full' : 'w-full h-full'}`}>
          {children}
        </div>
      </main>
      {!isCanvas && <BottomNav />}
    </div>
  )
}
