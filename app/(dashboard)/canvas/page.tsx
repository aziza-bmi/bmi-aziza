'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MousePointer2, Triangle, Circle, Square, Minus, Ruler, Type, Eraser, Undo2, Redo2, ZoomOut, ZoomIn, Grid, Save, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function CanvasPage() {
  const [activeTool, setActiveTool] = useState('cursor')

  const tools = [
    { id: 'cursor', icon: MousePointer2, label: 'Tanlash' },
    { id: 'triangle', icon: Triangle, label: 'Uchburchak' },
    { id: 'circle', icon: Circle, label: 'Aylana' },
    { id: 'rectangle', icon: Square, label: 'To\'rtburchak' },
    { id: 'line', icon: Minus, label: 'Chiziq' },
    { id: 'ruler', icon: Ruler, label: 'O\'lchash' },
    { id: 'text', icon: Type, label: 'Matn' },
    { id: 'eraser', icon: Eraser, label: 'O\'chirish' },
  ]

  const colors = ['bg-indigo-600', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-slate-800']

  return (
    <div className="flex h-[calc(100vh-80px)] -mt-4 w-full glass-card bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm overflow-hidden relative">
      
      {/* LEFT TOOLBAR */}
      <div className="w-16 border-r border-slate-100 flex flex-col items-center py-4 gap-2 bg-white/50 shrink-0 z-10">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              activeTool === tool.id 
                ? 'btn-gradient text-white shadow-md' 
                : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <tool.icon className="w-5 h-5" />
          </button>
        ))}
        
        <div className="w-8 h-px bg-slate-200 my-2"></div>
        
        <button className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
          <Undo2 className="w-5 h-5" />
        </button>
        <button className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
          <Redo2 className="w-5 h-5" />
        </button>
      </div>

      {/* CENTER CANVAS */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
        {/* TOP TOOLBAR */}
        <div className="h-14 border-b border-slate-100 bg-white/60 px-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs font-bold text-slate-600 min-w-[40px] text-center">100%</span>
            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><ZoomIn className="w-4 h-4" /></button>
          </div>
          <div className="font-semibold text-slate-700 text-sm py-1 px-4 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            Yangi chizma.geo
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-indigo-600 bg-indigo-50 rounded-lg transition-colors"><Grid className="w-4 h-4" /></button>
            <button className="btn-gradient px-4 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Save className="w-3.5 h-3.5" /> Saqlash
            </button>
          </div>
        </div>

        {/* CANVAS DRAWING AREA */}
        <div 
          className="flex-1 relative cursor-crosshair overflow-hidden" 
          style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        >
          {/* Static Mockup SVG Overlay */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none stroke-indigo-600 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            
            {/* Right Triangle ABC */}
            <path d="M150 100 L350 300 L450 150 Z" />
            <path d="M350 285 L365 285 L365 300" stroke="#4F46E5" /> {/* Right angle at mostly B conceptually */}
            
            <circle cx="150" cy="100" r="4" fill="#4F46E5" />
            <text x="140" y="90" fill="#312E81" fontSize="14" fontWeight="bold" stroke="none">A</text>
            
            <circle cx="350" cy="300" r="4" fill="#4F46E5" />
            <text x="340" y="320" fill="#312E81" fontSize="14" fontWeight="bold" stroke="none">B</text>
            
            <circle cx="450" cy="150" r="4" fill="#4F46E5" />
            <text x="465" y="145" fill="#312E81" fontSize="14" fontWeight="bold" stroke="none">C</text>
            
            {/* Side Lengths */}
            <text x="230" y="220" fill="#4F46E5" fontSize="14" fontWeight="bold" stroke="none" className="bg-white px-1">AB = 5 sm</text>
            <text x="410" y="240" fill="#4F46E5" fontSize="14" fontWeight="bold" stroke="none">BC = 4 sm</text>
            <text x="310" y="110" fill="#4F46E5" fontSize="14" fontWeight="bold" stroke="none">AC = 3 sm</text>

            {/* Circle */}
            <circle cx="650" cy="200" r="80" stroke="#3B82F6" strokeWidth="2" />
            <circle cx="650" cy="200" r="3" fill="#3B82F6" stroke="none" />
            <path d="M650 200 L730 200" stroke="#3B82F6" strokeDasharray="4 4" />
            <text x="680" y="190" fill="#1E3A8A" fontSize="14" fontWeight="bold" stroke="none">r = 3 sm</text>
          </svg>
        </div>
      </div>

      {/* RIGHT PROPERTIES PANEL */}
      <div className="w-72 border-l border-slate-100 bg-white/70 overflow-y-auto shrink-0 z-10 flex flex-col hide-scrollbar">
        <div className="p-5 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-20">
          <h2 className="font-bold text-slate-800">Xususiyatlar</h2>
        </div>

        <div className="p-5 flex-1">
          {/* Selected Object */}
          <div className="mb-6">
            <div className="bg-indigo-50 border border-indigo-100 border-l-4 border-l-indigo-500 rounded-r-xl p-3 mb-4">
              <span className="text-sm font-bold text-indigo-800">Uchburchak ABC</span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center"><span className="text-xs text-slate-400 font-medium">AB tomoni:</span><span className="text-sm font-semibold text-slate-800">5 sm</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-slate-400 font-medium">BC tomoni:</span><span className="text-sm font-semibold text-slate-800">4 sm</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-slate-400 font-medium">AC tomoni:</span><span className="text-sm font-semibold text-slate-800">3 sm</span></div>
            </div>
            
            <div className="h-px bg-slate-100 my-4 w-full"></div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center"><span className="text-xs text-slate-400 font-medium">Perimetr:</span><span className="text-sm font-semibold text-slate-800">12 sm</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-slate-400 font-medium">Yuza:</span><span className="text-sm font-semibold text-slate-800">6 sm²</span></div>
            </div>
            
            <div className="h-px bg-slate-100 my-4 w-full"></div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center"><span className="text-xs text-slate-400 font-medium">Burchak A:</span><span className="text-sm font-semibold text-slate-800">90°</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-slate-400 font-medium">Burchak B:</span><span className="text-sm font-semibold text-slate-800">53°</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-slate-400 font-medium">Burchak C:</span><span className="text-sm font-semibold text-slate-800">37°</span></div>
            </div>

            <Link href="/chat" className="mt-6 w-full btn-gradient py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transition-all">
              <Sparkles className="w-4 h-4" /> AI bilan tahlil qil
            </Link>
          </div>

          <div className="h-px bg-slate-100 my-6 w-full"></div>

          {/* Styles */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Uslub</h3>
            
            <div className="mb-5">
              <label className="text-xs text-slate-500 font-medium mb-2 block">Ranglar</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((c, i) => (
                  <button key={i} className={`w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 hover:scale-110 transition-transform ${c} ${i===0 ? 'ring-2 ring-indigo-500 scale-110' : ''}`}></button>
                ))}
              </div>
            </div>
            
            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <label className="text-xs text-slate-500 font-medium">Qalinlik</label>
                <span className="text-xs text-slate-800 font-bold">2px</span>
              </div>
              <input type="range" min="1" max="5" defaultValue="2" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-slate-500 font-medium">Shaffoflik</label>
                <span className="text-xs text-slate-800 font-bold">100%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="100" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
