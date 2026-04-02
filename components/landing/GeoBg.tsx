export default function GeoBg() {
  const shapes = [
    { type: 'triangle', top: '8%', left: '6%', size: 120, delay: '0s', anim: 'float-1' },
    { type: 'circle', top: '15%', right: '8%', size: 100, delay: '1s', anim: 'float-2' },
    { type: 'square', top: '40%', left: '2%', size: 90, delay: '2s', anim: 'float-3' },
    { type: 'hexagon', top: '55%', right: '4%', size: 110, delay: '0.5s', anim: 'float-1' },
    { type: 'triangle', top: '75%', left: '15%', size: 80, delay: '1.5s', anim: 'float-2' },
    { type: 'square', top: '20%', left: '45%', size: 70, delay: '3s', anim: 'float-3' },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {shapes.map((shape, i) => (
        <div
          key={i}
          className={`absolute opacity-[0.06] animate-${shape.anim}`}
          style={{
            top: shape.top,
            left: shape.left,
            right: shape.right,
            animationDelay: shape.delay,
          }}
        >
          <svg
            width={shape.size}
            height={shape.size}
            viewBox={`0 0 ${shape.size} ${shape.size}`}
          >
            {shape.type === 'triangle' && (
              <polygon
                points={`${shape.size/2},4 ${shape.size-4},${shape.size-4} 4,${shape.size-4}`}
                fill="#4F46E5"
              />
            )}
            {shape.type === 'circle' && (
              <circle
                cx={shape.size/2} cy={shape.size/2} r={shape.size/2 - 2}
                fill="#3B82F6"
              />
            )}
            {shape.type === 'square' && (
              <rect
                x="4" y="4"
                width={shape.size-8} height={shape.size-8}
                rx="10" fill="#4F46E5"
                transform={`rotate(15 ${shape.size/2} ${shape.size/2})`}
              />
            )}
            {shape.type === 'hexagon' && (
              <polygon
                points={`${shape.size/2},4 ${shape.size-4},${shape.size/4} ${shape.size-4},${shape.size*3/4} ${shape.size/2},${shape.size-4} 4,${shape.size*3/4} 4,${shape.size/4}`}
                fill="#6366F1"
              />
            )}
          </svg>
        </div>
      ))}
    </div>
  )
}
