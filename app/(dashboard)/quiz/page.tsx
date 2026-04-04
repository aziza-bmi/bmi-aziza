'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Star, BrainCircuit, RotateCcw, BookOpen, Zap } from 'lucide-react'
import { collectionGroup, getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { getDueQuestions } from '@/lib/db/repetition'
import { useAuth } from '@/context/AuthContext'

interface Topic {
  id: string
  title: string
  topic: string
  quiz?: any[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

const DIFFICULTY_STARS: Record<string, number> = {
  beginner: 1, intermediate: 2, advanced: 3
}

export default function QuizSelectionPage() {
  const { user } = useAuth()
  const [topics, setTopics] = useState<Topic[]>([])
  // dueByTopic: { [topicId]: count }
  const [dueByTopic, setDueByTopic] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [quizStats, setQuizStats] = useState({ totalTaken: 0, avgScore: 0 })
  const [mode, setMode] = useState<'new' | 'review'>('new')
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      try {
        // Fetch topics with quiz questions from nested collection group
        const snap = await getDocs(collectionGroup(db, 'topics'))
        const docs = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as unknown as Topic))
          .filter(t => t.quiz && t.quiz.length > 0)
        setTopics(docs)

        // Fetch due questions (all topics) and group by topicId
        const due = await getDueQuestions(user.uid)
        const grouped: Record<string, number> = {}
        due.forEach(d => {
          grouped[d.topicId] = (grouped[d.topicId] || 0) + 1
        })
        setDueByTopic(grouped)

        // Fetch user stats
        const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)))
        if (!userSnap.empty) {
          const data = userSnap.docs[0].data()
          setQuizStats({
            totalTaken: data.totalQuizzesTaken || 0,
            avgScore: data.averageQuizScore || 0,
          })
        }
      } catch (err) {
        console.error('Error fetching quiz data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const totalDue = Object.values(dueByTopic).reduce((a, b) => a + b, 0)

  const displayTopics = mode === 'review'
    ? topics.filter(t => (dueByTopic[t.id] || 0) > 0)
    : topics

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Bilimingizni sinang</h1>
          <p className="text-slate-500 mt-1 font-medium">Barcha boblar bo'yicha testlar to'plami</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl text-xs font-black text-indigo-700 uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5" />
          GeoWiz AI Engine
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Topshirilgan', value: quizStats.totalTaken, icon: BookOpen, color: 'indigo' },
          { label: "O'rta ball", value: `${quizStats.avgScore}%`, icon: Star, color: 'amber' },
          { label: 'Takrorlash', value: totalDue, icon: RotateCcw, color: 'rose' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${s.color}-50 text-${s.color}-600`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-800 block leading-none">{s.value}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODE TABS */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <button
          onClick={() => setMode('new')}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
            mode === 'new'
              ? 'bg-[#312E81] text-white shadow-md shadow-indigo-900/20'
              : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
          }`}
        >
          Yangi testlar
        </button>
        <button
          onClick={() => setMode('review')}
          className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
            mode === 'review'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-900/20'
              : 'bg-white text-slate-500 border border-slate-200 hover:border-rose-200 hover:text-rose-600'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Takrorlash
          {totalDue > 0 && (
            <span className="bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ml-1">
              {totalDue}
            </span>
          )}
        </button>
      </div>

      {/* TOPICS GRID */}
      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {displayTopics.length === 0 ? (
            <div className="bg-white border border-slate-100 p-16 rounded-3xl text-center shadow-sm">
              {mode === 'review' ? (
                <>
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Ajoyib!</h3>
                  <p className="text-slate-500 font-medium">Hozircha takrorlanadigan savollar yo'q.<br/>Yangi testlar ishlang, keyin bu yerda paydo bo'ladi.</p>
                </>
              ) : (
                <p className="text-slate-400 font-medium italic">Hali tayyor testlar mavjud emas.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTopics.map((item, i) => {
                const dueCount = dueByTopic[item.id] || 0
                const totalQ = item.quiz?.length || 0
                const stars = DIFFICULTY_STARS[item.difficulty] || 1

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600">
                        <BrainCircuit className="w-6 h-6" />
                      </div>
                      {mode === 'review' && dueCount > 0 ? (
                        <div className="bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 text-[11px] font-black text-rose-600">
                          {dueCount} TA TAKRORLASH
                        </div>
                      ) : (
                        <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-[10px] font-black text-slate-400 uppercase">
                          {item.topic || 'Geometriya'}
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-400 mb-5">
                      {mode === 'review' ? `${dueCount} ta takrorlanadigan savol` : `${totalQ} ta savol`}
                    </p>

                    <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(s => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/quiz/take?topicId=${item.id}&mode=${mode}`)
                        }
                        className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 transition-all shadow-md group-hover:translate-x-1 ${
                          mode === 'review'
                            ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                        }`}
                      >
                        Boshlash <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
