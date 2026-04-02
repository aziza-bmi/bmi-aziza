'use client'

import { motion } from 'framer-motion'
import { BrainCircuit, PenTool, FlaskConical, PlaySquare, Trophy, BarChart3, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function Features() {
  const features = [
    {
      title: 'AI Muallim',
      desc: 'Sun\'iy intellekt yordamida shaxsiy o\'qituvchi — har qanday savolga javob, istalgan vaqtda.',
      icon: BrainCircuit,
      color: 'bg-indigo-600',
      badge: 'Yangi'
    },
    {
      title: 'Interaktiv Canvas',
      desc: 'Geometrik shakllarni real vaqtda chizish, o\'lchash va AI tahlili.',
      icon: PenTool,
      color: 'bg-blue-500'
    },
    {
      title: 'Adaptiv Testlar',
      desc: 'Sizning darajangizga moslashuvchi aqlli test tizimi — zaif tomonlarni mustahkamlaydi.',
      icon: FlaskConical,
      color: 'bg-purple-500'
    },
    {
      title: 'Strukturali Darslar',
      desc: '200+ dars: video tushuntirishlar, animatsiyalar va amaliy mashqlar.',
      icon: PlaySquare,
      color: 'bg-indigo-500',
      badge: '200+ dars'
    },
    {
      title: 'Gamification',
      desc: 'XP ballar, yutuqlar, seriyalar va haftalik musobaqalar bilan o\'rganish qiziqarli bo\'ladi.',
      icon: Trophy,
      color: 'bg-amber-500'
    },
    {
      title: 'Progress Tahlili',
      desc: 'Batafsil statistika: o\'tilgan mavzular, vaqt, zaif tomonlar va o\'sish dinamikasi.',
      icon: BarChart3,
      color: 'bg-teal-500'
    }
  ]

  return (
    <section className="py-24 w-full max-w-6xl mx-auto px-6 relative z-10">
      <div className="text-center mb-16">
        <span className="text-indigo-600 font-medium px-4 py-1.5 rounded-full bg-indigo-50 text-sm">Xususiyatlar</span>
        <h2 className="text-4xl md:text-5xl font-medium mt-6 mb-4 text-slate-900">Nima uchun GeoMind?</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          An'anaviy ta'limdan farqli — AI bilan o'rganish tezroq, qiziqarliroq va samaraliroq.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              key={i}
              className="bg-white/80 backdrop-blur-sm border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7" />
                </div>
                {item.badge && (
                  <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-slate-800">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-6 flex-grow">
                {item.desc}
              </p>
              
              <Link href="#" className="flex items-center text-indigo-600 font-medium text-sm group-hover:text-indigo-700 transition-colors mt-auto">
                Ko'proq
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
