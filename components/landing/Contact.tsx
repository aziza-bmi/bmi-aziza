'use client'

import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

const INPUT_CLS = `w-full px-4 py-3 rounded-xl
  border border-slate-200 dark:border-slate-600
  bg-white/80 dark:bg-slate-700/80
  text-slate-800 dark:text-slate-100
  placeholder:text-slate-400 dark:placeholder:text-slate-500
  focus:outline-none focus:ring-2 focus:ring-indigo-600/20
  focus:border-indigo-500 dark:focus:border-indigo-500
  transition-all`

export default function Contact() {
  return (
    <section className="py-14 md:py-24 w-full max-w-6xl mx-auto px-4 sm:px-6 relative z-10" id="contact">
      <div className="text-center mb-10 md:mb-16">
        <span className="text-indigo-600 dark:text-indigo-400 font-medium px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-sm">Bog'lanish</span>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-medium mt-4 md:mt-6 mb-3 md:mb-4 text-slate-900 dark:text-white">Savolingiz bormi?</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm md:text-lg">
          Jamoamiz 24 soat ichida javob beradi. Istalgan savol yoki taklifingizni yuboring.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 bg-white/90 dark:bg-slate-800/70 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-2 md:p-3 shadow-2xl shadow-indigo-100/40 dark:shadow-none">
        
        {/* Chap qism - Kontakt ma'lumotlar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-slate-50 dark:bg-slate-900 rounded-[20px] p-6 md:p-10 flex flex-col h-full border border-slate-100 dark:border-slate-800 shadow-inner text-slate-800 dark:text-white"
        >
          <h3 className="text-xl font-semibold mb-6 md:mb-8 text-slate-800 dark:text-white">Aloqa ma'lumotlari</h3>
          
          <div className="space-y-5 md:space-y-6 flex-grow">
            {[
              { icon: Mail, bg: 'bg-indigo-100 dark:bg-indigo-500/20', color: 'text-indigo-600 dark:text-indigo-300', label: 'Email', value: 'hello@fazo.uz', href: 'mailto:hello@fazo.uz' },
              { icon: Phone, bg: 'bg-blue-100 dark:bg-blue-500/20', color: 'text-blue-600 dark:text-blue-300', label: 'Telefon', value: '+998 55 500 12 34', href: 'tel:+998555001234' },
              { icon: MapPin, bg: 'bg-emerald-100 dark:bg-emerald-500/20', color: 'text-emerald-600 dark:text-emerald-300', label: 'Manzil', value: 'Toshkent sh., IT Park (2-bino)', href: null },
              { icon: Clock, bg: 'bg-amber-100 dark:bg-amber-500/20', color: 'text-amber-600 dark:text-amber-300', label: 'Ish vaqti', value: 'Du–Jum: 9:00–18:00', href: null },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-slate-800 dark:text-slate-100 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-slate-800 dark:text-slate-100 font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-200 dark:border-slate-700/50">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Ijtimoiy tarmoqlar</p>
            <div className="flex gap-3">
              {[
                { label: 'Twitter', d: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z', type: 'path' },
                { label: 'Instagram', rects: true, type: 'instagram' },
                { label: 'Youtube', type: 'youtube' },
                { label: 'LinkedIn', type: 'linkedin' },
              ].map((s, i) => (
                <a key={i} href="#" aria-label={s.label} className="w-10 h-10 rounded-full bg-white shadow-sm dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {i === 0 && <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>}
                    {i === 1 && <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></>}
                    {i === 2 && <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></>}
                    {i === 3 && <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* O'ng qism - Forma */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3 p-6 md:p-10 flex flex-col justify-center"
        >
          <h3 className="text-xl font-semibold mb-6 md:mb-8 text-slate-800 dark:text-slate-100">Xabar yuborish</h3>
          
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Ismingiz</label>
                <input type="text" placeholder="Ali Valiyev" className={INPUT_CLS} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                <input type="email" placeholder="ali@example.com" className={INPUT_CLS} />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Mavzu</label>
              <input type="text" placeholder="Hamkorlik haqida" className={INPUT_CLS} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Xabaringiz</label>
              <textarea 
                rows={5}
                placeholder="Savolingizni yozing..." 
                className={INPUT_CLS + ' resize-none'}
              ></textarea>
            </div>
            
            <button className="w-full btn-gradient py-3.5 rounded-xl font-medium text-white shadow-lg flex justify-center items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Yuborish
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
