'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function GeoBg({ count = 30 }: { count?: number }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Generate deterministic shapes spread across the entire page height (0% to 100%)
  const shapeTypes = ['triangle', 'circle', 'square', 'hexagon']
  const gradients = ['url(#grad1)', 'url(#grad2)', 'url(#grad3)', 'url(#grad4)', 'url(#grad5)']
  
  const shapes = Array.from({ length: count }).map((_, i) => ({
    id: i,
    type: shapeTypes[i % 4],
    top: `${5 + (i * (90 / Math.max(1, count - 1)))}%`, // Spreads them evenly down the page
    left: `${10 + (i * 23) % 80}%`, // Distribute left/right more chaotically
    size: 80 + (i % 5) * 30, // Sizes between 80 and 200
    duration: 20 + (i % 15), // Randomize duration
    delay: (i % 10) * 0.5,
    gradient: gradients[i % 5],
    yRange: i % 2 === 0 ? [-80, 80, -80] : [80, -80, 80],
    xRange: i % 3 === 0 ? [-60, 60, -60] : [60, -60, 60],
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FCD34D" />
          </linearGradient>
          <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </linearGradient>
        </defs>
      </svg>

      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute opacity-30 dark:opacity-20 blur-[4px]"
          style={{ top: shape.top, left: shape.left }}
          animate={{
            y: shape.yRange,
            x: shape.xRange,
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay,
          }}
        >
          <svg
            width={shape.size}
            height={shape.size}
            viewBox={`0 0 ${shape.size} ${shape.size}`}
            className="drop-shadow-xl"
          >
            {shape.type === 'triangle' && (
              <polygon
                points={`${shape.size / 2},4 ${shape.size - 4},${shape.size - 4} 4,${shape.size - 4}`}
                fill={shape.gradient}
              />
            )}
            {shape.type === 'circle' && (
              <circle
                cx={shape.size / 2} cy={shape.size / 2} r={shape.size / 2 - 4}
                fill={shape.gradient}
              />
            )}
            {shape.type === 'square' && (
              <rect
                x="8" y="8"
                width={shape.size - 16} height={shape.size - 16}
                rx="12" fill={shape.gradient}
              />
            )}
            {shape.type === 'hexagon' && (
              <polygon
                points={`${shape.size / 2},4 ${shape.size - 4},${shape.size / 4} ${shape.size - 4},${shape.size * 3 / 4} ${shape.size / 2},${shape.size - 4} 4,${shape.size * 3 / 4} 4,${shape.size / 4}`}
                fill={shape.gradient}
              />
            )}
          </svg>
        </motion.div>
      ))}
    </div>
  )
}
