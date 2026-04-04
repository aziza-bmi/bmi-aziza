'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Timer, CheckCircle2, XCircle, ChevronRight,
  Trophy, RotateCcw, BrainCircuit, AlertCircle, Star
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { updateQuestionState, getDueQuestionsByTopic } from '@/lib/db/repetition'
import Link from 'next/link'

interface Question {
  id: string        // stable: topicId_q{index}
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface QuizTakerProps {
  topicId: string
  config: {
    mode: string  // 'new' | 'review'
  }
}

// Shuffle helper
function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function QuizTaker({ topicId, config }: QuizTakerProps) {
  const { user } = useAuth()
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [topicTitle, setTopicTitle] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewEmpty, setReviewEmpty] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function loadQuiz() {
      if (!user) return
      try {
        const response = await fetch(`/api/lessons/${topicId}`)
        const data = await response.json()

        const rawQuiz: any[] = data.quiz || data.quizData || []
        setTopicTitle(data.title || topicId)

        if (rawQuiz.length === 0) {
          setQuestions([])
          setLoading(false)
          return
        }

        // Build questions with STABLE IDs based on original array index
        const allQuestions: Question[] = rawQuiz.map((q: any, idx: number) => ({
          id: `${topicId}_q${idx}`,
          question: q.question ?? '',
          options: q.options ?? [],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : (q.correctAnswerIndex ?? 0),
          explanation: q.explanation ?? '',
          difficulty: q.difficulty ?? 'medium',
        }))

        let finalQuestions: Question[] = []

        if (config.mode === 'review') {
          // Fetch only due questions for this topic
          const dueStates = await getDueQuestionsByTopic(user.uid, topicId)

          if (dueStates.length === 0) {
            setReviewEmpty(true)
            setLoading(false)
            return
          }

          // Build a set of due question IDs for fast lookup
          const dueIds = new Set(dueStates.map(s => s.questionId))

          // Filter allQuestions to only due ones
          finalQuestions = allQuestions.filter(q => dueIds.has(q.id))

          // If for some reason no match (old data), fall through to all
          if (finalQuestions.length === 0) finalQuestions = allQuestions
        } else {
          // mode=new: shuffle all and take all
          finalQuestions = shuffleArray(allQuestions)
        }

        // Auto-calculate time: 90 seconds per question
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
  }, [topicId, config.mode, user])

  // Timer effect
  useEffect(() => {
    if (!loading && !isFinished && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            finishQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isFinished, questions])

  const handleAnswer = async (index: number) => {
    if (isAnswered || !user) return
    setSelectedAnswer(index)
    setIsAnswered(true)

    const isCorrect = index === questions[currentIndex].correctAnswer
    if (isCorrect) setScore(prev => prev + 1)

    // Save SM-2 state with stable question ID
    try {
      await updateQuestionState(user.uid, questions[currentIndex].id, topicId, isCorrect)
    } catch (err) {
      console.error('Error updating question state:', err)
    }
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = async () => {
    setIsFinished(true)
    if (timerRef.current) clearInterval(timerRef.current)

    setSubmitting(true)
    try {
      await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          topicId,
          score,
          total: questions.length,
          timeSpent: totalTime - timeLeft,
          mode: config.mode,
        }),
      })
    } catch (err) {
      console.error('Error submitting quiz:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // ─── LOADING ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Savollar tayyorlanmoqda...</p>
      </div>
    )
  }

  // ─── REVIEW EMPTY ────────────────────────────────────────────────────────────
  if (reviewEmpty) {
    return (
      <div className="bg-white p-12 rounded-3xl text-center border border-slate-100 shadow-sm max-w-xl mx-auto">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Hamma narsani bilasiz!</h3>
        <p className="text-slate-500 mb-8 font-medium">
          Bu mavzu bo'yicha hozircha takrorlanadigan savollar yo'q.<br />
          Ular ma'lum muddat o'tgach qayta paydo bo'ladi.
        </p>
        <Link href="/quiz" className="btn-gradient px-8 py-3 rounded-2xl text-white font-bold inline-block">
          Testlarga qaytish
        </Link>
      </div>
    )
  }

  // ─── NO QUESTIONS ────────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl text-center border border-slate-100 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Savollar topilmadi</h3>
        <p className="text-slate-500 mb-8">Ushbu bob uchun hali testlar qo'shilmagan.</p>
        <button onClick={() => router.back()} className="btn-gradient px-8 py-3 rounded-2xl text-white font-bold">
          Ortga qaytish
        </button>
      </div>
    )
  }

  // ─── RESULTS ─────────────────────────────────────────────────────────────────
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100)
    const isGreat = percentage >= 80
    const timeSpentSec = totalTime - timeLeft

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden"
      >
        <div className="p-12 text-center">
          <div className="w-24 h-24 bg-amber-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 relative">
            <Trophy className="w-12 h-12 text-amber-500" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border-2 border-dashed border-amber-200 rounded-[32px]"
            />
          </div>

          <h2 className="text-3xl font-black text-slate-800 mb-1">Natijangiz!</h2>
          <p className="text-slate-500 font-medium mb-8">{topicTitle}</p>

          <div className="grid grid-cols-3 gap-3 mb-10">
            {[
              { label: "To'g'ri", value: `${score}/${questions.length}`, color: 'indigo' },
              { label: 'Foiz', value: `${percentage}%`, color: isGreat ? 'emerald' : 'amber' },
              { label: 'Vaqt', value: formatTime(timeSpentSec), color: 'slate' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{s.label}</span>
                <span className={`text-xl font-black text-${s.color}-600`}>{s.value}</span>
              </div>
            ))}
          </div>

          {isGreat && (
            <p className="text-emerald-600 font-bold text-sm mb-6">
              🎉 Ajoyib natija! Yaxshi ish qildingiz.
            </p>
          )}

          <div className="space-y-3">
            <Link href="/quiz" className="block w-full bg-[#312E81] text-white py-5 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95">
              Testlarga qaytish
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Qayta urinish
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // ─── ACTIVE QUIZ ─────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex) / questions.length) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md border border-slate-200/60 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm">
            <BrainCircuit className="w-4 h-4" />
            {currentIndex + 1}/{questions.length}
          </div>
          {config.mode === 'review' && (
            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl uppercase tracking-wider">
              Takrorlash rejimi
            </span>
          )}
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm border ${timeLeft < 30 ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
          <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full ${config.mode === 'review' ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-indigo-500 to-blue-500'}`}
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
          className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-12 shadow-xl shadow-slate-200/40 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-2xl" />

          <h2 className="text-2xl font-bold text-slate-800 mb-10 leading-relaxed relative z-10">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4 relative z-10">
            {currentQuestion.options.map((option, idx) => {
              const isCorrect = idx === currentQuestion.correctAnswer
              const isSelected = idx === selectedAnswer

              let variantStyle = 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30'
              if (isAnswered) {
                if (isCorrect) variantStyle = 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm shadow-emerald-200/50'
                else if (isSelected) variantStyle = 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm shadow-rose-200/50'
                else variantStyle = 'bg-white border-slate-50 text-slate-300 pointer-events-none opacity-60'
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={isAnswered}
                  className={`w-full p-6 text-left rounded-2xl border-2 font-bold transition-all flex justify-between items-center ${variantStyle}`}
                >
                  <span className="flex-1">{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500 shrink-0" />}
                </button>
              )
            })}
          </div>

          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <h4 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Izoh:</h4>
                <p className="text-sm font-medium text-slate-600 italic">{currentQuestion.explanation}</p>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={nextQuestion}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
                  >
                    {currentIndex === questions.length - 1 ? "Natijani ko'rish" : 'Keyingi savol'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
