'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ThemeToggle from '@/components/shared/ThemeToggle'

const navLinks = [
  { href: '/', label: 'Bosh sahifa' },
  { href: '#how-it-works', label: 'Qanday ishlaydi' },
  { href: '#features', label: 'Xususiyatlar' },
  { href: '#faq', label: 'Savollar' },
  { href: '#contact', label: 'Aloqa' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 flex items-center justify-between px-8 h-16 transition-all duration-300 ${
        scrolled
          ? 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-primary-50 dark:border-slate-800 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <Link href="/" className="flex items-center gap-2">
        <img src="/logo-light.png" alt="GeoMind Logo" className="w-8 h-8 dark:hidden object-contain" />
        <img src="/logo-dark.png" alt="GeoMind Logo" className="w-8 h-8 hidden dark:block object-contain" />
        <span className="gradient-text text-lg font-medium">GeoMind</span>
      </Link>

      <div className="flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-slate-500 hover:text-primary-DEFAULT 
                       transition-colors duration-200"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/login"
          className="text-sm px-4 py-2 rounded-lg border border-primary-DEFAULT/30 
                     text-primary-DEFAULT hover:bg-primary-50 transition-all"
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
    </motion.nav>
  )
}
