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
        <section className="flex flex-col items-center justify-center text-center px-4 sm:px-8 pt-16 md:pt-24 lg:pt-32 pb-10 md:pb-16">

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight max-w-4xl mb-4 md:mb-6 text-slate-900 dark:text-white transition-colors duration-300">
            Geometriyani{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">Sun'iy Intellekt</span>{' '}
            bilan o'rganing
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mb-6 md:mb-10 transition-colors duration-300 px-2">
            Zerikarli nazariya ortda qoldi. Endi har bir chizma raqamli, har bir formula interaktiv. Qiyin mavzular va masalalar bo'yicha Fazo AI sizga soniyalar ichida mukammal tushuntirish beradi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm sm:max-w-none mb-4">
            <Link href="/register" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg hover:shadow-indigo-500/25 px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base font-medium transition-all hover:-translate-y-0.5 text-center">
              Bepul boshlash
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center">
              Qanday ishlaydi?
            </Link>
          </div>
        </section>

        <HeroMockup />
        <Stats />
        
        {/* Qanday ishlaydi section (Simple inline) */}
        <section className="py-14 md:py-24 w-full max-w-6xl mx-auto px-4 sm:px-6" id="how-it-works">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
            <div className="lg:w-1/2 w-full">
               <span className="text-indigo-600 font-medium px-4 py-1.5 rounded-full bg-indigo-50 text-sm">Qanday ishlaydi?</span>
               <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mt-4 md:mt-6 mb-6 md:mb-8 text-slate-900 dark:text-white transition-colors duration-300">Zamonaviy ta'lim faqat 3 qadamda</h2>
               
               <div className="space-y-4 md:space-y-5">
                 <div className="flex gap-4 md:gap-5 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all hover:-translate-y-1 group">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-110 transition-transform">1</div>
                   <div>
                     <h4 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-1 transition-colors">Profil yarating</h4>
                     <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">Fazo da maxsus o'quv kabinetingizga ega bo'ling. Jarayon atigi 30 soniya vaqtingizni oladi va mutlaqo bepul.</p>
                   </div>
                 </div>
                 <div className="flex gap-4 md:gap-5 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
                   <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-110 transition-transform">2</div>
                   <div>
                     <h4 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-1 transition-colors">AI bilan tayyorgarlik</h4>
                     <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">Laboratoriyada geometrik shakllar chizing yoki 450+ bazaviy darslarni o'zlashtiring. Tushunarsiz masalalarni to'g'ridan to'g'ri AI muallimdan so'rang.</p>
                   </div>
                 </div>
                 <div className="flex gap-4 md:gap-5 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-110 transition-transform">3</div>
                   <div>
                     <h4 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-1 transition-colors">Katta tahlil va raqobat</h4>
                     <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">Bilimingizga moslashuvchi (adaptiv) testlarni yechib, XP ballar yig'ing va Respublika bo'yicha kuchlilar reytingidan joy oling!</p>
                   </div>
                 </div>
               </div>
            </div>
            <div className="lg:w-1/2 bg-white/90 backdrop-blur-xl dark:bg-slate-900/50 rounded-3xl p-8 border-2 border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-100/40 dark:shadow-none transition-colors">
               <div className="aspect-[4/3] bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center relative overflow-hidden transition-colors border border-slate-100 dark:border-slate-700/50 group">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 dark:from-indigo-400/5 dark:to-blue-400/5 mix-blend-multiply dark:mix-blend-lighten z-20 pointer-events-none" />
                 <div className="w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl absolute top-0 left-0 z-0" />
                 <div className="w-48 h-48 bg-blue-500/20 rounded-full blur-3xl absolute bottom-0 right-0 z-0" />
                 <img src="/demo-progress.png" alt="Fazo Progress Dashboard" className="w-full h-full object-cover object-top relative z-10 scale-[1.02] group-hover:scale-[1.05] transition-transform duration-700 drop-shadow-xl" />
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
