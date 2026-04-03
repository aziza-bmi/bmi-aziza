'use client'
import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const html = document.documentElement
    const isDark = html.classList.contains('dark')
    if (isDark) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setDark(false)
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setDark(true)
    }
  }

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-xl flex items-center justify-center
                 text-slate-500 dark:text-slate-400
                 hover:bg-slate-100 dark:hover:bg-slate-700/50
                 transition-all"
      title={dark ? 'Kunduzgi rejim' : 'Tungi rejim'}
    >
      {dark
        ? <Sun size={18} className="text-amber-500" />
        : <Moon size={18} />}
    </button>
  )
}
