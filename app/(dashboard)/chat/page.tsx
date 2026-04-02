'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Send, CheckCircle2, ChevronRight, X, Plus, Eraser } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
  time: string
  isFormula?: boolean
}

export default function AIChatPage() {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: "Salom! Men GeoMind — geometriya bo'yicha shaxsiy muallimingizman. Bugun qaysi mavzuda yordam kerak?",
      time: '14:25'
    },
    {
      id: '2',
      role: 'user',
      text: "Pifagor teoremasi haqida tushuntiring",
      time: '14:26'
    },
    {
      id: '3',
      role: 'ai',
      isFormula: true,
      text: "Pifagor teoremasi to'g'ri burchakli uchburchak uchun amal qiladi:\n\n[FORMULA]\n\nBu yerda:\n• a va b — katetlar (to'g'ri burchak yonidagi tomonlar)\n• c — gipotenuza (eng uzun tomon)\n\nMisol: agar a=3, b=4 bo'lsa:\n3² + 4² = 9 + 16 = 25\nc = √25 = 5\n\nKo'proq misol ko'rmoqchimisiz? 🎯",
      time: '14:26'
    }
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const history = [
    { title: 'Pifagor teoremasi haqida', date: 'Bugun', active: true },
    { title: 'Doira va uning xossalari', date: 'Kecha', active: false },
    { title: 'Uchburchak turlari', date: '2 kun oldin', active: false },
    { title: 'To\'g\'ri burchakli uchburchak', date: '3 kun oldin', active: false },
    { title: 'Ko\'pburchaklar perimetri', date: '1 hafta oldin', active: false },
  ]

  const suggestions = [
    "Pifagor teoremasi", "Uchburchak yuzi", "Doira uzunligi", "Ko'pburchak", "Stereometriya", "Koordinatalar"
  ]

  const sendMessage = () => {
    if (!input.trim()) return;
    
    // Add User Message
    const newMsg: Message = { id: Date.now().toString(), role: 'user', text: input, time: new Date().toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'}) }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setIsTyping(true)

    // Mock AI response
    setTimeout(() => {
      setIsTyping(false)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: "Ajoyib savol! Bu mavzu bo'yicha batafsil tushuntiraman...",
        time: new Date().toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex h-[calc(100vh-80px)] w-full gap-6 mx-auto -mt-4 bg-transparent"
    >
      {/* LEFT SIDEBAR */}
      <div className="w-72 hidden lg:flex flex-col glass-card bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm overflow-hidden h-full shrink-0">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <h2 className="font-bold text-slate-800">Suhbat tarixi</h2>
          <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Suhbat qidirish..." 
              className="w-full bg-slate-100/50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all text-slate-700" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {history.map((item, i) => (
            <div key={i} className={`p-3 rounded-xl cursor-pointer transition-colors ${item.active ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100 text-slate-700'}`}>
              <p className={`text-sm font-medium truncate ${item.active ? 'text-white' : 'text-slate-700'}`}>{item.title}</p>
              <p className={`text-xs mt-1 ${item.active ? 'text-indigo-200' : 'text-slate-400'}`}>{item.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col glass-card bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm h-full overflow-hidden relative">
        
        {/* CHAT HEADER */}
        <div className="h-16 border-b border-slate-100 flex justify-between items-center px-6 bg-white/50 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
              G
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 className="font-medium text-slate-800">GeoMind Muallim</h3>
              <p className="text-xs text-slate-500 font-medium">Online</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-red-500 transition-colors p-2" title="Tozalash">
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'self-end ml-auto flex-row-reverse' : 'self-start'}`}>
              <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center shadow-sm text-sm font-bold mt-1 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white'}`}>
                {msg.role === 'user' ? 'SN' : 'G'}
              </div>
              <div className="flex flex-col gap-1 w-full relative">
                <div className={`p-4 shadow-sm w-fit max-w-full ${
                  msg.role === 'user' 
                    ? 'btn-gradient text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-indigo-600/5 border border-indigo-600/10 text-slate-800 rounded-2xl rounded-tl-sm'
                }`}>
                  
                  {/* Handling AI Formula Blocks manually for the mock */}
                  {msg.isFormula ? (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      Suvbat to'g'ri burchakli uchburchak uchun amal qiladi:
                      
                      <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-r-xl p-4 my-3 font-mono text-indigo-700 text-base font-bold shadow-sm whitespace-pre">
                        a² + b² = c²
                      </div>
                      
                      Bu yerda:
                      • a va b — katetlar (to'g'ri burchak yonidagi tomonlar)
                      • c — gipotenuza (eng uzun tomon)
                      <br/><br/>
                      Misol: agar a=3, b=4 bo'lsa:
                      <br/>
                      <span className="font-mono bg-white px-2 py-1 rounded text-indigo-700 font-bold border border-indigo-100 inline-block mt-1">3² + 4² = 9 + 16 = 25<br/>c = √25 = 5</span>
                      <br/><br/>
                      Ko'proq misol ko'rmoqchimisiz? 🎯
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
                <span className={`text-[11px] text-slate-400 font-medium ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4 self-start max-w-[85%]">
              <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center shadow-sm text-sm font-bold bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
                G
              </div>
              <div className="bg-indigo-600/5 border border-indigo-600/10 rounded-2xl rounded-tl-sm p-4 h-[52px] flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* QUICK SUGGESTIONS */}
        <div className="px-6 pb-3 pt-2 overflow-x-auto whitespace-nowrap noscrollbar shrink-0 flex gap-2">
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => setInput(s)}
              className="text-xs rounded-full border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors text-indigo-700 px-4 py-2 font-medium shrink-0"
            >
              {s}
            </button>
          ))}
        </div>

        {/* INPUT AREA */}
        <div className="p-4 border-t border-slate-100 bg-white/50 shrink-0">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Savolingizni yozing..." 
              rows={Math.min(4, Math.max(1, input.split('\n').length))}
              className="flex-1 resize-none bg-white border border-slate-200 rounded-2xl rounded-br-lg p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 transition-all text-slate-800 shadow-inner"
            />
            <button 
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-12 h-12 shrink-0 rounded-full btn-gradient flex items-center justify-center text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all"
            >
              <Send className="w-5 h-5 -ml-0.5" />
            </button>
          </div>
        </div>
        
      </div>
    </motion.div>
  )
}
