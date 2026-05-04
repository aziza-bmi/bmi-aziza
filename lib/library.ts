import {
  collection, getDocs, addDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp, Timestamp, getDoc, updateDoc
} from 'firebase/firestore'
import { db } from './firebase'

export interface LibraryBook {
  id: string
  title: string
  author?: string
  grade: number
  coverUrl?: string
  pdfUrl: string
  description?: string
  pages?: number
  publishedYear?: number
  createdAt?: Timestamp
}

export async function getLibraryBooks(): Promise<LibraryBook[]> {
  const q = query(collection(db, 'libraryBooks'), orderBy('grade', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryBook))
}

export async function addLibraryBook(book: Omit<LibraryBook, 'id' | 'createdAt'>) {
  return addDoc(collection(db, 'libraryBooks'), {
    ...book,
    createdAt: serverTimestamp(),
  })
}

export async function deleteLibraryBook(id: string) {
  return deleteDoc(doc(db, 'libraryBooks', id))
}

export async function updateLibraryBook(id: string, data: Partial<LibraryBook>) {
  return updateDoc(doc(db, 'libraryBooks', id), data)
}
