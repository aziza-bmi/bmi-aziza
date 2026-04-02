'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle2, ChevronRight, Lock } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { getUserProgress } from '@/lib/firestore'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function LessonsPage() {
  const topics = [
    "Barchasi", "Planimetriya", "Uchburchaklar", 
    "To'rtburchaklar", "Doiralar", "Ko'pburchaklar",
    "Stereometriya", "Koordinatalar"
  ]

  const { user } = useAuth()
  const [lessons, setLessons] = useState<any[]>([])
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      const [lessonsSnap, progress] = await Promise.all([
        getDocs(query(collection(db, 'lessons'), orderBy('order'))),
        getUserProgress(user.uid),
      ])
      setLessons(lessonsSnap.docs.map(d => d.data()))
      setCompletedIds(progress.map((p: any) => p.lessonId))
      setLoading(false)
    }
    load()
  }, [user])

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner": return "bg-green-100 text-green-700 border-green-200"
      case "intermediate": return "bg-amber-100 text-amber-700 border-amber-200"
      case "advanced": return "bg-red-100 text-red-700 border-red-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getTopicColor = (topic: string) => {
    switch(topic) {
        case 'planimetriya': return 'from-indigo-600 to-indigo-400'
        case 'uchburchaklar': return 'from-blue-600 to-blue-400'
        case 'tortburchaklar': return 'from-purple-600 to-purple-400'
        case 'doiralar': return 'from-teal-600 to-teal-400'
        case 'koppurchaklar': return 'from-indigo-600 to-indigo-400'
        default: return 'from-indigo-600 to-indigo-400'
    }
  }

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
      className="max-w-7xl mx-auto space-y-8 pb-12"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Darslar</h1>
          <p className="text-slate-500 font-medium mt-1">Geometriya bo'yicha to'liq kurs</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl text-sm font-bold text-indigo-700 shadow-sm flex items-center gap-2">
          <BookOpenShape className="w-4 h-4" />
          {completedIds.length} / {lessons.length} dars bajarildi
        </div>
      </div>

      {/* FILTER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="flex overflow-x-auto noscrollbar gap-2 pb-2 md:pb-0 w-full md:w-auto pr-4">
          {topics.map((t, i) => (
            <button 
              key={i} 
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                i === 0 
                  ? 'btn-gradient text-white shadow-md border-transparent' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        
        <select className="bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 min-w-[160px] shrink-0">
          <option>Barcha darajalar</option>
          <option>Boshlang'ich</option>
          <option>O'rta</option>
          <option>Murakkab</option>
        </select>
      </div>

      {/* LESSONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => {
          const isCompleted = completedIds.includes(lesson.id)
          const isInProgress = !isCompleted && lesson.order === (completedIds.length + 1)
          const isLocked = !isCompleted && !isInProgress

          return (
            <Link href={!isLocked ? `/lessons/${lesson.id}` : '#'} key={lesson.id} className="group">
              <div className={`glass-card bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 flex flex-col h-full ${isLocked ? 'opacity-75 cursor-not-allowed grayscale-[30%]' : 'hover:shadow-xl hover:-translate-y-1'}`}>
                
                {/* TOP BANNER */}
                <div className={`h-28 bg-gradient-to-br ${getTopicColor(lesson.topic)} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-80 z-10">
                    <path d="M12 2L2 22h20L12 2z"/>
                  </svg>
                </div>

                {/* BODY */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md">
                      {lesson.topic}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty === 'beginner' ? 'Boshlang\'ich' : lesson.difficulty === 'intermediate' ? 'O\'rta' : 'Murakkab'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug line-clamp-2">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4">
                    Ushbu darsda siz geometriya asoslari bo'yicha mustahkam ko'nikmalarga ega bo'lasiz.
                  </p>

                  {/* FOOTER */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {lesson.duration} daqiqa
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 text-xs font-bold">
                       +{lesson.xpReward} XP
                    </div>
                    
                    {isCompleted && (
                      <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        Bajarildi
                      </div>
                    )}
                    {isInProgress && (
                      <div className="flex items-center gap-1.5 text-indigo-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                        Boshlash
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                    {isLocked && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg">
                        <Lock className="w-3.5 h-3.5" />
                        Qulflangan
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}

function BookOpenShape(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}
