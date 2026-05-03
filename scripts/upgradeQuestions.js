/**
 * upgradeQuestions.js
 * 
 * Har bir mavzu (topic) uchun aynan 25 ta MURAKKAB, SIFATLI savol yaratadi.
 * - Model: gemini-3.1-flash-lite-preview
 * - Har bir savol kamida 2-3 bosqichli mantiqiy fikrlash talab qiladi
 * - easy/medium/hard aralash (5/10/10 nisbatda)
 * - Retry: 503 xatoda 3 urinishgacha
 */
const { initializeApp }      = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc } = require('firebase/firestore');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs   = require('fs');
const path = require('path');

// ── 1. Load .env.local ────────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m) process.env[m[1]] = (m[2] || '').replace(/(^['"]|['"]$)/g, '').trim();
  });
}

// ── 2. Firebase ───────────────────────────────────────────────────────────────
initializeApp({
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore();

// ── 3. Gemini keys round-robin ────────────────────────────────────────────────
const KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);
let keyIdx = 0;
const nextKey = () => KEYS[(keyIdx++) % KEYS.length] || process.env.GEMINI_API_KEY;

// ── 4. Robust JSON parser ─────────────────────────────────────────────────────
function parseAIJson(raw) {
  // Strip markdown fences
  let t = raw.replace(/^```[\w]*\n?/i, '').replace(/```\s*$/i, '').trim();
  // Extract only the JSON array
  const s = t.indexOf('['), e = t.lastIndexOf(']');
  if (s === -1 || e === -1) throw new Error('JSON array topilmadi');
  t = t.slice(s, e + 1);
  // Fix unescaped backslashes (e.g. from LaTeX)
  t = t.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
  return JSON.parse(t);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── 5. Core: generate exactly 25 high-quality questions ──────────────────────
async function generate25(topicId, title, content) {
  const prompt = `
Sen GEOMETRIYA fanidan tajribali olimpiada o'qituvchisi va muallifiSan.

MAVZU: "${title}"
DARS MATNI:
${content.slice(0, 4000)}

VAZIFA: Bu mavzu bo'yicha aynan 25 ta professional darajadagi test savoli tuz.

── TAQSIMOT ──
• 5 ta "easy"   → Formulani to'g'ri tanlash, oddiy bir bosqichli hisob (lekin o'ylash talab etiladi)
• 10 ta "medium" → Kamida 2 bosqich: bir natijadan ikkinchisini chiqarish
• 10 ta "hard"   → 3+ bosqich: murakkab kombinatsiya, chuqur tahlil yoki qiyosiy mantiq

── SIFAT TALABLARI ──
1. HECH QACHON shunchaki to'g'ridan to'g'ri formulaga son qo'yib hisoblaydigan savol YOZMA — bu ENG KAM DARAJALI savol.
2. Har bir savol o'quvchini o'ylashga MAJBUR QILSIN: masalan parametrlarni bir-biridan chiqarish, ziddiyatli ma'lumotlardan to'g'ri natija topish, nima noto'g'riligini aniqlash.
3. Chalg'ituvchi javoblar (distractors) — o'quvchi yo'l qo'yishi mumkin bo'lgan REAL xatolar asosida. "Umuman boshqa son" emas.
4. explanation — bosqichma-bosqich yechim yo'li, tushuntirish bilan.
5. Formulalar: backslash(\) YOZMANG (JSON buziladi). "a^2 + b^2 = c^2", "S = (a * h) / 2", "P = 2(a + b)" ko'rinishida.

── JAVOB FORMATI ──
Faqat sof JSON array. Markdown yo'q. Backtick yo'q. Izoh yo'q:
[
  {
    "question": "Savol matni (formulani so'z/belgi bilan)",
    "options": ["A javob", "B javob", "C javob", "D javob"],
    "correctAnswer": 0,
    "explanation": "1-qadam: ... 2-qadam: ... Natija: ...",
    "difficulty": "easy|medium|hard"
  }
]`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const genAI = new GoogleGenerativeAI(nextKey());
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite-preview',
        generationConfig: {
          temperature:     0.9,  // ijodiy, takrorlanmaslik uchun
          maxOutputTokens: 8192,
        },
      });

      const result = await model.generateContent(prompt);
      const qs     = parseAIJson(result.response.text());

      if (!Array.isArray(qs) || qs.length === 0) throw new Error("Bo'sh javob");

      // Stamp unique IDs
      return qs.slice(0, 25).map((q, i) => ({
        id:                 `${topicId}_q${i}`,
        question:           q.question           || '',
        options:            q.options            || [],
        correctAnswer:      q.correctAnswer      ?? 0,
        correctAnswerIndex: q.correctAnswer      ?? 0,
        explanation:        q.explanation        || '',
        difficulty:         q.difficulty         || 'medium',
      }));
    } catch (err) {
      const is503 = err.message?.includes('503') || err.message?.includes('high demand');
      console.log(`      ⚠️  Urinish ${attempt}/3: ${err.message?.slice(0, 90)}`);
      if (attempt < 3) await sleep(is503 ? 18000 : 7000);
    }
  }
  return null;
}

// ── 6. Main ───────────────────────────────────────────────────────────────────
async function upgradeAll() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  FAZO — 25 ta SIFATLI SAVOL (har mavzu uchun) ║');
  console.log('║  Model : gemini-3.1-flash-lite-preview            ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const sections = await getDocs(collection(db, 'sections'));
  let num = 0, ok = 0, fail = 0;

  for (const sDoc of sections.docs) {
    console.log(`\n📂 ${sDoc.id}`);
    const chapters = await getDocs(collection(db, 'sections', sDoc.id, 'chapters'));

    for (const cDoc of chapters.docs) {
      console.log(`  📖 ${cDoc.id}`);
      const topics = await getDocs(
        collection(db, 'sections', sDoc.id, 'chapters', cDoc.id, 'topics')
      );

      for (const tDoc of topics.docs) {
        num++;
        const data    = tDoc.data();
        const title   = data.title   || tDoc.id;
        const content = data.content || '';

        process.stdout.write(`    📄 [${num}] ${title} ... `);

        if (!content.trim()) {
          console.log('⏭️  (matn yo\'q)');
          fail++;
          continue;
        }

        const questions = await generate25(tDoc.id, title, content);

        if (questions && questions.length > 0) {
          await updateDoc(tDoc.ref, { quiz: questions });
          console.log(`✅ ${questions.length} ta savol saqlandi`);
          ok++;
        } else {
          console.log('❌ Muvaffaqiyatsiz');
          fail++;
        }

        // Rate limit: 8s between topics
        if (num > 1) await sleep(8000);
      }
    }
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log(`║  JAMI: ${ok} ✅ muvaffaqiyatli | ${fail} ❌ muvaffaqiyatsiz`);
  console.log('╚══════════════════════════════════════════════════╝');
  process.exit(0);
}

upgradeAll().catch(e => { console.error('Fatal:', e); process.exit(1); });
