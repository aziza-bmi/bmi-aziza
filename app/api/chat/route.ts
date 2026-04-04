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

const SYSTEM_PROMPT = `Siz GeoMind AI — O'zbek tilida
geometriya o'qituvchisiz.

FORMATLASH QOIDALARI (MAJBURIY):
1. Formulalar uchun LaTeX MAJBURIY:
   - Inline: $a^2 + b^2 = c^2$  
   - Blok: $$a^2 + b^2 = c^2$$
2. Sarlavhalar: ## va ### ishlatilsin
3. Ro'yxatlar uchun - (tire) ishlating
4. Muhim atamalar: **qalin** formatda
5. Hech qachon yulduzchalar (* *) ni oddiy matnda ishlatmang
6. Javobni 200-400 so'z bilan cheklang
7. Har doim O'zbek tilida
8. Geometriyadan tashqari savollarga: 
   "Men faqat geometriya bo'yicha yordam bera olaman"`

export async function POST(request: NextRequest) {
  try {
    const { message, history, systemPrompt } = await request.json()

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
          systemInstruction: systemPrompt || SYSTEM_PROMPT,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            maxOutputTokens: 8192,
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
