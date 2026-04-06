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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-[60] flex items-center justify-between px-4 md:px-8 h-16 transition-all duration-300 ${
          scrolled || menuOpen
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-700/40 shadow-sm'
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 z-[60]">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg border border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
            >
              Kirish
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 rounded-lg btn-gradient"
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
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-lg font-medium text-slate-800 dark:text-slate-100"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-2" />
              
              <Link
                href="/login"
                className="w-full text-center py-3 rounded-xl border border-primary-DEFAULT/30 text-primary-DEFAULT font-medium"
              >
                Kirish
              </Link>
              <Link
                href="/register"
                className="w-full text-center py-3 rounded-xl btn-gradient font-medium"
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
