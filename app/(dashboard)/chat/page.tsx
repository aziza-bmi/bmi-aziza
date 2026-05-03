'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import {
  collection, query, where, orderBy, documentId,
  limit, getDocs, addDoc, deleteDoc,
  doc, serverTimestamp, Timestamp
} from 'firebase/firestore'
import {
  Send, Plus, Search, Trash2, Bot,
  MessageCircle, X, ChevronDown,
  Sparkles, BookOpen, Globe, Clock,
  AlertCircle, Copy, Check, MoreVertical,
  PenLine
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isError?: boolean
}

interface ChatSession {
  id: string
  title: string
  date: string
  preview: string
  messageIds: string[]
}

const QUICK_SUGGESTIONS = [
  "Pifagor teoremasi nima?",
  "Doira yuzi formulasi",
  "Uchburchak turlari",
  "Ko'pburchak burchaklari",
  "Stereometriya nima?",
  "Vektorlar qo'shilishi",
  "Silindr hajmi",
  "Koordinatalar tizimi",
]

const SITE_KNOWLEDGE = `
Sen Fazo AI — geometriya bo'yicha professional 
o'zbek tilida o'qituvchisan.

SAYT HAQIDA (Fazo AI):
Fazo AI — geometriyani AI yordamida o'rgatuvchi 
ta'lim platformasi. Saytda quyidagi bo'limlar bor:

1. DASHBOARD — foydalanuvchi statistikasi:
   XP ball, streak (ketma-ket o'qish), daraja, 
   mavzular bo'yicha progress, reyting

2. DARSLAR — 2 bo'lim:
   PLANIMETRIYA (tekislik geometriyasi):
   - Dastlabki tushunchalar (nuqta, chiziq, burchak)
   - Uchburchaklar (turlar, Pifagor, yuza)
   - To'rtburchaklar (parallelogramm, trapetsiya, romb, kvadrat)
   - Doira va Aylana (uzunlik, yuza, yoy, sektor)
   - Ko'pburchaklar (muntazam, burchaklar yig'indisi)
   - Vektorlar va koordinatalar
   - O'xshashlik va simmetriya
   - Trigonometriya (sin, cos, tan; sinuslar/kosinuslar teoremasi)
   
   STEREOMETRIYA (fazoviy geometriya):
   - Fazoda to'g'ri chiziq va tekislik
   - Ko'pyoqlar (prizma, parallelepiped, piramida)
   - Aylanish jismlari (silindr, konus, shar)
   - Hajm hisoblash, kesimlar, kombinatsiyalar

3. AI MUALLIM — geometriya bo'yicha AI suhbat
4. TESTLAR — mavzular bo'yicha quiz
5. LABORATORIYA — interaktiv geometriya chizuvchi:
   2D shakllar: to'rtburchak, doira, uchburchak, 
                chiziq, vektor, ko'pburchak
   3D shakllar: kub, prizma, piramida, silindr, 
                konus, shar
   AI rejimlar: So'ra, Chizdir, Masala
6. PROFIL — XP, daraja, yutuqlar
7. REYTING — top o'quvchilar

GEOMETRIYA BILIMLARI:

=== PLANIMETRIYA ===

NUQTA, CHIZIQ, KESMA:
Ikki nuqta orasidagi masofa: d = √((x₂-x₁)²+(y₂-y₁)²)
Kesma o'rtasi: M = ((x₁+x₂)/2, (y₁+y₂)/2)

BURCHAKLAR:
O'tkir: 0°<α<90°, To'g'ri: α=90°
O'tmas: 90°<α<180°, Yoziq: α=180°
Qo'shni: α+β=180°, Vertikal: α₁=α₂

UCHBURCHAK:
Burchaklar: α+β+γ=180°
Perimetr: P=a+b+c
Yuza: S=½·a·h, Geron: S=√(s(s-a)(s-b)(s-c))
Pifagor: a²+b²=c²
Sinuslar teoremasi: a/sinA=b/sinB=c/sinC=2R
Kosinuslar teoremasi: c²=a²+b²-2ab·cosC

TO'RTBURCHAKLAR:
To'g'ri to'rtburchak: S=a·b, P=2(a+b), d=√(a²+b²)
Kvadrat: S=a², P=4a, d=a√2
Parallelogramm: S=a·h, P=2(a+b)
Romb: S=d₁·d₂/2, P=4a
Trapetsiya: S=(a+b)/2·h

DOIRA:
Aylana uzunligi: C=2πr=πd
Doira yuzi: S=πr²
Yoy: l=πrn/180
Sektor yuzi: S=πr²n/360

KO'PBURCHAK:
Burchaklar yig'indisi: (n-2)·180°
Bir burchak: (n-2)·180°/n

TRIGONOMETRIYA:
sinα=qarshi/gipotenuza
cosα=yonma-yon/gipotenuza
tanα=sinα/cosα
sin²α+cos²α=1
sin30°=½, sin60°=√3/2, sin45°=√2/2

=== STEREOMETRIYA ===

PRIZMA: V=S_asos·h, S_yon=P_asos·h
PARALLELEPIPED: V=a·b·c, d=√(a²+b²+c²)
PIRAMIDA: V=⅓·S_asos·h
SILINDR: V=πr²h, S_yon=2πrh, S_to'liq=2πr(r+h)
KONUS: V=⅓πr²h, l=√(r²+h²), S_yon=πrl
SHAR: V=4/3πr³, S=4πr²

XP TIZIMI:
Har bir mavzu: 30-70 XP
Test uchun: to'g'ri javob × 10 XP
Daraja: har 500 XP da yangi daraja

QOIDALAR:
1. FAQAT O'ZBEK tilida yoz
2. Formulalar uchun LaTeX: $formula$ yoki $$formula$$
3. Sarlavhalar: ## va ### 
4. Muhim so'zlar: **qalin**
5. Ro'yxat: - bilan
6. Aniq, qisqa, tushunarli yoz
7. Savol geometriya/sayt haqida bo'lmasa:
   "Kechirasiz, men faqat geometriya va Fazo AI 
    saytiga oid savollarga javob bera olaman."
8. Agar batafsil ma'lumot kerak bo'lsa yoki 
   yangi/qo'shimcha ma'lumot zarur bo'lsa — 
   internetdan ham qidirish mumkin, lekin 
   doimo O'zbek tilida tushuntir
9. Imlo qoidalariga qat'iy amal qil
10. Javob oxirida qo'shimcha savol taklif qil
`

export default function ChatPage() {
  const { user } = useAuth()
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showClearAll, setShowClearAll] = useState(false)
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // initialize chat session ID on mount
    setCurrentSessionId(Date.now().toString())
    setMessages([{
      id: '0',
      role: 'assistant',
      content: `Salom! Men **Fazo AI** — sizning geometriya bo'yicha shaxsiy muallimingizman. 🎓\n\nMen quyidagilar haqida yordam bera olaman:\n- **Geometriya** — formulalar, teoremalar, misollar\n- **Fazo AI sayt** — darslar, testlar, laboratoriya\n- **Masalalar** — bosqichma-bosqich yechim\n\nBugun qaysi mavzuda yordam kerak?`,
      timestamp: new Date(),
    }])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!user) return
    loadSessions()
  }, [user])

  async function loadSessions() {
    if (!user) return
    try {
      const q = query(
        collection(db, 'chats'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      )
      const snap = await getDocs(q)
      const grouped: Record<string, ChatSession> = {}
      snap.docs.forEach(doc => {
        const data = doc.data()
        const date = data.timestamp?.toDate
          ? data.timestamp.toDate().toLocaleDateString('uz-UZ')
          : 'Bugun'
        const key = data.sessionId || (date + '_' + data.userMessage?.slice(0, 20))
        if (!grouped[key]) {
          grouped[key] = {
            id: key,
            title: data.userMessage?.slice(0, 35) + 
              (data.userMessage?.length > 35 ? '...' : '') || 
              'Suhbat',
            date,
            preview: data.aiMessage?.slice(0, 60) + '...',
            messageIds: [doc.id],
          }
        } else {
          grouped[key].messageIds.push(doc.id)
        }
      })
      
      // Keep sort order descending properly
      const finalSessions = Object.values(grouped)
      setSessions(finalSessions.slice(0, 20))
    } catch (e) {
      console.error(e)
    }
  }

  async function loadSpecificSession(sessionKey: string, messageIds: string[]) {
    if (!user || messageIds.length === 0) return
    setCurrentSessionId(sessionKey)
    setIsLoading(true)
    try {
      const loadedMessages: Message[] = []
      
      for (let i = 0; i < messageIds.length; i += 10) {
        const chunk = messageIds.slice(i, i + 10)
        const q = query(collection(db, 'chats'), where(documentId(), 'in', chunk))
        const snap = await getDocs(q)
        
        const docsData = snap.docs.map(d => ({ id: d.id, data: d.data() }))
        docsData.sort((a, b) => {
          const tA = a.data.timestamp?.toMillis() || 0
          const tB = b.data.timestamp?.toMillis() || 0
          return tA - tB
        })
        
        docsData.forEach(d => {
          loadedMessages.push({
            id: d.id + '_user',
            role: 'user',
            content: d.data.userMessage,
            timestamp: d.data.timestamp?.toDate() || new Date()
          })
          if (d.data.aiMessage) {
              loadedMessages.push({
                id: d.id + '_ai',
                role: 'assistant',
                content: d.data.aiMessage,
                timestamp: d.data.timestamp?.toDate() || new Date()
              })
          }
        })
      }
      
      const initial: Message = {
        id: '0',
        role: 'assistant',
        content: `Salom! Men **Fazo AI** — sizning geometriya bo'yicha shaxsiy muallimingizman. 🎓\n\nMen quyidagilar haqida yordam bera olaman:\n- **Geometriya** — formulalar, teoremalar, misollar\n- **Fazo AI sayt** — darslar, testlar, laboratoriya\n- **Masalalar** — bosqichma-bosqich yechim\n\nBugun qaysi mavzuda yordam kerak?`,
        timestamp: new Date(),
      }
      
      setMessages([initial, ...loadedMessages])
      setMobileSidebar(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteSession(sessionId: string, messageIds: string[]) {
    if (!user) return
    try {
      // Create chunks and delete
      for (let i = 0; i < messageIds.length; i += 10) {
        const chunk = messageIds.slice(i, i + 10)
        await Promise.all(chunk.map(id => deleteDoc(doc(db, 'chats', id))))
      }
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      setDeleteConfirm(null)
      
      // If deleted current active session, reset chat
      if (sessionId === currentSessionId) {
          startNewChat()
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function clearAllHistory() {
    if (!user) return
    try {
      const q = query(
        collection(db, 'chats'),
        where('userId', '==', user.uid)
      )
      const snap = await getDocs(q)
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
      setSessions([])
      setShowClearAll(false)
      startNewChat()
    } catch (e) {
      console.error(e)
    }
  }

  async function copyMessage(content: string, id: string) {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return
    const userText = input.trim()
    setInput('')

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt: SITE_KNOWLEDGE,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])

      if (user) {
        await addDoc(collection(db, 'chats'), {
          sessionId: currentSessionId,
          userId: user.uid,
          userMessage: userText,
          aiMessage: data.message,
          timestamp: serverTimestamp(),
        })
        loadSessions()
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Kechirasiz, xatolik yuz berdi. Iltimos qisqaroq yoki boshqa savol berib ko\'ring. (API kvotasi tugagan bo\'lishi ham mumkin)',
        timestamp: new Date(),
        isError: true,
      }])
    } finally {
      setIsLoading(false)
    }
  }

  function startNewChat() {
    setCurrentSessionId(Date.now().toString())
    setMessages([{
      id: '0',
      role: 'assistant',
      content: `Salom! Yangi suhbat boshlandi. 😊\n\nGeometriya yoki Fazo AI saytiga oid savolingizni bering!`,
      timestamp: new Date(),
    }])
  }

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex h-screen overflow-hidden
                    bg-gradient-to-br from-indigo-50/50
                    via-white to-blue-50/50
                    dark:from-slate-950 dark:via-slate-900
                    dark:to-slate-950">

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-72 flex-shrink-0 flex flex-col h-full
                      bg-white/80 dark:bg-slate-900/80
                      backdrop-blur-xl
                      border-r border-slate-200/60
                      dark:border-slate-700/40
                      hidden md:flex">

        {/* Sidebar header */}
        <div className="p-4 border-b border-slate-100
                        dark:border-slate-700/40">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-700
                           dark:text-slate-200">
              Suhbat tarixi
            </h2>
            <div className="flex items-center gap-1">
              {sessions.length > 0 && (
                <button
                  onClick={() => setShowClearAll(true)}
                  title="Hammasini o'chirish"
                  className="w-7 h-7 rounded-lg flex items-center
                             justify-center text-slate-400
                             hover:text-red-500 hover:bg-red-50
                             dark:hover:bg-red-900/20 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                onClick={startNewChat}
                title="Yangi suhbat"
                className="w-7 h-7 rounded-lg flex items-center
                           justify-center text-slate-400
                           hover:text-indigo-600
                           hover:bg-indigo-50
                           dark:hover:bg-indigo-900/20
                           transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2
                         text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Suhbat qidirish..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl
                         border border-slate-200 dark:border-slate-700
                         bg-slate-50 dark:bg-slate-800/50
                         text-slate-700 dark:text-slate-200
                         placeholder:text-slate-400
                         focus:outline-none
                         focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-none">
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center
                            justify-center py-12 px-4 text-center">
              <MessageCircle size={28}
                className="text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {searchQuery
                  ? "Suhbat topilmadi"
                  : "Hali suhbat yo'q.\nAI bilan gaplashing!"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSessions.map((session) => (
                <div key={session.id}
                  onClick={() => loadSpecificSession(session.id, session.messageIds)}
                  className={`group relative flex items-start
                             gap-2 p-3 rounded-xl cursor-pointer
                             hover:bg-indigo-50 dark:hover:bg-indigo-900/20
                             transition-all ${currentSessionId === session.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                  <div className="w-7 h-7 rounded-full
                                  bg-indigo-100 dark:bg-indigo-900/40
                                  flex items-center justify-center
                                  flex-shrink-0 mt-0.5">
                    <MessageCircle size={13}
                      className="text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700
                                  dark:text-slate-200 truncate">
                      {session.title}
                    </p>
                    <p className="text-[11px] text-slate-400
                                  dark:text-slate-500 mt-0.5">
                      {session.date}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConfirm(session.id)
                    }}
                    className="opacity-0 group-hover:opacity-100
                               w-6 h-6 rounded-lg flex items-center
                               justify-center text-slate-300
                               hover:text-red-500
                               hover:bg-red-50 dark:hover:bg-red-900/20
                               transition-all flex-shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>

                  {/* Delete confirm */}
                  {deleteConfirm === session.id && (
                    <div className="absolute right-2 top-0
                                    bg-white dark:bg-slate-800
                                    border border-slate-200
                                    dark:border-slate-700
                                    rounded-xl shadow-lg p-3 z-10
                                    min-w-[160px]">
                      <p className="text-xs text-slate-600
                                    dark:text-slate-300 mb-2">
                        O'chirishni tasdiqlaysizmi?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSession(session.id, session.messageIds) }}
                          className="flex-1 py-1 rounded-lg text-xs
                                     bg-red-500 text-white
                                     hover:bg-red-600 transition-colors"
                        >
                          Ha
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null) }}
                          className="flex-1 py-1 rounded-lg text-xs
                                     border border-slate-200
                                     dark:border-slate-600
                                     text-slate-600 dark:text-slate-300
                                     hover:bg-slate-50
                                     dark:hover:bg-slate-700
                                     transition-colors"
                        >
                          Yo'q
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Chat header */}
        <div className="h-14 flex items-center justify-between
                        px-4 md:px-6
                        bg-white/80 dark:bg-slate-900/80
                        backdrop-blur-xl
                        border-b border-slate-200/60
                        dark:border-slate-700/40
                        flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebar(true)}
              className="md:hidden w-8 h-8 rounded-xl
                         flex items-center justify-center
                         text-slate-500 hover:bg-slate-100
                         dark:hover:bg-slate-700 transition-all"
            >
              <MessageCircle size={18} />
            </button>          
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br
                            from-indigo-500 to-blue-500
                            flex items-center justify-center
                            text-white font-bold text-sm shadow-sm hidden sm:flex">
              G
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800
                            dark:text-slate-100">
                Fazo Muallim
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full
                                bg-green-400 animate-pulse" />
                <span className="text-xs text-green-600
                                 dark:text-green-400">
                  Online
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
			{/* Yangi chat tugmasi olib tashlandi, sababi yon panelda + mavjud */}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4
                        space-y-4 scrollbar-none">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 group
                         ${msg.role === 'user'
                           ? 'flex-row-reverse'
                           : 'flex-row'}`}
            >
              {/* Avatar */}
              {msg.role === 'assistant' ? (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br
                                from-indigo-500 to-blue-500
                                flex items-center justify-center
                                text-white text-xs font-bold
                                flex-shrink-0 mt-0.5 shadow-sm">
                  G
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-slate-200
                                dark:bg-slate-700
                                flex items-center justify-center
                                text-slate-600 dark:text-slate-300
                                text-xs font-bold flex-shrink-0
                                mt-0.5">
                  {user?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[80%]
                              ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                <div className={`relative px-4 py-3 rounded-2xl
                                 ${msg.role === 'assistant'
                                   ? msg.isError
                                     ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-tl-sm'
                                     : 'bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/40 rounded-tl-sm shadow-sm'
                                   : 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-tr-sm shadow-sm'}`}
                >
                  {msg.role === 'assistant' ? (
                    <div className={`text-sm leading-relaxed
                                    ${msg.isError
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-slate-800 dark:text-slate-100'}`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0 leading-relaxed break-words text-sm sm:text-base">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold
                                               text-indigo-700
                                               dark:text-indigo-300">
                              {children}
                            </strong>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base sm:text-lg font-semibold
                                           text-slate-800
                                           dark:text-slate-100
                                           mb-2 mt-3 first:mt-0
                                           pb-1 border-b
                                           border-slate-200
                                           dark:border-slate-700">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm sm:text-base font-semibold
                                           text-slate-700
                                           dark:text-slate-200
                                           mb-1.5 mt-2 first:mt-0">
                              {children}
                            </h3>
                          ),
                          ul: ({ children }) => (
                            <ul className="space-y-1 mb-2 ml-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="space-y-1 mb-2 ml-1
                                           list-decimal list-inside">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="flex items-start gap-2
                                           text-sm sm:text-base leading-relaxed break-words">
                              <span className="mt-2 w-1.5 h-1.5
                                              rounded-full
                                              bg-indigo-400
                                              flex-shrink-0" />
                              <span className="flex-1">{children}</span>
                            </li>
                          ),
                          code: ({ children, className: cls }) => {
                            if (!cls) return (
                              <code className="px-1.5 py-0.5 rounded-md
                                               bg-indigo-100
                                               dark:bg-indigo-900/40
                                               text-indigo-700
                                               dark:text-indigo-300
                                               font-mono text-[90%]">
                                {children}
                              </code>
                            )
                            return (
                              <code className="block p-3 rounded-xl
                                               text-xs sm:text-sm bg-slate-900
                                               dark:bg-slate-950
                                               text-green-400 font-mono
                                               overflow-x-auto my-2 scrollbar-none">
                                {children}
                              </code>
                            )
                          },
                          pre: ({ children }) => (
                            <pre className="my-2">{children}</pre>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4
                                                   border-indigo-400
                                                   pl-3 py-1 my-2
                                                   bg-indigo-50
                                                   dark:bg-indigo-900/20
                                                   rounded-r-xl italic
                                                   text-slate-600
                                                   dark:text-slate-300 text-sm sm:text-base">
                              {children}
                            </blockquote>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-3 scrollbar-none">
                              <table className="w-full text-xs sm:text-sm
                                               border-collapse">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="px-2 py-1.5 text-left
                                           font-medium text-slate-700
                                           dark:text-slate-200
                                           bg-indigo-50
                                           dark:bg-indigo-900/30
                                           border border-slate-200
                                           dark:border-slate-700">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-2 py-1.5 text-slate-600
                                           dark:text-slate-300
                                           border border-slate-200
                                           dark:border-slate-700">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base leading-relaxed break-words">
                      {msg.content}
                    </p>
                  )}
                </div>

                {/* Message actions */}
                <div className={`flex items-center gap-2
                                opacity-0 group-hover:opacity-100
                                transition-opacity
                                ${msg.role === 'user'
                                  ? 'flex-row-reverse'
                                  : 'flex-row'}`}>
                  <span className="text-[10px] text-slate-400
                                   dark:text-slate-500">
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.role === 'assistant' && !msg.isError && (
                    <button
                      onClick={() => copyMessage(msg.content, msg.id)}
                      className="w-6 h-6 rounded-lg flex items-center
                                 justify-center text-slate-400
                                 hover:text-indigo-500
                                 hover:bg-indigo-50
                                 dark:hover:bg-indigo-900/20
                                 transition-all"
                    >
                      {copiedId === msg.id
                        ? <Check size={11} className="text-green-500" />
                        : <Copy size={11} />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br
                              from-indigo-500 to-blue-500
                              flex items-center justify-center
                              text-white text-xs font-bold
                              flex-shrink-0 shadow-sm">
                G
              </div>
              <div className="bg-white dark:bg-slate-800/80
                              border border-slate-200/60
                              dark:border-slate-700/40
                              rounded-2xl rounded-tl-sm px-4 py-3
                              shadow-sm">
                <div className="flex gap-1.5 items-center h-5">
                  {[0, 150, 300].map(delay => (
                    <span key={delay}
                      className="w-2 h-2 rounded-full bg-indigo-400
                                 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 md:px-6 pb-3">
            <p className="text-xs text-slate-400 dark:text-slate-500
                          mb-2">
              Tezkor savollar:
            </p>
            <div className="flex gap-2 flex-wrap">
              {QUICK_SUGGESTIONS.slice(0, 4).map(q => (
                <button key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1.5 rounded-full
                             bg-white dark:bg-slate-800
                             border border-slate-200
                             dark:border-slate-700
                             text-slate-600 dark:text-slate-300
                             hover:border-indigo-300
                             dark:hover:border-indigo-600
                             hover:text-indigo-600
                             dark:hover:text-indigo-400
                             hover:bg-indigo-50
                             dark:hover:bg-indigo-900/20
                             transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 md:px-6 pb-4 pt-2
                        bg-white/80 dark:bg-slate-900/80
                        backdrop-blur-xl
                        border-t border-slate-200/60
                        dark:border-slate-700/40
                        flex-shrink-0">
          <div className="flex gap-3 items-end
                          bg-white dark:bg-slate-800/80
                          border border-slate-200
                          dark:border-slate-700
                          rounded-2xl px-4 py-3
                          focus-within:border-indigo-400
                          dark:focus-within:border-indigo-600
                          transition-colors shadow-sm">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Savol yozing... (Enter — yuborish)"
              rows={1}
              className="flex-1 resize-none text-sm bg-transparent
                         text-slate-800 dark:text-slate-100
                         placeholder:text-slate-400
                         dark:placeholder:text-slate-500
                         focus:outline-none max-h-[120px]
                         leading-relaxed scrollbar-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 flex-shrink-0 rounded-xl
                         bg-gradient-to-br from-indigo-500
                         to-blue-500 flex items-center
                         justify-center text-white
                         disabled:opacity-40 transition-all
                         hover:opacity-90 hover:scale-105
                         active:scale-95 shadow-sm"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-[10px] text-slate-400
                        dark:text-slate-500 mt-2 text-center">
            Fazo AI geometriya va sayt bo'yicha 
            savollarga javob beradi
          </p>
        </div>
      </div>

      {/* Clear all confirmation modal */}
      <AnimatePresence>
        {showClearAll && (
          <div className="fixed inset-0 z-50 flex items-center
                          justify-center bg-black/40
                          backdrop-blur-sm"
            onClick={() => setShowClearAll(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-800
                         rounded-2xl p-6 mx-4 max-w-sm w-full
                         shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100
                              dark:bg-red-900/30 flex items-center
                              justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="text-base font-medium text-slate-800
                             dark:text-slate-100 text-center mb-2">
                Barcha tarixni o'chirish
              </h3>
              <p className="text-sm text-slate-500
                            dark:text-slate-400 text-center mb-6">
                Barcha suhbat tarixi butunlay o'chiriladi.
                Bu amalni qaytarib bo'lmaydi.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearAll(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm
                             border border-slate-200
                             dark:border-slate-600
                             text-slate-600 dark:text-slate-300
                             hover:bg-slate-50
                             dark:hover:bg-slate-700
                             transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={clearAllHistory}
                  className="flex-1 py-2.5 rounded-xl text-sm
                             bg-red-500 text-white
                             hover:bg-red-600 transition-colors"
                >
                  O'chirish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Mobile Sidebar Handle */}
      <AnimatePresence>
        {mobileSidebar && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40"
              onClick={() => setMobileSidebar(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0
                         bg-white dark:bg-slate-900
                         rounded-t-3xl max-h-[75vh]
                         flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full
                                bg-slate-300 dark:bg-slate-600" />
              </div>
              <div className="px-4 pb-2 flex items-center
                              justify-between">
                <h3 className="text-sm font-medium text-slate-800
                               dark:text-slate-100">Suhbat tarixi</h3>
                <button onClick={() => setMobileSidebar(false)}>
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-none">
                {filteredSessions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    Hali suhbat yo'q
                  </p>
                ) : (
                  filteredSessions.map(session => (
                    <div key={session.id}
                      onClick={() => loadSpecificSession(session.id, session.messageIds)}
                      className={`flex items-center gap-3 p-3
                                 rounded-xl hover:bg-slate-50 cursor-pointer
                                 dark:hover:bg-slate-800 transition-all
                                 ${currentSessionId === session.id ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}>
                      <MessageCircle size={14}
                        className="text-indigo-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700
                                      dark:text-slate-200 truncate">
                          {session.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {session.date}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id, session.messageIds) }}
                        className="text-slate-300 hover:text-red-400
                                   transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>      
    </div>
  )
}
