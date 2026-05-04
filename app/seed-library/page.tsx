'use client'
import { useEffect, useState } from 'react'
import { seedLibraryBooks } from '@/lib/seedLibrary'

export default function SeedPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSeed() {
    setStatus('loading')
    try {
      const count = await seedLibraryBooks()
      setStatus('done')
      setMessage(`✅ Muvaffaqiyatli! ${count} ta kitob qo'shildi.`)
    } catch (e: any) {
      setStatus('error')
      setMessage(`❌ Xato: ${e.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">📚 Kutubxona Seed</h1>
        <p className="text-slate-500 text-sm mb-6">
          Bu tugma Firestore'ga 4 ta geometriya kitobini qo'shadi.
          <br />Faqat bir marta bosing.
        </p>

        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${
            status === 'done' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSeed}
          disabled={status === 'loading' || status === 'done'}
          className="w-full py-3 px-6 rounded-xl bg-indigo-600 text-white font-semibold
                     hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {status === 'loading' ? '⏳ Qo\'shilmoqda...' :
           status === 'done' ? '✅ Bajarildi!' :
           '🚀 Kitoblarni Firestore\'ga qo\'sh'}
        </button>

        {status === 'done' && (
          <p className="mt-4 text-xs text-slate-400">
            Endi <a href="/library" className="text-indigo-600 underline">Kutubxona</a> sahifasiga o'ting
          </p>
        )}
      </div>
    </div>
  )
}
