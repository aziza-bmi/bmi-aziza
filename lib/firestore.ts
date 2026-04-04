import {
  doc, getDoc, setDoc, updateDoc, addDoc,
  collection, query, where, orderBy, limit,
  getDocs, onSnapshot, increment, serverTimestamp,
  Timestamp, getCountFromServer
} from 'firebase/firestore'
import { db } from './firebase'

export interface UserDocument {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  level: number
  xp: number
  streak: number
  lastActiveDate: string       // 'YYYY-MM-DD'
  totalLessonsCompleted: number
  totalQuizzesTaken: number
  averageQuizScore: number
  role: 'student' | 'admin'
  createdAt: Timestamp
  lastActiveAt: Timestamp
}

export interface LessonDocument {
  id: string
  title: string
  topic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  order: number
  duration: number             // minutes
  content: string
  xpReward: number
  isActive: boolean
}

export interface UserProgressDocument {
  userId: string
  lessonId: string
  completed: boolean
  completedAt: Timestamp | null
  timeSpent: number            // seconds
}

export interface QuizResultDocument {
  userId: string
  topic: string
  score: number                // percentage
  correctAnswers: number
  totalQuestions: number
  timeTaken: number            // seconds
  xpEarned: number
  completedAt: Timestamp
}

export interface QuizQuestion {
  id: string
  text: string
  options: string[]
  correctIndex: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  chapterId: string
  createdAt: Timestamp
}

export interface UserQuestionState {
  userId: string
  questionId: string
  status: 'correct' | 'incorrect'
  totalAttempts: number
  lastAttemptAt: Timestamp
}

export interface ChatDocument {
  userId: string
  userMessage: string
  aiMessage: string
  timestamp: Timestamp
}

// Get user data
export async function getUserData(uid: string) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  return snap.exists() ? snap.data() as UserDocument : null
}

// Update user XP and level
export async function addXP(uid: string, amount: number) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) return

  const current = snap.data() as UserDocument
  const newXP = current.xp + amount
  const newLevel = Math.floor(newXP / 500) + 1

  await updateDoc(userRef, {
    xp: newXP,
    level: newLevel,
    lastActiveAt: serverTimestamp(),
  })

  return { newXP, newLevel, leveledUp: newLevel > current.level }
}

// Update streak
export async function updateStreak(uid: string) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) return

  const user = snap.data() as UserDocument
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString().split('T')[0]

  if (user.lastActiveDate === today) return

  const newStreak = user.lastActiveDate === yesterday
    ? user.streak + 1
    : 1

  await updateDoc(userRef, {
    streak: newStreak,
    lastActiveDate: today,
    lastActiveAt: serverTimestamp(),
  })

  return newStreak
}

// Complete a lesson
export async function completeLesson(uid: string, lessonId: string, xpReward: number) {
  const progressId = `${uid}_${lessonId}`
  const progressRef = doc(db, 'userProgress', progressId)
  const snap = await getDoc(progressRef)

  if (snap.exists() && snap.data().completed) return null

  await setDoc(progressRef, {
    userId: uid,
    lessonId,
    completed: true,
    completedAt: serverTimestamp(),
    timeSpent: 0,
  })

  await updateDoc(doc(db, 'users', uid), {
    totalLessonsCompleted: increment(1),
    lastActiveAt: serverTimestamp(),
  })

  const xpResult = await addXP(uid, xpReward)
  await updateStreak(uid)

  return xpResult
}

// Save quiz result
export async function saveQuizResult(
  uid: string,
  topicId: string,
  score: number, // correct count
  total: number, // total questions
  timeTaken: number, // seconds
  config: any
) {
  const percentage = Math.round((score / total) * 100)
  
  // Calculate XP reward
  let xpEarned = 0
  if (percentage === 100) xpEarned = 50
  else if (percentage >= 80) xpEarned = 35
  else if (percentage >= 60) xpEarned = 20
  else if (percentage >= 40) xpEarned = 10

  // Record detailed attempt
  await addDoc(collection(db, 'quizResults'), {
    userId: uid,
    topicId,
    score: percentage,
    correctAnswers: score,
    totalQuestions: total,
    timeTaken,
    xpEarned,
    config,
    completedAt: serverTimestamp(),
  })

  // Update user statistics
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    totalQuizzesTaken: increment(1),
    [`stats.totalCorrectAnswers`]: increment(score),
    [`stats.totalQuestionsSeen`]: increment(total),
    lastActiveAt: serverTimestamp(),
  })

  // Add XP and handle level up
  const xpResult = await addXP(uid, xpEarned)
  await updateStreak(uid)

  return { 
    xpEarned, 
    percentage, 
    leveledUp: xpResult?.leveledUp || false,
    newLevel: xpResult?.newLevel || 1
  }
}

// Get user progress for all lessons
export async function getUserProgress(uid: string) {
  const q = query(
    collection(db, 'userProgress'),
    where('userId', '==', uid),
    where('completed', '==', true)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

// Get quiz results for user
export async function getUserQuizResults(uid: string) {
  const q = query(
    collection(db, 'quizResults'),
    where('userId', '==', uid),
    orderBy('completedAt', 'desc'),
    limit(10)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

// Get leaderboard (top users by XP)
export async function getLeaderboard(limitCount = 10) {
  const q = query(
    collection(db, 'users'),
    orderBy('xp', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d, i) => ({
    rank: i + 1,
    ...d.data() as UserDocument
  }))
}

// Get user rank based on XP (Counts how many users have more XP)
export async function getUserRank(xp: number): Promise<number> {
  const q = query(
    collection(db, 'users'),
    where('xp', '>', xp)
  )
  const snapshot = await getCountFromServer(q)
  return snapshot.data().count + 1 
}

// Get topic progress percentages
export async function getTopicProgress(uid: string) {
  const results = await getUserQuizResults(uid)
  
  const topics = [
    'planimetriya', 'uchburchaklar', 'tortburchaklar',
    'doiralar', 'koppurchaklar', 'koordinatalar', 'stereometriya'
  ]

  const topicScores: Record<string, number[]> = {}
  
  results.forEach((r: any) => {
    if (!topicScores[r.topic]) topicScores[r.topic] = []
    topicScores[r.topic].push(r.score)
  })

  return topics.map(topic => ({
    topic,
    progress: topicScores[topic]
      ? Math.round(
          topicScores[topic].reduce((a, b) => a + b, 0) /
          topicScores[topic].length
        )
      : 0
  }))
}

// Real-time user data listener
export function subscribeToUserData(
  uid: string,
  callback: (data: UserDocument) => void
) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) callback(snap.data() as UserDocument)
  })
}
