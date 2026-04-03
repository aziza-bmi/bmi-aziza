'use client'
import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-indigo-50 to-blue-50
                    dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-100
                        dark:bg-red-900/30 flex items-center
                        justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-medium text-slate-800
                       dark:text-slate-100 mb-2">
          Xatolik yuz berdi
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
          Nimadir noto&apos;g&apos;ri ketdi. Qaytadan urinib ko&apos;ring.
        </p>
        <button onClick={reset}
          className="btn-gradient px-8 py-2.5 rounded-xl text-sm">
          Qaytadan urinish
        </button>
      </div>
    </div>
  )
}
