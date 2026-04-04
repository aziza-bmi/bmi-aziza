'use client'

import { useSearchParams } from 'next/navigation'
import QuizTaker from '@/components/quiz/QuizTaker'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function QuizTakePage() {
  const searchParams = useSearchParams()

  const topicId = searchParams.get('topicId') || ''
  const mode = searchParams.get('mode') || 'new'

  if (!topicId) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto mt-20">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Xatolik: Mavzu tanlanmagan</h2>
        <Link href="/quiz" className="text-indigo-600 underline font-medium">
          Testlar ro'yxatiga qaytish
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/quiz"
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {mode === 'review' ? 'Takrorlash rejimi' : 'Test sinovi'}
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            GeoWiz AI Power
          </p>
        </div>
      </div>

      <QuizTaker topicId={topicId} config={{ mode }} />
    </motion.div>
  )
}
