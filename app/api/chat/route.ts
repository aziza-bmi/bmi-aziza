import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// Vercel Environment Variables:
// GEMINI_API_KEY   — asosiy kalit
// GEMINI_API_KEY_1 — qo'shimcha (round-robin uchun)
// GEMINI_API_KEY_2 — qo'shimcha
// GEMINI_API_KEY_3 — qo'shimcha
const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter((k): k is string => Boolean(k))

let currentKeyIndex = 0
function getNextApiKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error('Hech qanday GEMINI_API_KEY topilmadi. Vercel Environment Variables-ni tekshiring.')
  }
  const key = API_KEYS[currentKeyIndex % API_KEYS.length]
  currentKeyIndex++
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
9. Javob oxirida qo'shimcha savol taklif qil`

export async function POST(request: NextRequest) {
  try {
    const { message, history, systemPrompt } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Xabar bo'sh bo'lmasligi kerak" },
        { status: 400 }
      )
    }

    // Log env keys availability (server-side only — Vercel logs-da ko'rinadi)
    console.log(`[chat] Available API keys: ${API_KEYS.length}`)

    let lastError: Error | null = null
    const attempts = Math.max(API_KEYS.length, 1)

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const apiKey = getNextApiKey()
        const genAI  = new GoogleGenerativeAI(apiKey)

        const model = genAI.getGenerativeModel({
          model: 'gemini-3.1-flash-lite-preview',
          systemInstruction: systemPrompt || SYSTEM_PROMPT,
          generationConfig: {
            temperature:     0.7,
            topP:            0.85,
            maxOutputTokens: 2048,
          },
        })

        // Faqat alternating (user/model) tarix — Gemini talabi
        const rawHistory = (history || []).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }))

        const chatHistory: any[] = []
        for (const msg of rawHistory) {
          if (chatHistory.length === 0) {
            if (msg.role === 'user') chatHistory.push(msg)
          } else {
            const prev = chatHistory[chatHistory.length - 1]
            if (prev.role !== msg.role) {
              chatHistory.push(msg)
            } else {
              prev.parts[0].text += '\n' + msg.parts[0].text
            }
          }
        }

        const chat    = model.startChat({ history: chatHistory })
        const result  = await chat.sendMessage(message)
        const response = result.response.text()

        return NextResponse.json({ message: response })

      } catch (err: any) {
        console.error(`[chat] Attempt ${attempt + 1} failed:`, err?.message)
        lastError = err
        // Quota yoki rate limit — keyingi kalit bilan urinib ko'r
        if (
          err.status === 429 ||
          err.message?.includes('quota') ||
          err.message?.includes('rate') ||
          err.message?.includes('503')
        ) {
          continue
        }
        // Boshqa xatolik — qayta urinishning keragi yo'q
        throw err
      }
    }

    throw lastError || new Error("Barcha API kalitlar ishlamayapti")

  } catch (error: any) {
    console.error('[chat] Final error:', error?.message)

    const isQuota  = error.message?.includes('quota') || error.message?.includes('429')
    const noKey    = error.message?.includes('GEMINI_API_KEY topilmadi')
    const is503    = error.message?.includes('503') || error.message?.includes('high demand')
    const notFound = error.message?.includes('not found') || error.message?.includes('404')

    let userMsg = "Xatolik yuz berdi. Iltimos qaytadan urining."
    if (isQuota)  userMsg = "AI kvotasi tugagan. Biroz kutib qaytadan urining."
    if (is503)    userMsg = "AI hozir band. 1-2 daqiqadan so'ng urining."
    if (noKey)    userMsg = "Server konfiguratsiyasida xatolik. Admin bilan bog'laning."
    if (notFound) userMsg = "Ko'rsatilgan AI modeli topilmadi. Admin bilan bog'laning."

    return NextResponse.json({ error: userMsg }, { status: 500 })
  }
}
