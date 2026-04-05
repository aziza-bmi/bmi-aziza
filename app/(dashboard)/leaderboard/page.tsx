'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getLeaderboard, getUserRank, getPeriodicLeaderboard } from '@/lib/firestore'
import { Trophy, Medal, Crown, Calendar, Sparkles } from 'lucide-react'
import GlassCard from '@/components/shared/GlassCard'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function LeaderboardPage() {
  const { user, userData } = useAuth()
  const [leaders, setLeaders] = useState<any[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  
  // New States
  const [period, setPeriod] = useState<'all' | 'monthly' | 'weekly'>('all')
  const [displayCount, setDisplayCount] = useState(10)

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true)
      try {
        let top50 = []
        if (period === 'all') {
          top50 = await getLeaderboard(50)
        } else {
          top50 = await getPeriodicLeaderboard(period, 50)
        }
        
        setLeaders(top50)

        // Find if current user is in top 50
        const userInTop50 = top50.find(l => l.uid === user?.uid)
        
        if (userInTop50) {
          setCurrentUserRank(userInTop50.rank)
        } else if (userData && period === 'all') {
          // If not in top 50, fetch exact rank using count. 
          // Note: for weekly/monthly, exact rank is costly, so we skip it.
          const rank = await getUserRank(userData.xp || 0)
          setCurrentUserRank(rank)
        } else {
          setCurrentUserRank(null)
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user && userData !== undefined) {
      fetchLeaderboard()
    }
  }, [user, userData, period])

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50'
      case 2:
        return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600/50'
      case 3:
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700/50'
      default:
        return 'bg-white/50 dark:bg-slate-800/30 border-transparent hover:border-slate-200 dark:hover:border-slate-700/50'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-slate-400" />
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />
      default:
        return <span className="text-lg font-bold text-slate-400 dark:text-slate-500 w-6 text-center">{rank}</span>
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 lg:p-8 max-w-4xl mx-auto flex flex-col min-h-screen lg:min-h-0 relative"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
          <Trophy size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-medium text-slate-800 dark:text-slate-100">Reyting</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Yetakchilar doskasi (Top 50)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 mb-6 rounded-2xl w-full sm:w-max mx-auto shadow-inner border border-slate-200 dark:border-slate-700/50">
        {[
          { id: 'all', label: 'Umumiy' },
          { id: 'monthly', label: 'Oylik' },
          { id: 'weekly', label: 'Haftalik' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setPeriod(tab.id as any);
              setDisplayCount(10);
            }}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              period === tab.id
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <GlassCard className="flex-1 overflow-hidden flex flex-col p-0 border border-slate-100 dark:border-slate-700/40 shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        )}
        
        <div className="overflow-y-auto hidden-scrollbar p-2 md:p-6 space-y-3 pb-32 lg:pb-6">
          {leaders.slice(0, displayCount).map((leader) => {
            const isMe = leader.uid === user?.uid
            return (
              <motion.div
                key={leader.uid}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-4 p-3 md:p-4 rounded-2xl border transition-all ${getRankStyle(leader.rank)} ${isMe ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
              >
                <div className="flex items-center justify-center w-8 shrink-0">
                  {getRankIcon(leader.rank)}
                </div>
                
                <Avatar size="lg">
                  <AvatarImage src={leader.photoURL || ''} alt={leader.displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-medium">
                    {getInitials(leader.displayName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                      {leader.displayName || 'Foydalanuvchi'}
                    </h3>
                    {isMe && (
                      <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                        Siz
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Daraja {leader.level || 1}
                  </p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end">
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 text-xl">
                    {leader.xp.toLocaleString()} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">XP</span>
                  </p>
                  {period !== 'all' && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                      <Sparkles size={10} /> O'sish
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
          
          {!loading && leaders.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Ushbu davr uchun hali yetakchilar yo'q.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                O'qishda davom eting va birinchi bo'ling!
              </p>
            </div>
          )}

          {leaders.length > displayCount && (
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setDisplayCount(prev => prev + 10)}
                className="px-6 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              >
                Ko'proq ko'rsatish
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Sticky Bottom Rank Card */}
      {currentUserRank !== null && userData && (
        <div className="fixed lg:sticky bottom-20 lg:bottom-4 left-4 right-4 lg:left-0 lg:right-0 mt-4 z-40">
          <GlassCard className="p-4 bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl border-indigo-200 dark:border-indigo-700 shadow-xl shadow-indigo-500/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-200 dark:border-indigo-800">
                <span className="font-bold text-lg">#{currentUserRank}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                  Sizning joriy o&apos;rningiz
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Umumiy ro&apos;yxatda
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                  {userData?.xp?.toLocaleString() || 0} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">XP</span>
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </motion.div>
  )
}
