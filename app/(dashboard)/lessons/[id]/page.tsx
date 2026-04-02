'use client'

import { motion } from 'framer-motion'
import { Clock, BookOpen, Star, ChevronRight, PlayCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function LessonDetailPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8"
    >
      <div className="flex-1 max-w-3xl space-y-6">
        {/* BREADCRUMB */}
        <div className="flex items-center text-sm font-medium text-slate-400 gap-2 mb-2">
          <Link href="/lessons" className="hover:text-indigo-600 transition-colors">Darslar</Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span>Planimetriya</span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-slate-600">Burchaklar va turlari</span>
        </div>

        {/* HEADER CARD */}
        <div className="glass-card bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden border-t-8 border-t-indigo-500">
          <div className="flex gap-2 mb-4">
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold px-3 py-1 rounded-md">Planimetriya</span>
            <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-1 rounded-md">Boshlang'ich</span>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Burchaklar va turlari</h1>
          
          <div className="flex flex-wrap gap-6 mb-8 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 15 daqiqa</div>
            <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> 8 ta bo'lim</div>
            <div className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Boshlang'ich</div>
          </div>

          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>2 / 8 bo'lim bajarildi</span>
              <span className="text-indigo-600">25%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full w-1/4"></div>
            </div>
          </div>
        </div>

        {/* CONTENT SECTIONS */}
        <div className="glass-card bg-white/90 border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">1</div>
            <h2 className="text-xl font-bold text-slate-800">Burchak nima?</h2>
          </div>
          
          <p className="text-slate-700 leading-relaxed text-base">
            Burchak — bir tomondan chiqqan ikkita nurdan hosil bo'lgan shakl. Nurlar burchakning tomonlari, ularning umumiy boshlang'ich nuqtasi esa burchakning uchi deyiladi.
          </p>

          <div className="bg-indigo-50/50 rounded-2xl h-56 flex items-center justify-center border border-indigo-100/50 mt-6 relative overflow-hidden">
            <svg width="200" height="150" viewBox="0 0 200 150" className="opacity-80">
              <path d="M20 130 L100 20 L180 130" stroke="#4F46E5" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="100" cy="20" r="4" fill="#4F46E5" />
              <text x="100" y="10" fontSize="14" fill="#312E81" textAnchor="middle" fontWeight="bold">Uchi</text>
              <text x="50" y="70" fontSize="14" fill="#312E81" textAnchor="end" fontWeight="bold">Nur 1</text>
              <text x="150" y="70" fontSize="14" fill="#312E81" textAnchor="start" fontWeight="bold">Nur 2</text>
              <path d="M80 100 Q100 80 120 100" stroke="#818CF8" strokeWidth="3" fill="none" strokeDasharray="4 4" />
            </svg>
          </div>
          
          <button className="w-full btn-gradient py-4 rounded-xl text-white font-medium shadow-md mt-6 flex justify-center items-center gap-2">
            Keyingi bo'lim <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="w-full lg:w-72 shrink-0 relative">
        <div className="sticky top-6 flex flex-col gap-6">
          <div className="glass-card bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Mundarija</h3>
            <div className="space-y-4 relative">
              <div className="absolute left-[11px] top-4 bottom-8 w-0.5 bg-slate-100 -z-10"></div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-white relative z-10 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                <span className="text-sm font-medium text-slate-500 line-through">Kirish</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-white relative z-10 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                <span className="text-sm font-medium text-slate-500 line-through">Burchak o'lchov birliklari</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-50 border-[3px] border-indigo-600 flex items-center justify-center shrink-0 shadow-sm relative z-10 mt-0.5"></div>
                <span className="text-sm font-bold text-indigo-700">O'tkir va o'tmas burchak</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 shrink-0 relative z-10 mt-0.5"></div>
                <span className="text-sm font-medium text-slate-500">To'g'ri burchak</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 shrink-0 relative z-10 mt-0.5"></div>
                <span className="text-sm font-medium text-slate-500">Yoyiq burchak</span>
              </div>
            </div>
          </div>

          <div className="glass-card bg-indigo-600 border border-indigo-500 rounded-3xl p-6 shadow-xl text-white text-center">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🤖</span>
            </div>
            <h3 className="font-bold mb-2">Tushunishga qiynalyapsizmi?</h3>
            <p className="text-indigo-100 text-sm mb-6">AI muallimdan ushbu mavzu vizuallari bilan yordam so'rang.</p>
            <Link href="/chat" className="block w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              AI dan so'rash
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
