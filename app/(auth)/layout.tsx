import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
        
        {/* Abstract shapes */}
        <svg className="absolute left-[15%] top-[20%] opacity-[0.03] animate-pulse-slow" width="150" height="150" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="#4F46E5"/>
        </svg>
        <svg className="absolute right-[15%] bottom-[20%] opacity-[0.03] animate-float-1" width="150" height="150" viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" rx="10" fill="#3B82F6" transform="rotate(15 50 50)"/>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 my-12">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logo-light.png" alt="GeoMind Logo" className="w-10 h-10 dark:hidden object-contain" />
            <img src="/logo-dark.png" alt="GeoMind Logo" className="w-10 h-10 hidden dark:block object-contain" />
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              GeoMind
            </span>
          </Link>
          <p className="text-slate-500 text-sm">Sun'iy intellekt yordamida geometriya</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-indigo-100/40">
          {children}
        </div>
      </div>
    </div>
  )
}
