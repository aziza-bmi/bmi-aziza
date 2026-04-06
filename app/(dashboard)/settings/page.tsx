'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Bell, Moon, Sun, Globe, Shield,
  LogOut, ChevronRight, Monitor
} from 'lucide-react'

export default function SettingsPage() {
  const { user, userData } = useAuth()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(
    typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  )
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState("O'zbek")

  function toggleDarkMode() {
    const html = document.documentElement
    if (darkMode) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
    setDarkMode(!darkMode)
  }

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  const sections = [
    {
      title: "Ko'rinish",
      items: [
        {
          icon: darkMode ? Moon : Sun,
          label: "Tungi rejim",
          desc: darkMode ? "Yoqilgan" : "O'chirilgan",
          action: (
            <button onClick={toggleDarkMode}
              className={`w-11 h-6 rounded-full transition-colors relative
                         ${darkMode ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white 
                               shadow transition-transform
                               ${darkMode ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          )
        },
      ]
    },
    {
      title: "Bildirishnomalar",
      items: [
        {
          icon: Bell,
          label: "Push bildirishnomalar",
          desc: "Kunlik eslatmalar",
          action: (
            <button onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-colors relative
                         ${notifications ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white 
                               shadow transition-transform
                               ${notifications ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          )
        },
      ]
    },
    {
      title: "Til",
      items: [
        {
          icon: Globe,
          label: "Interfeys tili",
          desc: language,
          action: <ChevronRight size={16} className="text-slate-400" />
        },
      ]
    },
    {
      title: "Hisob",
      items: [
        {
          icon: Shield,
          label: "Parolni o'zgartirish",
          desc: "Oxirgi o'zgarish: hech qachon",
          action: <ChevronRight size={16} className="text-slate-400" />
        },
      ]
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg md:max-w-2xl"
    >
      <h1 className="text-2xl font-medium text-slate-800 
                     dark:text-slate-100 mb-6">
        Sozlamalar
      </h1>

      <div className="space-y-5">
        {sections.map((section, si) => (
          <div key={si}>
            <h2 className="text-xs font-medium text-slate-400 
                           dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h2>
            <div className="glass-card dark:bg-slate-800/60 
                            dark:border-slate-700/40 overflow-hidden p-0">
              {section.items.map((item, ii) => (
                <div key={ii}
                  className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 min-h-[56px]
                             ${ii < section.items.length - 1 
                               ? 'border-b border-slate-100 dark:border-slate-700/40' 
                               : ''}`}>
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 
                                  dark:bg-indigo-900/40 flex items-center 
                                  justify-center flex-shrink-0">
                    <item.icon size={17} className="text-indigo-600 
                                                    dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800 
                                    dark:text-slate-100">{item.label}</div>
                    <div className="text-xs text-slate-500 
                                    dark:text-slate-400">{item.desc}</div>
                  </div>
                  {item.action}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleLogout}
          className="w-full glass-card dark:bg-slate-800/60 
                     dark:border-slate-700/40 px-5 py-4
                     flex items-center gap-4 hover:bg-red-50 
                     dark:hover:bg-red-900/20 transition-colors
                     border-red-100 dark:border-red-900/30 group">
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40
                          flex items-center justify-center flex-shrink-0">
            <LogOut size={17} className="text-red-500" />
          </div>
          <span className="text-sm font-medium text-red-500">
            Chiqish
          </span>
        </button>
      </div>
    </motion.div>
  )
}
