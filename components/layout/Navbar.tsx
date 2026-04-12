'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Bosh sahifa' },
  { href: '#how-it-works', label: 'Qanday ishlaydi' },
  { href: '#features', label: 'Xususiyatlar' },
  { href: '#faq', label: 'Savollar' },
  { href: '#contact', label: 'Aloqa' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeHash, setActiveHash] = useState('/')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      // Determine the active section
      const sections = ['how-it-works', 'features', 'faq', 'contact']
      const current = sections.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          // if top of section is near the top of the viewport
          return rect.top <= 150 && rect.bottom >= 150
        }
        return false
      })

      if (current) {
        setActiveHash('#' + current)
      } else if (window.scrollY < 150) {
        setActiveHash('/')
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initialize on load
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 inset-x-0 w-full z-[60] flex items-center justify-between px-4 md:px-8 h-16 transition-all duration-300 ${
          scrolled || menuOpen
            ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <Link href="/" className="flex items-center gap-2 z-[60]">
          <img src="/logo-light.png" alt="GeoMind Logo" className="w-8 h-8 dark:hidden object-contain" />
          <img src="/logo-dark.png" alt="GeoMind Logo" className="w-8 h-8 hidden dark:block object-contain" />
          <span className="gradient-text text-lg font-medium">GeoMind</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = activeHash === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-1 py-1.5 text-sm transition-all duration-200 group ${
                  isActive 
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded-full bg-indigo-500 transition-transform duration-300 origin-left ${
                  isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
            )
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 z-[60]">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg border border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-medium"
            >
              Kirish
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 rounded-lg btn-gradient font-medium"
            >
              Boshlash
            </Link>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 rounded-md"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 pt-20 px-4 pb-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl md:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const isActive = activeHash === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl transition-all duration-200 text-lg font-medium ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                        : 'text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              
              <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-3" />
              
              <Link
                href="/login"
                className="w-full text-center py-3 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                Kirish
              </Link>
              <Link
                href="/register"
                className="w-full text-center py-3 rounded-xl btn-gradient font-semibold"
              >
                Boshlash
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

