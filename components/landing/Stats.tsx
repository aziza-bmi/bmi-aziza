'use client'

import { motion } from 'framer-motion'
import { Users, BookOpen, TrendingUp, Star } from 'lucide-react'

export default function Stats() {
  const stats = [
    { num: '71+', label: 'Geometriya mavzulari', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', cardBg: 'bg-indigo-50/60 dark:bg-indigo-900/10' },
    { num: '1,500+', label: 'Interaktiv masalalar', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', cardBg: 'bg-blue-50/60 dark:bg-blue-900/10' },
    { num: '24/7', label: 'AI muallim yordami', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', cardBg: 'bg-emerald-50/60 dark:bg-emerald-900/10' },
    { num: '4.9/5', label: 'O\'zlashtirish siri', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', cardBg: 'bg-amber-50/60 dark:bg-amber-900/10' },
  ]

  return (
    <section className="py-8 md:py-12 w-full max-w-6xl mx-auto px-4 sm:px-6 z-10 relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              key={i}
              className={`group ${stat.cardBg} backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700 p-4 md:p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none text-center flex flex-col items-center justify-center hover:-translate-y-2 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/30 hover:bg-slate-900 dark:hover:bg-slate-950 transition-all duration-500 cursor-pointer`}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl ${stat.bg} dark:bg-opacity-20 ${stat.color} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className={`text-2xl md:text-3xl font-bold mb-1 ${stat.color} group-hover:text-white transition-colors duration-300`}>
                {stat.num}
              </div>
              <div className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                {stat.label}
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
