'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Star, Clock, List, X, Play, BrainCircuit } from 'lucide-react'
import { collection, query, getDocs, where, Timestamp, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { getDueQuestions } from '@/lib/db/repetition'
import { useAuth } from '@/context/AuthContext'

interface Topic {
  id: string
  title: string
  topic: string
  quizData?: any[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export default function QuizSelectionPage() {
  const { user } = useAuth()
  const [topics, setTopics] = useState<Topic[]>([])
  const [dueQuestions, setDueQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quizStats, setQuizStats] = useState({ totalTaken: 0, avgScore: 0 })
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  
  // Configuration State
  const [config, setConfig] = useState({
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    questionCount: 10,
    timeLimit: 10, // minutes
    mode: 'new' as 'new' | 'review'
  })

  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      try {
        // Fetch topics
        const q = query(collection(db, 'lessons'), orderBy('order', 'asc'))
        const snap = await getDocs(q)
        const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Topic))
        setTopics(docs)

        // Fetch due questions from Spaced Repetition
        const due = await getDueQuestions(user.uid)
        setDueQuestions(due)

        // Fetch user stats
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)))
        if (!userDoc.empty) {
            const data = userDoc.docs[0].data()
            setQuizStats({
                totalTaken: data.totalQuizzesTaken || 0,
                avgScore: data.averageQuizScore || 0
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

  const startQuiz = () => {
    if (!selectedTopic) return
    const params = new URLSearchParams({
      topicId: selectedTopic.id,
      difficulty: config.difficulty,
      count: config.questionCount.toString(),
      time: config.timeLimit.toString(),
      mode: config.mode
    })
    router.push(`/quiz/take?${params.toString()}`)
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
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="text-center md:text-left mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Bilimingizni sinang</h1>
          <p className="text-slate-500 mt-2 font-medium">Barcha boblar bo'yicha testlar to'plami</p>
        </div>
        <div className="hidden md:block bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl text-xs font-black text-indigo-700 uppercase tracking-widest">
          {dueQuestions.length > 0 ? `${dueQuestions.length} ta takrorlash mavjud` : 'Geowiz AI Engine'}
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
            { label: 'Topshirilgan', value: quizStats.totalTaken, icon: List, color: 'indigo' },
            { label: 'O\'rta ball', value: quizStats.avgScore + '%', icon: Star, color: 'amber' },
            { label: 'Takrorlash', value: dueQuestions.length, icon: BrainCircuit, color: 'rose' },
            { label: 'AI Tavsiyasi', value: 'Geometriya', icon: BrainCircuit, color: 'emerald' },
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

      <div className="flex items-center gap-4 py-4">
          <button className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${config.mode === 'new' ? 'bg-[#312E81] border-[#312E81] text-white' : 'bg-white text-slate-500 hover:border-indigo-200'}`} onClick={() => setConfig({...config, mode: 'new'})}>
              Yangi testlar
          </button>
          <button className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${config.mode === 'review' ? 'bg-[#312E81] border-[#312E81] text-white' : 'bg-white text-slate-500 hover:border-indigo-200'} flex items-center gap-2`} onClick={() => setConfig({...config, mode: 'review'})}>
              Takrorlash {dueQuestions.length > 0 && <span className="bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{dueQuestions.length}</span>}
          </button>
      </div>

      {topics.length === 0 ? (
        <div className="bg-white border border-slate-100 p-12 rounded-3xl text-center shadow-sm">
          <p className="text-slate-400 font-medium italic">Hali tayyor testlar mavjud emas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((item) => (
            <div key={item.id} className="glass-card bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600`}>
                   <BrainCircuit className="w-6 h-6" />
                </div>
                <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-[10px] font-black text-slate-400 uppercase">
                  {dueQuestions.filter(d => d.topicId === item.id).length > 0 ? (
                      <span className="text-rose-500">{dueQuestions.filter(d => d.topicId === item.id).length} TA TAKRORLASH</span>
                  ) : item.topic}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">{item.quizData?.length || 0} ta mavjud savol</p>

              <div className="mt-auto border-t border-slate-100 pt-5 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${j < (item.difficulty === 'beginner' ? 1 : item.difficulty === 'intermediate' ? 2 : 3) ? 'bg-amber-100' : 'bg-slate-100'}`}>
                      <Star className={`w-3 h-3 ${j < (item.difficulty === 'beginner' ? 1 : item.difficulty === 'intermediate' ? 2 : 3) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setSelectedTopic(item)}
                  className="btn-gradient px-5 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 group-hover:translate-x-1 transition-all shadow-md shadow-indigo-500/20"
                >
                  Boshlash <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIGURATION MODAL */}
      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTopic(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 pb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Test sozlamalari</h2>
                <button onClick={() => setSelectedTopic(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-8 pt-4 space-y-8">
                {/* Topic Info */}
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700">{selectedTopic.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">Ushbu bobdan {selectedTopic.quizData?.length} ta savol mavjud</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Difficulty */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <BrainCircuit className="w-4 h-4" /> Qiyinchilik
                    </label>
                    <div className="flex flex-col gap-2">
                      {['easy', 'medium', 'hard'].map((d) => (
                        <button
                          key={d}
                          onClick={() => setConfig({...config, difficulty: d as any})}
                          className={`px-4 py-2 text-left rounded-xl text-sm font-bold border transition-all ${config.difficulty === d ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'}`}
                        >
                          {d === 'easy' ? 'Oson' : d === 'medium' ? 'O\'rta' : 'Qiyin'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <List className="w-4 h-4" /> Savollar soni
                      </label>
                      <select 
                        value={config.questionCount}
                        onChange={(e) => setConfig({...config, questionCount: parseInt(e.target.value)})}
                        className="w-full p-3 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={5}>5 ta</option>
                        <option value={10}>10 ta</option>
                        <option value={15}>15 ta</option>
                        <option value={20}>20 ta</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Vaqt limiti
                      </label>
                      <select 
                        value={config.timeLimit}
                        onChange={(e) => setConfig({...config, timeLimit: parseInt(e.target.value)})}
                        className="w-full p-3 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={5}>5 daqiqa</option>
                        <option value={10}>10 daqiqa</option>
                        <option value={15}>15 daqiqa</option>
                        <option value={30}>30 daqiqa</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={startQuiz}
                  className="w-full bg-[#312E81] hover:bg-indigo-900 text-white py-5 rounded-[22px] font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-950/20 active:scale-95"
                >
                  <Play className="w-6 h-6 fill-white" /> Testni boshlash
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
