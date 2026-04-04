import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const { content, topic, count = 5 } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      Siz geografiya va qat'iy fanlar (geodeziya, kartografiya) bo'yicha mutaxassissiz. 
      Quyidagi dars matni asosida ${count} ta yuqori sifatli test savollarini tuzing.
      
      Dars: ${topic}
      Matn: ${content}
      
      Talablar:
      1. Savollar dars mazmuniga to'liq mos bo'lsin.
      2. Har bir savolda 4 ta variant bo'lsin.
      3. To'g'ri javob indeksini (0-3) ko'rsating.
      4. Nima uchun aynan shu javob to'g'riligini qisqacha tushuntiring (explanation).
      5. Javobni faqat JSON formatida qaytaring.
      
      Format:
      [
        {
          "question": "Savol matni",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0,
          "explanation": "Tushuntirish..."
        }
      ]
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Clean JSON from markdown if needed
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    const questions = JSON.parse(jsonStr)

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error generating quiz:', error)
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 })
  }
}
