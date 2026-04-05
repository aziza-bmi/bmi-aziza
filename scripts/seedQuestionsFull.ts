import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
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

console.log('Firebase Init:', firebaseConfig.projectId ? 'OK' : 'MISSING CONFIG');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Question generation logic
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

function shuffleAndFindIndex(options: string[], correctOption: string) {
  const shuffled = [...new Set(options)];
  while (shuffled.length < 4) {
      shuffled.push((parseInt(correctOption) + randomInt(-10, 10)).toString());
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { shuffled: shuffled.slice(0, 4), correctIndex: shuffled.slice(0, 4).indexOf(correctOption) };
}

function generateQuestions(topicId: string, count: number) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    let qText = ''; let correctText = ''; let explanation = ''; let options: string[] = [];

    if (topicId.includes('nuqta') || topicId.includes('chiziq')) {
      const qType = randomInt(1, 3);
      if (qType === 1) {
        const x1 = randomInt(-10, 10); const x2 = randomInt(-10, 10); const dist = Math.abs(x2 - x1);
        qText = `Koordinatalar o'qida A(${x1}) va B(${x2}) nuqtalar orasidagi masofani toping.`;
        correctText = dist.toString(); explanation = `|${x2} - (${x1})| = ${dist}`;
      } else if (qType === 2) {
        const x1 = randomInt(0, 20); const x2 = x1 + randomInt(2, 20) * 2; const mid = (x1 + x2) / 2;
        qText = `A(${x1}) va B(${x2}) kesmaning o'rtasi qaysi nuqtada?`;
        correctText = mid.toString(); explanation = `(${x1} + ${x2}) / 2 = ${mid}`;
      } else {
        const ab = randomInt(10, 50); const ac = randomInt(2, ab - 2); const cb = ab - ac;
        qText = `Uzunligi ${ab} sm bo'lgan AB kesmada C nuqta olingan. Agar AC = ${ac} sm bo'lsa, CB qancha?`;
        correctText = cb.toString(); explanation = `CB = AB - AC = ${ab} - ${ac} = ${cb} sm`;
      }
    } 
    else if (topicId.includes('burchak')) {
      const angle = randomInt(10, 170);
      const isSupplementary = randomInt(0, 1) === 0;
      if (isSupplementary) {
        const sup = 180 - angle;
        qText = `${angle}° li burchakka qo'shni bo'lgan burchakni toping.`;
        correctText = `${sup}`; explanation = `180° - ${angle}° = ${sup}°`;
      } else {
        qText = `${angle}° li burchak qaysi turga kiradi?`;
        if (angle < 90) correctText = "O'tkir"; else if (angle === 90) correctText = "To'g'ri"; else correctText = "O'tmas";
        options = ["O'tkir", "To'g'ri", "O'tmas", "Yoziq"];
        explanation = angle < 90 ? "90° dan kichik burchak o'tkir burchak deyiladi." : angle > 90 ? "90° dan katta 180° dan kichik burchak o'tmas burchak deyiladi" : "90° li burchak to'g'ri burchak deyiladi";
      }
    }
    else if (topicId.includes('pifagor')) {
      const triples = [[3,4,5], [5,12,13], [8,15,17], [6,8,10], [9,12,15], [15,20,25]];
      const triple = randomChoice(triples);
      const isHypotenuse = randomInt(0, 1) === 0;
      if (isHypotenuse) {
        qText = `To'g'ri burchakli uchburchakning katetlari ${triple[0]} va ${triple[1]} ga teng. Gipotenuza uzunligini toping.`;
        correctText = triple[2].toString(); explanation = `Pifagor teoremasiga ko'ra: c = √(${triple[0]}² + ${triple[1]}²) = ${triple[2]}`;
      } else {
        qText = `To'g'ri burchakli uchburchakning gipotenuzasi ${triple[2]}, katetlaridan biri ${triple[0]} ga teng. Ikkinchi katetni toping.`;
        correctText = triple[1].toString(); explanation = `Pifagor teoremasiga ko'ra: b = √(${triple[2]}² - ${triple[0]}²) = ${triple[1]}`;
      }
    }
    else if (topicId.includes('uchburchak')) {
      const ang1 = randomInt(20, 80); const ang2 = randomInt(20, 80); const ang3 = 180 - ang1 - ang2;
      qText = `Uchburchakning ikkita burchagi ${ang1}° va ${ang2}° ga teng. Uchinchi burchagini toping.`;
      correctText = `${ang3}`; explanation = `Uchburchak ichki burchaklari yig'indisi 180°. 180° - (${ang1}° + ${ang2}°) = ${ang3}°`;
    }
    else if (topicId.includes('parallelogramm')) {
      const a = randomInt(5, 20); const h = randomInt(4, 15);
      qText = `Parallelogrammning asosi ${a} sm, unga tushirilgan balandlik ${h} sm. Uning yuzini toping.`;
      correctText = (a * h).toString(); explanation = `S = a × h = ${a} × ${h} = ${a*h}`;
    }
    else if (topicId.includes('kvadrat') || topicId.includes('turtburchak')) {
      const isSquare = randomInt(0, 1) === 0;
      if (isSquare) {
        const side = randomInt(4, 25);
        qText = `Kvadratning tomoni ${side} sm. Uning yuzini toping.`;
        correctText = (side * side).toString(); explanation = `S = a² = ${side}² = ${side*side}`;
      } else {
        const a = randomInt(3, 15); const b = randomInt(4, 20);
        qText = `To'g'ri to'rtburchakning tomonlari ${a} va ${b} sm. Uning perimetrini toping.`;
        correctText = (2 * (a + b)).toString(); explanation = `P = 2 × (${a} + ${b}) = ${2*(a+b)}`;
      }
    }
    else if (topicId.includes('aylana') || topicId.includes('doira')) {
      const r = randomInt(2, 20);
      qText = `Radiusi ${r} ga teng bo'lgan aylananing uzunligini toping (p ≈ 3 ni oling).`;
      correctText = (2 * 3 * r).toString(); explanation = `Aylana uzunligi = 2πR ≈ 2 × 3 × ${r} = ${2 * 3 * r}`;
    }
    else {
      const num1 = randomInt(1, 100); const num2 = randomInt(1, 100);
      qText = `Ushbu matematik ifodani hisoblang: ${num1} + ${num2} qancha?`;
      correctText = (num1 + num2).toString(); explanation = `${num1} + ${num2} = ${num1+num2}`;
    }

    if (options.length === 0) {
      const parsedMatch = correctText.match(/(\d+)/);
      if (parsedMatch) {
         let baseNum = parseInt(parsedMatch[1]);
         options = [
             correctText,
             correctText.replace(baseNum.toString(), (baseNum + randomInt(1, 5)).toString()),
             correctText.replace(baseNum.toString(), (baseNum - randomInt(1, 5)).toString()),
             correctText.replace(baseNum.toString(), (baseNum + randomInt(6, 10)).toString()),
         ];
      } else {
          options = [correctText, "Noto'g'ri variant", "Xato natija", "Boshqa qiymat"];
      }
    }

    const { shuffled, correctIndex } = shuffleAndFindIndex(options, correctText);
    questions.push({
      question: qText,
      options: shuffled,
      correctAnswer: correctIndex, // Ensure it matches schema (rawQuiz uses correctAnswer)
      explanation,
      difficulty: 'intermediate'
    });
  }
  return questions;
}

async function seedAll() {
  console.log('Fetching sections...');
  const sectionsSnap = await getDocs(collection(db, 'sections'));
  
  for (const sDoc of sectionsSnap.docs) {
    console.log(`Processing section: ${sDoc.id}`);
    const chaptersSnap = await getDocs(collection(db, 'sections', sDoc.id, 'chapters'));
    
    for (const cDoc of chaptersSnap.docs) {
      const topicsSnap = await getDocs(collection(db, 'sections', sDoc.id, 'chapters', cDoc.id, 'topics'));
      
      for (const tDoc of topicsSnap.docs) {
        const generated = generateQuestions(tDoc.id, 25);
        console.log(`  -> Injecting 25 questions to topic: ${tDoc.id}`);
        await updateDoc(tDoc.ref, {
          quiz: generated
        });
      }
    }
  }
  console.log('Migration Complete! All topics have 25 questions.');
  process.exit(0);
}

seedAll().catch(e => {
  console.error(e);
  process.exit(1);
});
