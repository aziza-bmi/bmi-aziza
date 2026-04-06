'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import {
  collection, getDocs, query,
  where, orderBy
} from 'firebase/firestore'
import {
  BookOpen, ChevronRight, Lock,
  CheckCircle2, Star, Clock
} from 'lucide-react'
import PageLoader from '@/components/shared/PageLoader'

interface Section {
  id: string
  title: string
  subtitle: string
  description: string
  emoji: string
  color: string
  order: number
  chaptersCount: number
  topicsCount: number
}

export default function LessonsPage() {
  const { user } = useAuth()
  const [sections, setSections] = useState<Section[]>([])
  const [completedTopics, setCompletedTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const sectionsSnap = await getDocs(
          query(collection(db, 'sections'), orderBy('order'))
        )
        setSections(
          sectionsSnap.docs.map(d => ({
            id: d.id, ...d.data()
          })) as Section[]
        )

        if (user) {
          const progressSnap = await getDocs(
            query(
              collection(db, 'userProgress'),
              where('userId', '==', user.uid),
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
  }, [user])

  if (loading) return <PageLoader />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 lg:p-8 max-w-5xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-medium
                       text-slate-800 dark:text-slate-100 mb-2">
          Darslar
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Geometriyaning ikki asosiy bo'limini o'rganing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, i) => {
          const completedInSection = completedTopics.length
          const progress = section.topicsCount > 0
            ? Math.round((completedInSection / section.topicsCount) * 100)
            : 0

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              <Link href={`/lessons/${section.id}`}>
                <div className="glass-card dark:bg-slate-800/60
                                dark:border-slate-700/40
                                p-6 cursor-pointer group
                                hover:shadow-lg transition-all
                                hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{section.emoji}</div>
                    <ChevronRight size={20}
                      className="text-slate-300 dark:text-slate-600
                                 group-hover:text-indigo-500
                                 group-hover:translate-x-1
                                 transition-all" />
                  </div>

                  <h2 className="text-xl font-medium
                                 text-slate-800 dark:text-slate-100 mb-1">
                    {section.title}
                  </h2>
                  <p className="text-sm text-slate-500
                                dark:text-slate-400 mb-1">
                    {section.subtitle}
                  </p>
                  <p className="text-xs text-slate-400
                                dark:text-slate-500 mb-5 leading-relaxed">
                    {section.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-xs
                                  text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen size={13} />
                      {section.chaptersCount} bob
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={13} />
                      {section.topicsCount} mavzu
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 dark:text-slate-500">
                        Progress
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400
                                       font-medium">
                        {completedInSection} / {section.topicsCount}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700
                                    rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: i * 0.2 }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${section.color}, ${section.color}99)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
