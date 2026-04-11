// scripts/clearUserQuestionStates.js
// Bu script userQuestionStates kolleksiyasidagi BARCHA hujjatlarni o'chiradi
// Ishlatish: node scripts/clearUserQuestionStates.js

const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const path = require('path')

// Service account yoki Application Default Credentials
let app
try {
  // Agar service-account.json mavjud bo'lsa
  const serviceAccount = require('../service-account.json')
  app = initializeApp({ credential: cert(serviceAccount) })
} catch {
  // Yo'q bo'lsa — firebase CLI login-dan foydalanadi
  const { applicationDefault } = require('firebase-admin/app')
  app = initializeApp({ credential: applicationDefault(), projectId: 'aziza-bmi-86ac8' })
}

const db = getFirestore()

async function deleteCollection(collectionPath, batchSize = 400) {
  const ref = db.collection(collectionPath)
  let deleted = 0

  while (true) {
    const snap = await ref.limit(batchSize).get()
    if (snap.empty) break

    const batch = db.batch()
    snap.docs.forEach(doc => batch.delete(doc.ref))
    await batch.commit()
    deleted += snap.docs.length
    console.log(`  ✅ ${deleted} ta hujjat o'chirildi...`)
  }

  console.log(`\n🟢 Jami ${deleted} ta hujjat o'chirildi: "${collectionPath}"`)
  return deleted
}

async function main() {
  console.log('🗑️  userQuestionStates kolleksiyasini tozalash...\n')
  await deleteCollection('userQuestionStates')
  console.log('\n✨ Takrorlash bo\'limi tozalandi!')
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Xatolik:', err.message)
  process.exit(1)
})
