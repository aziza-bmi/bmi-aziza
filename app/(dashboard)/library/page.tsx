'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, X, ChevronLeft, ChevronRight, Search, GraduationCap, ExternalLink, BookMarked } from 'lucide-react'
import { getLibraryBooks, LibraryBook } from '@/lib/library'
import GeoBg from '@/components/landing/GeoBg'

const GRADE_COLORS: Record<number, { bg: string; text: string; badge: string }> = {
  7: { bg: 'from-emerald-400 to-teal-500', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  8: { bg: 'from-blue-400 to-indigo-500', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  9: { bg: 'from-violet-400 to-purple-500', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
  10: { bg: 'from-orange-400 to-amber-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  11: { bg: 'from-rose-400 to-pink-500', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
}

function BookCoverPlaceholder({ grade, title }: { grade: number; title: string }) {
  const color = GRADE_COLORS[grade] || GRADE_COLORS[7]
  return (
    <div className={`w-full h-full bg-gradient-to-br ${color.bg} flex flex-col items-center justify-center p-4 text-white`}>
      <div className="text-5xl font-black mb-2 opacity-30">{grade}</div>
      <BookOpen size={32} className="mb-3 opacity-80" />
      <p className="text-xs font-semibold text-center leading-tight opacity-90 line-clamp-3">{title}</p>
      <div className="mt-3 text-xs font-bold opacity-60 tracking-wider uppercase">{grade}-sinf</div>
    </div>
  )
}

function PDFViewer({ book, onClose }: { book: LibraryBook; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${GRADE_COLORS[book.grade]?.bg || 'from-indigo-400 to-blue-500'} flex items-center justify-center`}>
            <BookOpen size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{book.title}</h2>
            {book.author && <p className="text-xs text-slate-500">{book.author}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={book.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-100 transition-colors"
          >
            <ExternalLink size={14} />
            Yangi tabda
          </a>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* PDF Iframe */}
      <div className="flex-1 min-h-0">
        <iframe
          src={`${book.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full h-full border-0"
          title={book.title}
          allow="fullscreen"
        />
      </div>
    </motion.div>
  )
}

function BookCard({ book, onClick }: { book: LibraryBook; onClick: () => void }) {
  const color = GRADE_COLORS[book.grade] || GRADE_COLORS[7]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="glass-card bg-white/80 backdrop-blur-xl shadow-lg shadow-indigo-100/10 border-2 border-white/60 rounded-3xl overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:shadow-indigo-200/20">
        {/* Book cover */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <BookCoverPlaceholder grade={book.grade} title={book.title} />
          )}

          {/* Grade badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${color.badge} shadow-sm`}>
            {book.grade}-sinf
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-2.5 shadow-lg flex items-center gap-2 text-slate-800 font-semibold text-sm"
            >
              <BookOpen size={16} className="text-indigo-600" />
              O'qish
            </motion.div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{book.author}</p>
          )}
          {book.pages && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{book.pages} bet</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function LibraryPage() {
  const [books, setBooks] = useState<LibraryBook[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null)
  const [activeGrade, setActiveGrade] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    const mainEl = document.querySelector('main')
    if (!mainEl) return
    const handleScroll = () => setScrollTop(mainEl.scrollTop)
    mainEl.addEventListener('scroll', handleScroll)
    return () => mainEl.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    getLibraryBooks()
      .then(setBooks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const grades = [7, 8, 9, 10, 11]

  const filtered = books.filter(book => {
    const matchGrade = activeGrade === null || book.grade === activeGrade
    const matchSearch = !search || book.title.toLowerCase().includes(search.toLowerCase())
    return matchGrade && matchSearch
  })

  return (
    <>
      <div className="relative min-h-full pb-10">
        {/* Parallax BG */}
        <div
          style={{ transform: `translateY(${-scrollTop * 0.5}px)` }}
          className="absolute top-0 left-0 w-full h-[150%] pointer-events-none z-0"
        >
          <GeoBg count={10} />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <BookMarked size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kutubxona</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">7–11-sinf geometriya darsliklari</p>
              </div>
            </div>
          </motion.div>

          {/* Search + Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Kitob qidirish..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-xl border-2 border-white/60 shadow-sm text-sm text-slate-800 dark:text-slate-100 dark:bg-slate-900/50 dark:border-slate-700/50 outline-none focus:border-indigo-300 transition-all"
              />
            </div>

            {/* Grade filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveGrade(null)}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                  activeGrade === null
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white/80 backdrop-blur-xl border-2 border-white/60 text-slate-600 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700/50 hover:border-indigo-200'
                }`}
              >
                Barchasi
              </button>
              {grades.map(g => {
                const color = GRADE_COLORS[g]
                return (
                  <button
                    key={g}
                    onClick={() => setActiveGrade(activeGrade === g ? null : g)}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                      activeGrade === g
                        ? `bg-gradient-to-r ${color.bg} text-white shadow-lg`
                        : 'bg-white/80 backdrop-blur-xl border-2 border-white/60 text-slate-600 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700/50 hover:border-indigo-200'
                    }`}
                  >
                    {g}-sinf
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Books grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-3xl bg-white/60 animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card bg-white/80 backdrop-blur-xl border-2 border-white/60 rounded-3xl p-12 text-center"
            >
              <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 dark:text-slate-400">
                {books.length === 0
                  ? 'Hali hech qanday kitob qo\'shilmagan'
                  : 'Bu filtr bo\'yicha kitob topilmadi'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {filtered.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <BookCard book={book} onClick={() => setSelectedBook(book)} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Stats */}
          {books.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 glass-card bg-white/80 backdrop-blur-xl border-2 border-white/60 rounded-3xl p-5 flex flex-wrap gap-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <BookOpen size={18} className="text-indigo-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white">{books.length}</div>
                  <div className="text-xs text-slate-500">Jami kitoblar</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <GraduationCap size={18} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white">5</div>
                  <div className="text-xs text-slate-500">Sinf darajalari</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* PDF Viewer modal */}
      <AnimatePresence>
        {selectedBook && (
          <PDFViewer book={selectedBook} onClose={() => setSelectedBook(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
