import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// 1. Manually load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.replace(/\\n/gm, '\n');
      }
      value = value.replace(/(^['"]|['"]$)/g, '').trim();
      process.env[key] = value;
    }
  });
}

// 2. Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Initialize AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function generateEliteQuiz(lessonTopic: string, lessonContent: string, count: number = 15) {
    const prompt = `
Sen oliy toifali geometriya o'qituvchisi va olimisan. 
Quyidagi dars matni asosida ${count} ta yuqori darajadagi, tahliliy va mantiqiy test savollarini tuz.

Mavzu: ${lessonTopic}
Dars matni: ${lessonContent.slice(0, 4000)}

DIQQAT! SAVOLLARGA QO'YILADIGAN QAT'IY TALABLAR:
1. SAVOL DARALARI: Oddiy sonlarni qo'shish/ayirish darajasidagi savollar QAT'IYAN MAN ETILADI. Savollar tahliliy va kamida 2-3 bosqichli mantiqiy fikrlashni talab qilsin.
2. MURAKKABLIK: Savol ichida bir parametrni topish uchun boshqa bir xossadan foydalanish (masalan, yuzadan perimetrga o'tish, burchaklardan foydalanib tomonni topish) majburiy.
3. FORMAT: Barcha matematik formulalar, burchaklar va belgilar qat'iy ravishda LaTeX ($...$) formatida bo'lishi shart. Masalan: $x^2 + y^2 = r^2$, $\angle ABC = 90^\circ$, $S = \frac{1}{2}ah$.
4. IZOH (Explanation): Har bir savol uchun yechim yo'li bosqichma-bosqich, o'quvchi tushunadigan tilda tushuntirilsin.
5. VARIANTLAR: 4 ta variant bo'lsin. Chalg'ituvchi javoblar o'quvchi yo'l qo'yishi mumkin bo'lgan tipik xatolar asosida tuzilsin.

Javobni FAQAT quyidagi JSON array formatida qaytaring (boshqa hech narsa yozmang):
[
  {
    "question": "Savol matni (LaTeX bilan)",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Bosqichma-bosqich yechim yo'li...",
    "difficulty": "hard"
  }
]
`;

    try {
        const result = await model.generateContent(prompt);
        const rawText = result.response.text();
        const match = rawText.match(/\[[\s\S]*\]/);
        const jsonStr = match ? match[0] : rawText;
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error(`AI Error for ${lessonTopic}:`, e);
        return null;
    }
}

async function upgradeAll() {
  console.log('--- STARTING ELITE QUIZ UPGRADE ---');
  const sectionsSnap = await getDocs(collection(db, 'sections'));
  
  for (const sDoc of sectionsSnap.docs) {
    const chaptersSnap = await getDocs(collection(db, 'sections', sDoc.id, 'chapters'));
    for (const cDoc of chaptersSnap.docs) {
      const topicsSnap = await getDocs(collection(db, 'sections', sDoc.id, 'chapters', cDoc.id, 'topics'));
      
      for (const tDoc of topicsSnap.docs) {
        const topicData = tDoc.data();
        const topicTitle = topicData.title || tDoc.id;
        const topicContent = topicData.content || '';

        console.log(`Processing Topic: ${topicTitle} (${tDoc.id})...`);
        
        const eliteQuiz = await generateEliteQuiz(topicTitle, topicContent, 10);
        
        if (eliteQuiz && Array.isArray(eliteQuiz)) {
          // Add unique IDs to questions for spaced repetition
          const quizWithIds = eliteQuiz.map((q, idx) => ({
            ...q,
            id: `${tDoc.id}_q${Date.now()}_${idx}`
          }));

          await updateDoc(tDoc.ref, { quiz: quizWithIds });
          console.log(`  ✅ Successfully updated with ${quizWithIds.length} high-quality questions.`);
        } else {
          console.error(`  ❌ Failed to generate quiz for ${topicTitle}.`);
        }
        
        // Brief pause to avoid API rate limits
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  console.log('--- ALL TOPICS UPGRADED SUCCESSFULLY ---');
  process.exit(0);
}

upgradeAll().catch(e => {
  console.error('Fatal Migration Error:', e);
  process.exit(1);
});
