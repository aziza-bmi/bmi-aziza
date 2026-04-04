'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Star, BrainCircuit, RotateCcw,
  BookOpen, Zap, X, Clock, Target, Layers
} from 'lucide-react'
import { collectionGroup, getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { getDueQuestions } from '@/lib/db/repetition'
import { useAuth } from '@/context/AuthContext'

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

interface Topic {
  id: string
  title: string
  topic: string
  quiz?: any[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface QuizConfig {
  difficulty: 'easy' | 'medium' | 'hard' | 'all'
  count: number  // 0 = all
}

const DIFFICULTY_STARS: Record<string, number> = {
  beginner: 1, intermediate: 2, advanced: 3
}

const DIFF_OPTIONS: { value: QuizConfig['difficulty']; label: string; color: string }[] = [
  { value: 'easy',   label: 'Oson',   color: 'emerald' },
  { value: 'medium', label: "O'rta",  color: 'amber'   },
  { value: 'hard',   label: 'Qiyin',  color: 'rose'    },
  { value: 'all',    label: 'Barchasi', color: 'indigo' },
]

const COUNT_OPTIONS = [5, 10, 20, 0] // 0 = all

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export default function QuizSelectionPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [topics,     setTopics]     = useState<Topic[]>([])
  const [dueByTopic, setDueByTopic] = useState<Record<string, number>>({})
  const [loading,    setLoading]    = useState(true)
  const [quizStats,  setQuizStats]  = useState({ totalTaken: 0, avgScore: 0 })
  const [mode,       setMode]       = useState<'new' | 'review'>('new')

  // Config modal state
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [config, setConfig] = useState<QuizConfig>({ difficulty: 'all', count: 10 })

  // ────────────────────────────── data load ─────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      if (!user) return
      try {
        const snap = await getDocs(collectionGroup(db, 'topics'))
        const docs = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as unknown as Topic))
          .filter(t => t.quiz && t.quiz.length > 0)
        setTopics(docs)

        const due = await getDueQuestions(user.uid)
        const grouped: Record<string, number> = {}
        due.forEach(d => { grouped[d.topicId] = (grouped[d.topicId] || 0) + 1 })
        setDueByTopic(grouped)

        const userSnap = await getDocs(
          query(collection(db, 'users'), where('uid', '==', user.uid))
        )
        if (!userSnap.empty) {
          const data = userSnap.docs[0].data()
          setQuizStats({
            totalTaken: data.totalQuizzesTaken || 0,
            avgScore:   data.averageQuizScore   || 0,
          })
        }
      } catch (err) {
        console.error('Error fetching data:', err)
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

  // ──────────────────────── count options for selected topic ────────────────
  function getCountOptions(topic: Topic | null) {
    if (!topic) return COUNT_OPTIONS
    const total = topic.quiz?.length || 0
    return COUNT_OPTIONS.filter(c => c === 0 || c <= total)
  }

  function countLabel(c: number, topic: Topic | null) {
    if (c === 0) return `Barchasi (${topic?.quiz?.length || 0})`
    return `${c} ta`
  }

  // ──────────────────────────────── start quiz ─────────────────────────────
  function startQuiz() {
    if (!selectedTopic) return
    const params = new URLSearchParams({
      topicId:    selectedTopic.id,
      mode:       mode,
      difficulty: config.difficulty,
      count:      String(config.count),
    })
    router.push(`/quiz/take?${params}`)
  }

  // ──────────────────────────────── loading ────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  // ══════════════════════════════════ RENDER ════════════════════════════════
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Bilimingizni sinang
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Barcha boblar bo'yicha testlar to'plami
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 px-4 py-2 rounded-2xl text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" />
            GeoWiz SM-2
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Topshirilgan', value: quizStats.totalTaken, icon: BookOpen  },
            { label: "O'rta ball",   value: `${quizStats.avgScore}%`, icon: Star  },
            { label: 'Takrorlash',   value: totalDue, icon: RotateCcw             },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[24px] shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block leading-none">{s.value}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* MODE TABS */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <button
            onClick={() => setMode('new')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              mode === 'new'
                ? 'bg-[#312E81] text-white shadow-md shadow-indigo-900/20'
                : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 hover:text-indigo-600'
            }`}
          >
            Yangi testlar
          </button>
          <button
            onClick={() => setMode('review')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              mode === 'review'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/20'
                : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-rose-200 hover:text-rose-600'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Takrorlash
            {totalDue > 0 && (
              <span className="bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                {totalDue}
              </span>
            )}
          </button>
        </div>

        {/* TOPICS GRID */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {displayTopics.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-16 rounded-3xl text-center shadow-sm">
                {mode === 'review' ? (
                  <>
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Ajoyib!</h3>
                    <p className="text-slate-500 font-medium">
                      Hozircha takrorlanadigan savollar yo'q.<br />
                      Yangi testlar ishlang, keyin bu yerda paydo bo'ladi.
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400 font-medium italic">
                    Hali tayyor testlar mavjud emas.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayTopics.map((item, i) => {
                  const dueCount = dueByTopic[item.id] || 0
                  const totalQ   = item.quiz?.length || 0
                  const stars    = DIFFICULTY_STARS[item.difficulty] || 1

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                          <BrainCircuit className="w-6 h-6" />
                        </div>
                        {mode === 'review' && dueCount > 0 ? (
                          <div className="bg-rose-50 dark:bg-rose-950 px-3 py-1 rounded-lg border border-rose-100 dark:border-rose-900 text-[11px] font-black text-rose-600 dark:text-rose-400">
                            {dueCount} TA TAKRORLASH
                          </div>
                        ) : (
                          <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700 text-[10px] font-black text-slate-400 uppercase">
                            {item.topic || 'Geometriya'}
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-400 mb-5">
                        {mode === 'review'
                          ? `${dueCount} ta takrorlanadigan savol`
                          : `${totalQ} ta savol`}
                      </p>

                      <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(s => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700'}`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTopic(item)
                            setConfig({ difficulty: 'all', count: 10 })
                          }}
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

      {/* ══════════════════════════ CONFIG MODAL ══════════════════════════════ */}
      <AnimatePresence>
        {selectedTopic && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTopic(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 relative">
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white leading-snug">
                    {selectedTopic.title}
                  </h2>
                  <p className="text-indigo-200 text-sm mt-1 font-medium">
                    Jami {selectedTopic.quiz?.length || 0} ta savol mavjud
                  </p>
                </div>

                {/* Config body */}
                <div className="p-6 space-y-6">

                  {/* Difficulty */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Qiyinchilik darajasi</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {DIFF_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setConfig(c => ({ ...c, difficulty: opt.value }))}
                          className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                            config.difficulty === opt.value
                              ? `border-${opt.color}-500 bg-${opt.color}-50 dark:bg-${opt.color}-950 text-${opt.color}-700 dark:text-${opt.color}-400`
                              : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Count */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Savollar soni</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {getCountOptions(selectedTopic).map(c => (
                        <button
                          key={c}
                          onClick={() => setConfig(prev => ({ ...prev, count: c }))}
                          className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                            config.count === c
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
                              : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          {countLabel(c, selectedTopic)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto time preview */}
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500 font-medium">
                      Taxminiy vaqt:{' '}
                      <span className="font-black text-slate-700 dark:text-slate-300">
                        {Math.round(
                          ((config.count === 0 ? (selectedTopic.quiz?.length || 10) : config.count) * 90) / 60
                        )} daqiqa
                      </span>
                    </span>
                  </div>

                  {/* Start button */}
                  <button
                    onClick={startQuiz}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-2xl font-bold text-base hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    Testni boshlash <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
