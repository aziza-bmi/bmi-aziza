'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronDown, BrainCircuit, Sparkles,
  BookOpen, RotateCcw, Clock, Target, Layers, ArrowRight,
  CheckCircle2, AlertTriangle, X, Loader2, Play
} from 'lucide-react'
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { getDueQuestions } from '@/lib/db/repetition'
import { useAuth } from '@/context/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Section { id: string; title: string; order: number }
interface Chapter { id: string; title: string; order: number; sectionId: string }
interface Topic {
  id: string; title: string; content: string; difficulty: string
  quiz?: any[]; sectionId: string; chapterId: string; order?: number
}
type Difficulty = 'easy' | 'medium' | 'hard' | 'all'
interface QuizConfig { difficulty: Difficulty; count: number }

// ─── Constants ────────────────────────────────────────────────────────────────
const COUNT_OPTIONS = [10, 15, 20, 25, 30]
// 90 seconds per question → minutes
const calcTime = (n: number) => `${Math.ceil(n * 1.5)} daqiqa`

// ─── Component ────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const { user } = useAuth()
  const router   = useRouter()

  // Hierarchy data
  const [sections, setSections]   = useState<Section[]>([])
  const [chapters, setChapters]   = useState<Record<string, Chapter[]>>({})
  const [topics,   setTopics]     = useState<Record<string, Topic[]>>({})
  const [topicMap, setTopicMap]   = useState<Record<string, Topic>>({})

  // Accordion open state
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [openChapter, setOpenChapter] = useState<string | null>(null)

  // UI state
  const [mode,       setMode]       = useState<'new' | 'review'>('new')
  const [pageLoading, setPageLoading] = useState(true)
  const [generating,  setGenerating]  = useState<string | null>(null)
  const [genError,    setGenError]    = useState<string | null>(null)

  // Config modal
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [config, setConfig] = useState<QuizConfig>({ difficulty: 'all', count: 10 })

  // SM-2 due counts
  const [dueByTopic, setDueByTopic] = useState<Record<string, number>>({})

  // ── Load sections on mount ──────────────────────────────────────────────────
  useEffect(() => {
    getDocs(query(collection(db, 'sections'), orderBy('order')))
      .then(snap => setSections(snap.docs.map(d => ({ id: d.id, ...d.data() } as Section))))
      .catch(console.error)
      .finally(() => setPageLoading(false))
  }, [])

  // ── Load due questions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    getDueQuestions(user.uid).then(due => {
      const grouped: Record<string, number> = {}
      due.forEach(d => { grouped[d.topicId] = (grouped[d.topicId] || 0) + 1 })
      setDueByTopic(grouped)
    }).catch(console.error)
  }, [user])

  // ── Lazy loaders ───────────────────────────────────────────────────────────
  async function loadChapters(sectionId: string) {
    if (chapters[sectionId]) return
    const snap = await getDocs(query(collection(db, 'sections', sectionId, 'chapters'), orderBy('order')))
    setChapters(p => ({ ...p, [sectionId]: snap.docs.map(d => ({ id: d.id, sectionId, ...d.data() } as Chapter)) }))
  }

  async function loadTopics(sectionId: string, chapterId: string) {
    if (topics[chapterId]) return
    const snap = await getDocs(
      query(collection(db, 'sections', sectionId, 'chapters', chapterId, 'topics'), orderBy('order'))
    )
    const loaded = snap.docs.map(d => ({ id: d.id, sectionId, chapterId, ...d.data() } as Topic))
    setTopics(p => ({ ...p, [chapterId]: loaded }))
    setTopicMap(p => { const n = { ...p }; loaded.forEach(t => { n[t.id] = t }); return n })
  }

  // ── Accordion toggles ──────────────────────────────────────────────────────
  async function toggleSection(id: string) {
    setOpenSection(p => p === id ? null : id)
    setOpenChapter(null)
    if (openSection !== id) await loadChapters(id)
  }

  async function toggleChapter(sectionId: string, chapterId: string) {
    setOpenChapter(p => p === chapterId ? null : chapterId)
    if (openChapter !== chapterId) await loadTopics(sectionId, chapterId)
  }

  // ── Generate quiz ──────────────────────────────────────────────────────────
  async function generateQuiz(topic: Topic) {
    if (!topic.content) { setGenError('Bu mavzuda dars matni mavjud emas.'); return }
    setGenerating(topic.id)
    setGenError(null)
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterTitle: topic.title, chapterContent: topic.content, count: 30 }),
      })
      if (!res.ok) throw new Error('API xatosi')
      const { questions } = await res.json()

      // Normalize: stable IDs + correctAnswer field
      const normalized = (questions as any[]).map((q, idx) => ({
        id:            `${topic.id}_q${idx}`,
        question:      q.question      ?? '',
        options:       q.options       ?? [],
        correctAnswer: q.correctAnswer ?? q.correctIndex ?? 0,
        explanation:   q.explanation   ?? '',
        difficulty:    q.difficulty    ?? 'medium',
      }))

      // Save to Firestore
      await updateDoc(
        doc(db, 'sections', topic.sectionId, 'chapters', topic.chapterId, 'topics', topic.id),
        { quiz: normalized }
      )

      // Update local state
      setTopics(p => ({
        ...p,
        [topic.chapterId]: (p[topic.chapterId] || []).map(t =>
          t.id === topic.id ? { ...t, quiz: normalized } : t
        ),
      }))
      setTopicMap(p => ({ ...p, [topic.id]: { ...topic, quiz: normalized } }))
    } catch (err: any) {
      console.error(err)
      setGenError('Savollar yaratishda xatolik. Qaytadan urinib ko\'ring.')
    } finally {
      setGenerating(null)
    }
  }

  // ── Config modal helpers ───────────────────────────────────────────────────
  function openConfig(topic: Topic) {
    const max = topic.quiz?.length || 30
    setSelectedTopic(topic)
    setConfig({ difficulty: 'all', count: Math.min(10, max) })
  }

  function startQuiz() {
    if (!selectedTopic) return
    const params = new URLSearchParams({
      topicId:    selectedTopic.id,
      mode,
      difficulty: config.difficulty,
      count:      String(config.count),
    })
    router.push(`/quiz/take?${params}`)
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalDue   = Object.values(dueByTopic).reduce((a, b) => a + b, 0)
  const reviewList = Object.entries(dueByTopic)
    .filter(([, n]) => n > 0 && topicMap[/* topicId */ '' + Object.keys(dueByTopic).find(k => dueByTopic[k] > 0)])
    .map(([topicId, dueCount]) => ({ topicId, dueCount, topic: topicMap[topicId] }))
    .filter(r => r.topic)

  if (pageLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // ══════════════════════════════════════════════════════════════════════ RENDER
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bilimingizni sinang</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Istalgan mavzu bo&apos;yicha AI test yarating va ishlang
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {[
            { v: 'new',    label: 'Mavzular',   icon: BookOpen,   active: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' },
            { v: 'review', label: 'Takrorlash', icon: RotateCcw,  active: 'bg-rose-600 text-white shadow-md shadow-rose-500/30'   },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = mode === tab.v
            return (
              <button key={tab.v} onClick={() => setMode(tab.v as any)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                  isActive ? tab.active : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.v === 'review' && totalDue > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                    {totalDue > 9 ? '9+' : totalDue}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {genError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-2xl text-sm text-red-700 dark:text-red-300"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              {genError}
              <button onClick={() => setGenError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ YANGI TEST TAB ═══ */}
        {mode === 'new' && (
          <div className="space-y-3">
            {sections.length === 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-16 rounded-2xl text-center">
                <p className="text-slate-400 text-sm">Darslar topilmadi. Admin darslar qo&apos;shishi kerak.</p>
              </div>
            )}
            {sections.map(section => (
              <div key={section.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">

                {/* Section header */}
                <button onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{section.title}</p>
                  </div>
                  <motion.div animate={{ rotate: openSection === section.id ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </motion.div>
                </button>

                {/* Chapters */}
                <AnimatePresence>
                  {openSection === section.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                    >
                      {!chapters[section.id] ? (
                        <div className="flex justify-center p-6"><Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /></div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {chapters[section.id].map(chapter => (
                            <div key={chapter.id}>
                              {/* Chapter row */}
                              <button onClick={() => toggleChapter(section.id, chapter.id)}
                                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
                              >
                                <div className="flex items-center gap-3 pl-3">
                                  <div className="w-1.5 h-7 rounded-full bg-indigo-200 dark:bg-indigo-800 shrink-0" />
                                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{chapter.title}</p>
                                </div>
                                <motion.div animate={{ rotate: openChapter === chapter.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                </motion.div>
                              </button>

                              {/* Topics */}
                              <AnimatePresence>
                                {openChapter === chapter.id && (
                                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                    className="overflow-hidden bg-slate-50/60 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800"
                                  >
                                    {!topics[chapter.id] ? (
                                      <div className="flex justify-center p-5"><Loader2 className="w-4 h-4 text-indigo-400 animate-spin" /></div>
                                    ) : (
                                      <div className="divide-y divide-slate-100/60 dark:divide-slate-800/60">
                                        {topics[chapter.id].map(topic => {
                                          const qCount = topic.quiz?.length || 0
                                          const isGen  = generating === topic.id
                                          return (
                                            <div key={topic.id} className="flex items-center justify-between px-5 py-3.5 pl-12 gap-3">
                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${qCount > 0 ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{topic.title}</p>
                                              </div>
                                              <div className="flex items-center gap-2 shrink-0">
                                                {qCount > 0 && (
                                                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg">
                                                    {qCount} savol
                                                  </span>
                                                )}
                                                {qCount > 0 ? (
                                                  <button onClick={() => openConfig(topic)}
                                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 transition-colors shadow-sm"
                                                  >
                                                    <Play className="w-3 h-3" /> Boshlash
                                                  </button>
                                                ) : (
                                                  <button onClick={() => generateQuiz(topic)} disabled={!!generating}
                                                    className="px-3 py-1.5 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-violet-200 dark:hover:bg-violet-900 transition-colors disabled:opacity-50"
                                                  >
                                                    {isGen
                                                      ? <><Loader2 className="w-3 h-3 animate-spin" />Tuzilmoqda...</>
                                                      : <><Sparkles className="w-3 h-3" />AI Tuzsin</>
                                                    }
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {/* ═══ TAKRORLASH TAB ═══ */}
        {mode === 'review' && (
          <div className="space-y-3">
            {Object.keys(dueByTopic).length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-16 rounded-2xl text-center shadow-sm">
                <div className="w-14 h-14 bg-green-50 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Hammasi yaxshi!</h3>
                <p className="text-sm text-slate-400 font-medium">
                  Hozircha takrorlanadigan savollar yo&apos;q.<br />
                  Yangi testlar ishlagan sari bu yerda paydo bo&apos;ladi.
                </p>
              </div>
            ) : (
              Object.entries(dueByTopic).map(([topicId, dueCount]) => {
                const topic = topicMap[topicId]
                if (!topic) return null
                return (
                  <div key={topicId} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950 rounded-xl flex items-center justify-center text-rose-500">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{topic.title}</p>
                        <p className="text-xs text-rose-500 font-semibold mt-0.5">{dueCount} ta takrorlanadigan savol</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/quiz/take?topicId=${topicId}&mode=review&difficulty=all&count=0`)}
                      className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-rose-600 transition-colors"
                    >
                      <Play className="w-4 h-4" /> Boshlash
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}
      </motion.div>

      {/* ═══════════ CONFIG MODAL ═══════════ */}
      <AnimatePresence>
        {selectedTopic && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedTopic(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">

                {/* Modal header */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-7 relative">
                  <button onClick={() => setSelectedTopic(null)}
                    className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white"
                  ><X className="w-4 h-4" /></button>
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white leading-snug">{selectedTopic.title}</h2>
                  <p className="text-indigo-200 text-sm mt-1">{selectedTopic.quiz?.length || 0} ta savol mavjud</p>
                </div>

                {/* Modal config body */}
                <div className="p-6 space-y-5">

                  {/* Difficulty */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                      <Layers className="w-3.5 h-3.5" /> Qiyinchilik darajasi
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { v: 'all',    l: 'Barchasi' },
                        { v: 'easy',   l: 'Oson'     },
                        { v: 'medium', l: "O'rta"    },
                        { v: 'hard',   l: 'Qiyin'    },
                      ] as const).map(opt => (
                        <button key={opt.v}
                          onClick={() => setConfig(c => ({ ...c, difficulty: opt.v }))}
                          className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                            config.difficulty === opt.v
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >{opt.l}</button>
                      ))}
                    </div>
                  </div>

                  {/* Count + time */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                      <Target className="w-3.5 h-3.5" /> Savollar soni va vaqt
                    </label>
                    {/* Each button shows count + minutes */}
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {COUNT_OPTIONS
                        .filter(c => c <= (selectedTopic.quiz?.length || 30))
                        .map(c => (
                          <button key={c}
                            onClick={() => setConfig(p => ({ ...p, count: c }))}
                            className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-0.5 ${
                              config.count === c
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <span className="text-sm font-black">{c}</span>
                            <span className="text-[9px] font-bold opacity-60">{calcTime(c)}</span>
                          </button>
                        ))
                      }
                    </div>

                    {/* Summary pill */}
                    <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 rounded-2xl p-3">
                      <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-sm text-indigo-700 dark:text-indigo-300">
                        <span className="font-black">{config.count} ta savol</span>
                        {' — '}
                        <span className="font-black">{calcTime(config.count)}</span>
                        <span className="opacity-70 text-xs"> (har biriga 90 sek)</span>
                      </span>
                    </div>
                  </div>

                  {/* Start */}
                  <button onClick={startQuiz}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-[0.98]"
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
