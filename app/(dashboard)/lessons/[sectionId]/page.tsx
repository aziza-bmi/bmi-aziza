'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import {
  collection, getDocs, query,
  orderBy, doc, getDoc, where
} from 'firebase/firestore'
import {
  ChevronRight, BookOpen, Star,
  Clock, CheckCircle2, ArrowLeft
} from 'lucide-react'
import PageLoader from '@/components/shared/PageLoader'

export default function SectionPage() {
  const { sectionId } = useParams()
  const { user } = useAuth()
  const [section, setSection] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [completedTopics, setCompletedTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const sectionSnap = await getDoc(
          doc(db, 'sections', sectionId as string)
        )
        if (sectionSnap.exists()) {
           setSection({ id: sectionSnap.id, ...sectionSnap.data() })
        }

        const chaptersSnap = await getDocs(
          query(
            collection(
              db, 'sections', sectionId as string, 'chapters'
            ),
            orderBy('order')
          )
        )

        const chaptersWithTopics = await Promise.all(
          chaptersSnap.docs.map(async (chDoc) => {
            const topicsSnap = await getDocs(
              query(
                collection(
                  db, 'sections', sectionId as string,
                  'chapters', chDoc.id, 'topics'
                ),
                orderBy('order')
              )
            )
            return {
              id: chDoc.id,
              ...chDoc.data(),
              topics: topicsSnap.docs.map(t => ({
                id: t.id, ...t.data()
              }))
            }
          })
        )
        setChapters(chaptersWithTopics)

        if (user) {
          const progressSnap = await getDocs(
            query(
              collection(db, 'userProgress'),
              where('userId', '==', user.uid),
              where('sectionId', '==', sectionId),
              where('completed', '==', true)
            )
          )
          setCompletedTopics(
            progressSnap.docs.map(d => d.data().topicId)
          )
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sectionId, user])

  if (loading) return <PageLoader />
  if (!section) return null

  const difficultyColor: Record<string, string> = {
    beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    intermediate: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    advanced: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  }

  const difficultyLabel: Record<string, string> = {
    beginner: "Boshlang'ich",
    intermediate: "O'rta",
    advanced: 'Murakkab',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 lg:p-8 max-w-4xl"
    >
      {/* Back */}
      <Link href="/lessons"
        className="inline-flex items-center gap-1.5 text-sm
                   text-slate-500 dark:text-slate-400
                   hover:text-indigo-600 dark:hover:text-indigo-400
                   transition-colors mb-6">
        <ArrowLeft size={16} />
        Darslar
      </Link>

      {/* Header */}
      <div className="glass-card dark:bg-slate-800/60
                      dark:border-slate-700/40 p-6 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{section.emoji}</span>
          <div>
            <h1 className="text-2xl font-medium
                           text-slate-800 dark:text-slate-100">
              {section.title}
            </h1>
            <p className="text-sm text-slate-500
                          dark:text-slate-400 mt-0.5">
              {section.subtitle}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs
                            text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {section.chaptersCount} bob
              </span>
              <span className="flex items-center gap-1">
                <Star size={12} />
                {section.topicsCount} mavzu
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} />
                {completedTopics.length} bajarildi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-5">
        {chapters.map((chapter, ci) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.1 }}
          >
            <div className="glass-card dark:bg-slate-800/60
                            dark:border-slate-700/40 overflow-hidden">
              {/* Chapter header */}
              <div className="px-5 py-4 border-b border-slate-100
                              dark:border-slate-700/40
                              bg-slate-50/50 dark:bg-slate-800/30">
                <h2 className="text-base font-medium
                               text-slate-800 dark:text-slate-100">
                  {chapter.title}
                </h2>
                <p className="text-xs text-slate-400
                              dark:text-slate-500 mt-0.5">
                  {chapter.topics.length} ta mavzu •{' '}
                  {chapter.topics.filter(
                    (t: any) => completedTopics.includes(t.id)
                  ).length} bajarildi
                </p>
              </div>

              {/* Topics */}
              <div className="divide-y divide-slate-100
                              dark:divide-slate-700/30">
                {chapter.topics.map((topic: any, ti: number) => {
                  const done = completedTopics.includes(topic.id)
                  const isFirst = ti === 0
                  const prevDone = ti === 0 ||
                    completedTopics.includes(chapter.topics[ti-1]?.id)
                  const locked = !prevDone && ti > 0

                  return (
                    <Link
                      key={topic.id}
                      href={locked ? '#' :
                        `/lessons/${sectionId}/${chapter.id}/${topic.id}`}
                      className={`flex items-center gap-4 px-5 py-4
                                 transition-all
                                 ${locked
                                   ? 'opacity-50 cursor-not-allowed'
                                   : 'hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 cursor-pointer'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex-shrink-0
                                       flex items-center justify-center
                                       ${done
                                         ? 'bg-green-100 dark:bg-green-900/30'
                                         : 'bg-indigo-50 dark:bg-indigo-900/20'}`}>
                        {done ? (
                          <CheckCircle2 size={16}
                            className="text-green-600 dark:text-green-400" />
                        ) : (
                          <span className="text-xs font-medium
                                           text-indigo-600 dark:text-indigo-400">
                            {ti + 1}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium
                                      text-slate-800 dark:text-slate-100
                                      truncate">
                          {topic.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1
                                           text-xs text-slate-400">
                            <Clock size={11} />
                            {topic.duration} daq
                          </span>
                          <span className={`text-[11px] px-1.5 py-0.5
                                           rounded-full font-medium
                                           ${difficultyColor[topic.difficulty]}`}>
                            {difficultyLabel[topic.difficulty]}
                          </span>
                          <span className="text-xs text-amber-500
                                           flex items-center gap-0.5">
                            <Star size={11} />
                            +{topic.xpReward} XP
                          </span>
                        </div>
                      </div>

                      {!locked && !done && (
                        <ChevronRight size={16}
                          className="text-slate-300 dark:text-slate-600
                                     flex-shrink-0" />
                      )}
                      {done && (
                        <span className="text-xs text-green-600
                                         dark:text-green-400 flex-shrink-0">
                          ✓
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
