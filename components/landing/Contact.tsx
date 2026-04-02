'use client'

import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Contact() {
  return (
    <section className="py-24 w-full max-w-6xl mx-auto px-6 relative z-10" id="contact">
      <div className="text-center mb-16">
        <span className="text-indigo-600 font-medium px-4 py-1.5 rounded-full bg-indigo-50 text-sm">Bog'lanish</span>
        <h2 className="text-3xl md:text-5xl font-medium mt-6 mb-4 text-slate-900">Savolingiz bormi?</h2>
        <p className="text-slate-500 max-w-xl mx-auto text-lg">
          Jamoamiz 24 soat ichida javob beradi. Istalgan savol yoki taklifingizni yuboring.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white/60 backdrop-blur-xl border border-slate-100 rounded-3xl p-6 md:p-10 shadow-xl shadow-indigo-100/20">
        
        {/* Chap qism - Kontakt ma'lumotlar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-slate-50 rounded-2xl p-8 flex flex-col h-full border border-slate-100"
        >
          <h3 className="text-xl font-semibold mb-8 text-slate-800">Aloqa ma'lumotlari</h3>
          
          <div className="space-y-6 flex-grow">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Email</p>
                <a href="mailto:info@geomind.ai" className="text-slate-800 font-medium hover:text-indigo-600 transition-colors">info@geomind.ai</a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Telefon</p>
                <a href="tel:+998711234567" className="text-slate-800 font-medium hover:text-indigo-600 transition-colors">+998 71 123 45 67</a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Manzil</p>
                <p className="text-slate-800 font-medium">Toshkent, O'zbekiston</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Ish vaqti</p>
                <p className="text-slate-800 font-medium">Du–Jum: 9:00–18:00</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-4">Ijtimoiy tarmoqlar</p>
            <div className="flex gap-3">
              {['T', 'I', 'Y', 'L'].map((social, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all font-medium">
                  {social}
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
          className="lg:col-span-3 p-2 md:p-6"
        >
          <h3 className="text-xl font-semibold mb-8 text-slate-800">Xabar yuborish</h3>
          
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Ismingiz</label>
                <input 
                  type="text" 
                  placeholder="Ali Valiyev" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-slate-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input 
                  type="email" 
                  placeholder="ali@example.com" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-slate-800"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Mavzu</label>
              <input 
                type="text" 
                placeholder="Hamkorlik haqida" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-slate-800"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Xabaringiz</label>
              <textarea 
                rows={5}
                placeholder="Savolingizni yozing..." 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-slate-800 resize-none"
              ></textarea>
            </div>
            
            <button className="w-full btn-gradient py-4 rounded-xl font-medium text-white shadow-lg flex justify-center items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Yuborish
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
