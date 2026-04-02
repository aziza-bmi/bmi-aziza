'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'

interface XPToastProps {
  xp: number
  show: boolean
  onHide: () => void
}

export default function XPToast({ xp, show, onHide }: XPToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          onAnimationComplete={() => {
            setTimeout(onHide, 2000)
          }}
          className="fixed bottom-8 right-8 z-50
                     bg-gradient-to-r from-indigo-500 to-blue-500
                     text-white px-5 py-3 rounded-2xl shadow-lg
                     flex items-center gap-2"
        >
          <Star size={18} className="text-yellow-300 fill-yellow-300" />
          <span className="font-medium">+{xp} XP qo'shildi!</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
