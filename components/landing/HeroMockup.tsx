'use client'

import { motion } from 'framer-motion'
import { Brain, Bot, Send, User } from 'lucide-react'

export default function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative z-10 w-full max-w-5xl mx-auto mt-16 mb-24 px-4"
    >
      {/* Decorative elements behind the mockup */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/20 blur-[100px] rounded-full z-0" />
      
      {/* Mockup Container */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-2xl overflow-hidden flex flex-col z-10">
        
        {/* Mockup Header (Browser-like) */}
        <div className="h-12 border-b border-slate-100 flex items-center px-4 bg-slate-50/50">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto bg-white border border-slate-200 rounded-md px-24 py-1.5 text-xs text-slate-400 font-medium">
            geomind.ai/dashboard
          </div>
        </div>

        {/* Mockup Layout */}
        <div className="flex h-[450px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-100 bg-white/50 p-4 hidden md:flex flex-col gap-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 text-indigo-700 font-medium text-sm">
              <Brain className="w-5 h-5" />
              AI Muallim
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 font-medium text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              Darslar
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 font-medium text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Reytinglar
            </div>
            <div className="mt-auto p-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200/50">
                <span className="text-amber-500 text-xs font-bold">✨</span>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700">Test yakunlandi</p>
                <p className="text-[10px] items-center text-amber-600/80 mt-0.5">95% to'g'ri 🔥</p>
              </div>
            </div>
          </div>

          {/* Main Content Area (Chat Interface) */}
          <div className="flex-1 bg-slate-50/30 flex flex-col relative overflow-hidden">
            {/* Shapes Graphic Overlay */}
            <svg className="absolute right-0 top-10 opacity-[0.03] select-none pointer-events-none" width="200" height="200" viewBox="0 0 100 100">
               <polygon points="50,10 90,90 10,90" fill="#4F46E5"/>
            </svg>

            {/* Chat Messages */}
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto z-10">
              
              {/* AI Message */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm max-w-[85%] rounded-tl-none">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">Ajoyib savol! Pifagor teoremasi: <span className="text-indigo-600">a² + b² = c²</span></p>
                  <p className="text-sm text-slate-500 mt-1">Bu yerda c — gipotenuz (eng uzun tomon) hisoblanadi.</p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-4 self-end flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div className="bg-indigo-600 text-white rounded-2xl p-4 shadow-sm max-w-[85%] rounded-tr-none">
                  <p className="text-sm leading-relaxed">Tushunarli, agar a=3 va b=4 bo'lsa, c ni qanday topaman?</p>
                </div>
              </div>

              {/* AI Message Typing */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm max-w-[85%] rounded-tl-none flex items-center gap-1.5 h-12">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  disabled
                  placeholder="Savolingizni yozing..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-6 pr-14 text-sm focus:outline-none"
                />
                <button disabled className="absolute right-2 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Send className="w-4 h-4 -ml-0.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
