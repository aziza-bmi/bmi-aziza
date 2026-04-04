'use client'

import { useState } from 'react'
import { Plus, Trash2, Wand2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswerIndex: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface QuizEditorProps {
  topicId: string
  sectionId: string
  chapterId: string
  topicTitle: string
  initialContent: string
  currentQuizData?: QuizQuestion[]
}

export default function QuizEditor({ 
  topicId, 
  sectionId, 
  chapterId, 
  topicTitle, 
  initialContent, 
  currentQuizData = [] 
}: QuizEditorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(currentQuizData)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chapterTitle: topicTitle, 
          chapterContent: initialContent,
          count: 10 // Let's do 10 per click to avoid timeouts
        }),
      })
      
      const data = await response.json()
      if (data.questions) {
        setQuestions([...questions, ...data.questions])
      }
    } catch (err) {
      console.error('Generation failed:', err)
      alert('AI generatsiyada xatolik yuz berdi.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const docRef = doc(db, 'sections', sectionId, 'chapters', chapterId, 'topics', topicId)
      await updateDoc(docRef, {
        quiz: questions
      })
      alert('Testlar muvaffaqiyatli saqlandi!')
    } catch (err) {
      console.error('Save failed:', err)
      alert('Saqlashda xatolik yuz berdi.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setQuestions(newQuestions)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const addEmptyQuestion = () => {
    setQuestions([...questions, {
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
      difficulty: 'medium'
    }])
    setExpandedIndex(questions.length)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800">Test Savollari ({questions.length})</h3>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generatsiya...' : 'AI bilan yaratish'}
          </button>
          <button
            onClick={addEmptyQuestion}
            className="flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> Savol qo'shish
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || questions.length === 0}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md shadow-indigo-500/20"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black">{idx + 1}</span>
                <p className="font-bold text-slate-700 line-clamp-1">{q.question || 'Yangi savol...'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] uppercase font-black px-2 py-1 rounded ${
                  q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {q.difficulty}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {expandedIndex === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {expandedIndex === idx && (
              <div className="p-6 border-t border-slate-50 bg-slate-50/30 space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Savol matni (LaTeX mumkin)</label>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${idx}`}
                        checked={q.correctAnswerIndex === optIdx}
                        onChange={() => updateQuestion(idx, 'correctAnswerIndex', optIdx)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...q.options]
                          newOptions[optIdx] = e.target.value
                          updateQuestion(idx, 'options', newOptions)
                        }}
                        className={`flex-1 p-3 rounded-xl border ${q.correctAnswerIndex === optIdx ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 bg-white'} text-sm font-medium outline-none`}
                        placeholder={`Variant ${String.fromCharCode(65 + optIdx)}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Tushuntirish (Explanation)</label>
                  <textarea
                    value={q.explanation}
                    onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Qiyinchilik:</label>
                  <select
                    value={q.difficulty}
                    onChange={(e) => updateQuestion(idx, 'difficulty', e.target.value)}
                    className="p-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 outline-none"
                  >
                    <option value="easy">Oson</option>
                    <option value="medium">O'rta</option>
                    <option value="hard">Qiyin</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}

        {questions.length === 0 && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wand2 className="w-10 h-10 text-slate-300" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">Hozircha testlar yo'q</h4>
            <p className="text-slate-500 text-sm mb-8 font-medium">Ushbu dars uchun AI orqali testlarni generatsiya qilishingiz yoki qo'lda qo'shishingiz mumkin.</p>
            <button
               onClick={handleGenerateAI}
               disabled={isGenerating}
               className="btn-gradient px-8 py-4 rounded-2xl text-sm font-bold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center gap-2 mx-auto"
            >
               {isGenerating ? 'Generatsiya qilinmoqda...' : 'AI bilan bir zumda yaratish'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
