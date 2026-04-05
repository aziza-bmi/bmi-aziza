import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'

const googleProvider = new GoogleAuthProvider()

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName })
  await createUserDocument(result.user, displayName)
  return result.user
}

export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  await createUserDocument(
    result.user,
    result.user.displayName || 'Foydalanuvchi'
  )
  return result.user
}

export async function logout() {
  await signOut(auth)
}

export async function createUserDocument(user: User, displayName: string) {
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName,
      photoURL: user.photoURL || null,
      level: 1,
      xp: 0,
      streak: 0,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    })
  }
}

export async function updateUserAuthProfile(user: User, displayName: string, photoURL: string) {
  await updateProfile(user, { displayName, photoURL })
}

export async function updateUserAuthPassword(user: User, oldPassword: string, newPassword: string) {
  if (!user.email) throw new Error("Email yo'q");
  const credential = EmailAuthProvider.credential(user.email, oldPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/user-not-found': "Bu email topilmadi",
    'auth/wrong-password': "Parol noto'g'ri",
    'auth/invalid-credential': "Email yoki parol noto'g'ri",
    'auth/email-already-in-use': "Bu email allaqachon ro'yxatdan o'tgan",
    'auth/weak-password': "Parol kamida 6 ta belgi bo'lishi kerak",
    'auth/invalid-email': "Email noto'g'ri formatda",
    'auth/too-many-requests': "Ko'p urinish. Biroz kutib turing",
    'auth/popup-closed-by-user': "Google kirish bekor qilindi",
    'auth/requires-recent-login': "Xavfsizlik uchun hisobingizga qaytadan kirishingiz kerak",
  }
  return messages[code] || "Xatolik yuz berdi. Qaytadan urining"
}
