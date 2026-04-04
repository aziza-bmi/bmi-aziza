'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import QuizTaker from '@/components/quiz/QuizTaker'

function QuizTakerWrapper() {
  const params = useSearchParams()

  const topicId    = params.get('topicId')    || ''
  const mode       = (params.get('mode')       || 'new') as 'new' | 'review'
  const difficulty = params.get('difficulty')  || 'all'
  const count      = Number(params.get('count') || '10')

  if (!topicId) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 font-medium">
        Mavzu topilmadi. Qaytib borib tanlang.
      </div>
    )
  }

  return (
    <QuizTaker
      topicId={topicId}
      mode={mode}
      difficulty={difficulty as any}
      count={count}
    />
  )
}

export default function TakeQuizPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    }>
      <QuizTakerWrapper />
    </Suspense>
  )
}
