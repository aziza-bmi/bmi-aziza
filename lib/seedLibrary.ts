import { db } from './firebase'
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'

const BOOKS = [
  {
    title: 'Geometriya 7',
    author: "A. Abduhamidov, N. Mirzayev",
    grade: 7,
    pdfUrl: 'https://drive.google.com/file/d/1p7DvK8UVdoWm8jw53JFbv6eS7FGEtCMF/preview',
    description: "7-sinf o'quvchilari uchun geometriya darsligi.",
    pages: 192,
    publishedYear: 2023,
    coverUrl: '',
  },
  {
    title: 'Geometriya 8',
    author: "A. Abduhamidov, N. Mirzayev",
    grade: 8,
    pdfUrl: 'https://drive.google.com/file/d/1odt4OSSXFoONtFvPu0_COb9yZ9-9yj7I/preview',
    description: "8-sinf uchun geometriya darsligi.",
    pages: 208,
    publishedYear: 2023,
    coverUrl: '',
  },
  {
    title: 'Geometriya 9',
    author: "A. Abduhamidov, N. Mirzayev",
    grade: 9,
    pdfUrl: 'https://drive.google.com/file/d/1K_f9eoykerBmYuA-apBX03hC3RYdTmdv/preview',
    description: "9-sinf uchun geometriya darsligi.",
    pages: 224,
    publishedYear: 2023,
    coverUrl: '',
  },
  {
    title: 'Geometriya 10',
    author: "A. Abduhamidov, N. Mirzayev",
    grade: 10,
    pdfUrl: 'https://drive.google.com/file/d/1_zqkTuJCo2icY5avsJOgAIOf87uWYeNS/preview',
    description: "10-sinf uchun geometriya darsligi.",
    pages: 240,
    publishedYear: 2023,
    coverUrl: '',
  },
]

export async function seedLibraryBooks() {
  const col = collection(db, 'libraryBooks')
  let added = 0

  for (const book of BOOKS) {
    // Check if already exists
    const existing = await getDocs(query(col, where('grade', '==', book.grade)))
    if (existing.empty) {
      await addDoc(col, { ...book, createdAt: serverTimestamp() })
      added++
      console.log(`✅ Added: ${book.title}`)
    } else {
      console.log(`⏭️ Already exists: ${book.title}`)
    }
  }

  return added
}
