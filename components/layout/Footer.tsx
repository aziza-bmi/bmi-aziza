import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1 md:col-span-1 border-b md:border-b-0 border-slate-800 pb-8 md:pb-0">
          <Link href="/" className="text-xl font-bold text-white mb-4 block group">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">GeoMind</span>
          </Link>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Sun'iy intellekt yordamida geometriyani o'rganish platformasi. O'quvchilar, maktab va talabalar uchun.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-400">Barcha tizimlar ishlayapti</span>
          </div>
        </div>

        <div className="col-span-1">
          <h4 className="text-white font-medium mb-6 uppercase text-xs tracking-wider">Platforma</h4>
          <ul className="space-y-4">
            <li><Link href="/dashboard" className="text-sm hover:text-white transition-colors">Dashboard</Link></li>
            <li><Link href="/chat" className="text-sm hover:text-white transition-colors">AI Muallim</Link></li>
            <li><Link href="/lessons" className="text-sm hover:text-white transition-colors">Darslar</Link></li>
            <li><Link href="/quiz" className="text-sm hover:text-white transition-colors">Testlar</Link></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h4 className="text-white font-medium mb-6 uppercase text-xs tracking-wider">Kompaniya</h4>
          <ul className="space-y-4">
            <li><Link href="/about" className="text-sm hover:text-white transition-colors">Biz haqimizda</Link></li>
            <li><Link href="/blog" className="text-sm hover:text-white transition-colors">Blog</Link></li>
            <li><Link href="/contact" className="text-sm hover:text-white transition-colors">Bog'lanish</Link></li>
            <li><Link href="/careers" className="text-sm hover:text-white transition-colors">Karyera</Link></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h4 className="text-white font-medium mb-6 uppercase text-xs tracking-wider">Resurslar</h4>
          <ul className="space-y-4">
            <li><Link href="/help" className="text-sm hover:text-white transition-colors">Yordam markazi</Link></li>
            <li><Link href="/docs" className="text-sm hover:text-white transition-colors">Hujjatlar</Link></li>
            <li><Link href="/privacy" className="text-sm hover:text-white transition-colors">Maxfiylik siyosati</Link></li>
            <li><Link href="/terms" className="text-sm hover:text-white transition-colors">Foydalanish shartlari</Link></li>
          </ul>
          
          <div className="mt-8">
            <h5 className="text-xs font-medium text-white mb-3">Yangiliklardan xabardor bo'ling</h5>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <input type="email" placeholder="email@example.com" className="bg-transparent text-sm w-full outline-none px-3 text-white placeholder-slate-500" />
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-md px-3 py-1.5 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500">
          © 2026 GeoMind. Barcha huquqlar himoyalangan.
        </p>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          O'zbekistonda <span className="text-red-500">❤</span> bilan yaratildi
        </p>
        <div className="flex gap-4">
          <button className="text-xs text-slate-500 hover:text-white">O'z</button>
          <button className="text-xs text-slate-500 hover:text-white">Ru</button>
          <button className="text-xs text-slate-500 hover:text-white">En</button>
        </div>
      </div>
    </footer>
  )
}
