'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, XCircle, RotateCcw, Home, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { saveQuizResult } from '@/lib/firestore'

export default function ActiveQuizPage() {
  const { user } = useAuth()
  const params = useParams()
  const topic = params.topic as string

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes defaults
  const [quizFinished, setQuizFinished] = useState(false)
  
  // Real data state
  const [xpEarned, setXpEarned] = useState(0)

  // Timer logic
  useEffect(() => {
    if (quizFinished || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, quizFinished])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx)
  }

  const checkAnswer = () => {
    if (selectedAnswer === null) return
    setIsAnswered(true)
    if (selectedAnswer === 0) setScore(s => s + 1) // mocking 0 as correct answer
  }

  const nextQuestion = async () => {
    if (currentQuestion >= 9) {
      await handleQuizComplete(score, score, 10, 300 - timeLeft)
    } else {
      setCurrentQuestion(c => c + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    }
  }

  async function handleQuizComplete(
    finalScoreRaw: number,
    correct: number,
    total: number,
    timeTaken: number
  ) {
    if (!user) return
    // finalScoreRaw is between 0 and 10. We need score to be percentage 0-100.
    const finalPercentage = Math.round((finalScoreRaw / total) * 100)
    
    // Provide a default topic if empty
    const t = topic || 'planimetriya'
    
    const xp = await saveQuizResult(
      user.uid,
      t,
      correct,
      total,
      timeTaken,
      {}
    )
    setXpEarned(xp.xpEarned || 0)
    setQuizFinished(true)
  }

  if (quizFinished) {
    return (
      <div className="max-w-md mx-auto pt-10 px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card bg-white/90 border border-slate-100 rounded-3xl p-8 text-center shadow-xl">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="stroke-slate-100" strokeWidth="8" fill="none" />
              <circle 
                cx="50" cy="50" r="45" 
                className="stroke-indigo-600 transition-all duration-1000 ease-out" 
                strokeWidth="8" fill="none" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - score/10)}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold text-slate-800">{score}/10</span>
              <span className="text-sm font-bold text-green-500 mt-2">Ajoyib!</span>
            </div>
          </div>

          <div className="flex justify-between pb-6 mb-6 border-b border-slate-100 px-4">
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">Vaqt</p>
              <p className="font-bold text-slate-700">{formatTime(300 - timeLeft)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">XP</p>
              <p className="font-bold text-amber-500">+{xpEarned}</p>
            </div>
            <div className="text-center">
              <p className="text-xs pr-2 text-slate-400 font-medium">To'g'ri</p>
              <p className="font-bold text-green-500">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">Xato</p>
              <p className="font-bold text-red-500">{10 - score}</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button onClick={() => window.location.reload()} className="w-full py-3.5 rounded-xl border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold flex items-center justify-center gap-2 transition-colors">
              <RotateCcw className="w-4 h-4" /> Qaytadan topshirish
            </button>
            <Link href="/dashboard" className="w-full btn-gradient py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transition-transform">
              <Home className="w-4 h-4" /> Dashboardga
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* TOP NAVIGATION */}
      <div className="flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-100 shadow-sm sticky top-4 z-20">
        <div className="text-sm font-black text-slate-400 bg-slate-50 px-3 py-1 text-center rounded-lg border border-slate-100">
          SAVOL {currentQuestion + 1} / 10
        </div>
        <div className="flex-1 px-8 hidden sm:block">
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
              initial={{ width: `${(currentQuestion / 10) * 100}%` }}
              animate={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className={`text-sm font-bold flex items-center gap-2 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
            <ClockIcon /> {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* QUESTION CARD */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="glass-card bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm"
      >
        <div className="flex gap-2 mb-6">
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">{topic || 'Geometriya'}</span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed mb-8">
          To'g'ri burchakli uchburchakning katetlari 3 sm va 4 sm bo'lsa, gipotenuzasi qancha?
        </h2>

        {/* GEOMETRY FIGURE */}
        <div className="bg-slate-50 rounded-3xl p-6 md:p-10 mb-8 border border-slate-100 flex items-center justify-center">
          <svg width="200" height="150" viewBox="0 0 200 150" className="overflow-visible">
            <path d="M40 130 L160 130 L40 40 Z" fill="none" stroke="#4F46E5" strokeWidth="4" strokeLinejoin="round" />
            <path d="M40 115 L55 115 L55 130" fill="none" stroke="#4F46E5" strokeWidth="2.5" />
            <text x="100" y="150" fontSize="16" fill="#312E81" fontWeight="bold" textAnchor="middle">b = 4</text>
            <text x="20" y="90" fontSize="16" fill="#312E81" fontWeight="bold" textAnchor="middle">a = 3</text>
            <text x="115" y="75" fontSize="16" fill="#4F46E5" fontWeight="bold" textAnchor="middle" className="bg-white">c = ?</text>
          </svg>
        </div>

        {/* OPTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {['5 sm', '6 sm', '7 sm', '4.5 sm'].map((opt, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect = i === 0; // mocking first option as correct
            const showCorrectStatus = isAnswered && isCorrect;
            const showWrongStatus = isAnswered && isSelected && !isCorrect;

            let btnClass = "bg-white border-2 border-slate-100 text-slate-700 hover:border-indigo-200 hover:bg-slate-50";
            if (isSelected && !isAnswered) btnClass = "border-2 border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm";
            if (showCorrectStatus) btnClass = "border-2 border-green-500 bg-green-50 text-green-800 shadow-sm";
            if (showWrongStatus) btnClass = "border-2 border-red-500 bg-red-50 text-red-800 shadow-sm";

            return (
              <button 
                key={i} 
                onClick={() => handleSelect(i)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all ${btnClass}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 ${
                  showCorrectStatus ? 'bg-green-500 border-green-600 text-white' : 
                  showWrongStatus ? 'bg-red-500 border-red-600 text-white' : 
                  isSelected ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  {showCorrectStatus ? <CheckCircle2 className="w-5 h-5" /> : showWrongStatus ? <XCircle className="w-5 h-5" /> : String.fromCharCode(65 + i)}
                </div>
                <span className="font-bold text-[15px]">{opt}</span>
              </button>
            )
          })}
        </div>

        <AnimatePresence>
          {isAnswered && selectedAnswer !== 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl p-5 mb-6 overflow-hidden"
            >
              <h4 className="font-bold text-amber-900 mb-1">To'g'ri javob: A) 5 sm</h4>
              <p className="text-amber-800 text-sm font-medium leading-relaxed mt-2">
                Pifagor teoremasiga ko'ra katetlar kvadratlarining yig'indisi gipotenuza kvadratiga teng: a² + b² = c² <br/>
                Keltirilgan ma'lumotlarga asosan: 3² + 4² = 9 + 16 = 25. c = √25 = 5.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTION BUTTON */}
        <div className="flex justify-end pt-6 border-t border-slate-100 mt-2">
          {!isAnswered ? (
            <button 
               onClick={checkAnswer} 
               disabled={selectedAnswer === null}
               className="btn-gradient px-8 py-3.5 rounded-xl font-bold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all text-sm"
            >
              Javobni tekshirish
            </button>
          ) : (
            <motion.button 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
               onClick={nextQuestion} 
               className="btn-gradient px-8 py-3.5 rounded-xl font-bold text-white shadow-md flex items-center gap-2 hover:-translate-y-0.5 transition-all text-sm"
            >
              {currentQuestion >= 9 ? 'Natijani ko\'rish' : 'Keyingi savol'} <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>

      </motion.div>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}
