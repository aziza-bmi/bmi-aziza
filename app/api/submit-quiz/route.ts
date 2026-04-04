import { NextResponse } from 'next/server'
import { saveQuizResult } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { userId, topicId, score, total, timeTaken, config } = await request.json()

    if (!userId || !topicId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await saveQuizResult(
      userId,
      topicId,
      score,
      total,
      timeTaken,
      config
    )

    return NextResponse.json({ 
      success: true, 
      xpEarned: result.xpEarned,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel
    })
  } catch (error) {
    console.error('Error submitting quiz result:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
