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
      a: "Ha, platformaning asosiy qismlari barcha baribir bepul. Qo\'shimcha premium imkoniyatlar (masalan, cheksiz AI so\'rovlar) uchun obuna bo\'lishingiz mumkin."
    },
    {
      q: "Qanday bilim darajasi talab qilinadi?",
      a: "Platforma barcha darajalar uchun moslashtirilgan. Siz o\'z darajangizni belgilaysiz, va AI sizga mos darslarni taqdim etadi."
    },
    {
      q: "AI Muallim qanday ishlaydi?",
      a: "AI Muallim OpenAI va maxsus tayyorlangan matematik modellar yordamida ishlaydi. U savollaringizni tahlil qilib, nafaqat to\'g\'ri javobni beradi, balki yechim yo\'lini bosqichma-bosqich tushuntiradi."
    },
    {
      q: "Interaktiv Canvas nima?",
      a: "Interaktiv Canvas yordamida siz geometrik shakllarni vizual tarzda chizishingiz va parametrlarini o\'zgartirishingiz mumkin. AI siz chizgan shakllar ustida masalalar tuzib beradi."
    },
    {
      q: "Testlar qanday tuzilgan?",
      a: "Testlar sizning oldingi natijalaringiz va zaif tomonlaringizga asoslanib dinamik tarzda tuziladi. Har bir noto\'g\'ri javob uchun batafsil izoh beriladi."
    },
    {
      q: "Platforma mobil qurilmalarda ishlaydimi?",
      a: "Ha, GeoMind barcha qurilmalar (Smartfon, Planshet va Noutbuklar) uchun to'liq responsiv qilib ishlangan."
    },
    {
      q: "Ota-onalar farzandining natijasini kuzata oladimi?",
      a: "Ota-onalar paneli orqali farzandingizning o\'zlashtirishi, qancha vaqt sarflayotgani va zaif tomonlari ko\'rsatib boriladi."
    }
  ]

  return (
    <section className="py-24 w-full max-w-4xl mx-auto px-6 relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-medium mt-2 mb-4 text-slate-900">Ko'p beriladigan savollar</h2>
        <p className="text-slate-500 text-lg">Platforma haqida qisqacha ma'lumotlar</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Accordion className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl px-6 data-[state=open]:shadow-md transition-all">
              <AccordionTrigger className="text-left font-medium text-slate-800 hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-500 leading-relaxed pb-6 text-base">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  )
}
