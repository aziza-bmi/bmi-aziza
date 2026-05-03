# 🗺 Fazo AI — Loyiha Passporti

## 1. Asosiy Ma'lumotlar
- **Loyiha nomi:** Fazo AI (yoki avvalgi GeoLab)
- **Loyihaning mohiyati:** Fazo AI — o'quvchilar va talabalar uchun mo'ljallangan, sun'iy intellekt (Gemini AI) bilan integratsiya qilingan innovatsion geometriya o'rganish platformasi. Unda virtual asboblar vositasida geometrik shakllarni interaktiv chizish, darslarni tizimli o'zlashtirish va shaxsiy mini-testlar yechish orqali reyting (XP) yig'ib borish imkoniyati mavjud.
- **Holati:** Ishlab chiqarishga chiqarilgan (Production ready) / Vercel da xosting qilingan.

---

## 2. Texnologiyalar Steki (Tech Stack)
Loyihaning yadrosi zamonaviy va yuqori tezlikda ishlovchi freymvorklardan tashkil topgan:
- **Frontend (UI & Logic):** Next.js (App Router), React, TypeScript.
- **Dizayn va Stil:** Tailwind CSS, Framer Motion (animatsiyalar), Lucide React (ikonkalar).
- **Backend va Ma'lumotlar Bazasi:** Firebase (Authentication, Firestore Database, Storage, Security Rules).
- **Sun'iy Intellekt:** Google Gemini AI API (`@google/generative-ai`) — tizimli promptlash asosida chizma tahlili, savol-javob va chizmalar yaratish uchun mantiq.
- **Maxsus Kutubxonalar:** 
  - `react-markdown`, `remark-math`, `rehype-katex` — masalalar va teoremalarda aniq matematik formulalarni (LaTeX) chiqarish uchun.
  - Native HTML5 `<canvas>` API — geometrik proyeksiyalar va masshtablarni hisoblash asosi sifatida.

---

## 3. Hozirgi Tizim Imkoniyatlari (Features in v1.0)
Hozirda loyihamizda quyidagilar 100% ishlashga tayyor holda shakllangan:

1. **Autentifikatsiya (Firebase Auth):** Elektron pochta va parol bilan xavfsiz ro'yxatdan o'tish hamda tizimga kirish (.env maxfisligi ostida ishlaydi).
2. **Pro Canvas Engine (Chizish maydoni):**
   - Istalgan geometrik shakl (to'rtburchak, doira, uchburchak, vektor, ko'pburchak) chizish, rang berish va tahrirlash (Drag and Drop moduli ulandi).
   - *Zoom In/Out* va cheksiz sahnani surish (*Hand tool - Pan*).
   - Chizilgan har bir shaklni lokal xotiraga (storage) avtomatik saqlash va PNG qilib eksport qilish (yuklab olish).
   - Interaktiv dinamik o'lchovlar: har bir figuraning "label" qiymatini sahnaning o'zida yozib almashtirganda mos ravishda proporsional razmer o'zgarishi.
3. **AI Rejimi (GeoLab AI):**
   - *So'rash* - Har qanday oddiy geometriya haqidagi savollarga javob olish.
   - *Masala tuzish* - Sun'iy intellekt maxsus JSON ma'lumot generatsiya qiladi. Ekrandagi matematik masala o'ziga xos chizmasi (topilishi kerak bo'lgan tomonni `?` shaklida ifodalab) bilan Canvas doskasiga chizib beriladi.
   - Barcha AI javoblaridan chizish logikasi (JSON kodlar) tizim fonida mijozga ko'rsatilmasdan tozalanadi (Formatlash mexanizmi).
4. **Darslar qismi (Curriculum):**
   - Ikki asosiy yo'nalish: *Planimetriya* (tekislik geometriasi) va *Stereometriya* (fazoviy geometriya). Har bir yo'nalish bob va qismlarga taqsimlangan.
   - Bobdagi darslarni va videolarni to'liq ko'rib bo'lgach, "Mini-Test" jarayoni boshlanadi. Agar to'g'ri topsa, foydalanuvchiga *XP* (Tajriba ballari) beriladi. Yechilgan boblar qulfdan yechilib, saqlab qolinadi.
5. **Dashboard va Foydalanuvchi Profili:** Umumiy to'plagan ball, kunlik kirish statiskalari, progress hisobi (Firebase `userProgress` ro'yxatida yuritiladi).

---

## 4. Ma'lumotlar Bazasi (Firestore) Arxitekturasi
Xavfsizlik qoidalari sozlangan jami quyidagi Collections saqlanadi:
- `users`: Barcha platforma a'zolarining umumiy XP yig'indisi, kunlik kirish izlari.
- `sections` (Planimetriya/Stereometriya) -> subcollection `chapters` -> subcollection `topics` (barcha kontent va testlar ushbu sxemada saqlanadi).
- `userProgress`: Qaysi o'quvchi qaysi topic ni tugatgani va necha ball olgani `userId_topicId` unikal ID ostida saqlanadi.
- `drawings`: O'quvchilar tomonidan saqlangan (save tugmasi) PNG formatidagi eskizlarning bulutli arxivi.

---

## 5. Kelajakka Dastur (Roadmap: Next Steps)
Bular kelgusida dastur imkoniyatini mutlaqo "raqobatchisi yo'q" ekotizimga aylantirishga turtki bo'ladi:

🔵 **UI / UX Tomonidan:**
1. **Liderlar Maydoni (Leaderboard):** Barcha o'quvchilarni olgan *XP* lari o'sish dinamikasi bo'yicha global TOP 10 ro'yxatini shakllantirish, o'rtasida motivatsion musobaqani yaratish.
2. **Murakkab 3D Obyektlar Sahnasi:** Stereometriya tushayotganda standart 2D Canvas o'rniga haqiqiy 3D proyeksiyali oynani (Three.js bilan) ulash va o'quvchilarga figuralarni vizual 360 darajada aylantirib tushuntirish.
3. **Dark / Light mexanizmining global holati:** Tizim uchun to'liq foydalanuvchi profiliga biriktirilgan avto tun/kun tizimini individual sozlamalarga qo'shish.

🔴 **Sun'iy Intellekt va EdTech:**
1. **Voice AI (Ovozli Muallim):** Tizimdagi geometriya masalasini yoki teoremani o'qish imkoniyati emas (TTS - Text-to-Speech), balki tushunmay qolgan bolaga audio-ovozli orqali maslahat berish.
2. **AI Chizuvchi (Tinglash mexanizmi):** Foydalanuvchi ovozi yordamida Canvas'ga chizma tashkil qildirish ("Menga a va b katetlari 4 hamda 5 bo'lgan uchburchakni chiz").
3. **Collaboration (Birgali ishchi platformasi):** Ikki nafar foydalanuvchining ustoz-shogird tizimida bir xil Canvas ish sahifasida birga ishlashiga (hamma narsa real taymda Web Sockets orqali yozilishiga) ruxsat etuvchi modul yaratish.
4. **Milliy va DTM Test rejimi:** Kirish imtihonlaridagi barcha qiyin masala bazasini kiritib oylik reyting bo'yicha yopiq imtihon qismini yaratish.

*P.s. Ushbu hujjat Fazo AI loyihasining navbatdagi qadamlari va yangi dasturchilarning guruhga tez moslashishiga hizmat qiladi.*
