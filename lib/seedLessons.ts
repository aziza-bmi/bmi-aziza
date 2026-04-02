import { collection, writeBatch, doc } from 'firebase/firestore'
import { db } from './firebase'

export const LESSONS_DATA = [
  {
    id: 'lesson-1',
    title: 'Planimetriya asoslari',
    topic: 'planimetriya',
    difficulty: 'beginner',
    order: 1,
    duration: 10,
    xpReward: 30,
    isActive: true,
    content: `
# Planimetriya asoslari

Planimetriya — tekis figuralar geometriyasi.

## Asosiy tushunchalar

**Nuqta** — geometriyaning eng asosiy elementi.
**Chiziq** — cheksiz ko'p nuqtalar to'plami.
**Tekislik** — ikki o'lchovli fazо.

## Burchaklar
- O'tkir burchak: 0° dan 90° gacha
- To'g'ri burchak: 90°
- O'tmas burchak: 90° dan 180° gacha
    `
  },
  {
    id: 'lesson-2',
    title: 'Nuqta, chiziq, tekislik',
    topic: 'planimetriya',
    difficulty: 'beginner',
    order: 2,
    duration: 12,
    xpReward: 30,
    isActive: true,
    content: `# Nuqta, chiziq, tekislik tushunchalari`
  },
  {
    id: 'lesson-3',
    title: 'Burchaklar va turlari',
    topic: 'planimetriya',
    difficulty: 'beginner',
    order: 3,
    duration: 15,
    xpReward: 40,
    isActive: true,
    content: `# Burchaklar va ularning turlari`
  },
  {
    id: 'lesson-4',
    title: 'Uchburchak va uning turlari',
    topic: 'uchburchaklar',
    difficulty: 'intermediate',
    order: 4,
    duration: 18,
    xpReward: 50,
    isActive: true,
    content: `# Uchburchaklar`
  },
  {
    id: 'lesson-5',
    title: 'Pifagor teoremasi',
    topic: 'uchburchaklar',
    difficulty: 'intermediate',
    order: 5,
    duration: 20,
    xpReward: 60,
    isActive: true,
    content: `# Pifagor teoremasi: a² + b² = c²`
  },
  {
    id: 'lesson-6',
    title: "Uchburchak yuzi va perimetri",
    topic: 'uchburchaklar',
    difficulty: 'intermediate',
    order: 6,
    duration: 15,
    xpReward: 50,
    isActive: true,
    content: `# Uchburchak yuzi va perimetri`
  },
  {
    id: 'lesson-7',
    title: "To'rtburchaklar",
    topic: 'tortburchaklar',
    difficulty: 'intermediate',
    order: 7,
    duration: 18,
    xpReward: 50,
    isActive: true,
    content: `# To'rtburchaklar turlari`
  },
  {
    id: 'lesson-8',
    title: 'Doira va uning elementlari',
    topic: 'doiralar',
    difficulty: 'advanced',
    order: 8,
    duration: 22,
    xpReward: 70,
    isActive: true,
    content: `# Doira: radius, diametr, yoy`
  },
  {
    id: 'lesson-9',
    title: "Ko'pburchaklar",
    topic: 'koppurchaklar',
    difficulty: 'advanced',
    order: 9,
    duration: 25,
    xpReward: 70,
    isActive: true,
    content: `# Ko'pburchaklar va ularning xossalari`
  },
]

export async function seedLessons() {
  const batch = writeBatch(db)
  LESSONS_DATA.forEach(lesson => {
    const ref = doc(collection(db, 'lessons'), lesson.id)
    batch.set(ref, lesson)
  })
  await batch.commit()
  console.log('Lessons seeded successfully!')
}
