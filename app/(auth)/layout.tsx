import Link from 'next/link'
import GeoBg from '@/components/landing/GeoBg'
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden
           bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50
           dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <GeoBg count={8} />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md px-4 sm:px-6 my-8 sm:my-12">
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logo-light.png" alt="Fazo Logo" className="w-8 h-8 md:w-10 md:h-10 dark:hidden object-contain" />
            <img src="/logo-dark.png" alt="Fazo Logo" className="w-8 h-8 md:w-10 md:h-10 hidden dark:block object-contain" />
            <span className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              Fazo
            </span>
          </Link>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Sun'iy intellekt yordamida geometriya</p>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl md:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-indigo-100/40 dark:shadow-none">
          {children}
        </div>
      </div>
    </div>
  )
}
