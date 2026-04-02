'use client'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import {
  User, Mail, Star, Flame, Trophy,
  BookOpen, BarChart3, Calendar, Edit3
} from 'lucide-react'

export default function ProfilePage() {
  const { user, userData } = useAuth()

  const stats = [
    { icon: BookOpen, label: "Darslar", value: "47", color: "indigo" },
    { icon: Star, label: "XP Ball", value: "2,840", color: "purple" },
    { icon: Flame, label: "Streak", value: "12 kun", color: "amber" },
    { icon: BarChart3, label: "Test natija", value: "87%", color: "green" },
  ]

  const achievements = [
    { emoji: "🎯", title: "Birinchi dars", desc: "Birinchi darsni tugatdingiz", earned: true },
    { emoji: "🔥", title: "5 kun streak", desc: "5 kun ketma-ket o'qidingiz", earned: true },
    { emoji: "🏆", title: "Test ustasi", desc: "10 ta testdan 90%+ ball oldingiz", earned: false },
    { emoji: "💡", title: "AI do'sti", desc: "AI bilan 50 ta suhbat qildingiz", earned: false },
    { emoji: "📐", title: "Geometer", desc: "50 ta darsni tugatdingiz", earned: false },
    { emoji: "⭐", title: "Top o'quvchi", desc: "Reytingda 1-o'ringa chiqing", earned: false },
  ]

  const initials = (userData?.displayName || user?.displayName || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 lg:p-8 max-w-4xl"
    >
      <h1 className="text-2xl font-medium text-slate-800 dark:text-slate-100 mb-6">
        Profil
      </h1>

      <div className="glass-card dark:bg-slate-800/60 dark:border-slate-700/40
                      p-6 mb-6 flex flex-col sm:flex-row items-start 
                      sm:items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br 
                        from-indigo-500 to-blue-500 flex items-center 
                        justify-center text-white text-2xl font-medium
                        flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-medium text-slate-800 
                           dark:text-slate-100">
              {userData?.displayName || user?.displayName || 'Foydalanuvchi'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full
                             bg-indigo-100 dark:bg-indigo-900/40
                             text-indigo-700 dark:text-indigo-300 font-medium">
              Daraja {userData?.level || 1}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm 
                          text-slate-500 dark:text-slate-400">
            <Mail size={14} />
            {user?.email}
          </div>
          <div className="flex items-center gap-2 text-sm 
                          text-slate-500 dark:text-slate-400 mt-1">
            <Calendar size={14} />
            A'zo bo'lgan sana: {user?.metadata.creationTime 
              ? new Date(user.metadata.creationTime).toLocaleDateString('uz-UZ')
              : '—'}
          </div>
        </div>
        <button className="btn-gradient px-4 py-2 rounded-xl text-sm
                           flex items-center gap-2">
          <Edit3 size={14} />
          Tahrirlash
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card dark:bg-slate-800/60 
                                  dark:border-slate-700/40 p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center 
                            justify-center mb-3
                            ${stat.color === 'indigo' 
                              ? 'bg-indigo-100 dark:bg-indigo-900/40' 
                              : stat.color === 'purple'
                              ? 'bg-purple-100 dark:bg-purple-900/40'
                              : stat.color === 'amber'
                              ? 'bg-amber-100 dark:bg-amber-900/40'
                              : 'bg-green-100 dark:bg-green-900/40'}`}>
              <stat.icon size={18} className={
                stat.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400'
                : stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400'
                : stat.color === 'amber' ? 'text-amber-600 dark:text-amber-400'
                : 'text-green-600 dark:text-green-400'
              } />
            </div>
            <div className="text-xl font-medium text-slate-800 
                            dark:text-slate-100">{stat.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card dark:bg-slate-800/60 dark:border-slate-700/40 p-6">
        <h3 className="text-base font-medium text-slate-800 
                       dark:text-slate-100 mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          Yutuqlar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((a, i) => (
            <div key={i} className={`p-4 rounded-xl border transition-all
                                     ${a.earned
                                       ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700/40'
                                       : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40 opacity-50'}`}>
              <div className="text-2xl mb-2">{a.emoji}</div>
              <div className="text-sm font-medium text-slate-800 
                              dark:text-slate-100">{a.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {a.desc}
              </div>
              {a.earned && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 
                                 rounded-full bg-green-100 dark:bg-green-900/30
                                 text-green-700 dark:text-green-400">
                  ✓ Qo'lga kiritildi
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
