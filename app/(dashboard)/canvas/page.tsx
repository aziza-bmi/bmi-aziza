'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  MousePointer2, Triangle, Circle, Square,
  Minus, Eraser, Undo, Redo,
  ZoomIn, ZoomOut, Grid, Save, Trash2
} from 'lucide-react'
import Link from 'next/link'

type Tool = 'select' | 'triangle' | 'circle' | 'rect' | 'line' | 'eraser'
type Shape = {
  id: string
  type: 'circle' | 'rect' | 'line' | 'triangle'
  x: number
  y: number
  x2?: number
  y2?: number
  width?: number
  height?: number
  radius?: number
  color: string
  strokeWidth: number
}

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Tanlash' },
  { id: 'triangle', icon: Triangle, label: 'Uchburchak' },
  { id: 'circle', icon: Circle, label: 'Doira' },
  { id: 'rect', icon: Square, label: "To'rtburchak" },
  { id: 'line', icon: Minus, label: 'Chiziq' },
  { id: 'eraser', icon: Eraser, label: "O'chirish" },
]

const COLORS = [
  '#4F46E5', '#3B82F6', '#10B981',
  '#F59E0B', '#EF4444', '#8B5CF6',
  '#1E293B', '#94A3B8',
]

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('rect')
  const [shapes, setShapes] = useState<Shape[]>([])
  const [history, setHistory] = useState<Shape[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentShape, setCurrentShape] = useState<Shape | null>(null)
  const [selectedColor, setSelectedColor] = useState('#4F46E5')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [showGrid, setShowGrid] = useState(true)
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null)
  const [zoom, setZoom] = useState(100)

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)'
    ctx.lineWidth = 0.5
    const gap = 24
    for (let x = 0; x < w; x += gap) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y < h; y += gap) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }
  }, [])

  const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeStyle = shape.color
    ctx.lineWidth = shape.strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillStyle = shape.color + '15'

    if (shape.type === 'rect' && shape.width && shape.height) {
      ctx.beginPath()
      ctx.roundRect(shape.x, shape.y, shape.width, shape.height, 4)
      ctx.fill(); ctx.stroke()
    } else if (shape.type === 'circle' && shape.radius) {
      ctx.beginPath()
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2)
      ctx.fill(); ctx.stroke()
    } else if (shape.type === 'line' && shape.x2 != null && shape.y2 != null) {
      ctx.beginPath()
      ctx.moveTo(shape.x, shape.y)
      ctx.lineTo(shape.x2, shape.y2)
      ctx.stroke()
    } else if (shape.type === 'triangle' && shape.x2 != null && shape.y2 != null) {
      const midX = (shape.x + shape.x2) / 2
      ctx.beginPath()
      ctx.moveTo(midX, shape.y)
      ctx.lineTo(shape.x2, shape.y2)
      ctx.lineTo(shape.x, shape.y2)
      ctx.closePath()
      ctx.fill(); ctx.stroke()
    }
  }, [])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (showGrid) drawGrid(ctx, canvas.width, canvas.height)

    shapes.forEach(s => {
      if (selectedShape?.id === s.id) {
        ctx.shadowColor = '#4F46E5'; ctx.shadowBlur = 8
      }
      drawShape(ctx, s)
      ctx.shadowBlur = 0
    })

    if (currentShape) drawShape(ctx, currentShape)
  }, [shapes, currentShape, showGrid, selectedShape, drawGrid, drawShape])

  useEffect(() => { redraw() }, [redraw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      redraw()
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [redraw])

  function getPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function isNearShape(shape: Shape, pos: { x: number; y: number }): boolean {
    if (shape.type === 'rect' && shape.width && shape.height) {
      return pos.x >= shape.x && pos.x <= shape.x + shape.width &&
             pos.y >= shape.y && pos.y <= shape.y + shape.height
    }
    if (shape.type === 'circle' && shape.radius) {
      const dx = pos.x - shape.x; const dy = pos.y - shape.y
      return Math.sqrt(dx * dx + dy * dy) <= shape.radius
    }
    if ((shape.type === 'triangle' || shape.type === 'line') && shape.x2 != null && shape.y2 != null) {
      const minX = Math.min(shape.x, shape.x2) - 10
      const maxX = Math.max(shape.x, shape.x2) + 10
      const minY = Math.min(shape.y, shape.y2) - 10
      const maxY = Math.max(shape.y, shape.y2) + 10
      return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY
    }
    return false
  }

  function pushHistory(newShapes: Shape[]) {
    const newHist = history.slice(0, historyIndex + 1)
    newHist.push(newShapes)
    setHistory(newHist)
    setHistoryIndex(newHist.length - 1)
    setShapes(newShapes)
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const pos = getPos(e)
    if (tool === 'eraser') {
      const hit = [...shapes].reverse().find(s => isNearShape(s, pos))
      if (hit) { pushHistory(shapes.filter(s => s.id !== hit.id)); setSelectedShape(null) }
      return
    }
    if (tool === 'select') {
      setSelectedShape([...shapes].reverse().find(s => isNearShape(s, pos)) || null)
      return
    }
    setIsDrawing(true)
    setStartPos(pos)
    setCurrentShape({
      id: Date.now().toString(),
      type: tool === 'triangle' ? 'triangle' : tool === 'circle' ? 'circle' : tool === 'line' ? 'line' : 'rect',
      x: pos.x, y: pos.y,
      color: selectedColor, strokeWidth,
    })
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing || !currentShape) return
    const pos = getPos(e)
    const dx = pos.x - startPos.x
    const dy = pos.y - startPos.y
    let updated = { ...currentShape }
    if (currentShape.type === 'rect') {
      updated = { ...updated, x: dx < 0 ? pos.x : startPos.x, y: dy < 0 ? pos.y : startPos.y, width: Math.abs(dx), height: Math.abs(dy) }
    } else if (currentShape.type === 'circle') {
      updated = { ...updated, radius: Math.sqrt(dx * dx + dy * dy) }
    } else {
      updated = { ...updated, x2: pos.x, y2: pos.y }
    }
    setCurrentShape(updated)
  }

  function handleMouseUp() {
    if (!isDrawing || !currentShape) return
    setIsDrawing(false)
    const hasSize = currentShape.type === 'rect'
      ? (currentShape.width || 0) > 5 && (currentShape.height || 0) > 5
      : currentShape.type === 'circle'
      ? (currentShape.radius || 0) > 5
      : Math.abs((currentShape.x2 || 0) - currentShape.x) > 5
    if (hasSize) pushHistory([...shapes, currentShape])
    setCurrentShape(null)
  }

  function undo() { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setShapes(history[historyIndex - 1]) } }
  function redo() { if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setShapes(history[historyIndex + 1]) } }
  function clearCanvas() { pushHistory([]); setSelectedShape(null) }

  function getShapeInfo(shape: Shape | null) {
    if (!shape) return null
    if (shape.type === 'rect' && shape.width && shape.height) {
      return { type: "To'rtburchak", props: [
        { label: 'Kenglik', value: `${Math.round(shape.width)} px` },
        { label: 'Balandlik', value: `${Math.round(shape.height)} px` },
        { label: 'Perimetr', value: `${Math.round(2 * (shape.width + shape.height))} px` },
        { label: 'Yuza', value: `${Math.round(shape.width * shape.height)} px²` },
      ]}
    }
    if (shape.type === 'circle' && shape.radius) {
      return { type: 'Doira', props: [
        { label: 'Radius', value: `${Math.round(shape.radius)} px` },
        { label: 'Diametr', value: `${Math.round(shape.radius * 2)} px` },
        { label: 'Aylanasi', value: `${Math.round(2 * Math.PI * shape.radius)} px` },
        { label: 'Yuza', value: `${Math.round(Math.PI * shape.radius * shape.radius)} px²` },
      ]}
    }
    if (shape.type === 'triangle' && shape.x2 != null && shape.y2 != null) {
      const midX = (shape.x + shape.x2) / 2
      const a = Math.sqrt(Math.pow(shape.x2 - shape.x, 2) + Math.pow(shape.y2 - shape.y, 2))
      const b = Math.sqrt(Math.pow(shape.x2 - midX, 2) + Math.pow(shape.y2 - shape.y, 2))
      const c = Math.sqrt(Math.pow(midX - shape.x, 2) + Math.pow(shape.y - shape.y2, 2))
      return { type: 'Uchburchak', props: [
        { label: 'Tomon AB', value: `${Math.round(b)} px` },
        { label: 'Tomon BC', value: `${Math.round(c)} px` },
        { label: 'Tomon AC', value: `${Math.round(a)} px` },
        { label: 'Perimetr', value: `${Math.round(a + b + c)} px` },
      ]}
    }
    if (shape.type === 'line' && shape.x2 != null && shape.y2 != null) {
      const len = Math.sqrt(Math.pow(shape.x2 - shape.x, 2) + Math.pow(shape.y2 - shape.y, 2))
      return { type: 'Chiziq', props: [{ label: 'Uzunlik', value: `${Math.round(len)} px` }] }
    }
    return null
  }

  const shapeInfo = getShapeInfo(selectedShape)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[calc(100vh-80px)] overflow-hidden -mt-4">
      {/* Left toolbar */}
      <div className="w-14 flex flex-col items-center gap-1 py-4 px-1 bg-white/80 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700/40 dark:bg-slate-900/80">
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => setTool(t.id as Tool)} title={t.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${tool === t.id ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-md' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <t.icon size={18} />
          </button>
        ))}
        <div className="w-8 h-px bg-slate-200 my-1" />
        <button onClick={undo} disabled={historyIndex === 0} title="Bekor qilish"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all">
          <Undo size={16} />
        </button>
        <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Qaytarish"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all">
          <Redo size={16} />
        </button>
        <button onClick={clearCanvas} title="Tozalash"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 transition-all">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Main canvas area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="h-12 flex items-center justify-between px-4 bg-white/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700/40 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all text-slate-500">
              <ZoomOut size={14} />
            </button>
            <span className="text-xs text-slate-500 w-12 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all text-slate-500">
              <ZoomIn size={14} />
            </button>
          </div>
          <span className="text-sm text-slate-500">Yangi chizma</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowGrid(!showGrid)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${showGrid ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}>
              <Grid size={14} />
            </button>
            <button className="btn-gradient px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 text-white">
              <Save size={12} /> Saqlash
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-white dark:bg-slate-900">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ cursor: tool === 'select' ? 'default' : tool === 'eraser' ? 'cell' : 'crosshair' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          {shapes.length === 0 && !isDrawing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-slate-300">
                <div className="text-5xl mb-3">✏️</div>
                <p className="text-sm">Chizish vositasini tanlang va boshlang</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-60 flex flex-col bg-white/80 backdrop-blur-sm border-l border-slate-200 dark:border-slate-700/40 dark:bg-slate-900/80">
        {/* Colors */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/40">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Rang</p>
          <div className="grid grid-cols-4 gap-2">
            {COLORS.map(color => (
              <button key={color} onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-lg transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        {/* Stroke */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/40">
          <div className="flex justify-between mb-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Qalinlik</p>
            <span className="text-xs text-indigo-600 font-medium">{strokeWidth}px</span>
          </div>
          <input type="range" min="1" max="8" value={strokeWidth}
            onChange={e => setStrokeWidth(Number(e.target.value))}
            className="w-full accent-indigo-600" />
        </div>

        {/* Shape info */}
        <div className="p-4 flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Xususiyatlar</p>
          {shapeInfo ? (
            <div>
              <div className="text-sm font-medium text-indigo-600 mb-3 px-3 py-1.5 bg-indigo-50 rounded-lg">{shapeInfo.type}</div>
              <div className="space-y-2 mb-4">
                {shapeInfo.props.map((p, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-xs text-slate-400">{p.label}</span>
                    <span className="text-xs font-medium text-slate-700">{p.value}</span>
                  </div>
                ))}
              </div>
              <Link href="/chat" className="btn-gradient w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 text-white">
                AI bilan tahlil qil →
              </Link>
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-8 leading-relaxed">
              Figura chizing yoki<br />tanlash uchun bosing
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700/40">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Figuralar: {shapes.length}</span>
            <span>Amallar: {historyIndex}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
