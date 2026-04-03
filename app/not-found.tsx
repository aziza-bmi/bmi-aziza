import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-indigo-50 via-blue-50
                    to-indigo-50 dark:from-slate-950
                    dark:via-slate-900 dark:to-slate-950">
      <div className="text-center px-8">
        <div className="text-8xl font-medium gradient-text mb-4">404</div>
        <h1 className="text-2xl font-medium text-slate-800
                       dark:text-slate-100 mb-3">
          Sahifa topilmadi
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
          Siz izlayotgan sahifa mavjud emas yoki
          ko&apos;chirilgan bo&apos;lishi mumkin.
        </p>
        <Link href="/"
          className="btn-gradient px-8 py-3 rounded-xl text-sm inline-block">
          Bosh sahifaga qaytish →
        </Link>
      </div>
    </div>
  )
}
