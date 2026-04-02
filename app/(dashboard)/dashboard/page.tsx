'use client'

import { motion } from 'framer-motion'
import { BookOpen, Flame, Star, BarChart3, MessageSquare, PlayCircle, Edit3, Award, ArrowRight, MousePointer2, PaintBucket, Type, Eraser, Square, Circle, Triangle, Pencil, CheckCircle2, ChevronRight, Search, Plus, Send } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const currentDate = new Date().toLocaleDateString('uz-UZ', dateOptions);

  const topics = [
    { name: 'Planimetriya', progress: 75, color: 'from-indigo-600 to-indigo-400' },
    { name: 'Uchburchaklar', progress: 60, color: 'from-blue-600 to-blue-400' },
    { name: 'To\'rtburchaklar', progress: 45, color: 'from-indigo-600 to-indigo-400' },
    { name: 'Doiralar', progress: 38, color: 'from-blue-600 to-blue-400' },
    { name: 'Ko\'pburchaklar', progress: 25, color: 'from-indigo-600 to-indigo-400' },
    { name: 'Koordinatalar', progress: 20, color: 'from-blue-600 to-blue-400' },
    { name: 'Stereometriya', progress: 10, color: 'from-indigo-600 to-indigo-400' },
  ]

  const activities = [
    { title: 'Uchburchaklar darsi', type: 'Dars', time: 'Bugun, 14:30', icon: '📐', bg: 'bg-blue-100', status: '✓', statusColor: 'bg-green-100 text-green-700' },
    { title: 'Pifagor teoremasi testi', type: 'Test', time: 'Kecha', icon: '🧪', bg: 'bg-amber-100', status: '92%', statusColor: 'bg-green-100 text-green-700' },
    { title: 'AI bilan suhbat', type: 'Chat', time: '2 kun oldin', icon: '💬', bg: 'bg-indigo-100', status: '✓', statusColor: 'bg-green-100 text-green-700' },
    { title: 'Doiralar darsi', type: 'Dars', time: '3 kun oldin', icon: '📐', bg: 'bg-blue-100', status: '✓', statusColor: 'bg-green-100 text-green-700' },
    { title: 'Planimetriya testi', type: 'Test', time: '5 kun oldin', icon: '🧪', bg: 'bg-amber-100', status: '78%', statusColor: 'bg-amber-100 text-amber-700' },
  ]

  const leaderboard = [
    { rank: 1, name: 'Akbar Karimov', init: 'AK', xp: '4,200', medal: '🥇', isMe: false },
    { rank: 2, name: 'Sardor Umarov', init: 'SU', xp: '3,850', medal: '🥈', isMe: false },
    { rank: 3, name: 'Malika Rahimova', init: 'MR', xp: '3,100', medal: '🥉', isMe: false },
    { rank: 4, name: 'Jasur Toshmatov', init: 'JT', xp: '2,980', medal: '', isMe: false },
    { rank: 5, name: 'Yourself (you)', init: 'YN', xp: '2,840', medal: '', isMe: true },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Salom, Alisher! 👋</h1>
          <p className="text-sm text-slate-500 mt-1">Bugun ham geometriya o'rganamizmi?</p>
        </div>
        <div className="text-sm font-medium text-slate-400 mt-4 md:mt-0 bg-white/60 px-4 py-2 rounded-full border border-slate-100">
          {currentDate}
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm text-center md:text-left flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">47 / 200</h3>
            <p className="text-sm font-medium text-slate-500 mb-3">Jami darslar</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '23.5%' }}></div>
            </div>
          </div>
        </div>

        <div className="glass-card bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium bg-amber-50 text-amber-600 px-2 py-1 rounded-md">🔥 Davom eting!</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">12 kun</h3>
            <p className="text-sm font-medium text-slate-500">Ketma-ket o'qish</p>
          </div>
        </div>

        <div className="glass-card bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Star className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium bg-purple-50 text-purple-600 px-2 py-1 rounded-md">Daraja 6</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">2,840</h3>
            <p className="text-sm font-medium text-slate-500">Tajriba ballari</p>
          </div>
        </div>

        <div className="glass-card bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">+5% o'tgan haftadan</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">87%</h3>
            <p className="text-sm font-medium text-slate-500">O'rtacha ball</p>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT TWO COLUMNS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* MAVZULAR BO'YICHA PROGRESS */}
          <div className="glass-card bg-white/80 backdrop-blur-xl border border-white/50 p-6 sm:p-8 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Mavzular bo'yicha progress</h2>
            <div className="space-y-5">
              {topics.map((topic, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-32 text-sm text-slate-700 font-medium truncate">{topic.name}</span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${topic.color}`}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-bold text-indigo-600">{topic.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* SO'NGGI FAOLIYAT */}
          <div className="glass-card bg-white/80 backdrop-blur-xl border border-white/50 p-6 sm:p-8 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6">So'nggi faoliyat</h2>
            <div className="space-y-4">
              {activities.map((act, i) => (
                <div key={i} className="flex items-center justify-between p-3 sm:p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${act.bg}`}>
                      {act.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{act.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{act.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 font-medium hidden sm:block">{act.time}</span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${act.statusColor}`}>
                      {act.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* TEZKOR HARAKATLAR */}
          <div className="glass-card bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Tezkor harakatlar</h2>
            <div className="space-y-3">
              <Link href="/chat" className="btn-gradient w-full py-3.5 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                <MessageSquare className="w-4 h-4" />
                AI Muallim bilan gaplash
              </Link>
              <Link href="/lessons" className="w-full py-3.5 px-4 rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 font-medium flex items-center justify-center gap-2 transition-all">
                <PlayCircle className="w-4 h-4" />
                Dars davom ettirish
              </Link>
              <Link href="/quiz" className="w-full py-3.5 px-4 rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 font-medium flex items-center justify-center gap-2 transition-all">
                <Star className="w-4 h-4" />
                Test topshirish
              </Link>
              <Link href="/canvas" className="w-full py-3.5 px-4 rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 font-medium flex items-center justify-center gap-2 transition-all">
                <Edit3 className="w-4 h-4" />
                Geometriya chizish
              </Link>
            </div>
          </div>

          {/* KUNLIK MAQSAD */}
          <div className="glass-card bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-6 text-left">Bugungi maqsad</h2>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="stroke-slate-100" strokeWidth="8" fill="none" />
                <circle 
                  cx="50" cy="50" r="40" 
                  className="stroke-indigo-600 transition-all duration-1000 ease-out" 
                  strokeWidth="8" fill="none" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.6)}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800">3/5</span>
                <span className="text-xs text-slate-500 font-medium">dars</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">5 ta darsdan 3 tasini tugatdingiz</p>
            <p className="text-xs text-indigo-600 font-bold bg-indigo-50 inline-block px-3 py-1 rounded-full">+50 XP kutmoqda</p>
          </div>

          {/* REYTING */}
          <div className="glass-card bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Top o'quvchilar</h2>
            <div className="space-y-4">
              {leaderboard.map((user, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${user.isMe ? 'bg-indigo-50 border border-indigo-100' : ''}`}>
                  <div className="w-6 text-center font-bold text-slate-400 text-sm">{user.medal || user.rank}</div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.isMe ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {user.init}
                  </div>
                  <div className="flex-1 truncate">
                    <h4 className={`text-sm font-semibold truncate ${user.isMe ? 'text-indigo-800' : 'text-slate-800'}`}>{user.name}</h4>
                  </div>
                  <div className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                    {user.xp} XP
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
