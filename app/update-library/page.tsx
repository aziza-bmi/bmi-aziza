'use client'
import { useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, updateDoc } from 'firebase/firestore'

const UPDATES = [
  {
    grade: 7,
    coverUrl: 'https://drive.google.com/thumbnail?id=1p7DvK8UVdoWm8jw53JFbv6eS7FGEtCMF&sz=w400-h560',
    author: '', // user fills this
  },
  {
    grade: 8,
    coverUrl: 'https://drive.google.com/thumbnail?id=1odt4OSSXFoONtFvPu0_COb9yZ9-9yj7I&sz=w400-h560',
    author: '',
  },
  {
    grade: 9,
    coverUrl: 'https://drive.google.com/thumbnail?id=1K_f9eoykerBmYuA-apBX03hC3RYdTmdv&sz=w400-h560',
    author: '',
  },
  {
    grade: 10,
    coverUrl: 'https://drive.google.com/thumbnail?id=1_zqkTuJCo2icY5avsJOgAIOf87uWYeNS&sz=w400-h560',
    author: '',
  },
]

export default function UpdateLibraryPage() {
  const [authors, setAuthors] = useState<Record<number, string>>({
    7: '', // 7-sinf o'zgartirilmaydi
    8: "A.A. Rahimqoriyev, M.A. To'xtaxo'jayeva",
    9: 'B. Xaydarov, E. Sariqov, A. Qo\'chqorov',
    10: 'B. Xaydarov, N. Tashtemirova, I. Asrorov',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleUpdate() {
    setStatus('loading')
    try {
      const col = collection(db, 'libraryBooks')
      let updated = 0

      for (const update of UPDATES) {
        const q = query(col, where('grade', '==', update.grade))
        const snap = await getDocs(q)
        
        for (const docSnap of snap.docs) {
          const data: any = { coverUrl: update.coverUrl }
          if (authors[update.grade]) {
            data.author = authors[update.grade]
          }
          await updateDoc(docSnap.ref, data)
          updated++
        }
      }

      setStatus('done')
      setMessage(`✅ ${updated} ta kitob yangilandi!`)
    } catch (e: any) {
      setStatus('error')
      setMessage(`❌ Xato: ${e.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">📚 Kitoblarni yangilash</h1>
        <p className="text-slate-500 text-sm mb-6">
          Mualliflarni kiriting va muqovalarni yangilang.
          <br />Muallif bo'sh qoldirilsa, eski qiymat saqlanadi.
        </p>

        <div className="space-y-3 mb-6">
          {[7, 8, 9, 10].map(grade => (
            <div key={grade} className="flex items-center gap-3">
              <span className="w-20 text-sm font-semibold text-slate-600 shrink-0">{grade}-sinf:</span>
              <input
                type="text"
                placeholder={`Muallif ismi (masalan: N. Mirzaev)`}
                value={authors[grade]}
                onChange={e => setAuthors(prev => ({ ...prev, [grade]: e.target.value }))}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
          ))}
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${
            status === 'done' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleUpdate}
          disabled={status === 'loading' || status === 'done'}
          className="w-full py-3 px-6 rounded-xl bg-indigo-600 text-white font-semibold
                     hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {status === 'loading' ? '⏳ Yangilanmoqda...' :
           status === 'done' ? '✅ Bajarildi!' :
           '🔄 Muqova va mualliflarni yangilash'}
        </button>

        {status === 'done' && (
          <p className="mt-4 text-xs text-center text-slate-400">
            <a href="/library" className="text-indigo-600 underline">Kutubxona</a> ga o'ting va tekshiring
          </p>
        )}
      </div>
    </div>
  )
}
