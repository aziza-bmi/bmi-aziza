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
    <main className="relative min-h-screen overflow-x-hidden bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <GeoBg />
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative z-10">
        <section className="flex flex-col items-center justify-center text-center px-4 sm:px-8 pt-24 md:pt-32 pb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse-slow" />
            <span className="text-xs font-medium text-indigo-700">
              Generativ AI bilan geometriya — Jonli
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight max-w-4xl mb-6 text-slate-900">
            Geometriyani{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">AI bilan</span>{' '}
            yangicha o'rgan
          </h1>

          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed mb-10">
            Sun'iy intellekt yordamida geometriyani interaktiv va qiziqarli tarzda o'rganish platformasi. Har bir savol — darhol javob.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Link href="/register" className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg hover:shadow-indigo-500/25 px-8 py-4 rounded-xl text-base font-medium transition-all hover:-translate-y-0.5">
              Bepul boshlash
            </Link>
            <Link href="#demo" className="px-8 py-4 rounded-xl text-base font-medium border border-indigo-100 text-indigo-700 bg-white/50 hover:bg-indigo-50 backdrop-blur-sm transition-all hover:-translate-y-0.5">
              Demo ko'rish
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
               <h2 className="text-3xl md:text-4xl font-semibold mt-6 mb-8 text-slate-900">Uch qadamda o'rganishni boshlang</h2>
               
               <div className="space-y-8">
                 <div className="flex gap-4">
                   <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0">1</div>
                   <div>
                     <h4 className="text-xl font-semibold text-slate-800 mb-2">Ro'yxatdan o'ting</h4>
                     <p className="text-slate-500 leading-relaxed">Platformada atigi 30 soniya ichida o'z hisobingizni yarating va profilingizni moslashtiring.</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">2</div>
                   <div>
                     <h4 className="text-xl font-semibold text-slate-800 mb-2">AI bilan muloqot qiling</h4>
                     <p className="text-slate-500 leading-relaxed">O'zingizni qiynagan geometriya savollarini bering yoki tayyor interaktiv darslarni boshlang.</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">3</div>
                   <div>
                     <h4 className="text-xl font-semibold text-slate-800 mb-2">Testlang va o'sing</h4>
                     <p className="text-slate-500 leading-relaxed">Adaptiv testlarni yeching, XP yig'ing va o'z bilim darajangizni yangi bosqichga olib chiqing.</p>
                   </div>
                 </div>
               </div>
            </div>
            <div className="lg:w-1/2 bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-xl shadow-indigo-100/20">
               <div className="aspect-square bg-slate-200/50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                 {/* Placeholders for abstract shapes to illustrate steps */}
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 mix-blend-multiply" />
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
