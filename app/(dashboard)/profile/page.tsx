'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getUserProgress, getUserQuizResults, subscribeToUserData, getUserRank } from '@/lib/firestore'
import { Mail, Calendar, Edit3, BookOpen, Star, Flame, BarChart3, Trophy, ChevronRight } from 'lucide-react'

import Link from 'next/link'

export default function ProfilePage() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [completedLessons, setCompletedLessons] = useState(0)
  const [quizResults, setQuizResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentRank, setCurrentRank] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToUserData(user.uid, (data) => {
      setUserData(data)
    })

    async function loadStats() {
      try {
        const [progress, quizzes] = await Promise.all([
          getUserProgress(user!.uid).catch(() => []),
          getUserQuizResults(user!.uid).catch(() => []),
        ])
        setCompletedLessons(progress?.length || 0)
        setQuizResults(quizzes || [])
      } catch (error) {
        console.error("Stats yuklashda xatolik:", error)
        setCompletedLessons(0)
        setQuizResults([])
      } finally {
        setLoading(false)
      }
    }

    loadStats()
    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (userData?.xp !== undefined) {
      getUserRank(userData.xp)
        .then(rank => setCurrentRank(rank))
        .catch(err => {
           console.error("Reytingni yuklashda xatolik:", err)
           setCurrentRank(null)
        })
    }
  }, [userData?.xp])

  const avgScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((a, b) => a + b.score, 0) / quizResults.length)
    : 0

  const stats = [
    { icon: BookOpen, label: 'Darslar', value: completedLessons.toString(), color: 'indigo' },
    { icon: Star, label: 'XP Ball', value: (userData?.xp || 0).toLocaleString(), color: 'purple' },
    { icon: Flame, label: 'Streak', value: `${userData?.streak || 0} kun`, color: 'amber' },
    { icon: BarChart3, label: 'Test natija', value: quizResults.length > 0 ? `${avgScore}%` : '—', color: 'green' },
  ]

  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    amber:  'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    green:  'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
  }

  const achievements = [
    { emoji: '🎯', title: 'Birinchi dars', desc: 'Birinchi darsni tugatdingiz', earned: completedLessons >= 1 },
    { emoji: '📚', title: '5 ta dars', desc: '5 ta darsni tugatdingiz', earned: completedLessons >= 5 },
    { emoji: '🔥', title: '5 kun streak', desc: "5 kun ketma-ket o'qidingiz", earned: (userData?.streak || 0) >= 5 },
    { emoji: '⭐', title: '100 XP', desc: "100 XP to'pladingiz", earned: (userData?.xp || 0) >= 100 },
    { emoji: '🏆', title: 'Test ustasi', desc: '5 ta test topshirdingiz', earned: quizResults.length >= 5 },
    { emoji: '💡', title: "AI do'sti", desc: 'AI bilan suhbatlashdingiz', earned: false },
  ]

  const initials = (userData?.displayName || user?.displayName || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 lg:p-8 max-w-4xl"
    >
      <h1 className="text-2xl font-medium text-slate-800 dark:text-slate-100 mb-6">Profil</h1>

      {/* User card */}
      <div className="glass-card dark:bg-slate-800/60 dark:border-slate-700/40 p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-2xl font-medium flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">
              {userData?.displayName || user?.displayName || 'Foydalanuvchi'}
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium">
              Daraja {userData?.level || 1}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Mail size={14} />
            {user?.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
            <Calendar size={14} />
            A&apos;zo bo&apos;lgan sana:{' '}
            {user?.metadata.creationTime
              ? new Date(user.metadata.creationTime).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })
              : '—'}
          </div>
        </div>
        <button className="btn-gradient px-4 py-2 rounded-xl text-sm flex items-center gap-2 flex-shrink-0">
          <Edit3 size={14} />
          Tahrirlash
        </button>
      </div>

      {/* Current Standing Slider/Widget */}
      <div className="glass-card dark:bg-slate-800/60 dark:border-slate-700/40 p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Trophy size={24} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Reytingdagi o&apos;rningiz</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {currentRank !== null ? `Umumiy ro'yxatda #${currentRank}-o'rinda` : "Hisoblanmoqda..."}
            </p>
          </div>
        </div>
        <Link href="/leaderboard" className="btn-gradient px-4 py-2.5 flex items-center justify-center gap-2 rounded-xl font-medium w-full sm:w-auto whitespace-nowrap text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] transition-shadow">
          To&apos;liq reyting
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card dark:bg-slate-800/60 dark:border-slate-700/40 p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
              <stat.icon size={18} />
            </div>
            <div className="text-xl font-medium text-slate-800 dark:text-slate-100">{stat.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="glass-card dark:bg-slate-800/60 dark:border-slate-700/40 p-6 mb-6">
        <div className="flex justify-between mb-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Daraja {userData?.level || 1} → Daraja {(userData?.level || 1) + 1}
          </span>
          <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            {userData?.xp || 0} / {((userData?.level || 1)) * 500} XP
          </span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(((userData?.xp || 0) % 500) / 500 * 100, 100)}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
          />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Keyingi darajaga {500 - ((userData?.xp || 0) % 500)} XP qoldi
        </p>
      </div>

      {/* Achievements */}
      <div className="glass-card dark:bg-slate-800/60 dark:border-slate-700/40 p-6">
        <h3 className="text-base font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          Yutuqlar ({achievements.filter(a => a.earned).length}/{achievements.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((a, i) => (
            <div key={i} className={`p-4 rounded-xl border transition-all ${a.earned ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700/40' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40 opacity-50'}`}>
              <div className="text-2xl mb-2">{a.emoji}</div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{a.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.desc}</div>
              {a.earned && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  ✓ Qo&apos;lga kiritildi
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
