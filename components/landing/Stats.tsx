'use client'

import { motion } from 'framer-motion'
import { Users, BookOpen, TrendingUp, Star } from 'lucide-react'

export default function Stats() {
  const stats = [
    { num: '71+', label: 'Geometriya mavzulari', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { num: '1,500+', label: 'Interaktiv masalalar', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { num: '24/7', label: 'Ai Muallim yordami', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { num: '4.9/5', label: 'O\'zlashtirish siri', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  ]

  return (
    <section className="py-12 w-full max-w-6xl mx-auto px-6 z-10 relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              key={i}
              className="bg-white/60 backdrop-blur-md border border-white/40 p-6 rounded-3xl shadow-lg shadow-indigo-100/20 text-center flex flex-col items-center justify-center hover:-translate-y-1 transition-transform duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className={`text-3xl font-bold mb-1 ${stat.color}`}>
                {stat.num}
              </div>
              <div className="text-sm font-medium text-slate-500">
                {stat.label}
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
