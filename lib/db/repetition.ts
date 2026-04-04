import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, increment, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface QuestionState {
  userId: string
  questionId: string
  topicId: string
  correctCount: number
  incorrectCount: number
  lastAttemptAt: Timestamp
  nextReviewAt: Timestamp
  interval: number // in days
  easeFactor: number
}

/**
 * SuperMemo-2 (SM-2) simplified algorithm
 * q: quality of response (0-5)
 * interval: previous interval
 * easeFactor: previous ease factor
 */
function calculateNextReview(q: number, prevInterval: number, prevEase: number) {
  let ease = prevEase + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  if (ease < 1.3) ease = 1.3

  let interval = 0
  if (q >= 3) {
    if (prevInterval === 0) interval = 1
    else if (prevInterval === 1) interval = 6
    else interval = Math.round(prevInterval * ease)
  } else {
    interval = 1 // Reset to 1 day if failed
  }

  return { interval, ease }
}

export async function updateQuestionState(
  userId: string,
  questionId: string,
  topicId: string,
  isCorrect: boolean
) {
  const stateId = `${userId}_${questionId}`
  const stateRef = doc(db, 'userQuestionStates', stateId)
  const snap = await getDoc(stateRef)

  let currentState: QuestionState
  
  if (snap.exists()) {
    currentState = snap.data() as QuestionState
  } else {
    currentState = {
      userId,
      questionId,
      topicId,
      correctCount: 0,
      incorrectCount: 0,
      lastAttemptAt: Timestamp.now(),
      nextReviewAt: Timestamp.now(),
      interval: 0,
      easeFactor: 2.5
    }
  }

  const quality = isCorrect ? 5 : 0 // Simplified: 5 for correct, 0 for wrong
  const { interval, ease } = calculateNextReview(
    quality, 
    currentState.interval, 
    currentState.easeFactor
  )

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  const updateData = {
    ...currentState,
    correctCount: increment(isCorrect ? 1 : 0),
    incorrectCount: increment(isCorrect ? 0 : 1),
    lastAttemptAt: serverTimestamp(),
    nextReviewAt: Timestamp.fromDate(nextReviewDate),
    interval: interval,
    easeFactor: ease
  }

  await setDoc(stateRef, updateData, { merge: true })
}

export async function getDueQuestions(userId: string) {
  const q = query(
    collection(db, 'userQuestionStates'),
    where('userId', '==', userId),
    where('nextReviewAt', '<=', Timestamp.now())
  )
  const snap = await getDocs(q)
  return snap.docs.map(doc => doc.data() as QuestionState)
}
