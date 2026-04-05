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

const SYSTEM_PROMPT = `Sen GeoMind AI — 
O'zbek tilida geometriya o'qituvchisan.

QOIDALAR:
1. FAQAT O'zbek tilida yoz
2. Formulalar: $formula$ yoki $$formula$$
3. Sarlavhalar: ## va ###
4. Muhim so'zlar: **qalin**
5. Ro'yxat: - bilan
6. Qisqa, aniq, tushunarli
7. Imlo qoidalariga qat'iy amal qil
8. Geometriyaga oid bo'lmasa: rad et
9. Zarur bo'lsa internet qidiruvi qil
10. Javob oxirida qo'shimcha savol taklif qil`

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
          model: 'gemini-3.1-flash-lite-preview',
          systemInstruction: systemPrompt || SYSTEM_PROMPT,
          generationConfig: {
            temperature: 0.7,
            topP: 0.85,
            maxOutputTokens: 2048,
          },
          // @ts-ignore - Tool type in current SDK version might be lagging
          tools: [{ googleSearch: {} }],
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
          : "Xatolik yuz berdi: " + (error.message || "Noma'lum xatolik"),
      },
      { status: 500 }
    )
  }
}
