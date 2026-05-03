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
// GeometryFigure — Firebase savollar asosida geometrik SVG diagramma
// ──────────────────────────────────────────────────────────────────────────────
// Savol turlari (Firebase nuqta-chiziq-kesma, burchak-turlari topicsidan):
//   1. "A, B, C nuqtalar bir to'g'ri chiziqda yotadi. AB=5, BC=3"
//      → to'g'ri chiziq ustida ketma-ket nuqtalar
//   2. "ABC uchburchak" → uchburchak
//   3. "burchak alfa o'tkir" → ikkita nurdan hosil bo'lgan burchak
//   4. "doira sektori 90°" → doira
// ──────────────────────────────────────────────────────────────────────────────

/** Savol turini aniqlaydi */
function detectQuestionType(text: string): 'line' | 'triangle' | 'angle' | 'circle' | null {
  if (/uchburchak|△|▲|triangle/i.test(text)) return 'triangle'
  if (/doira|sektor|radius|diametr|aylana|circle|sector/i.test(text)) return 'circle'
  // burchak but NOT uchburchak
  if (/burchak/i.test(text) && !/uchburchak/i.test(text)) return 'angle'
  // kesma, to'g'ri chiziq, collinear descriptions
  if (/kesma|to['']g['']ri\s*chiziq|chiziqda|nuqta.*yota|yota.*nuqta|ketma-?ket/i.test(text)) return 'line'
  // Fallback: 3+ single uppercase point labels → collinear line problem
  const pts = [...new Set(text.match(/\b[A-Z]\b/g) ?? [])]
  if (pts.length >= 3) return 'line'
  return null
}

/** Extracts ordered point labels from text (A, B, C, D, M, N ...) */
function extractLinePoints(text: string): string[] {
  // Prefer points found before the word "nuqta" or "chiziq"
  const cutIdx = text.search(/nuqta|chiziq/i)
  const segment = cutIdx > 0 ? text.slice(0, cutIdx + 20) : text
  const singles = [...new Set(segment.match(/\b[A-Z]\b/g) ?? [])]
  if (singles.length >= 2) return singles.slice(0, 7)
  const all = [...new Set(text.match(/\b[A-Z]\b/g) ?? [])]
  return all.slice(0, 7)
}

// ── SVG components ─────────────────────────────────────────────────────────────

function SvgLine({ points }: { points: string[] }) {
  const step = 68
  const W = Math.max(260, (points.length - 1) * step + 80)
  const H = 80, y = H / 2
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={Math.min(W, 480)} height={H}>
      {/* main horizontal line */}
      <line x1={18} y1={y} x2={W - 18} y2={y} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      {/* arrowheads */}
      <polygon points={`${W-18},${y} ${W-30},${y-5} ${W-30},${y+5}`} fill="#6366f1"/>
      <polygon points={`18,${y} 30,${y-5} 30,${y+5}`} fill="#6366f1"/>
      {/* points */}
      {points.map((pt, i) => {
        const x = 38 + i * step
        return (
          <g key={pt}>
            <circle cx={x} cy={y} r={5} fill="#4338ca"/>
            <text x={x} y={y - 13} textAnchor="middle" fontSize="14" fontWeight="800"
                  fill="#4338ca" fontFamily="'Segoe UI',sans-serif">{pt}</text>
          </g>
        )
      })}
    </svg>
  )
}

function SvgTriangle({ label }: { label: string }) {
  const W = 200, H = 160
  const verts = [
    { x: 100, y: 16,  lx: 100, ly: 7,    anchor: 'middle' as const },
    { x: 18,  y: 144, lx: 4,   ly: 144,  anchor: 'end'    as const },
    { x: 182, y: 144, lx: 196, ly: 144,  anchor: 'start'  as const },
  ]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <polygon points={verts.map(v=>`${v.x},${v.y}`).join(' ')}
               fill="#eef2ff" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round"/>
      {verts.map((v, i) => (
        <text key={i} x={v.lx} y={v.ly} textAnchor={v.anchor}
              fontSize="14" fontWeight="800" fill="#4338ca" fontFamily="'Segoe UI',sans-serif">
          {label[i] ?? String.fromCharCode(65+i)}
        </text>
      ))}
    </svg>
  )
}

function SvgAngle() {
  const W = 190, H = 130
  const vx = 48, vy = 108, r = 92
  const a1 = -0.3, a2 = -1.1
  const r1x = vx + r*Math.cos(a1), r1y = vy + r*Math.sin(a1)
  const r2x = vx + r*Math.cos(a2), r2y = vy + r*Math.sin(a2)
  const ar = 28
  const ac1x = vx + ar*Math.cos(a1), ac1y = vy + ar*Math.sin(a1)
  const ac2x = vx + ar*Math.cos(a2), ac2y = vy + ar*Math.sin(a2)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <line x1={vx} y1={vy} x2={r1x} y2={r1y} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1={vx} y1={vy} x2={r2x} y2={r2y} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <path d={`M ${ac1x} ${ac1y} A ${ar} ${ar} 0 0 0 ${ac2x} ${ac2y}`}
            fill="none" stroke="#818cf8" strokeWidth="2"/>
      <circle cx={vx} cy={vy} r={4} fill="#4338ca"/>
      <text x={vx-12} y={vy+16} fontSize="13" fontWeight="700" fill="#4338ca" fontFamily="'Segoe UI',sans-serif">O</text>
      <text x={r1x+8}  y={r1y+4}  fontSize="13" fontWeight="700" fill="#4338ca" fontFamily="'Segoe UI',sans-serif">B</text>
      <text x={r2x-4}  y={r2y-6}  fontSize="13" fontWeight="700" fill="#4338ca" fontFamily="'Segoe UI',sans-serif">A</text>
      <text x={(ac1x+ac2x)/2+14} y={(ac1y+ac2y)/2}
            fontSize="12" fontStyle="italic" fill="#818cf8" fontFamily="'Segoe UI',sans-serif">α</text>
    </svg>
  )
}

function SvgCircle() {
  const W = 160, H = 140, cx = 80, cy = 70, r = 56
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <circle cx={cx} cy={cy} r={r} fill="#eef2ff" stroke="#6366f1" strokeWidth="2.5"/>
      <circle cx={cx} cy={cy} r={4} fill="#4338ca"/>
      <line x1={cx} y1={cy} x2={cx+r} y2={cy} stroke="#4338ca" strokeWidth="2" strokeDasharray="5 3"/>
      <text x={cx+r/2+2} y={cy-7} textAnchor="middle"
            fontSize="12" fontStyle="italic" fill="#4338ca" fontFamily="'Segoe UI',sans-serif">r</text>
      <text x={cx-8} y={cy+16} fontSize="13" fontWeight="800" fill="#4338ca" fontFamily="'Segoe UI',sans-serif">O</text>
    </svg>
  )
}

/**
 * GeometryFigure — savol matnini tahlil qilib, mos SVG diagramma chiqaradi.
 * Hech narsa topilmasa → null.
 */
function GeometryFigure({ question }: { question: string }) {
  const qType = detectQuestionType(question)
  if (!qType) return null

  let figure: React.ReactNode = null
  let caption = 'Geometrik shakl'

  if (qType === 'line') {
    const pts = extractLinePoints(question)
    if (pts.length < 2) return null
    figure  = <SvgLine points={pts} />
    caption = `To'g'ri chiziq: ${pts.join(' — ')}`
  } else if (qType === 'triangle') {
    const m = question.match(/\b([A-Z]{3})\b/)
    figure  = <SvgTriangle label={m ? m[1] : 'ABC'} />
    caption = 'Uchburchak'
  } else if (qType === 'angle') {
    figure  = <SvgAngle />
    caption = 'Burchak'
  } else if (qType === 'circle') {
    figure  = <SvgCircle />
    caption = 'Doira'
  }

  if (!figure) return null

  return (
    <div className="flex justify-center my-4">
      <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl px-5 py-4 inline-flex flex-col items-center gap-1">
        {figure}
        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{caption}</p>
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
                      {/* Geometrik shakl — natijalar ekranida ham ko'rsatiladi */}
                      <GeometryFigure question={q.question} />
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
