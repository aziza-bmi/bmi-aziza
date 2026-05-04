'use client'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import {
  getUserProgress,
  getUserQuizResults,
  getLeaderboard,
  getTopicProgress,
  subscribeToUserData,
  updateStreak,
  getTotalTopicsCount,
  getTopicsMap
} from '@/lib/firestore'
import {
  BookOpen, Star, Flame, BarChart3,
  ChevronRight, ArrowUp, Clock
} from 'lucide-react'
import Link from 'next/link'
import GeoBg from '@/components/landing/GeoBg'

export default function DashboardPage() {
  const { user, userData: ctxUserData } = useAuth()
  const [userData, setUserData] = useState(ctxUserData)
  const [topicProgress, setTopicProgress] = useState<any[]>([])
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [completedLessons, setCompletedLessons] = useState(0)
  const [totalTopics, setTotalTopics] = useState(9) // Fallback initially
  const [topicsMap, setTopicsMap] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    // Parallax logic attached to layout's scrolling main element
    const mainEl = document.querySelector('main')
    if (!mainEl) return
    const handleScroll = () => setScrollTop(mainEl.scrollTop)
    mainEl.addEventListener('scroll', handleScroll)
    return () => mainEl.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!user) return

    // Update streak on dashboard visit
    updateStreak(user.uid)

    // Real-time user data
    const unsubscribe = subscribeToUserData(user.uid, (data) => {
      setUserData(data)
    })

    // Load other data
    async function loadData() {
      try {
        const [progress, quizzes, lb, topics, topicsCount, tMap] = await Promise.all([
          getUserProgress(user!.uid),
          getUserQuizResults(user!.uid),
          getLeaderboard(),
          getTopicProgress(user!.uid),
          getTotalTopicsCount(),
          getTopicsMap()
        ])
        setCompletedLessons(progress.length)
        setRecentQuizzes(quizzes.slice(0, 5))
        setLeaderboard(lb)
        setTopicProgress(topics)
        setTotalTopics(topicsCount > 0 ? topicsCount : 9)
        setTopicsMap(tMap)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    return () => unsubscribe()
  }, [user])
  const stats = [
    {
      icon: BookOpen,
      value: completedLessons === 0 ? `${totalTopics}` : `${completedLessons} / ${totalTopics}`,
      label: 'Jami darslar',
      color: 'indigo',
      progress: Math.round((completedLessons / totalTopics) * 100),
    },
    {
      icon: Flame,
      value: `${userData?.streak || 0} kun`,
      label: 'Ketma-ket o\'qish',
      color: 'amber',
      sub: userData?.streak ? '🔥 Davom eting!' : 'Bugun boshlang!',
    },
    {
      icon: Star,
      value: userData?.xp?.toLocaleString() || '0',
      label: 'Tajriba ballari',
      color: 'purple',
      sub: `Daraja ${userData?.level || 1}`,
    },
    {
      icon: BarChart3,
      value: recentQuizzes.length > 0
        ? `${Math.round(recentQuizzes.reduce((a, b) => a + b.score, 0) / recentQuizzes.length)}%`
        : '—',
      label: "O'rtacha ball",
      color: 'green',
      sub: recentQuizzes.length > 0 ? 'So\'nggi testlar' : 'Hali test yo\'q',
    },
  ]

  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    amber:  'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    green:  'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
  }

  const displayName = userData?.displayName ||
                      user?.displayName ||
                      'Foydalanuvchi'

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 
                        border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-full">
      {/* Safe Background Layer for Parallax */}
      <div 
        style={{ transform: `translateY(${-scrollTop * 0.5}px)` }} 
        className="absolute top-0 left-0 w-full h-[150%] pointer-events-none z-0"
      >
        <GeoBg count={10} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto p-4 md:p-8 pt-6 md:pt-8 relative z-10"
      >
        {/* Header */}
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
            Salom, {displayName.split(' ')[0]}! 👋
          </h1>
          <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Bugun ham geometriya o'rganamizmi?
          </p>
        </div>
        <span className="hidden sm:block text-xs md:text-sm font-medium text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-800/50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/40">
          {new Date().toLocaleDateString('uz-UZ', {
            weekday: 'short', day: 'numeric', month: 'short'
          })}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="glass-card dark:bg-slate-900/50 p-5 bg-white/80 backdrop-blur-xl shadow-lg shadow-indigo-100/20 border-2 border-white/60 dark:border-slate-800/60 rounded-3xl hover:-translate-y-1 hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center 
                            justify-center mb-4 ${colorMap[stat.color]}`}>
              <stat.icon size={20} strokeWidth={2.5} />
            </div>
            <div className="text-2xl font-bold text-slate-800 
                            dark:text-slate-100 leading-tight">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {stat.label}
            </div>
            {stat.progress !== undefined && (
              <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-700 
                              rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-indigo-500 
                             to-blue-500 rounded-full"
                />
              </div>
            )}
            {stat.sub && (
              <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2 bg-slate-50 dark:bg-slate-800/50 inline-block px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700/40">
                {stat.sub}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: topic progress + activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Topic progress */}
          <div className="glass-card dark:bg-slate-900/50 p-6 bg-white/80 backdrop-blur-xl shadow-lg shadow-indigo-100/10 border-2 border-white/60 dark:border-slate-800/60 rounded-3xl transition-all">
            <h2 className="text-base font-bold text-slate-800 
                           dark:text-slate-100 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full" /> Bo'limlar bo'yicha daraja
            </h2>
            <div className="space-y-5">
              {topicProgress.map((item, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-600 
                                     dark:text-slate-300">
                      {item.title || item.topic}
                    </span>
                    <span className="text-sm font-bold text-indigo-600 
                                     dark:text-indigo-400">
                      {item.progress}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-700 
                                  rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-indigo-500 
                                 to-blue-500 rounded-full relative"
                    >
                       <div className="absolute inset-0 bg-white/20 w-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.div>
                  </div>
                </div>
              ))}
              {topicProgress.every(t => t.progress === 0) && (
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500 
                              text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/40 border-dashed">
                  Hali test topshirilmagan. 
                  <Link href="/quiz" className="text-indigo-500 hover:text-indigo-600 ml-1 underline decoration-indigo-200 underline-offset-2">
                    Test boshlash →
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Recent activity */}
          <div className="glass-card dark:bg-slate-900/50 p-6 bg-white/80 backdrop-blur-xl shadow-lg shadow-indigo-100/10 border-2 border-white/60 dark:border-slate-800/60 rounded-3xl transition-all">
            <h2 className="text-base font-bold text-slate-800 
                           dark:text-slate-100 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full" /> So'nggi natijalar
            </h2>
            {recentQuizzes.length > 0 ? (
              <div className="space-y-4">
                {recentQuizzes.map((quiz, i) => (
                  <div key={i} className="flex items-center gap-4 
                                          p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/40 transition-colors hover:border-indigo-100 dark:hover:border-indigo-800/40 hover:shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800/40 shadow-sm
                                    flex items-center justify-center flex-shrink-0">
                      <BarChart3 size={18} className="text-indigo-500" strokeWidth={2.5}/>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {topicsMap[quiz.topicId]?.title || topicsMap[quiz.topic]?.title || quiz.topic} Testi
                      </div>
                      <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Clock size={12} />
                        {quiz.completedAt?.toDate
                          ? new Date(quiz.completedAt.toDate())
                              .toLocaleDateString('uz-UZ', {day:'numeric', month:'short'})
                          : '—'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-extrabold px-3 py-1 
                                        rounded-lg
                                        ${quiz.score >= 80
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : quiz.score >= 60
                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                        {quiz.score}% Max
                        </span>
                        <div className="text-[10px] font-bold text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-800/30">
                            +{quiz.xpEarned} XP
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500 
                            text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/40 border-dashed">
                Hali natijalar yo'q. 
                <Link href="/lessons" className="text-indigo-500 hover:text-indigo-600 ml-1 underline decoration-indigo-200 underline-offset-2">
                  Dars boshlash →
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Right: quick actions + leaderboard */}
        <div className="space-y-6">
          
          {/* Quick actions */}
          <div className="glass-card dark:bg-slate-900/50 p-6 bg-white/80 backdrop-blur-xl shadow-lg shadow-indigo-100/10 border-2 border-white/60 dark:border-slate-800/60 rounded-3xl transition-all">
            <h2 className="text-base font-bold text-slate-800 
                           dark:text-slate-100 mb-5">
              Tezkor harakatlar
            </h2>
            <div className="grid grid-cols-1 gap-2 md:gap-3">
              {[
                { label: 'AI muallim', href: '/chat', primary: true, icon: '🤖' },
                { label: 'Yangi dars', href: '/lessons', primary: false, icon: '📚' },
                { label: 'Bilimni tekshirish', href: '/quiz', primary: false, icon: '🎯' },
              ].map((btn, i) => (
                <Link key={i} href={btn.href}
                  className={`flex items-center justify-between w-full
                             px-3 md:px-4 py-3 md:py-3.5 rounded-2xl text-sm font-bold transition-all shadow-sm group
                             ${btn.primary
                               ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/25'
                               : 'bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border-2 border-slate-200/60 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:-translate-y-1 hover:shadow-md'}`}>
                  <span className="flex items-center gap-2"><span>{btn.icon}</span> {btn.label}</span>
                  <ChevronRight size={16} className={btn.primary ? 'opacity-80 group-hover:opacity-100' : 'text-slate-400 group-hover:text-indigo-500'} />
                </Link>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass-card dark:bg-slate-900/50 p-6 bg-white/80 backdrop-blur-xl shadow-lg shadow-indigo-100/10 border-2 border-white/60 dark:border-slate-800/60 rounded-3xl relative overflow-hidden transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-6xl">🏆</div>
            <h2 className="text-base font-bold text-slate-800 
                           dark:text-slate-100 mb-5 relative z-10">
              Top o'quvchilar
            </h2>
            <div className="space-y-3 relative z-10 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {leaderboard.slice(0, 15).map((u, i) => {
                const isMe = u.uid === user?.uid
                const initials = (u.displayName || 'U')
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <div key={i}
                    className={`flex items-center gap-3 px-4 py-3 
                                rounded-2xl transition-all border
                                ${isMe
                                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200/60 dark:border-indigo-700/40 shadow-sm'
                                  : 'bg-white dark:bg-transparent border-transparent hover:border-slate-100 dark:hover:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                    <span className="text-sm font-black text-slate-400 dark:text-slate-500 w-6 text-center">
                      {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br 
                                    from-indigo-500 to-blue-500 flex items-center 
                                    justify-center text-white text-xs font-bold shadow-sm">
                      {initials}
                    </div>
                    <span className={`flex-1 text-sm truncate font-bold
                                     ${isMe ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>
                      {isMe ? 'Siz' : u.displayName}
                    </span>
                    <span className="text-xs font-extrabold text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg border border-amber-100 dark:border-amber-800/30">
                      {u.xp?.toLocaleString()}
                    </span>
                  </div>
                )
              })}
              {leaderboard.length === 0 && (
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500 text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/40 border-dashed">
                  Hali ro'yxat bo'sh
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </div>
  )
}
