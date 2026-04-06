import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800 dark:border-slate-800/80 text-slate-400 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
        <div className="lg:col-span-2 border-b md:border-b-0 border-slate-800 pb-8 md:pb-0">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <img src="/logo-light.png" alt="GeoMind Logo" className="w-8 h-8 dark:hidden object-contain" />
            <img src="/logo-dark.png" alt="GeoMind Logo" className="w-8 h-8 hidden dark:block object-contain" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">GeoMind</span>
          </Link>
          <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-sm">
            Geometriyani sun'iy intellekt yordamida mustaqil o'rganish uchun platforma.
          </p>

        </div>

        <div>
          <h4 className="text-white font-medium mb-6 uppercase text-xs tracking-wider">Platforma</h4>
          <ul className="space-y-4">
            <li><Link href="/dashboard" className="text-sm hover:text-white transition-colors">Dashboard</Link></li>
            <li><Link href="/chat" className="text-sm hover:text-white transition-colors">Ai muallim</Link></li>
            <li><Link href="/lessons" className="text-sm hover:text-white transition-colors">Asosiy darslar</Link></li>
            <li><Link href="#how-it-works" className="text-sm hover:text-white transition-colors">Qanday ishlaydi?</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium mb-6 uppercase text-xs tracking-wider">Aloqa</h4>
          <ul className="space-y-4">
            <li><Link href="#contact" className="text-sm hover:text-white transition-colors">Bog'lanish</Link></li>
            <li><Link href="/help" className="text-sm hover:text-white transition-colors">Yordam markazi</Link></li>
            <li><Link href="/privacy" className="text-sm hover:text-white transition-colors">Maxfiylik siyosati</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 md:mt-16 pt-8 border-t border-slate-800 flex justify-center text-center items-center gap-4">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} GeoMind. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  )
}
