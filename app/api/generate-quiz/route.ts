import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter((k): k is string => Boolean(k))

let currentKeyIndex = 0
function getNextApiKey(): string {
  if (API_KEYS.length === 0) throw new Error('Hech qanday GEMINI_API_KEY topilmadi')
  const key = API_KEYS[currentKeyIndex % API_KEYS.length]
  currentKeyIndex++
  return key
}

function robustParseJSON(raw: string) {
  let t = raw.replace(/^```[\w]*\n?/i, '').replace(/```\s*$/i, '').trim()
  const s = t.indexOf('['), e = t.lastIndexOf(']')
  if (s === -1 || e === -1) throw new Error('JSON array topilmadi')
  t = t.slice(s, e + 1)
  // Fix unescaped backslashes (LaTeX artifacts break JSON.parse)
  t = t.replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
  return JSON.parse(t)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      chapterContent, content,
      chapterTitle, topic,
      count = 25,
      difficulty
    } = body

    const lessonContent = chapterContent || content || ''
    const lessonTopic   = chapterTitle   || topic   || 'Dars'

    if (!lessonContent) {
      return NextResponse.json({ error: 'Dars matni (content) talab qilinadi' }, { status: 400 })
    }

    const diffInstruction = difficulty && difficulty !== 'all'
      ? `Savollar FAQAT "${difficulty}" darajasida bo'lsin.`
      : '5 ta "easy", 10 ta "medium", 10 ta "hard" taqsimotda bo\'lsin.'

    const prompt = `
Sen GEOMETRIYA fanidan tajribali olimpiada o'qituvchisi.

MAVZU: "${lessonTopic}"
DARS MATNI: ${lessonContent.slice(0, 4000)}

VAZIFA: Bu mavzu bo'yicha aynan ${count} ta professional test savoli tuz.

QIYINCHILIK: ${diffInstruction}

SIFAT TALABLARI (QAT'IY):
1. To'g'ridan-to'g'ri formulaga son qo'yib hisoblash savollari MUTLAQO TAQIQLANGAN.
2. Har bir savol o'quvchini o'ylashga MAJBUR qilsin — parametr chiqarish, kombinatsiya, tahlil.
3. Chalg'ituvchilar — o'quvchi YO'L QO'YISHI mumkin bo'lgan REAL xatolar asosida.
4. explanation — bosqichma-bosqich aniq yechim (kamida 2 qadam).
5. Formulalar: backslash (\\) YOZMANG — JSON buziladi. "S = (a*h)/2", "a^2+b^2=c^2" shaklida.

FAQAT sof JSON array (markdown yo'q, backtick yo'q, izoh yo'q):
[
  {
    "question": "Savol matni",
    "options": ["A javob", "B javob", "C javob", "D javob"],
    "correctAnswer": 0,
    "explanation": "1-qadam: ... 2-qadam: ... Natija: ...",
    "difficulty": "easy|medium|hard"
  }
]`

    const keysToTry = API_KEYS.length > 0 ? API_KEYS.length : 1
    let lastError: Error | null = null

    for (let attempt = 0; attempt < keysToTry; attempt++) {
      try {
        const genAI = new GoogleGenerativeAI(getNextApiKey())
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
        })
        const result    = await model.generateContent(prompt)
        const questions = robustParseJSON(result.response.text())
        return NextResponse.json({ questions })
      } catch (err: any) {
        console.error(`Gemini attempt ${attempt + 1} error:`, err?.message)
        lastError = err
        if (err.status === 429 || err.message?.includes('quota')) continue
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
