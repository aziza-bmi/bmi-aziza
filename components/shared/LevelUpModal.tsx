'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface LevelUpModalProps {
  level: number
  show: boolean
  onClose: () => void
}

export default function LevelUpModal({ level, show, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center 
                        justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="glass-card bg-white dark:bg-slate-800/90 p-10 text-center
                       max-w-sm mx-4 rounded-3xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent mb-2">
              Yangi daraja!
            </h2>
            <div className="text-6xl font-black text-slate-800 
                            dark:text-slate-100 my-4">
              {level}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">
              Tabriklaymiz! Siz {level}-darajaga ko'tarildingiz!
            </p>
            <button onClick={onClose} className="btn-gradient px-8 py-3 
                                                  rounded-xl text-sm w-full font-bold text-white shadow-lg shadow-indigo-500/20">
              Davom etish 🚀
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
