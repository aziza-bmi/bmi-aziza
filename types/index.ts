export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: Date
  level: number
  xp: number
  streak: number
}

export interface Lesson {
  id: string
  title: string
  topic: Topic
  content: string
  order: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface UserProgress {
  userId: string
  lessonId: string
  completed: boolean
  score?: number
  completedAt?: Date
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  topic: Topic
}

export type Topic =
  | 'planimetriya'
  | 'uchburchaklar'
  | 'tortburchaklar'
  | 'doiralar'
  | 'koppurchaklar'
  | 'stereometriya'
  | 'koordinatalar'
