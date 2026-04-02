import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[]

let currentKeyIndex = 0

function getNextApiKey(): string {
  const key = API_KEYS[currentKeyIndex]
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
  return key
}

const SYSTEM_PROMPT = `Siz GeoMind AI — professional geometriya 
o'qituvchisisiz. Faqat geometriya va matematika mavzularida 
javob bering. 

Qoidalar:
1. Har doim O'zbek tilida javob bering
2. Tushuntirishlarni bosqichma-bosqich bering
3. Formulalarni aniq va chiroyli ko'rsating
4. Misol va masalalar keltiring
5. Agar geometriyadan tashqari savol bo'lsa:
   "Kechirasiz, men faqat geometriya bo'yicha 
    savollarga javob beraman" deng
6. Javoblarni qisqa va tushunarli qiling
7. Muhim tushunchalarni ** ** orasida yozing

Mavzular: Planimetriya, Stereometriya, Uchburchaklar, 
Doiralar, Ko'pburchaklar, Koordinatalar, Vektorlar`

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Xabar bo\'sh bo\'lmasligi kerak' },
        { status: 400 }
      )
    }

    let lastError: Error | null = null
    
    for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
      try {
        const apiKey = getNextApiKey()
        const genAI = new GoogleGenerativeAI(apiKey)
        
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: SYSTEM_PROMPT,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            maxOutputTokens: 1024,
          },
        })

        const chatHistory = (history || []).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }))

        const chat = model.startChat({ history: chatHistory })
        const result = await chat.sendMessage(message)
        const response = result.response.text()

        return NextResponse.json({
          message: response,
          keyUsed: attempt + 1,
        })

      } catch (err: any) {
        lastError = err
        if (err.status === 429 || err.message?.includes('quota')) {
          continue
        }
        throw err
      }
    }

    throw lastError || new Error('Barcha API keylar ishlamayapti')

  } catch (error: any) {
    console.error('Gemini API error:', error)
    return NextResponse.json(
      {
        error: error.message?.includes('quota')
          ? 'AI hozir band. Biroz kutib qaytadan urining.'
          : 'Xatolik yuz berdi. Qaytadan urining.',
      },
      { status: 500 }
    )
  }
}
