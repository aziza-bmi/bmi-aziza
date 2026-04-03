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

const SYSTEM_PROMPT = `Siz GeoMind AI — professional geometriya o'qituvchisisiz. Faqat geometriya va matematika mavzularida javob bering.

MUHIM FORMATLASH QOIDALARI:
1. Sarlavhalar uchun ## dan foydalaning (### kichik sarlavha)
2. Formulalar uchun LaTeX ishlatish MAJBURIY:
   - Inline: $a^2 + b^2 = c^2$
   - Blok (alohida satr): $$a^2 + b^2 = c^2$$
3. Ro'yxatlar uchun - (tire) ishlating
4. Muhim so'zlar uchun **qalin** ishlating (kamroq)
5. Tushuntirishni qisqa, aniq va bosqichma-bosqich bering

JAVOB STRUKTURASI:
## Mavzu nomi

Qisqa kirish (1-2 jumla)

### Ta'rif
...

### Formula
$$formula$$

### Misol
...

QOIDALAR:
- Har doim O'zbek tilida javob bering
- Geometriyadan tashqari savolga: "Kechirasiz, men faqat geometriya bo'yicha javob beraman"
- Formulalarni LaTeX bilan yozing
- Misollar keltiring
- Javobni 300-500 so'z bilan cheklang`

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
          model: 'gemini-2.5-flash',
          systemInstruction: SYSTEM_PROMPT,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            maxOutputTokens: 1024,
          },
        })

        let rawHistory = (history || []).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }))
        
        let chatHistory: any[] = []
        for (const msg of rawHistory) {
           if (chatHistory.length === 0) {
              if (msg.role === 'user') chatHistory.push(msg)
           } else {
              if (chatHistory[chatHistory.length - 1].role !== msg.role) {
                 chatHistory.push(msg)
              } else {
                 chatHistory[chatHistory.length - 1].parts[0].text += '\n' + msg.parts[0].text
              }
           }
        }

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
