import { NextResponse } from 'next/server'
import { saveQuizResult } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      topicId,
      score,
      total,
      timeTaken,   // preferred
      timeSpent,   // fallback (alt name used in client)
      mode,        // 'new' | 'review'
      config,      // optional legacy config object
    } = body

    if (!userId || !topicId || total === undefined) {
      return NextResponse.json(
        { error: 'userId, topicId, total parametrlari talab qilinadi' },
        { status: 400 }
      )
    }

    const finalTimeTaken = timeTaken ?? timeSpent ?? 0
    const mergedConfig   = config ?? { mode: mode ?? 'new' }

    const result = await saveQuizResult(
      userId,
      topicId,
      score  ?? 0,
      total,
      finalTimeTaken,
      mergedConfig
    )

    return NextResponse.json({
      success:  true,
      xpEarned: result.xpEarned,
      leveledUp: result.leveledUp,
      newLevel:  result.newLevel,
    })
  } catch (error: any) {
    console.error('Error submitting quiz result:', error)
    return NextResponse.json(
      { error: 'Natijani saqlashda xatolik', details: error?.message },
      { status: 500 }
    )
  }
}
