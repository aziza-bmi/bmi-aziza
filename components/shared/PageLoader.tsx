export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2
                          border-indigo-200 dark:border-indigo-900/40" />
          <div className="absolute inset-0 rounded-full border-2
                          border-transparent border-t-indigo-500
                          animate-spin" />
          <div className="absolute inset-3 rounded-full
                          bg-gradient-to-br from-indigo-500 to-blue-500
                          animate-pulse" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
          Yuklanmoqda...
        </p>
      </div>
    </div>
  )
}
