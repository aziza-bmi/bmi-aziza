'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'

export default function QuizSelectionPage() {
  const topics = [
    { title: 'Planimetriya asoslari', questions: 20, bestScore: '85%', difficulty: 1, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Uchburchaklar', questions: 15, bestScore: '72%', difficulty: 2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Pifagor teoremasi', questions: 10, bestScore: '90%', difficulty: 2, color: 'text-teal-600', bg: 'bg-teal-100' },
    { title: 'To\'rtburchaklar', questions: 15, bestScore: null, difficulty: 2, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Doiralar', questions: 12, bestScore: null, difficulty: 3, color: 'text-rose-600', bg: 'bg-rose-100' },
    { title: 'Aralash test', questions: 30, bestScore: null, difficulty: 3, color: 'text-amber-600', bg: 'bg-amber-100' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="text-center md:text-left mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Testlar</h1>
        <p className="text-slate-500 mt-2 font-medium">O'z bilimlaringizni sinab ko'ring va XP to'plang</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((item, i) => (
          <div key={i} className="glass-card bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.color}`}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                 </svg>
              </div>
              <div className="flex bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                {[...Array(3)].map((_, j) => (
                  <Star key={j} className={`w-3.5 h-3.5 ${j < item.difficulty ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                ))}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-1">{item.title}</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">{item.questions} savol</p>

            <div className="mt-auto border-t border-slate-100 pt-5 flex items-center justify-between">
              <div className="text-xs font-bold w-1/2">
                {item.bestScore ? (
                  <div>
                     <span className="text-slate-400 block mb-0.5 uppercase tracking-wider">Eng yaxshi natija</span>
                     <span className="text-emerald-600 text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{item.bestScore}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 drop-shadow-sm">Hali<br/>topshirilmagan</span>
                )}
              </div>
              <Link href={`/quiz/${item.title.toLowerCase().replace(/\s+/g, '-')}`} className="btn-gradient px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-1 group-hover:scale-105 transition-transform shadow-md">
                Boshlash <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
