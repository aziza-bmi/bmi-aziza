'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import {
  doc, getDoc, setDoc, serverTimestamp, updateDoc, increment
} from 'firebase/firestore'
import { addXP, updateStreak } from '@/lib/firestore'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import {
  ArrowLeft, ArrowRight, CheckCircle2,
  Star, Clock, BookOpen, PenTool,
  X, Check, ChevronRight, Trophy,
  Lightbulb
} from 'lucide-react'
import PageLoader from '@/components/shared/PageLoader'

export default function TopicPage() {
  const { sectionId, chapterId, topicId } = useParams()
  const { user } = useAuth()
  const router = useRouter()

  const [topic, setTopic] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [phase, setPhase] = useState<'lesson' | 'quiz' | 'result'>('lesson')

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const topicSnap = await getDoc(
          doc(
            db, 'sections', sectionId as string,
            'chapters', chapterId as string,
            'topics', topicId as string
          )
        )
        if (topicSnap.exists()) {
          setTopic({ id: topicSnap.id, ...topicSnap.data() })
        }

        if (user) {
          const progressId = `${user.uid}_${topicId}`
          const progressSnap = await getDoc(
            doc(db, 'userProgress', progressId)
          )
          if (progressSnap.exists()) {
            setCompleted(progressSnap.data().completed)
          }
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sectionId, chapterId, topicId, user])

  async function completeTopic(score: number) {
    if (!user || !topic || completing) return
    setCompleting(true)
    try {
      const progressId = `${user.uid}_${topicId}`
      await setDoc(doc(db, 'userProgress', progressId), {
        userId: user.uid,
        topicId: topicId as string,
        chapterId: chapterId as string,
        sectionId: sectionId as string,
        completed: true,
        score,
        completedAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'users', user.uid), {
        totalLessonsCompleted: increment(1),
      })
      const earned = Math.round(topic.xpReward * (score / 100))
      await addXP(user.uid, earned)
      await updateStreak(user.uid)
      setXpEarned(earned)
      setCompleted(true)
    } finally {
      setCompleting(false)
    }
  }

  function handleAnswer(index: number) {
    if (isAnswered) return
    setSelectedAnswer(index)
    setIsAnswered(true)
    if (index === topic.quiz[currentQ].correctIndex) {
      setCorrectCount(c => c + 1)
    }
  }

  async function handleNextQuestion() {
    if (currentQ < topic.quiz.length - 1) {
      setCurrentQ(c => c + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      const score = Math.round(
        ((correctCount + (selectedAnswer === topic.quiz[currentQ].correctIndex ? 1 : 0))
        / topic.quiz.length) * 100
      )
      await completeTopic(score)
      setPhase('result')
    }
  }

  const difficultyLabel: Record<string, string> = {
    beginner: "Boshlang'ich",
    intermediate: "O'rta",
    advanced: 'Murakkab',
  }

  const difficultyColor: Record<string, string> = {
    beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    intermediate: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    advanced: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  }

  if (loading) return <PageLoader />
  if (!topic) return (
    <div className="p-8 text-center text-slate-400">
      Mavzu topilmadi
    </div>
  )

  const quiz = topic.quiz || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 lg:p-8 max-w-3xl"
    >
      {/* Back */}
      <Link href={`/lessons/${sectionId}`}
        className="inline-flex items-center gap-1.5 text-sm
                   text-slate-500 dark:text-slate-400
                   hover:text-indigo-600 transition-colors mb-6">
        <ArrowLeft size={16} />
        Orqaga
      </Link>

      {/* Topic header */}
      <div className="glass-card dark:bg-slate-800/60
                      dark:border-slate-700/40 p-5 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-medium
                           text-slate-800 dark:text-slate-100 mb-2">
              {topic.title}
            </h1>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className={`px-2 py-0.5 rounded-full font-medium
                               ${difficultyColor[topic.difficulty]}`}>
                {difficultyLabel[topic.difficulty]}
              </span>
              <span className="flex items-center gap-1
                               text-slate-400 dark:text-slate-500">
                <Clock size={12} />
                {topic.duration} daqiqa
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <Star size={12} />
                +{topic.xpReward} XP
              </span>
              {completed && (
                <span className="flex items-center gap-1
                                 text-green-600 dark:text-green-400">
                  <CheckCircle2 size={12} />
                  Bajarildi
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {phase === 'lesson' && quiz.length > 0 && (
              <button
                onClick={() => setPhase('quiz')}
                className="btn-gradient px-4 py-2 rounded-xl
                           text-xs flex items-center gap-1.5"
              >
                <PenTool size={13} />
                Testga o'tish
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LESSON PHASE */}
      {phase === 'lesson' && (
        <div className="space-y-5">
          {/* Content */}
          <div className="glass-card dark:bg-slate-800/60
                          dark:border-slate-700/40 p-6">
            <div className="prose-content text-sm
                            text-slate-700 dark:text-slate-200
                            leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-lg font-medium
                                   text-slate-800 dark:text-slate-100
                                   mb-4 mt-6 first:mt-0 pb-2
                                   border-b border-slate-100
                                   dark:border-slate-700/40">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-medium
                                   text-slate-800 dark:text-slate-100
                                   mb-3 mt-5">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 leading-relaxed">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold
                                       text-indigo-700 dark:text-indigo-300">
                      {children}
                    </strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-indigo-400
                                           pl-4 py-2 my-3
                                           bg-indigo-50 dark:bg-indigo-900/20
                                           rounded-r-xl italic text-slate-600
                                           dark:text-slate-300">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="w-full text-sm border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-2 text-left font-medium
                                   bg-indigo-50 dark:bg-indigo-900/30
                                   text-slate-700 dark:text-slate-200
                                   border border-slate-200 dark:border-slate-700">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 text-slate-600
                                   dark:text-slate-300
                                   border border-slate-200 dark:border-slate-700">
                      {children}
                    </td>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-1.5 mb-3">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full
                                       bg-indigo-400 flex-shrink-0 mt-2" />
                      <span>{children}</span>
                    </li>
                  ),
                }}
              >
                {topic.content as string}
              </ReactMarkdown>
            </div>
          </div>

          {/* Examples */}
          {topic.examples && topic.examples.length > 0 && (
            <div className="glass-card dark:bg-slate-800/60
                            dark:border-slate-700/40 p-5">
              <h3 className="text-sm font-medium
                             text-slate-800 dark:text-slate-100
                             mb-3 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" />
                Misollar
              </h3>
              <div className="space-y-2">
                {topic.examples.map((ex: string, i: number) => (
                  <div key={i}
                    className="text-sm text-slate-600 dark:text-slate-300
                               bg-amber-50 dark:bg-amber-900/20
                               border border-amber-100 dark:border-amber-800/30
                               rounded-xl px-4 py-3">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {`${i+1}. ${ex}`}
                    </ReactMarkdown>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {quiz.length > 0 && (
              <button
                onClick={() => setPhase('quiz')}
                className="btn-gradient flex-1 py-3 rounded-xl
                           text-sm font-medium flex items-center
                           justify-center gap-2"
              >
                <PenTool size={15} />
                Mini-test: {quiz.length} ta savol
              </button>
            )}
            {completed && (
              <Link href={`/lessons/${sectionId}`}
                className="flex-1 py-3 rounded-xl text-sm font-medium
                           border border-slate-200 dark:border-slate-600
                           text-slate-600 dark:text-slate-300
                           flex items-center justify-center gap-2
                           hover:bg-slate-50 dark:hover:bg-slate-800
                           transition-all">
                <ChevronRight size={15} />
                Keyingi mavzu
              </Link>
            )}
          </div>
        </div>
      )}

      {/* QUIZ PHASE */}
      {phase === 'quiz' && quiz.length > 0 && (
        <div>
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Savol {currentQ + 1} / {quiz.length}
            </span>
            <span className="text-sm text-amber-500 font-medium">
              +{topic.xpReward} XP
            </span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700
                          rounded-full mb-6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((currentQ) / quiz.length) * 100}%`
              }}
              className="h-full bg-gradient-to-r from-indigo-500
                         to-blue-500 rounded-full"
            />
          </div>

          {/* Question */}
          <div className="glass-card dark:bg-slate-800/60
                          dark:border-slate-700/40 p-6 mb-4">
            <p className="text-base font-medium
                          text-slate-800 dark:text-slate-100 mb-6
                          leading-relaxed">
              {quiz[currentQ].question}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {quiz[currentQ].options.map(
                (option: string, i: number) => {
                  const isCorrect = i === quiz[currentQ].correctIndex
                  const isSelected = i === selectedAnswer

                  let style = 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'

                  if (isAnswered) {
                    if (isCorrect) {
                      style = 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600'
                    } else if (isSelected) {
                      style = 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
                    }
                  }

                  return (
                    <button key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={isAnswered}
                      className={`w-full flex items-center gap-3 p-4
                                 rounded-xl border text-left
                                 transition-all ${style}
                                 disabled:cursor-not-allowed`}
                    >
                      <span className={`w-7 h-7 rounded-full flex-shrink-0
                                       flex items-center justify-center
                                       text-xs font-medium
                                       ${isAnswered && isCorrect
                                         ? 'bg-green-500 text-white'
                                         : isAnswered && isSelected
                                         ? 'bg-red-500 text-white'
                                         : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {isAnswered && isCorrect
                          ? <Check size={14} />
                          : isAnswered && isSelected
                          ? <X size={14} />
                          : String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm text-slate-700
                                       dark:text-slate-200">
                        {option}
                      </span>
                    </button>
                  )
                }
              )}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl
                           bg-blue-50 dark:bg-blue-900/20
                           border border-blue-200 dark:border-blue-800/40"
              >
                <p className="text-xs font-medium
                              text-blue-700 dark:text-blue-300 mb-1">
                  💡 Tushuntirish
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {quiz[currentQ].explanation}
                </p>
              </motion.div>
            )}
          </div>

          {isAnswered && (
            <button
              onClick={handleNextQuestion}
              disabled={completing}
              className="btn-gradient w-full py-3 rounded-xl
                         text-sm font-medium disabled:opacity-50"
            >
              {completing ? 'Saqlanmoqda...'
                : currentQ < quiz.length - 1
                ? 'Keyingi savol →'
                : "Yakunlash →"}
            </button>
          )}
        </div>
      )}

      {/* RESULT PHASE */}
      {phase === 'result' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card dark:bg-slate-800/60
                     dark:border-slate-700/40 p-8 text-center"
        >
          <div className="text-5xl mb-4">
            {correctCount === quiz.length ? '🎉' :
             correctCount >= quiz.length / 2 ? '👍' : '💪'}
          </div>
          <h2 className="text-xl font-medium
                         text-slate-800 dark:text-slate-100 mb-2">
            {correctCount === quiz.length
              ? 'Mukammal!'
              : correctCount >= quiz.length / 2
              ? 'Yaxshi!'
              : "Davom eting!"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400
                        text-sm mb-6">
            {correctCount} / {quiz.length} to'g'ri javob
          </p>

          <div className="flex justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-medium gradient-text">
                {Math.round((correctCount / quiz.length) * 100)}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Ball</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-amber-500">
                +{xpEarned}
              </div>
              <div className="text-xs text-slate-400 mt-1">XP</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setPhase('quiz')
                setCurrentQ(0)
                setSelectedAnswer(null)
                setIsAnswered(false)
                setCorrectCount(0)
              }}
              className="flex-1 py-2.5 rounded-xl text-sm
                         border border-slate-200 dark:border-slate-600
                         text-slate-600 dark:text-slate-300
                         hover:bg-slate-50 dark:hover:bg-slate-800
                         transition-all"
            >
              Qaytadan
            </button>
            <Link href={`/lessons/${sectionId}`}
              className="flex-1 btn-gradient py-2.5 rounded-xl
                         text-sm font-medium text-center">
              Davom etish →
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
