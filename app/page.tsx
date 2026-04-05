import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GeoBg from '@/components/landing/GeoBg'
import Stats from '@/components/landing/Stats'
import Features from '@/components/landing/Features'
import FAQ from '@/components/landing/FAQ'
import Contact from '@/components/landing/Contact'
import HeroMockup from '@/components/landing/HeroMockup'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white dark:bg-slate-950 transition-colors duration-300 selection:bg-indigo-100 selection:text-indigo-900">
      <GeoBg />
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative z-10">
        <section className="flex flex-col items-center justify-center text-center px-4 sm:px-8 pt-24 md:pt-32 pb-16">


          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight max-w-4xl mb-6 text-slate-900 dark:text-white transition-colors duration-300">
            Geometriyani{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">Sun'iy Intellekt</span>{' '}
            bilan o'rganing
          </h1>

          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mb-10 transition-colors duration-300">
            Zerikarli nazariya ortda qoldi. Endi har bir chizma raqamli, har bir formula interaktiv. Qiyin mavzular va masalalar bo'yicha GeoMind AI sizga soniyalar ichida mukammal tushuntirish beradi.
          </p>

          <div className="flex justify-center w-full mb-4">
            <Link href="/register" className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg hover:shadow-indigo-500/25 px-8 py-4 rounded-xl text-base font-medium transition-all hover:-translate-y-0.5">
              Bepul boshlash
            </Link>
          </div>
        </section>

        <HeroMockup />
        <Stats />
        
        {/* Qanday ishlaydi section (Simple inline) */}
        <section className="py-24 w-full max-w-6xl mx-auto px-6" id="how-it-works">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
               <span className="text-indigo-600 font-medium px-4 py-1.5 rounded-full bg-indigo-50 text-sm">Qanday ishlaydi?</span>
               <h2 className="text-3xl md:text-4xl font-semibold mt-6 mb-8 text-slate-900 dark:text-white transition-colors duration-300">Zamonaviy ta'lim faqat 3 qadamda</h2>
               
               <div className="space-y-8">
                 <div className="flex gap-4">
                   <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl shrink-0 transition-colors">1</div>
                   <div>
                     <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2 transition-colors">Profil yarating</h4>
                     <p className="text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">GeoMind da maxsus o'quv kabinetingizga ega bo'ling. Jarayon atigi 30 soniya vaqtingizni oladi va mutlaqo bepul.</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl shrink-0 transition-colors">2</div>
                   <div>
                     <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2 transition-colors">AI bilan tayyorgarlik</h4>
                     <p className="text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">Laboratoriyada geometrik shakllar chizing yoki 450+ bazaviy darslarni o'zlashtiring. Tushunarsiz masalalarni to'g'ridan to'g'ri AI muallimdan so'rang.</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0 transition-colors">3</div>
                   <div>
                     <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2 transition-colors">Katta tahlil va raqobat</h4>
                     <p className="text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">Bilimingizga moslashuvchi (adaptiv) testlarni yechib, XP ballar yig'ing va Respublika bo'yicha kuchlilar reytingidan joy oling!</p>
                   </div>
                 </div>
               </div>
            </div>
            <div className="lg:w-1/2 bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-indigo-100/20 dark:shadow-none transition-colors">
               <div className="aspect-square bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center relative overflow-hidden transition-colors">
                 {/* Placeholders for abstract shapes to illustrate steps */}
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-400/10 dark:to-blue-400/10 mix-blend-multiply dark:mix-blend-lighten" />
                 <div className="w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl absolute top-10 left-10" />
                 <div className="w-40 h-40 bg-blue-500/20 rounded-full blur-2xl absolute bottom-10 right-10" />
                 {/* Actual decorative content */}
                 <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 opacity-60"><path d="M12 2L2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
               </div>
            </div>
          </div>
        </section>

        <Features />
        <FAQ />
        <Contact />
      </div>

      <Footer />
    </main>
  )
}
