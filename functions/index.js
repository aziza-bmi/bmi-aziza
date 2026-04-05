/**
 * functions/index.js — Firebase Cloud Function
 * 
 * Trigger: Firestore-da yangi topic hujjati yaratilganda
 * Action:  Gemini AI yordamida aynan 25 ta MURAKKAB savol yaratib saqlaydi
 * Deploy:  firebase deploy --only functions
 */
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret }      = require('firebase-functions/params');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { initializeApp }     = require('firebase-admin/app');

initializeApp();
const db = getFirestore();

// Gemini API key — Firebase Secret sifatida saqlash:
// firebase functions:secrets:set GEMINI_API_KEY
const GEMINI_KEY = defineSecret('GEMINI_API_KEY');

// ── Helpers ────────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function robustParseJSON(raw) {
  let t = raw.replace(/^```[\w]*\n?/i, '').replace(/```\s*$/i, '').trim();
  const s = t.indexOf('['), e = t.lastIndexOf(']');
  if (s === -1 || e === -1) throw new Error('JSON array topilmadi');
  t = t.slice(s, e + 1);
  t = t.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
  return JSON.parse(t);
}

// ── Generate 25 high-quality questions ────────────────────────────────────────
async function generate25(apiKey, topicId, topicTitle, content) {
  const prompt = `
Sen GEOMETRIYA fanidan tajribali olimpiada o'qituvchisi.

MAVZU: "${topicTitle}"
DARS MATNI: ${content.slice(0, 4000)}

VAZIFA: Bu mavzu bo'yicha aynan 25 ta professional darajadagi test savoli tuz.

TAQSIMOT (qat'iy):
• 5 ta "easy"    → bir bosqichli, lekin o'ylash talab etadigan
• 10 ta "medium" → 2 bosqichli kombinatsiya
• 10 ta "hard"   → 3+ bosqich, chuqur tahlil yoki murakkab kombinatsiya

SIFAT TALABLARI:
1. To'g'ridan-to'g'ri formulaga son qo'yib hisoblash savollari MUTLAQO TAQIQLANGAN.
2. Har bir savol o'quvchini o'ylashga MAJBUR qilsin — parametr chiqarish, ziddiyat topish, xatoni aniqlash.
3. Chalg'ituvchilar (wrong options) — o'quvchi YO'L QO'YISHI MUMKIN bo'lgan REAL xatolar asosida.
4. explanation — bosqichma-bosqich aniq yechim (kamida 2 qadam).
5. Formulalar: backslash(\\) YOZMANG — JSON buziladi. "S = (a*h)/2", "a^2+b^2=c^2" shaklida.

FAQAT sof JSON array (markdown yo'q, izoh yo'q, backtick yo'q):
[
  {
    "question": "Savol matni",
    "options": ["A javob", "B javob", "C javob", "D javob"],
    "correctAnswer": 0,
    "explanation": "1-qadam: ... 2-qadam: ... Natija: ...",
    "difficulty": "easy|medium|hard"
  }
]`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite-preview',
        generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
      });
      const result = await model.generateContent(prompt);
      const qs     = robustParseJSON(result.response.text());
      if (!Array.isArray(qs) || qs.length === 0) throw new Error("Bo'sh javob");

      return qs.slice(0, 25).map((q, i) => ({
        id:                 `${topicId}_q${i}`,
        question:           q.question           || '',
        options:            q.options            || [],
        correctAnswer:      q.correctAnswer      ?? 0,
        correctAnswerIndex: q.correctAnswer      ?? 0,
        explanation:        q.explanation        || '',
        difficulty:         q.difficulty         || 'medium',
      }));
    } catch (e) {
      const is503 = e.message?.includes('503') || e.message?.includes('high demand');
      console.log(`[AutoQuiz] Urinish ${attempt}/3 xato: ${e.message?.slice(0, 80)}`);
      if (attempt < 3) await sleep(is503 ? 18000 : 8000);
    }
  }
  return null;
}

// ── Firestore onCreate Trigger ─────────────────────────────────────────────────
exports.autoGenerateQuizOnTopicCreate = onDocumentCreated(
  {
    document:       'sections/{sectionId}/chapters/{chapterId}/topics/{topicId}',
    secrets:        [GEMINI_KEY],
    timeoutSeconds: 300,  // 5 daqiqa — 25 savol uchun yetarli
    memory:         '256MiB',
    region:         'europe-west1',
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data      = snap.data();
    const topicId   = event.params.topicId;
    const title     = data.title   || topicId;
    const content   = data.content || '';

    console.log(`[AutoQuiz] Yangi mavzu: "${title}" (${topicId})`);

    if (!content.trim()) {
      console.log('[AutoQuiz] Matn yo\'q — o\'tkazib yuborildi.');
      return;
    }

    const questions = await generate25(GEMINI_KEY.value(), topicId, title, content);

    if (questions && questions.length > 0) {
      await snap.ref.update({
        quiz:              questions,
        quizGeneratedAt:   FieldValue.serverTimestamp(),
        quizGeneratedCount: questions.length,
      });
      console.log(`[AutoQuiz] ✅ ${questions.length} ta savol saqlandi!`);
    } else {
      console.log('[AutoQuiz] ❌ Savollar yaratilmadi.');
    }
  }
);
