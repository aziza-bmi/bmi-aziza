'use client'

import Link from 'next/link'
import { Mail, Lock, LogIn } from 'lucide-react'
import { loginWithEmail, loginWithGoogle, getAuthErrorMessage } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      router.push('/dashboard')
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Platformaga kirish</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Davom etish uchun hisobingizga kiring</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 
                        dark:border-red-800 rounded-xl p-3 mb-4 text-sm 
                        text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <button onClick={handleGoogleLogin} disabled={loading} className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl mb-6 flex items-center justify-center gap-3 transition-colors bg-white disabled:opacity-50">
        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
          </g>
        </svg>
        {loading ? 'Kutilmoqda...' : 'Google bilan kirish'}
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-slate-200"></div>
        <span className="text-xs text-slate-400 font-medium">YOKI</span>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      <form className="space-y-4" onSubmit={handleEmailLogin}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email pochta</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
              className="w-full pl-11 pr-4 py-2.5 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700">Parol</label>
            <Link href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              Parolni unutdingizmi?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-2.5 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <button disabled={loading} type="submit" className="w-full h-11 btn-gradient py-2.5 rounded-xl font-medium text-white shadow-lg flex justify-center items-center gap-2 mt-4 md:mt-6 disabled:opacity-50">
          <LogIn className="w-5 h-5" />
          {loading ? 'Kutilmoqda...' : 'Kirish'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-8">
        Hali hisobingiz yo'qmi?{' '}
        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          Ro'yxatdan o'tish
        </Link>
      </p>
    </>
  )
}
