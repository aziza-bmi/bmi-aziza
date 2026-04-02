'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, BookOpen, Star, ChevronRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { completeLesson } from '@/lib/firestore'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

import XPToast from '@/components/shared/XPToast'
import LevelUpModal from '@/components/shared/LevelUpModal'

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [showXP, setShowXP] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [newLevel, setNewLevel] = useState(1)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    async function fetchLesson() {
      if (!params.id) return
      try {
        const snap = await getDoc(doc(db, 'lessons', params.id as string))
        if (snap.exists()) {
          setLesson(snap.data())
        }
      } catch (err) {
        console.error("Darsni yuklashda xatolik", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [params.id])

  async function handleComplete() {
    if (!user || !lesson) return
    setCompleting(true)
    try {
      const result = await completeLesson(
        user.uid,
        lesson.id,
        lesson.xpReward
      )
      if (result) {
        setXpEarned(lesson.xpReward)
        setShowXP(true)
        if (result.leveledUp) {
          setNewLevel(result.newLevel)
          setTimeout(() => setShowLevelUp(true), 2500)
        } else {
            setTimeout(() => {
                router.push('/lessons')
            }, 2500)
        }
      } else {
          // Already completed
          router.push('/lessons')
      }
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!lesson) {
    return (
        <div className="p-8 flex items-center justify-center flex-col min-h-[60vh] gap-4">
            <h2 className="text-xl font-bold text-slate-800">Dars topilmadi.</h2>
            <Link href="/lessons" className="text-indigo-600 underline font-medium">Ortga qaytish</Link>
        </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 pb-12"
    >
      <div className="flex-1 max-w-3xl space-y-6">
        {/* BREADCRUMB */}
        <div className="flex items-center text-sm font-bold text-slate-400 gap-2 mb-2 uppercase tracking-wider">
          <Link href="/lessons" className="hover:text-indigo-600 transition-colors">Darslar</Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span>{lesson.topic}</span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-slate-600 truncate">{lesson.title}</span>
        </div>

        {/* HEADER CARD */}
        <div className="glass-card bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden border-t-8 border-t-indigo-500">
          <div className="flex gap-3 mb-6">
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">{lesson.topic}</span>
            <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-1.5 rounded-md tracking-wider uppercase">{lesson.difficulty === 'beginner' ? 'Boshlang\'ich' : lesson.difficulty === 'intermediate' ? "O'rta" : 'Murakkab'}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-6">{lesson.title}</h1>
          
          <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-sm font-bold text-slate-600">
            <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400" /> {lesson.duration} daqiqa</div>
            <div className="flex items-center gap-2 text-indigo-600"><Star className="w-5 h-5 text-amber-500 fill-amber-500" /> {lesson.xpReward} XP oling</div>
          </div>

          <div className="w-full space-y-3">
            <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-wider">
              <span>0% bajarildi</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full w-[2%]"></div>
            </div>
          </div>
        </div>

        {/* CONTENT SECTIONS */}
        <div className="glass-card bg-white/90 border border-slate-100 rounded-3xl p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-black text-xl shadow-sm">1</div>
            <h2 className="text-2xl font-bold text-slate-800">Kirish qismi</h2>
          </div>
          
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-p:font-medium prose-p:leading-relaxed prose-strong:text-indigo-700 prose-ul:font-medium prose-li:marker:text-indigo-500" 
              dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n\n/g, '<br/><br/>').replace(/# (.*?)\n/g, '<h1 class="text-2xl mb-4">$1</h1>') }} />

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-3xl h-64 flex items-center justify-center border border-indigo-100 mt-8 relative overflow-hidden shadow-inner">
            <svg width="250" height="180" viewBox="0 0 200 150" className="opacity-90">
              <path d="M20 130 L100 20 L180 130" stroke="#4a5568" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="100" cy="20" r="5" fill="#4f46e5" />
              <text x="100" y="10" fontSize="16" fill="#312e81" textAnchor="middle" fontWeight="bold">Uchi</text>
              <text x="50" y="70" fontSize="14" fill="#64748b" textAnchor="end" fontWeight="bold">Tomon 1</text>
              <text x="150" y="70" fontSize="14" fill="#64748b" textAnchor="start" fontWeight="bold">Tomon 2</text>
            </svg>
          </div>
          
          {/* ACTION BUTTON */}
          <div className="pt-8 mt-8 border-t border-slate-100 flex justify-end">
            <button
                onClick={handleComplete}
                disabled={completing}
                className="btn-gradient px-8 py-4 rounded-2xl text-sm font-bold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
                {completing ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saqlanmoqda...</>
                ) : (
                    <>Darsni tugatish <CheckCircle2 className="w-5 h-5" /></>
                )}
            </button>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="w-full lg:w-72 shrink-0 relative">
        <div className="sticky top-6 flex flex-col gap-6">
          <div className="glass-card bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 uppercase tracking-wider text-sm">Mundarija</h3>
            <div className="space-y-5 relative">
              <div className="absolute left-[11px] top-4 bottom-8 w-0.5 bg-slate-100 -z-10"></div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm border-[3px] border-indigo-100 relative z-10 -mt-0.5"><BookOpen className="w-3 h-3" /></div>
                <span className="text-sm font-bold text-indigo-700">Kirish</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 shrink-0 relative z-10 -mt-0.5"></div>
                <span className="text-sm font-medium text-slate-400">Amaliy qism</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 shrink-0 relative z-10 -mt-0.5"></div>
                <span className="text-sm font-medium text-slate-400">Xulosa</span>
              </div>
            </div>
          </div>

          <div className="glass-card bg-[#312E81] border border-indigo-900 rounded-3xl p-8 shadow-xl text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10 shadow-inner">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-bold mb-3 text-lg">Tushunishga qiynalyapsizmi?</h3>
            <p className="text-indigo-200 text-sm mb-8 font-medium leading-relaxed">AI muallimdan ushbu mavzu sirlarini tushuntirishini so'rang.</p>
            <Link href="/chat" className="block w-full bg-white text-[#312E81] font-bold py-3.5 rounded-xl hover:bg-slate-50 hover:-translate-y-0.5 shadow-lg transition-all text-sm">
              Muallimdan so'rash
            </Link>
          </div>
        </div>
      </div>

      <XPToast xp={xpEarned} show={showXP} onHide={() => setShowXP(false)} />
      <LevelUpModal level={newLevel} show={showLevelUp} onClose={() => setShowLevelUp(false)} />
    </motion.div>
  )
}
