'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getUserProgress, getUserQuizResults, subscribeToUserData, getUserRank, updateUserDocument } from '@/lib/firestore'
import { updateUserAuthProfile, updateUserAuthPassword, getAuthErrorMessage } from '@/lib/auth'
import { Mail, Calendar, Edit3, BookOpen, Star, Flame, BarChart3, Trophy, ChevronRight, X, Check, Lock, User as UserIcon } from 'lucide-react'

import Link from 'next/link'

export default function ProfilePage() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [completedLessons, setCompletedLessons] = useState(0)
  const [quizResults, setQuizResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentRank, setCurrentRank] = useState<number | null>(null)

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editPhotoUrl, setEditPhotoUrl] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  const MOOD_AVATARS = [
    { id: 'happy',   url: 'https://api.dicebear.com/7.x/micah/svg?seed=Felix&backgroundColor=b6e3f4', label: 'Xursand' },
    { id: 'smart',   url: 'https://api.dicebear.com/7.x/micah/svg?seed=Mimi&backgroundColor=c0aede', label: 'Aqlli' },
    { id: 'cool',    url: 'https://api.dicebear.com/7.x/micah/svg?seed=Jasper&backgroundColor=d1d4f9', label: 'Ajoyib' },
    { id: 'focused', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Abby&backgroundColor=ffd5dc', label: 'Jiddiy' },
    { id: 'chill',   url: 'https://api.dicebear.com/7.x/micah/svg?seed=Caleb&backgroundColor=ffdfbf', label: 'Sokin' },
    { id: 'energetic',url:'https://api.dicebear.com/7.x/micah/svg?seed=Scooter&backgroundColor=fef08a', label: 'G\'ayratli' },
    { id: 'dreamer', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Bailey&backgroundColor=a7f3d0', label: 'Xayolparast' }
  ]

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToUserData(user.uid, (data: any) => {
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
        .then((rank: any) => setCurrentRank(rank))
        .catch((err: any) => {
           console.error("Reytingni yuklashda xatolik:", err)
           setCurrentRank(null)
        })
    }
  }, [userData?.xp])

  const avgScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((a, b) => a + b.score, 0) / quizResults.length)
    : 0

  const openEditModal = () => {
    const names = (userData?.displayName || user?.displayName || '').split(' ')
    setEditFirstName(names[0] || '')
    setEditLastName(names.slice(1).join(' ') || '')
    setEditPhotoUrl(userData?.photoURL || user?.photoURL || '')
    setOldPassword('')
    setNewPassword('')
    setEditError('')
    setEditSuccess('')
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)
    setEditError('')
    setEditSuccess('')

    try {
      // 1. Update Password if provided
      if (oldPassword && newPassword) {
        if (newPassword.length < 6) {
           throw { code: 'auth/weak-password' }
        }
        await updateUserAuthPassword(user, oldPassword, newPassword)
      }

      // 2. Update Profile Display Name & Avatar
      const newDisplayName = (`${editFirstName.trim()} ${editLastName.trim()}`).trim()
      await updateUserAuthProfile(user, newDisplayName, editPhotoUrl)
      await updateUserDocument(user.uid, { displayName: newDisplayName, photoURL: editPhotoUrl })

      setEditSuccess("Profil muvaffaqiyatli yangilandi!")
      setTimeout(() => setIsEditModalOpen(false), 1500)
    } catch (err: any) {
      if (err.code && typeof err.code === 'string' && err.code.startsWith('auth/')) {
        console.warn("Profil tahrirlash (kutilgan xato):", err.code)
      } else {
        console.error("Profil tahrirlashda xato:", err)
      }
      setEditError(getAuthErrorMessage(err.code) || err.message || "Xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPasswordUser = user?.providerData?.some(p => p.providerId === 'password')

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
      <div className="glass-card dark:bg-slate-800/60 dark:border-slate-700/40 p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 overflow-hidden flex items-center justify-center text-white text-2xl font-medium flex-shrink-0">
          {(userData?.photoURL || user?.photoURL) ? (
            <img src={userData?.photoURL || user?.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
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
        <button onClick={openEditModal} className="btn-gradient px-4 py-2 rounded-xl text-sm flex items-center gap-2 flex-shrink-0">
          <Edit3 size={14} />
          Tahrirlash
        </button>
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

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card dark:bg-slate-800 dark:border-slate-700 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-indigo-100 dark:border-slate-700 flex justify-between items-center bg-indigo-50/50 dark:bg-slate-900/50">
              <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Edit3 size={20} className="text-indigo-600 dark:text-indigo-400" />
                Shaxsiy ma&apos;lumotlar
              </h2>
              <button 
                onClick={() => !isSubmitting && setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-5 custom-scrollbar">
              {/* Avatar Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Kayfiyatingizga mos vizual tanlang</label>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                   {/* User Auth Existing Photo fallback limit */}
                  {user?.photoURL && !MOOD_AVATARS.some(m => m.url === user.photoURL) && (
                     <div 
                        onClick={() => setEditPhotoUrl(user.photoURL!)}
                        className={`snap-center flex flex-col items-center gap-2 cursor-pointer transition-all flex-shrink-0 ${editPhotoUrl === user.photoURL ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                      >
                        <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-colors ${editPhotoUrl === user.photoURL ? 'border-indigo-500 shadow-md shadow-indigo-500/30' : 'border-transparent'}`}>
                          <img src={user.photoURL} alt="Google Avatar" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500">Google</span>
                     </div>
                  )}
                  {MOOD_AVATARS.map((avatar) => (
                    <div 
                      key={avatar.id} 
                      onClick={() => setEditPhotoUrl(avatar.url)}
                      className={`snap-center flex flex-col items-center gap-2 cursor-pointer transition-all flex-shrink-0 ${editPhotoUrl === avatar.url ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-colors ${editPhotoUrl === avatar.url ? 'border-indigo-500 shadow-md shadow-indigo-500/30' : 'border-transparent bg-slate-100 dark:bg-slate-800'}`}>
                        <img src={avatar.url} alt={avatar.label} className="w-full h-full" />
                      </div>
                      <span className={`text-[10px] font-medium ${editPhotoUrl === avatar.url ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                        {avatar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Name Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Ism</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={editFirstName}
                      onChange={e => setEditFirstName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white transition-all"
                      placeholder="Ismingiz"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Familiya</label>
                  <input 
                    type="text" 
                    value={editLastName}
                    onChange={e => setEditLastName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white transition-all"
                    placeholder="Familiyangiz"
                  />
                </div>
              </div>

              {/* Password Info */}
              {isPasswordUser && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Lock size={16} className="text-amber-500" /> Parolni o&apos;zgartirish
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">Eski parol</label>
                    <input 
                      type="password" 
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white transition-all"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">Yangi parol</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white transition-all"
                      placeholder="Kiritilmasa o'zgarmaydi"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              {editError && (
                <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-800">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="p-3 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 text-sm rounded-xl border border-green-100 dark:border-green-800 flex items-center gap-2">
                  <Check size={16} />
                  {editSuccess}
                </div>
              )}
            </form>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button 
                onClick={handleEditSubmit}
                disabled={isSubmitting || (!!newPassword && !oldPassword)}
                className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Saqlash
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
