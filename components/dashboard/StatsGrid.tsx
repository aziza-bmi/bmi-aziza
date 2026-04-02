'use client'

import { BookOpen, Flame, Trophy, Target } from 'lucide-react'

export default function StatsGrid() {
  const stats = [
    { title: 'Jami darslar', value: '24', icon: BookOpen, color: 'bg-blue-100 text-blue-600', trend: '+3 bu hafta' },
    { title: 'Streak (kun)', value: '12', icon: Flame, color: 'bg-orange-100 text-orange-600', trend: 'Eng yaxshi: 15' },
    { title: 'XP Ball', value: '2,450', icon: Trophy, color: 'bg-amber-100 text-amber-600', trend: 'Top 10% da' },
    { title: 'Test natijasi', value: '92%', icon: Target, color: 'bg-emerald-100 text-emerald-600', trend: '+5% oldingiga ko\'ra' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{stat.trend}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
          </div>
        )
      })}
    </div>
  )
}
