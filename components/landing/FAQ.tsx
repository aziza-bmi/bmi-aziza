'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from "framer-motion"

export default function FAQ() {
  const faqs = [
    {
      q: "GeoMind bepulmi?",
      a: "Ha, platformaning asosiy bo'limlari hisob yaratgan barcha uchun bepul. Sun'iy intellektdan cheksiz foydalanish va ilg'or funksiyalar uchun maxsus obuna tizimi ham mavjud."
    },
    {
      q: "Qanday bilim darajasi talab qilinadi?",
      a: "Platforma barcha yoshdagi o'quvchilar uchun moslashtirilgan. Siz o'z darajangizni belgilaganingizdan so'ng, tizim aynan malakangizga mos darslarni va masalalarni taqdim etadi."
    },
    {
      q: "Ai muallim qanday ishlaydi?",
      a: "Murakkab generativ va riyoziy modellar yordamida ishlaydi. U savollaringizning mantig'ini tushunib, nafaqat to'g'ri javobni beradi, balki yechimni to'liq tasviriy tushuntiradi."
    },
    {
      q: "Interaktiv canvas nima?",
      a: "Canvas yordamida siz geometrik shakllarni xuddi laboratoriyadagidek vizual tarzda chizishingiz va qiymatlarini o'zgartirib tajriba qilishingiz mumkin."
    },
    {
      q: "Testlar tizimi qanday ishlaydi?",
      a: "Testlar sizning oldingi natijalaringiz o'sishiga qarab dinamik tarzda murakkablashadi. Xato qilingan masalalar uchun esa batafsil AI izohlari beriladi."
    },
    {
      q: "Barcha qurilmalarda ishlaydimi?",
      a: "Tizim to'liq responsiv bo'lib, mobil telefonlar, planshetlar va kompyuterlar ekrani uchun maxsus moslashuvchan dizaynga ega."
    },
    {
      q: "Ota-onalar farzandining natijasini ko'radimi?",
      a: "Albatta, maxsus panel orqali farzandingiz aynan qaysi mavzularda qiynalayotganini va platformada qancha vaqt sarflayotganini kuzatib borishingiz mumkin."
    }
  ]

  return (
    <section className="py-14 md:py-24 w-full max-w-4xl mx-auto px-4 sm:px-6 relative z-10" id="faq">
      <div className="text-center mb-10 md:mb-16">
        <span className="text-indigo-600 dark:text-indigo-400 font-medium px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-sm">Savollar</span>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium mt-4 md:mt-6 mb-3 md:mb-4 text-slate-900 dark:text-white">Ko'p beriladigan savollar</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg">Platforma imkoniyatlari haqida qisqacha ma'lumotlar</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Accordion className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl px-2 sm:px-6 data-[state=open]:shadow-lg data-[state=open]:bg-white dark:data-[state=open]:bg-slate-900 transition-all duration-300 overflow-hidden">
              <AccordionTrigger className="text-left font-semibold text-slate-800 dark:text-slate-200 hover:no-underline py-5 px-4 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed text-base px-0 pb-5">
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-5 mx-4 shadow-sm">
                  {faq.a}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  )
}
