'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw, BrainCircuit, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { updateQuestionState } from '@/lib/db/repetition'
import Link from 'next/link'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface QuizTakerProps {
  topicId: string
  config: {
    difficulty: string
    count: number
    time: number
    mode: string
  }
}

export default function QuizTaker({ topicId, config }: QuizTakerProps) {
  const { user } = useAuth()
  const router = useRouter()
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(config.time * 60)
  const [isFinished, setIsFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function loadQuiz() {
      try {
        const response = await fetch(`/api/lessons/${topicId}`)
        const data = await response.json()
        
        if (data.quizData) {
          // Filter by difficulty and limit count
          let filtered = data.quizData.filter((q: any) => q.difficulty === config.difficulty)
          if (filtered.length < config.count) {
              // If not enough of specific difficulty, add others
              const others = data.quizData.filter((q: any) => q.difficulty !== config.difficulty)
              filtered = [...filtered, ...others].slice(0, config.count)
          } else {
              filtered = filtered.slice(0, config.count)
          }

          // Shuffle questions
          setQuestions(filtered.sort(() => Math.random() - 0.5))
        }
      } catch (err) {
        console.error('Error loading quiz:', err)
      } finally {
        setLoading(false)
      }
    }
    loadQuiz()
  }, [topicId, config])

  useEffect(() => {
    if (!loading && !isFinished && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
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
  }, [loading, isFinished, questions])

  const handleAnswer = async (index: number) => {
    if (isAnswered || !user) return
    setSelectedAnswer(index)
    setIsAnswered(true)
    
    const isCorrect = index === questions[currentIndex].correctAnswer
    
    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    // Record for spaced repetition
    try {
      await updateQuestionState(
        user.uid,
        questions[currentIndex].id,
        topicId,
        isCorrect
      )
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
          timeSpent: config.time * 60 - timeLeft,
          config
        })
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Savollar tayyorlanmoqda...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl text-center border border-slate-100 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Savollar topilmadi</h3>
        <p className="text-slate-500 mb-8">Ushbu bob uchun tanlangan qiyinchilikda savollar mavjud emas.</p>
        <button onClick={() => router.back()} className="btn-gradient px-8 py-3 rounded-2xl text-white font-bold">Ortga qaytish</button>
      </div>
    )
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100)
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
               initial={{ rotate: 0 }}
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
               className="absolute inset-0 border-2 border-dashed border-amber-200 rounded-[32px]"
             />
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 mb-2">Natijangiz!</h2>
          <p className="text-slate-500 font-medium mb-8">Ushbu Bob: {topicId} muvaffaqiyatli yakunlandi</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">To'g'ri javoblar</span>
              <span className="text-2xl font-black text-indigo-600">{score} / {questions.length}</span>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Foizda</span>
              <span className="text-2xl font-black text-emerald-600">{percentage}%</span>
            </div>
          </div>

          <div className="space-y-3">
             <Link href="/quiz" className="block w-full bg-[#312E81] text-white py-5 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95">
               Tugallash
             </Link>
             <button onClick={() => window.location.reload()} className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
               <RotateCcw className="w-4 h-4" /> Qayta urinish
             </button>
          </div>
        </div>
      </motion.div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER STATS */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md border border-slate-200/60 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm">
            <BrainCircuit className="w-4 h-4" /> Savol {currentIndex + 1}/{questions.length}
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm border ${timeLeft < 30 ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
          <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500" 
        />
      </div>

      {/* QUESTION CARD */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
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
              
              let variantStyle = "bg-white border-slate-100 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30"
              if (isAnswered) {
                if (isCorrect) variantStyle = "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm shadow-emerald-200/50"
                else if (isSelected) variantStyle = "bg-rose-50 border-rose-500 text-rose-700 shadow-sm shadow-rose-200/50"
                else variantStyle = "bg-white border-slate-50 text-slate-300 pointer-events-none opacity-60"
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={isAnswered}
                  className={`w-full p-6 text-left rounded-2xl border-2 font-bold transition-all flex justify-between items-center ${variantStyle}`}
                >
                  <span className="flex-1">{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500" />}
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
                    {currentIndex === questions.length - 1 ? 'Natijani ko\'rish' : 'Keyingi savol'} <ChevronRight className="w-4 h-4" />
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
