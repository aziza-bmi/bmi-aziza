'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, PenTool, FlaskConical, PlaySquare, Trophy, BarChart3, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function Features() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    {
      title: 'Ai dasturlangan muallim',
      desc: 'Generativ AI orqali ishlaydigan shaxsiy o\'qituvchi. Har qanday murakkab geometrik masalani bosqichma-bosqich, eng tushunarli tarzda tushuntirib beradi.',
      icon: BrainCircuit,
      color: 'bg-indigo-600',
      badge: 'Yangi avlod',
      image: '/demo-chat-real.webp',
      moreDetails: 'AI Muallim OpenAI va maxsus riyoziy modellar majmuasi orqali har bir chizmangiz va xatongizdan xulosa qilib, darslarni to\'g\'rilaydi.'
    },
    {
      title: 'Real vaqt interaktiv canvas',
      desc: 'Shakllarni haqiqiy parametrlar yordamida laboratoriyada jonlantiring. Burchaklar, yuzalar, balandliklarni avtomatik vizuallashtiradigan muhit.',
      icon: PenTool,
      color: 'bg-blue-500',
      image: '/demo-canvas.png',
      moreDetails: 'Barcha shakllarni dinamik chizish, qirqish va interaktiv tahlil qilish imkoniyati. Sizning har bir nuqtangiz tizimda jonlanadi.'
    },
    {
      title: 'Ai adaptiv testlar',
      desc: 'Sizning kuchli va zaif tomonlaringizni tahlil qilib, o\'zlashtirish qiyin bo\'lgan mavzulardan chuqurlashtirilgan takrorlash testlarini tuzadi.',
      icon: FlaskConical,
      color: 'bg-purple-500',
      image: '/demo-progress.png',
      moreDetails: 'Testlar sizning bilim xaritangizni (Knowledge Graph) quradi va qaysi qismda kamchilik bo\'lsa, shu tipdagi misollarni ko\'paytiradi.'
    },
    {
      title: '450+ akademik darslar',
      desc: 'Planimetriya va stereometriya qoidalarini tasviriy tarzda mukammallashtirgan eng batafsil o\'zbek tilidagi qadam-baqadam darslar arxivi.',
      icon: PlaySquare,
      color: 'bg-rose-500',
      badge: 'Barcha sinflar',
      image: '/demo-lessons.png',
      moreDetails: '71 ta mavzu, yuzlab teoremalar va 1500 dan ortiq misollar yordamida geometriyani professional darajada o\'rganing.'
    },
    {
      title: 'O\'yinlashtirilgan ta\'lim',
      desc: 'Haftalik reytinglar, maxsus topshiriqlar va kvestlar. Darslarda qatnashib XP ballarini yig\'ing va O\'zbekiston bo\'ylab kuchlilar reytingidan joy oling!',
      icon: Trophy,
      color: 'bg-amber-500',
      image: '/demo-library.png',
      moreDetails: 'O\'quvchi har bir to\'g\'ri javobi va masalasi uchun koinot mavzusiga boy gamifikatsiya platformasida XP va nishonlarga ega bo\'ladi.'
    },
    {
      title: 'Chuqur progress tahlili',
      desc: 'Batafsil statistika yordamida vaqt sarfi, mavzularni o\'zlashtirish tezligi va bilim dinamikangizni shaxsiy ko\'rsatkichlar panelida kuzatib boring.',
      icon: BarChart3,
      color: 'bg-teal-500',
      image: '/demo-progress.png',
      moreDetails: 'Ota-onalar va o\'qituvchilar o\'quvchining har bir darsda qanday fikrlayotganligini va zaif nuqtalarini chuqur tahlil qila oladilar.'
    }
  ]

  // Auto rotate features every 5 seconds
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [features.length, isHovered])

  return (
    <section 
      className="py-14 md:py-24 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10" 
      id="features"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-center mb-10 md:mb-16">
        <span className="text-indigo-600 font-medium px-4 py-1.5 rounded-full bg-indigo-50 text-sm">Xususiyatlar</span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium mt-4 md:mt-6 mb-3 md:mb-4 text-slate-900 dark:text-white">Nima uchun GeoMind?</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-lg">
          An'anaviy ta'limdan farqli — sun'iy intellekt bilan o'rganish tezroq, qiziqarliroq va samaraliroq.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-10 min-h-auto lg:min-h-[600px]">
        {/* Chap qism (Kartalar ro'yxati) */}
        <div className="w-full lg:w-5/12 flex flex-col gap-2 md:gap-3">
          {features.map((item, i) => {
            const Icon = item.icon
            const isActive = activeIdx === i

            return (
              <div
                key={i}
                onMouseEnter={() => setActiveIdx(i)}
                className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  isActive 
                    ? 'bg-white shadow-xl shadow-indigo-100/40 border-indigo-100 scale-[1.02] transform' 
                    : 'bg-white/50 border-transparent hover:bg-white/80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 transition-colors ${isActive ? item.color : 'bg-slate-200 text-slate-500'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                        {item.title}
                      </h3>
                      {item.badge && isActive && (
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <motion.p 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="text-sm text-slate-500 mt-2 leading-relaxed"
                      >
                        {item.desc}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* O'ng qism (Kengaytirilgan ma'lumot va rasm) */}
        <div className="w-full lg:w-7/12 relative hidden md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden flex flex-col shadow-inner"
            >
              {/* Yuqori matn */}
              <div className="p-8 pb-6 relative z-10 bg-gradient-to-b from-slate-50 to-transparent">
                <div className={`w-14 h-14 rounded-2xl ${features[activeIdx].color} text-white flex items-center justify-center shadow-lg mb-6`}>
                  {(() => {
                    const ActiveIcon = features[activeIdx].icon
                    return <ActiveIcon className="w-7 h-7" />
                  })()}
                </div>
                <h3 className="text-3xl font-semibold mb-3 text-slate-900">{features[activeIdx].title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg mb-6">
                  {features[activeIdx].moreDetails}
                </p>
                <Link href="/register" className="inline-flex items-center text-indigo-600 font-medium group hover:text-indigo-700 transition-colors">
                  Batafsil ma'lumot olish
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Rasm yoki grafik */}
              <div className="flex-grow relative px-8 flex items-end justify-center">
                {features[activeIdx].image ? (
                  <motion.img 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    src={features[activeIdx].image!} 
                    alt={features[activeIdx].title} className="w-full h-auto rounded-t-2xl shadow-2xl object-cover object-top border border-slate-200 border-b-0 max-h-[350px]" 
                  />
                ) : (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full h-[300px] bg-white rounded-t-2xl shadow-xl border border-slate-200 border-b-0 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
                  >
                     <div className={`p-6 rounded-3xl ${features[activeIdx].color} bg-opacity-10`}>
                        {(() => {
                          const ActiveIcon = features[activeIdx].icon
                          return <ActiveIcon className={`w-24 h-24 ${features[activeIdx].color.replace('bg-', 'text-')}`} />
                        })()}
                     </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
