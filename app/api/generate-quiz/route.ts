import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60s timeout for Vercel

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[]

let currentKeyIndex = 0

function getNextApiKey(): string {
  if (API_KEYS.length === 0) {
    return process.env.GEMINI_API_KEY || ''
  }
  const key = API_KEYS[currentKeyIndex]
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
  return key
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      chapterContent, content,       
      chapterTitle, topic,           
      count = 10,                    
      difficulty                     
    } = body

    const lessonContent = chapterContent || content || ''
    const lessonTopic   = chapterTitle   || topic   || 'Dars'

    if (!lessonContent) {
      return NextResponse.json({ error: 'Dars matni (content) talab qilinadi' }, { status: 400 })
    }

    const diffInstruction = difficulty && difficulty !== 'all' 
      ? `Savollar faqat "${difficulty}" qiyinchilik darajasida bo'lsin.` 
      : 'Savollar turli qiyinchilik darajasida bo\'lsin: "easy", "medium", "hard"'

    const prompt = `
Sen geometriya bo'yicha bilimdon o'qituvchisan.
Quyidagi dars matni asosida ${count} ta yuqori sifatli test savoli tuz.

Mavzu: ${lessonTopic}
Matn: ${lessonContent.slice(0, 4000)}

QOIDALAR:
1. Har bir savol dars mazmuniga aniq mos bo'lsin
2. Har bir savolda 4 ta variant bo'lsin (biri to'g'ri)
3. ${diffInstruction}
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
    "difficulty": "${difficulty && difficulty !== 'all' ? difficulty : 'medium'}"
  }
]
`

    let lastError: Error | null = null
    const keysToTry = API_KEYS.length > 0 ? API_KEYS.length : 1

    for (let attempt = 0; attempt < keysToTry; attempt++) {
      try {
        const apiKey = getNextApiKey()
        const genAI = new GoogleGenerativeAI(apiKey)
        
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
        })
        const result  = await model.generateContent(prompt)
        const rawText = result.response.text()

        // Extract JSON array robustly
        const match = rawText.match(/\[[\s\S]*\]/);
        const jsonStr = match ? match[0] : rawText;
        const questions = JSON.parse(jsonStr)

        return NextResponse.json({ questions })
      } catch (err: any) {
        console.error(`Gemini API key error (attempt ${attempt + 1}):`, err)
        lastError = err
        if (err.status === 429 || err.message?.includes('quota')) {
          continue
        }
        throw err
      }
    }

    throw lastError || new Error('Barcha API keylar ishlamayapti')

  } catch (error: any) {
    console.error('Error generating quiz:', error)
    return NextResponse.json(
      { error: 'Savollar yaratishda xatolik yuz berdi', details: error?.message },
      { status: 500 }
    )
  }
}
