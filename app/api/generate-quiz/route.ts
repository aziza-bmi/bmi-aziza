import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60s timeout for Vercel

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    // Support both naming conventions from QuizEditor and other callers
    const body = await request.json()
    const {
      chapterContent, content,       // lesson text (primary content)
      chapterTitle, topic,           // lesson name
      count = 10,                    // number of questions
    } = body

    const lessonContent = chapterContent || content || ''
    const lessonTopic   = chapterTitle   || topic   || 'Dars'

    if (!lessonContent) {
      return NextResponse.json({ error: 'Dars matni (content) talab qilinadi' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
Sen geometriya bo'yicha bilimdon o'qituvchisan.
Quyidagi dars matni asosida ${count} ta yuqori sifatli test savoli tuz.

Mavzu: ${lessonTopic}
Matn: ${lessonContent.slice(0, 4000)}

QOIDALAR:
1. Har bir savol dars mazmuniga aniq mos bo'lsin
2. Har bir savolda 4 ta variant bo'lsin (biri to'g'ri)
3. Savollar turli qiyinchilik darajasida bo'lsin: "easy", "medium", "hard"
4. To'g'ri javob indeksi 0 dan 3 gacha (correctAnswer)
5. Izoh (explanation) mazmunli va qisqa bo'lsin
6. Javobni FAQAT JSON array formatida qaytaring — boshqa hech narsa yozma

Format:
[
  {
    "question": "Savol matni",
    "options": ["A variant", "B variant", "C variant", "D variant"],
    "correctAnswer": 0,
    "explanation": "Tushuntirish...",
    "difficulty": "medium"
  }
]
`

    const result  = await model.generateContent(prompt)
    const rawText = result.response.text()

    // Strip markdown code fences if present
    const jsonStr = rawText.replace(/```(?:json)?/g, '').trim()
    const questions = JSON.parse(jsonStr)

    return NextResponse.json({ questions })
  } catch (error: any) {
    console.error('Error generating quiz:', error)
    return NextResponse.json(
      { error: 'Savollar yaratishda xatolik yuz berdi', details: error?.message },
      { status: 500 }
    )
  }
}
