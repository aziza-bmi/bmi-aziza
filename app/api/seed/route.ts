import { NextResponse } from 'next/server'
import { seedLessons } from '@/lib/seedLessons'

export async function GET() {
  try {
    await seedLessons()
    return NextResponse.json({ success: true, message: 'Lessons seeded!' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
