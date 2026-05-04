'use client'
import { useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, updateDoc } from 'firebase/firestore'

// Try multiple URL formats for grade 10
const COVER_URLS = [
  'https://drive.google.com/thumbnail?id=1_zqkTuJCo2icY5avsJOgAIOf87uWYeNS&sz=w400',
  'https://lh3.googleusercontent.com/d/1_zqkTuJCo2icY5avsJOgAIOf87uWYeNS=w400',
  'https://drive.google.com/uc?id=1_zqkTuJCo2icY5avsJOgAIOf87uWYeNS&export=download',
]

export default function FixGrade10Page() {
  const [status, setStatus] = useState('')
  const [selectedUrl, setSelectedUrl] = useState(COVER_URLS[0])

  async function handleFix() {
    setStatus('Yangilanmoqda...')
    try {
      const col = collection(db, 'libraryBooks')
      const q = query(col, where('grade', '==', 10))
      const snap = await getDocs(q)
      for (const docSnap of snap.docs) {
        await updateDoc(docSnap.ref, { coverUrl: selectedUrl })
      }
      setStatus('✅ Muvaffaqiyatli yangilandi! /library ga o\'ting va F5 bosing.')
    } catch (e: any) {
      setStatus('❌ Xato: ' + e.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <h1 className="text-xl font-bold text-slate-800 mb-4">🔧 10-sinf muqovasini tuzatish</h1>
        
        <div className="space-y-3 mb-6">
          {COVER_URLS.map((url, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 border-slate-100 hover:border-indigo-200 transition-colors">
              <input
                type="radio"
                name="url"
                value={url}
                checked={selectedUrl === url}
                onChange={() => setSelectedUrl(url)}
                className="mt-1 shrink-0"
              />
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">Format {i + 1}</div>
                <div className="text-xs text-slate-400 break-all">{url}</div>
                {/* Preview */}
                <img src={url} alt="Preview" className="mt-2 h-20 object-cover rounded-lg border" 
                     onError={e => (e.currentTarget.style.display='none')} />
              </div>
            </label>
          ))}
        </div>

        {status && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${
            status.startsWith('✅') ? 'bg-green-50 text-green-700' : 
            status.startsWith('❌') ? 'bg-red-50 text-red-700' : 
            'bg-blue-50 text-blue-700'
          }`}>
            {status}
          </div>
        )}

        <button
          onClick={handleFix}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
        >
          Tanlangan URL bilan yangilash
        </button>

        <div className="mt-4 text-center">
          <a href="/library" className="text-sm text-indigo-600 underline">← Kutubxonaga qaytish</a>
        </div>
      </div>
    </div>
  )
}
