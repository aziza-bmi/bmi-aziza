'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Send, Plus, Eraser } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isFormula?: boolean
}

export default function AIChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Salom! Men GeoMind AI — geometriya bo\'yicha shaxsiy muallimingizman. Bugun qaysi mavzuda yordam kerak?',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  useEffect(() => {
    if (!user) return
    async function loadHistory() {
      try {
        const q = query(
          collection(db, 'chats'),
          where('userId', '==', user!.uid),
          orderBy('timestamp', 'desc'),
          limit(20)
        )
        const snap = await getDocs(q)
        const grouped: Record<string, any> = {}
        snap.docs.forEach(doc => {
          const data = doc.data()
          const date = data.timestamp?.toDate
            ? data.timestamp.toDate().toLocaleDateString('uz-UZ')
            : 'Bugun'
          if (!grouped[date]) {
            grouped[date] = {
              title: (data.userMessage || '').slice(0, 30) + '...',
              date,
            }
          }
        })
        setChatHistory(Object.values(grouped).slice(0, 8))
      } catch (e) {
        console.error('Chat history load error:', e)
      }
    }
    loadHistory()
  }, [user])

  const suggestions = [
    "Pifagor teoremasi", "Uchburchak yuzi", "Doira uzunligi", "Ko'pburchak", "Stereometriya", "Koordinatalar"
  ]

  async function sendMessage() {
    if (!input.trim() || isLoading) return
  
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
  
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data.error || 'Xatolik yuz berdi')
      }
  
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }
  
      setMessages(prev => [...prev, aiMessage])
  
      // Save chat to Firestore if user is logged in
      if (user) {
        try {
          await addDoc(collection(db, 'chats'), {
            userId: user.uid,
            userMessage: userMessage.content,
            aiMessage: aiMessage.content,
            timestamp: serverTimestamp(),
          })
        } catch (e) {
          console.error('Chat saqlashda xatolik:', e)
        }
      }
  
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'Xatolik yuz berdi. Qaytadan urining.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
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

        <div className="flex-1 overflow-y-auto p-4 space-y-2 hidden-scrollbar">
          {chatHistory.length > 0 ? (
            chatHistory.map((item: { title: string; date: string }, i: number) => (
              <div key={i} className="px-3 py-2.5 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                <div className="text-sm text-slate-700 truncate font-medium">{item.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.date}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-400 text-center py-8 px-3 leading-relaxed">
              Hali suhbat yo&apos;q.<br />AI bilan gaplashing!
            </div>
          )}
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
          <button className="text-slate-400 hover:text-red-500 transition-colors p-2" title="Tozalash" onClick={() => setMessages([messages[0]])}>
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 hidden-scrollbar">
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
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className={`text-[11px] text-slate-400 font-medium ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br 
                              from-indigo-500 to-blue-500 flex items-center 
                              justify-center text-white font-bold
                              flex-shrink-0 shadow-sm mt-1">
                G
              </div>
              <div className="bg-indigo-50 border border-indigo-600/10 
                              rounded-2xl rounded-tl-sm p-4 h-[52px] flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-400 
                                 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 
                                 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 
                                 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* QUICK SUGGESTIONS */}
        <div className="px-6 pb-3 pt-2 overflow-x-auto whitespace-nowrap noscrollbar shrink-0 flex gap-2 hidden-scrollbar">
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
              disabled={!input.trim() || isLoading}
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
