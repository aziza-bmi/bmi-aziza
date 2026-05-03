import 'katex/dist/katex.min.css'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Timer, CheckCircle2, XCircle, ChevronRight, ChevronLeft,
  Trophy, RotateCcw, BrainCircuit, AlertCircle, Star, Zap,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { updateQuestionState, getDueQuestionsByTopic } from '@/lib/db/repetition'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

interface Question {
  id:            string
  question:      string
  options:       string[]
  correctAnswer: number
  explanation:   string
  difficulty:    'easy' | 'medium' | 'hard'
}

interface QuizTakerProps {
  topicId:    string
  mode?:      'new' | 'review'
  difficulty?: 'easy' | 'medium' | 'hard' | 'all'
  count?:     number    // 0 = all
  config?: { mode?: string }
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const newArr = [...arr]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

function randomizeQuestionOptions(q: Question): Question {
  if (!q.options || q.options.length === 0) return q
  const correctOptionText = q.options[q.correctAnswer]
  const shuffledOptions = shuffleArray(q.options)
  const newCorrectIndex = Math.max(0, shuffledOptions.findIndex(o => o === correctOptionText))
  return {
    ...q,
    options: shuffledOptions,
    correctAnswer: newCorrectIndex
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function MathText({ content, className = '' }: { content: string, className?: string }) {
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkMath]} 
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({node, ...props}) => <span {...props} /> // Avoid block p tags inside buttons
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// GeometryFigure — geometrik shakllarni SVG orqali ko'rsatish
// ──────────────────────────────────────────────────────────────────────────────

type GeoShape =
  | { type: 'segment'; label: string; points: [string, string] }
  | { type: 'angle';   label: string; vertex: string; rays: [string, string] }
  | { type: 'triangle'; label: string; vertices: [string, string, string] }

/** Savoldan geometrik shakllarni ajratib oladi */
function parseGeometryShapes(text: string): GeoShape[] {
  const shapes: GeoShape[] = []
  const seen = new Set<string>()

  // Triangle: "ABC uchburchak" or "△ABC"
  const triRe = /(?:△|▲)?([A-Z]{3})\s*(?:uchburchak|triangle|uch\s*burchak)?/g
  let m: RegExpExecArray | null
  while ((m = triRe.exec(text)) !== null) {
    const label = m[1]
    if (!seen.has('tri_' + label)) {
      seen.add('tri_' + label)
      shapes.push({ type: 'triangle', label, vertices: [label[0], label[1], label[2]] })
    }
  }

  // Segment: "AB kesma" or "AB=5" or just "AB" as 2-letter uppercase
  const segRe = /\b([A-Z]{2})\b(?:\s*(?:kesma|segment|=|ning|da|ga|ni|bo'yi|uzunligi))?/g
  while ((m = segRe.exec(text)) !== null) {
    const label = m[1]
    // Skip if already part of a triangle
    const inTriangle = shapes.some(s => s.type === 'triangle' && s.label.includes(label[0]) && s.label.includes(label[1]))
    if (!seen.has('seg_' + label) && !inTriangle) {
      seen.add('seg_' + label)
      shapes.push({ type: 'segment', label, points: [label[0], label[1]] })
    }
  }

  // Angle: "∠ABC" or "ABC burchak"
  const angRe = /(?:∠|<|burchak\s+)([A-Z]{3})/g
  while ((m = angRe.exec(text)) !== null) {
    const label = m[1]
    if (!seen.has('ang_' + label)) {
      seen.add('ang_' + label)
      shapes.push({ type: 'angle', label, vertex: label[1], rays: [label[0], label[2]] })
    }
  }

  return shapes
}

/** SVG chizish */
function GeometryFigure({ question }: { question: string }) {
  const shapes = parseGeometryShapes(question)
  if (shapes.length === 0) return null

  const W = 320
  const H = 140
  const PAD = 32

  // Render all shapes side by side
  const svgElements: React.ReactNode[] = []
  let offsetX = PAD

  shapes.forEach((shape, si) => {
    if (shape.type === 'segment') {
      const x1 = offsetX
      const x2 = offsetX + 90
      const y  = H / 2
      svgElements.push(
        <g key={si}>
          {/* Line */}
          <line x1={x1} y1={y} x2={x2} y2={y} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
          {/* Endpoints */}
          <circle cx={x1} cy={y} r={4} fill="#6366f1" />
          <circle cx={x2} cy={y} r={4} fill="#6366f1" />
          {/* Labels */}
          <text x={x1} y={y - 10} textAnchor="middle" fontSize="13" fontWeight="700" fill="#4f46e5">{shape.points[0]}</text>
          <text x={x2} y={y - 10} textAnchor="middle" fontSize="13" fontWeight="700" fill="#4f46e5">{shape.points[1]}</text>
        </g>
      )
      offsetX += 120
    } else if (shape.type === 'triangle') {
      // Equilateral-ish triangle
      const cx = offsetX + 55
      const ax = cx, ay = H * 0.18
      const bx = cx - 50, by = H * 0.82
      const cx2 = cx + 50, cy2 = H * 0.82
      svgElements.push(
        <g key={si}>
          <polygon
            points={`${ax},${ay} ${bx},${by} ${cx2},${cy2}`}
            fill="#eef2ff"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <text x={ax}    y={ay - 8}   textAnchor="middle" fontSize="13" fontWeight="700" fill="#4f46e5">{shape.vertices[0]}</text>
          <text x={bx - 8} y={by + 4}  textAnchor="middle" fontSize="13" fontWeight="700" fill="#4f46e5">{shape.vertices[1]}</text>
          <text x={cx2 + 8} y={cy2 + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#4f46e5">{shape.vertices[2]}</text>
        </g>
      )
      offsetX += 130
    } else if (shape.type === 'angle') {
      const vx = offsetX + 30, vy = H * 0.72
      const r  = 60
      const a1 = -0.35 // radians for first ray
      const a2 = -Math.PI + 0.35 // radians for second ray
      // Reverse: ray1 goes up-right, ray2 goes up-left
      const r1x = vx + r * Math.cos(-0.4), r1y = vy + r * Math.sin(-0.4)
      const r2x = vx + r * Math.cos(-Math.PI * 0.75), r2y = vy + r * Math.sin(-Math.PI * 0.75)
      // Arc
      const arcR = 20
      const arc1x = vx + arcR * Math.cos(-0.4), arc1y = vy + arcR * Math.sin(-0.4)
      const arc2x = vx + arcR * Math.cos(-Math.PI * 0.75), arc2y = vy + arcR * Math.sin(-Math.PI * 0.75)
      svgElements.push(
        <g key={si}>
          <line x1={vx} y1={vy} x2={r1x} y2={r1y} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={vx} y1={vy} x2={r2x} y2={r2y} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M ${arc1x} ${arc1y} A ${arcR} ${arcR} 0 0 0 ${arc2x} ${arc2y}`} fill="none" stroke="#6366f1" strokeWidth="1.5" />
          <circle cx={vx} cy={vy} r={3.5} fill="#6366f1" />
          <text x={r1x + 6} y={r1y}   textAnchor="start"  fontSize="13" fontWeight="700" fill="#4f46e5">{shape.rays[0]}</text>
          <text x={r2x - 6} y={r2y}   textAnchor="end"    fontSize="13" fontWeight="700" fill="#4f46e5">{shape.rays[1]}</text>
          <text x={vx}      y={vy + 16} textAnchor="middle" fontSize="13" fontWeight="700" fill="#4f46e5">{shape.vertex}</text>
        </g>
      )
      offsetX += 120
    }
  })

  const totalW = Math.max(offsetX + PAD / 2, 200)

  return (
    <div className="flex justify-center my-4">
      <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl px-4 py-3 inline-block">
        <svg
          viewBox={`0 0 ${totalW} ${H}`}
          width={Math.min(totalW, 400)}
          height={Math.round(H * Math.min(totalW, 400) / totalW)}
          aria-label="Geometrik shakl"
        >
          {svgElements}
        </svg>
        <p className="text-center text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Geometrik shakl</p>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export default function QuizTaker({
  topicId,
  mode:    propMode,
  difficulty = 'all',
  count      = 10,
  config,
}: QuizTakerProps) {
  const { user }  = useAuth()
  const router    = useRouter()

  const resolvedMode = (propMode ?? config?.mode ?? 'new') as 'new' | 'review'

  const [questions,   setQuestions]   = useState<Question[]>([])
  const [topicTitle,  setTopicTitle]  = useState('')
  const [lessonPath,  setLessonPath]  = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Track answers for free navigation
  const [answers, setAnswers] = useState<Record<number, number>>({})
  
  const [score,       setScore]       = useState(0)
  const [timeLeft,    setTimeLeft]    = useState(0)
  const [totalTime,   setTotalTime]   = useState(0)
  
  const [loading,     setLoading]     = useState(true)
  const [reviewEmpty, setReviewEmpty] = useState(false)
  
  // Submit states
  const [isFinishing, setIsFinishing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [xpEarned,    setXpEarned]   = useState<number | null>(null)

  // Accordion state
  const [openHintIndex, setOpenHintIndex] = useState<number | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // ────────────────────────────── data load ────────────────────────────────
  useEffect(() => {
    async function loadQuiz() {
      if (!user) return
      try {
        const { collectionGroup, getDocs, doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        
        const snap = await getDocs(collectionGroup(db, 'topics'))
        const targetDoc = snap.docs.find(d => d.id === topicId)
        
        let data: any = {}
        if (targetDoc) {
          data = { id: targetDoc.id, ...targetDoc.data() }
          const pathSegments = targetDoc.ref.path.split('/')
          if (pathSegments.length >= 6) {
            data.sectionId = pathSegments[1]
            data.chapterId = pathSegments[3]
          }
        } else {
          const lessonDoc = await getDoc(doc(db, 'lessons', topicId))
          if (lessonDoc.exists()) {
             data = { id: lessonDoc.id, ...lessonDoc.data() }
          } else {
             throw new Error('Lesson/Topic not found')
          }
        }

        const rawQuiz: any[] = data.quiz || data.quizData || []
        setTopicTitle(data.title || topicId)
        
        let pathRoute = `/lessons/${topicId}`
        if (data.sectionId && data.chapterId) {
          pathRoute = `/lessons/${data.sectionId}/${data.chapterId}/${data.id}`
        }
        setLessonPath(pathRoute)

        if (rawQuiz.length === 0) {
          setLoading(false)
          return
        }

        const allQuestions: Question[] = rawQuiz.map((q: any, idx: number) => {
          const parsedQ: Question = {
            id:            `${topicId}_q${idx}`,
            question:      q.question ?? '',
            options:       q.options   ?? [],
            correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : (q.correctAnswerIndex ?? 0),
            explanation:   q.explanation ?? '',
            difficulty:    q.difficulty  ?? 'medium',
          }
          return randomizeQuestionOptions(parsedQ)
        })

        let finalQuestions: Question[]

        if (resolvedMode === 'review') {
          const dueStates = await getDueQuestionsByTopic(user.uid, topicId)

          if (dueStates.length === 0) {
            setReviewEmpty(true)
            setLoading(false)
            return
          }

          const validDue = dueStates.filter(s => !!s.questionData)
          if (validDue.length === 0) {
            setReviewEmpty(true)
            setLoading(false)
            return
          }

          finalQuestions = validDue.map(s => randomizeQuestionOptions(s.questionData!))
        } else {
          // STATIC JSON QUESTIONS (No AI Generation on the fly)
          let filtered = difficulty === 'all'
            ? [...allQuestions]
            : allQuestions.filter(q => q.difficulty === difficulty)

          if (filtered.length === 0) {
            filtered = [...allQuestions] // Fallback if no questions match difficulty
          }

          const shuffled = shuffleArray(filtered)
          finalQuestions  = count > 0 ? shuffled.slice(0, count) : shuffled
        }

        const secs = finalQuestions.length * 90
        setTotalTime(secs)
        setTimeLeft(secs)
        setQuestions(finalQuestions)
      } catch (err) {
        console.error('Error loading quiz:', err)
      } finally {
        setLoading(false)
      }
    }
    loadQuiz()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, resolvedMode, difficulty, count, user])

  // ────────────────────────────── timer ────────────────────────────────────
  useEffect(() => {
    if (!loading && !isFinishing && !showResults && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            submitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, showResults, isFinishing, questions.length])

  // ────────────────────────────── handlers ─────────────────────────────────
  const handleAnswer = (index: number) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: index }))
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const submitQuiz = async () => {
    if (!user || questions.length === 0 || isFinishing) return
    setIsFinishing(true)
    if (timerRef.current) clearInterval(timerRef.current)

    let calculatedScore = 0
    const answerPromises = []

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const userAns = answers[i]
      const isCorrect = userAns === q.correctAnswer
      
      if (isCorrect) calculatedScore++

      // Only update state if user actually selected an answer
      if (userAns !== undefined) {
        answerPromises.push(
          updateQuestionState(user.uid, q.id, topicId, isCorrect, q).catch(e => console.error("SM2 Log err:", e))
        )
      }
    }

    setScore(calculatedScore)

    // Wait for spaced repetition updates
    await Promise.all(answerPromises)

    try {
      const { saveQuizResult } = await import('@/lib/firestore')
      const result = await saveQuizResult(
        user.uid,
        topicId,
        calculatedScore,
        questions.length,
        totalTime - timeLeft,
        { mode: resolvedMode }
      )
      setXpEarned(result.xpEarned ?? 0)
    } catch (err) {
      console.error('Error submitting quiz:', err)
    }

    setShowResults(true)
  }

  // ─────────────────── LOADING STATE ───────────────────────────────────────
  if (loading || isFinishing && !showResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          {isFinishing ? 'Natijalar hisoblanmoqda...' : 'Savollar tayyorlanmoqda...'}
        </p>
      </div>
    )
  }

  // ... (rest handles EMPTY, RESULTS and QUESTIONS)

  // ─────────────────── REVIEW EMPTY ────────────────────────────────────────
  if (reviewEmpty) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-100 dark:border-slate-800 shadow-sm max-w-xl mx-auto">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Hamma narsani bilasiz!
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
          Bu mavzu bo&apos;yicha hozircha takrorlanadigan savollar yo&apos;q.<br />
          Ular ma&apos;lum muddat o&apos;tgach qayta paydo bo&apos;ladi.
        </p>
        <Link
          href="/quiz"
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold inline-block hover:bg-indigo-700 transition-colors"
        >
          Testlarga qaytish
        </Link>
      </div>
    )
  }

  // ─────────────────── NO QUESTIONS ────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center border border-slate-100 dark:border-slate-800 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Savollar topilmadi
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Ushbu mavzu uchun hali testlar qo&apos;shilmagan.
        </p>
        <button
          onClick={() => router.back()}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Ortga qaytish
        </button>
      </div>
    )
  }

  // ─────────────────── RESULTS SCREEN ──────────────────────────────────────
  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    const isGreat    = percentage >= 80
    const timeSpent  = totalTime - timeLeft

    // Get incorrect questions for hints
    const incorrectQs = questions.map((q, i) => ({ q, userAns: answers[i], index: i }))
                                 .filter(item => item.userAns !== item.q.correctAnswer)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-amber-50 dark:bg-amber-950 rounded-[32px] flex items-center justify-center mx-auto mb-8 relative">
              <Trophy className="w-12 h-12 text-amber-500" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-[32px]"
              />
            </div>

            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">
              Natijangiz!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">{topicTitle}</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "To'g'ri", value: `${score}/${questions.length}`, color: 'text-indigo-600'  },
                { label: 'Foiz',   value: `${percentage}%`, color: isGreat ? 'text-emerald-600' : 'text-amber-600' },
                { label: 'Vaqt',   value: formatTime(timeSpent), color: 'text-slate-600'           },
              ].map((s, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{s.label}</span>
                  <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            {xpEarned !== null && xpEarned > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 py-3 px-6 rounded-2xl"
              >
                <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-black text-indigo-700 dark:text-indigo-300">
                  +{xpEarned} XP qo&apos;shildi!
                </span>
              </motion.div>
            )}

            {isGreat && (
              <p className="text-emerald-600 font-bold text-sm">
                🎉 Ajoyib natija! Yaxshi ish qildingiz!
              </p>
            )}
          </div>
        </div>

        {/* INCORRECT QUESTIONS ACCORDION / LIST */}
        {incorrectQs.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 p-8 space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <AlertCircle className="text-rose-500 w-6 h-6" />
              Xato qilingan savollar tahlili
            </h3>

            <div className="space-y-4">
              {incorrectQs.map(({ q, userAns, index }) => (
                <div key={q.id} className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/50">
                  <button 
                    onClick={() => setOpenHintIndex(openHintIndex === index ? null : index)}
                    className="w-full text-left p-6 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1 pr-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Savol {index + 1}</span>
                      <MathText content={q.question} className="text-slate-700 dark:text-slate-200 font-medium" />
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openHintIndex === index ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {openHintIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                          
                          <div className="grid md:grid-cols-2 gap-4 pt-4">
                            <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-100 dark:border-rose-900">
                              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1 block">Sizning javobingiz</span>
                              {userAns !== undefined ? (
                                <MathText content={q.options[userAns]} className="text-rose-700 dark:text-rose-300 font-medium text-sm" />
                              ) : (
                                <span className="text-rose-400 text-sm italic">Javob belgilanmagan</span>
                              )}
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900">
                              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1 block">To'g'ri javob</span>
                              <MathText content={q.options[q.correctAnswer]} className="text-emerald-700 dark:text-emerald-300 font-medium text-sm" />
                            </div>
                          </div>

                          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900">
                            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                              <BrainCircuit className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-widest">Tushuntirish</span>
                            </div>
                            <MathText content={q.explanation} className="text-indigo-900 dark:text-indigo-200 text-sm leading-relaxed" />
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            
            <div className="pt-6">
               <Link href={lessonPath || `/lessons/${topicId}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center justify-center gap-2">
                 Ushbu mavzuni qayta o'qish <ChevronRight className="w-4 h-4" />
               </Link>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-6">
          <Link
            href="/quiz"
            className="block w-full bg-[#312E81] text-white py-5 rounded-2xl font-bold hover:shadow-lg transition-all text-center"
          >
            Boshqa testlar
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Qayta urinish
          </button>
        </div>
      </motion.div>
    )
  }

  // ─────────────────── ACTIVE QUIZ ─────────────────────────────────────────
  const currentQuestion = questions[currentIndex]
  const progress        = ((currentIndex + 1) / questions.length) * 100
  const isLowTime       = timeLeft < 30
  
  // Has the user answered everything?
  const allAnswered = Object.keys(answers).length === questions.length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER BAR */}
      <div className="flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm">
            <BrainCircuit className="w-4 h-4" />
            {currentIndex + 1}/{questions.length}
          </div>
          {resolvedMode === 'review' && (
            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-3 py-1.5 rounded-xl uppercase tracking-wider hidden sm:inline-block">
              Takrorlash
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={submitQuiz}
            className="px-4 py-2 font-bold text-sm rounded-2xl transition-colors text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Topshirish
          </button>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm border transition-colors ${
            isLowTime
              ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900 animate-pulse'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700'
          }`}>
            <Timer className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* NAVIGATION GRID */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 p-4 rounded-3xl flex flex-wrap gap-2 justify-center">
        {questions.map((_, idx) => {
          const isAnswered = answers[idx] !== undefined
          const isActive = idx === currentIndex
          return (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                isActive 
                  ? 'ring-4 ring-indigo-200 dark:ring-indigo-900 scale-110' 
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700'
              } ${
                isAnswered
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full ${
            resolvedMode === 'review'
              ? 'bg-gradient-to-r from-rose-500 to-rose-400'
              : 'bg-gradient-to-r from-indigo-500 to-blue-500'
          }`}
        />
      </div>

      {/* QUESTION CARD */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 md:p-12 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/60 relative overflow-hidden flex flex-col min-h-[400px]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />

          <div className="mb-10 relative z-10 flex-1">
             <MathText 
               content={currentQuestion.question} 
               className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed" 
             />
             {/* Geometrik shakl avtomatik ko'rsatiladi */}
             <GeometryFigure question={currentQuestion.question} />
          </div>

          <div className="space-y-4 relative z-10">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = idx === answers[currentIndex]

              let variantStyle = 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer'
              if (isSelected) {
                 variantStyle = 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm shadow-indigo-200/50 ring-1 ring-indigo-500'
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full p-5 md:p-6 text-left rounded-2xl border-2 transition-all flex justify-between items-center group ${variantStyle}`}
                >
                  <MathText content={option} className="flex-1 pointer-events-none font-medium" />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 transition-colors ${isSelected ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'}`}>
                     {isSelected && <div className="w-3 h-3 bg-indigo-500 rounded-full" />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* BOTTOM NAVIGATION ACTIONS */}
          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button
               onClick={prevQuestion}
               disabled={currentIndex === 0}
               className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            >
               <ChevronLeft className="w-4 h-4" /> Ortga
            </button>
            <button
               onClick={currentIndex === questions.length - 1 ? submitQuiz : nextQuestion}
               className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                 currentIndex === questions.length - 1
                 ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30 text-white' 
                 : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 text-white'
               }`}
            >
               {currentIndex === questions.length - 1 ? 'Topshirish' : 'Keyingisi'}
               {currentIndex !== questions.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
