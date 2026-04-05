import * as fs from 'fs'

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

function shuffleAndFindIndex(options: string[], correctOption: string): { shuffled: string[], correctIndex: number } {
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

function generateQuestions(topicId: string, count: number): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    let qText = '';
    let correctText = '';
    let explanation = '';
    let options: string[] = [];

    if (topicId === 'nuqta-chiziq-kesma') {
      const qType = randomInt(1, 3);
      if (qType === 1) {
        const x1 = randomInt(-10, 10);
        const x2 = randomInt(-10, 10);
        const dist = Math.abs(x2 - x1);
        qText = `Koordinatalar o'qida A(${x1}) va B(${x2}) nuqtalar orasidagi masofani toping.`;
        correctText = dist.toString();
        explanation = `|${x2} - (${x1})| = ${dist}`;
      } else if (qType === 2) {
        const x1 = randomInt(0, 20);
        const x2 = x1 + randomInt(2, 20) * 2;
        const mid = (x1 + x2) / 2;
        qText = `A(${x1}) va B(${x2}) kesmaning o'rtasi qaysi nuqtada?`;
        correctText = mid.toString();
        explanation = `(${x1} + ${x2}) / 2 = ${mid}`;
      } else {
        const ab = randomInt(10, 50);
        const ac = randomInt(2, ab - 2);
        const cb = ab - ac;
        qText = `Uzunligi ${ab} sm bo'lgan AB kesmada C nuqta olingan. Agar AC = ${ac} sm bo'lsa, CB qancha?`;
        correctText = cb.toString();
        explanation = `CB = AB - AC = ${ab} - ${ac} = ${cb} sm`;
      }
    } 
    else if (topicId === 'burchak-turlari') {
      const angle = randomInt(10, 170);
      const isSupplementary = randomInt(0, 1) === 0;
      if (isSupplementary) {
        const sup = 180 - angle;
        qText = `${angle}° li burchakka qo'shni bo'lgan burchakni toping.`;
        correctText = `${sup}°`;
        explanation = `180° - ${angle}° = ${sup}°`;
      } else {
        qText = `${angle}° li burchak qaysi turga kiradi?`;
        if (angle < 90) correctText = "O'tkir";
        else if (angle === 90) correctText = "To'g'ri";
        else correctText = "O'tmas";
        options = ["O'tkir", "To'g'ri", "O'tmas", "Yoziq"];
        explanation = angle < 90 ? "90° dan kichik burchak o'tkir burchak deyiladi." : angle > 90 ? "90° dan katta 180° dan kichik burchak o'tmas burchak deyiladi" : "90° li burchak to'g'ri burchak deyiladi";
      }
    }
    else if (topicId === 'pifagor-teoremasi') {
      const triples = [[3,4,5], [5,12,13], [8,15,17], [6,8,10], [9,12,15], [15,20,25]];
      const triple = randomChoice(triples);
      const isHypotenuse = randomInt(0, 1) === 0;
      if (isHypotenuse) {
        qText = `To'g'ri burchakli uchburchakning katetlari ${triple[0]} va ${triple[1]} ga teng. Gipotenuza uzunligini toping.`;
        correctText = triple[2].toString();
        explanation = `c = √(${triple[0]}² + ${triple[1]}²) = √(${triple[0]*triple[0]} + ${triple[1]*triple[1]}) = ${triple[2]}`;
      } else {
        qText = `To'g'ri burchakli uchburchakning gipotenuzasi ${triple[2]}, katetlaridan biri ${triple[0]} ga teng. Ikkinchi katetni toping.`;
        correctText = triple[1].toString();
        explanation = `b = √(${triple[2]}² - ${triple[0]}²) = ${triple[1]}`;
      }
    }
    else if (topicId === 'parallelogramm') {
      const a = randomInt(5, 20);
      const h = randomInt(4, 15);
      qText = `Parallelogrammning asosi ${a} sm, unga tushirilgan balandlik ${h} sm. Uning yuzini toping.`;
      correctText = (a * h).toString();
      explanation = `S = a × h = ${a} × ${h} = ${a*h}`;
    }
    else if (topicId === 'kvadrat-turtburchak') {
      const isSquare = randomInt(0, 1) === 0;
      if (isSquare) {
        const side = randomInt(4, 25);
        qText = `Kvadratning tomoni ${side} sm. Uning yuzini toping.`;
        correctText = (side * side).toString();
        explanation = `S = a² = ${side}² = ${side*side}`;
      } else {
        const a = randomInt(3, 15);
        const b = randomInt(4, 20);
        qText = `To'g'ri to'rtburchakning tomonlari ${a} va ${b} sm. Uning perimetrini toping.`;
        correctText = (2 * (a + b)).toString();
        explanation = `P = 2 × (${a} + ${b}) = ${2*(a+b)}`;
      }
    }
    else if (topicId === 'uchburchak-turlari') {
        const ang1 = randomInt(20, 80);
        const ang2 = randomInt(20, 80);
        const ang3 = 180 - ang1 - ang2;
        qText = `Uchburchakning ikkita burchagi ${ang1}° va ${ang2}° ga teng. Uchinchi burchagini toping.`;
        correctText = `${ang3}°`;
        explanation = `180° - (${ang1}° + ${ang2}°) = ${ang3}°`;
    }
    else {
      // Generic fallback for unmapped topics
      const num1 = randomInt(1, 100);
      const num2 = randomInt(1, 100);
      qText = `(Osnoy tushunchalar test) ${num1} + ${num2} qancha?`;
      correctText = (num1 + num2).toString();
      explanation = `Oddiy arifmetika. ${num1} + ${num2} = ${num1+num2}`;
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
          options = [correctText, "Noto'g'ri variant A", "Noto'g'ri variant B", "Noto'g'ri variant C"];
      }
    }

    const { shuffled, correctIndex } = shuffleAndFindIndex(options, correctText);
    questions.push({
      question: qText,
      options: shuffled,
      correctIndex,
      explanation,
      difficulty: 'intermediate'
    });
  }

  return questions;
}

const topics = [
  'nuqta-chiziq-kesma', 'burchak-turlari', 'uchburchak-turlari', 
  'pifagor-teoremasi', 'uchburchak-yuzi', 'parallelogramm', 
  'kvadrat-turtburchak', 'doira-elementlari', 'koppurchaklar'
];

const result: Record<string, Question[]> = {};

topics.forEach(topic => {
  result[topic] = generateQuestions(topic, 25);
});

fs.writeFileSync('generated_25_questions.json', JSON.stringify(result, null, 2));
console.log('Successfully generated JSON with 25 questions per topic!');
