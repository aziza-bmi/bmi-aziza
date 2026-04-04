export const LESSONS_SEED = [
  {
    id: 'planimetriya',
    title: 'Planimetriya',
    subtitle: "Tekislikdagi geometriya",
    description: "Nuqta, chiziq, burchak, uchburchak, to'rtburchak, doira va ko'pburchaklarni o'rganamiz",
    emoji: '📐',
    color: '#4F46E5',
    order: 1,
    chapters: [
      {
        id: 'asosiy-tushunchalar',
        title: 'Dastlabki tushunchalar',
        order: 1,
        topics: [
          {
            id: 'nuqta-chiziq-kesma',
            title: "Nuqta, to'g'ri chiziq va kesma",
            duration: 10,
            difficulty: 'beginner',
            xpReward: 30,
            order: 1,
            content: `## Nuqta, to'g'ri chiziq va kesma

**Nuqta** — geometriyaning asosiy elementi, o'lchamsiz, faqat joylashuv bildiradi. Harflar bilan belgilanadi: $A$, $B$, $C$.

**To'g'ri chiziq** — ikki tomonga cheksiz uzaygan figura. Kichik harflar bilan: $a$, $b$.

> Ikki nuqta orqali faqat **bitta** to'g'ri chiziq o'tadi.

**Kesma** — to'g'ri chiziqning ikki nuqta orasidagi cheklangan qismi.

$$AB = |x_B - x_A|$$

**Kesma o'rtasi:** Agar $M$ — $AB$ ning o'rtasi bo'lsa:
$$AM = MB = \\frac{AB}{2}$$`,
            examples: [
              "A(1,0) va B(6,0) → $AB = |6-1| = 5$ birlik",
              "M o'rta nuqta bo'lsa → $AM = MB = 2.5$ birlik"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Ikki nuqta orqali nechta to'g'ri chiziq o'tkazish mumkin?",
                options: ["Bitta", "Ikkita", "Uchtadan ko'p", "Cheksiz"],
                correctIndex: 0,
                explanation: "Ikki nuqta orqali faqat bitta to'g'ri chiziq o'tadi — bu geometriya aksiomasidir."
              },
              {
                question: "A(2,0) va B(8,0) nuqtalar orasidagi masofa?",
                options: ["4", "5", "6", "10"],
                correctIndex: 2,
                explanation: "$AB = |8-2| = 6$ birlik"
              },
              {
                question: "Kesma nima?",
                options: [
                  "Cheksiz uzaygan chiziq",
                  "Ikki nuqta orasidagi chiziq qismi",
                  "Bir tomonga uzaygan nur",
                  "Egri chiziq"
                ],
                correctIndex: 1,
                explanation: "Kesma — to'g'ri chiziqning ikki nuqta orasidagi cheklangan qismi."
              }
            ]
          },
          {
            id: 'burchak-turlari',
            title: 'Burchak va uning turlari',
            duration: 12,
            difficulty: 'beginner',
            xpReward: 30,
            order: 2,
            content: `## Burchak va uning turlari

**Burchak** — bir nuqtadan chiquvchi ikki nurdan hosil bo'lgan figura.

### Burchak turlari

| Tur | O'lchov |
|-----|---------|
| O'tkir | $0° < \\alpha < 90°$ |
| To'g'ri | $\\alpha = 90°$ |
| O'tmas | $90° < \\alpha < 180°$ |
| Yoziq | $\\alpha = 180°$ |
| To'la | $\\alpha = 360°$ |

### Qo'shni va vertikal burchaklar
**Qo'shni burchaklar** yig'indisi $180°$ ga teng:
$$\\alpha + \\beta = 180°$$

**Vertikal burchaklar** bir-biriga teng:
$$\\alpha_1 = \\alpha_2$$`,
            examples: [
              "Soat millarining 3:00 da hosil qilgan burchagi = 90° (to'g'ri)",
              "Agar bir burchak 65° bo'lsa, unga qo'shni burchak = 180° - 65° = 115°"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "To'g'ri burchak necha gradus?",
                options: ["45°", "90°", "180°", "360°"],
                correctIndex: 1,
                explanation: "To'g'ri burchak 90° ga teng."
              },
              {
                question: "Qo'shni burchaklar yig'indisi qancha?",
                options: ["90°", "180°", "270°", "360°"],
                correctIndex: 1,
                explanation: "Qo'shni burchaklar yig'indisi 180° ga teng."
              },
              {
                question: "Burchak 120° bo'lsa, u qaysi turga kiradi?",
                options: ["O'tkir", "To'g'ri", "O'tmas", "Yoziq"],
                correctIndex: 2,
                explanation: "90° < 120° < 180° bo'lgani uchun o'tmas burchak."
              }
            ]
          }
        ]
      },
      {
        id: 'uchburchaklar',
        title: 'Uchburchaklar',
        order: 2,
        topics: [
          {
            id: 'uchburchak-turlari',
            title: 'Uchburchak turlari',
            duration: 12,
            difficulty: 'beginner',
            xpReward: 35,
            order: 1,
            content: `## Uchburchak turlari

**Uchburchak** — uchta nuqta va ularni bog'lovchi uchta kesmadan iborat figura.

### Tomonlari bo'yicha
- **Teng tomonli** — barcha 3 tomoni teng: $a = b = c$
- **Teng yonli** — ikki tomoni teng: $a = b$
- **Har xil tomonli** — barcha tomonlar har xil

### Burchaklari bo'yicha
- **O'tkir burchakli** — barcha burchaklar o'tkir ($< 90°$)
- **To'g'ri burchakli** — bir burchagi $90°$
- **O'tmas burchakli** — bir burchagi o'tmas ($> 90°$)

### Asosiy xususiyat
Uchburchak burchaklari yig'indisi:
$$\\alpha + \\beta + \\gamma = 180°$$

### Perimetr va yuza
$$P = a + b + c$$
$$S = \\frac{1}{2} \\cdot a \\cdot h_a$$`,
            examples: [
              "Tomonlari 3, 4, 5 bo'lgan uchburchak — to'g'ri burchakli",
              "Burchaklari 60°, 60°, 60° — teng tomonli uchburchak",
              "P = 3+4+5 = 12, S = ½·3·4 = 6 sm²"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Uchburchak burchaklari yig'indisi?",
                options: ["90°", "180°", "270°", "360°"],
                correctIndex: 1,
                explanation: "Har qanday uchburchak burchaklari yig'indisi 180°."
              },
              {
                question: "Tomonlari teng bo'lgan uchburchak nomi?",
                options: ["Teng yonli", "Teng tomonli", "To'g'ri burchakli", "O'tmas burchakli"],
                correctIndex: 1,
                explanation: "Barcha 3 tomoni teng bo'lsa — teng tomonli uchburchak."
              },
              {
                question: "Tomonlari 3, 4, 5 bo'lgan uchburchak qaysi turga kiradi?",
                options: ["O'tkir burchakli", "To'g'ri burchakli", "O'tmas burchakli", "Teng tomonli"],
                correctIndex: 1,
                explanation: "3²+4²=5² bo'lgani uchun Pifagor teoremasi bo'yicha to'g'ri burchakli."
              }
            ]
          },
          {
            id: 'pifagor-teoremasi',
            title: 'Pifagor teoremasi',
            duration: 15,
            difficulty: 'intermediate',
            xpReward: 50,
            order: 2,
            content: `## Pifagor teoremasi

To'g'ri burchakli uchburchakda **gipotenuzaning kvadrati** katetlar kvadratlari yig'indisiga teng:

$$a^2 + b^2 = c^2$$

Bu yerda:
- $a$, $b$ — **katetlar** (to'g'ri burchak yonidagi tomonlar)
- $c$ — **gipotenuza** (eng uzun tomon)

### Teskari teorem
Agar $a^2 + b^2 = c^2$ bo'lsa, uchburchak to'g'ri burchakli.

### Pifagor uchliglar
| $a$ | $b$ | $c$ |
|-----|-----|-----|
| 3 | 4 | 5 |
| 5 | 12 | 13 |
| 8 | 15 | 17 |

### Balandlik formulasi
$$h = \\frac{a \\cdot b}{c}$$`,
            examples: [
              "a=3, b=4 → c = √(9+16) = √25 = 5",
              "c=13, a=5 → b = √(169-25) = √144 = 12",
              "Balandlik: h = (3·4)/5 = 2.4 sm"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Katetlari 6 va 8 bo'lsa, gipotenuza?",
                options: ["10", "12", "14", "9"],
                correctIndex: 0,
                explanation: "c = √(36+64) = √100 = 10"
              },
              {
                question: "Gipotenuza 17, bitta katet 15 bo'lsa, ikkinchi katet?",
                options: ["6", "7", "8", "9"],
                correctIndex: 2,
                explanation: "b = √(289-225) = √64 = 8"
              },
              {
                question: "Pifagor teoremasi qaysi uchburchak uchun?",
                options: ["Istalgan", "Teng tomonli", "To'g'ri burchakli", "O'tmas burchakli"],
                correctIndex: 2,
                explanation: "Pifagor teoremasi faqat to'g'ri burchakli uchburchak uchun."
              }
            ]
          },
          {
            id: 'uchburchak-yuzi',
            title: 'Uchburchak yuzi va perimetri',
            duration: 12,
            difficulty: 'intermediate',
            xpReward: 40,
            order: 3,
            content: `## Uchburchak yuzi va perimetri

### Perimetr
$$P = a + b + c$$

### Yuza formulalari

**Asosiy formula** (asos va balandlik):
$$S = \\frac{1}{2} \\cdot a \\cdot h$$

**Geron formulasi** (3 tomon bo'yicha):
$$s = \\frac{a+b+c}{2}$$
$$S = \\sqrt{s(s-a)(s-b)(s-c)}$$

**Aylana radiusi orqali:**
$$S = \\frac{abc}{4R}$$

**Ichki aylana radiusi orqali:**
$$S = r \\cdot s$$`,
            examples: [
              "a=6, h=4 → S = ½·6·4 = 12 sm²",
              "Tomonlari 3,4,5 → s=6, S = √(6·3·2·1) = 6 sm²",
              "P = 3+4+5 = 12 sm"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Uchburchak asosi 8, balandligi 5. Yuza?",
                options: ["20", "40", "13", "16"],
                correctIndex: 0,
                explanation: "S = ½·8·5 = 20 sm²"
              },
              {
                question: "Tomonlari 5, 12, 13 bo'lgan uchburchak yuzi?",
                options: ["25", "30", "60", "65"],
                correctIndex: 1,
                explanation: "Bu to'g'ri burchakli: S = ½·5·12 = 30 sm²"
              }
            ]
          }
        ]
      },
      {
        id: 'tortburchaklar',
        title: "To'rtburchaklar",
        order: 3,
        topics: [
          {
            id: 'parallelogramm',
            title: 'Parallelogramm va trapetsiya',
            duration: 14,
            difficulty: 'intermediate',
            xpReward: 45,
            order: 1,
            content: `## Parallelogramm va trapetsiya

### Parallelogramm
Qarama-qarshi tomonlari parallel va teng bo'lgan to'rtburchak.

**Xususiyatlari:**
- $AB \\parallel CD$, $AD \\parallel BC$
- $AB = CD$, $AD = BC$
- Diagonallar o'rtasida kesishadi

$$S = a \\cdot h$$
$$P = 2(a + b)$$

### Trapetsiya
Faqat **bir juft** tomonlari parallel bo'lgan to'rtburchak.

$$S = \\frac{(a + b)}{2} \\cdot h$$

Bu yerda $a$ va $b$ — asoslar, $h$ — balandlik.

### O'rta chiziq
Trapetsiyaning o'rta chizig'i:
$$m = \\frac{a + b}{2}$$`,
            examples: [
              "Parallelogramm: a=6, h=4 → S = 24 sm²",
              "Trapetsiya: a=8, b=4, h=5 → S = (8+4)/2·5 = 30 sm²",
              "O'rta chiziq: m = (8+4)/2 = 6 sm"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Parallelogramm asosi 7, balandligi 3. Yuza?",
                options: ["10", "21", "42", "14"],
                correctIndex: 1,
                explanation: "S = 7·3 = 21 sm²"
              },
              {
                question: "Asoslari 6 va 10, balandligi 4 bo'lgan trapetsiya yuzi?",
                options: ["24", "32", "40", "64"],
                correctIndex: 1,
                explanation: "S = (6+10)/2 · 4 = 32 sm²"
              }
            ]
          },
          {
            id: 'kvadrat-turtburchak',
            title: "Kvadrat, to'g'ri to'rtburchak, romb",
            duration: 12,
            difficulty: 'intermediate',
            xpReward: 40,
            order: 2,
            content: `## Kvadrat, to'g'ri to'rtburchak, romb

### To'g'ri to'rtburchak
Barcha burchaklari $90°$ bo'lgan parallelogramm.

$$S = a \\cdot b$$
$$P = 2(a+b)$$
$$d = \\sqrt{a^2 + b^2}$$

### Kvadrat
Barcha tomonlari teng va burchaklari $90°$ bo'lgan to'rtburchak.

$$S = a^2$$
$$P = 4a$$
$$d = a\\sqrt{2}$$

### Romb
Barcha tomonlari teng bo'lgan parallelogramm.

$$S = a \\cdot h = \\frac{d_1 \\cdot d_2}{2}$$

Bu yerda $d_1$, $d_2$ — diagonallar.`,
            examples: [
              "To'g'ri to'rtburchak: 4×6 → S=24, d=√52≈7.2",
              "Kvadrat: a=5 → S=25, d=5√2≈7.07",
              "Romb: d₁=6, d₂=8 → S=24 sm²"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Kvadrat tomoni 6. Yuza?",
                options: ["12", "24", "36", "48"],
                correctIndex: 2,
                explanation: "S = 6² = 36 sm²"
              },
              {
                question: "To'g'ri to'rtburchak: 3×4. Diagonal?",
                options: ["5", "6", "7", "4"],
                correctIndex: 0,
                explanation: "d = √(9+16) = √25 = 5 sm"
              }
            ]
          }
        ]
      },
      {
        id: 'doira-aylana',
        title: 'Doira va Aylana',
        order: 4,
        topics: [
          {
            id: 'doira-elementlari',
            title: 'Doira elementlari va formulalar',
            duration: 14,
            difficulty: 'intermediate',
            xpReward: 45,
            order: 1,
            content: `## Doira va Aylana

**Aylana** — markazdan teng masofadagi nuqtalar to'plami.
**Doira** — aylana va uning ichki qismi.

### Asosiy formulalar

$$C = 2\\pi r = \\pi d$$
$$S = \\pi r^2$$

### Yoy va Sektor
Yoy uzunligi ($n$ — daraja):
$$l = \\frac{\\pi r n}{180}$$

Sektor yuzi:
$$S_{sek} = \\frac{\\pi r^2 n}{360}$$

### π qiymati
$$\\pi \\approx 3.14159$$`,
            examples: [
              "r=7 → C = 2·3.14·7 = 43.96 sm",
              "r=5 → S = 3.14·25 = 78.5 sm²",
              "r=6, n=60° → l = π·6·60/180 = 2π ≈ 6.28 sm"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Radiusi 4 bo'lgan doira yuzi? (π≈3.14)",
                options: ["25.12", "50.24", "12.56", "100.48"],
                correctIndex: 0,
                explanation: "S = π·4² = 3.14·16 = 50.24 sm² — ammo r=4 uchun S=50.24 sm². Agar r=2 bo'lsa S=12.56."
              },
              {
                question: "Diametri 10 bo'lgan aylana uzunligi? (π≈3.14)",
                options: ["15.7", "31.4", "62.8", "78.5"],
                correctIndex: 1,
                explanation: "C = π·d = 3.14·10 = 31.4 sm"
              }
            ]
          },
          {
            id: 'koppurchaklar',
            title: "Ko'pburchaklar",
            duration: 12,
            difficulty: 'intermediate',
            xpReward: 40,
            order: 2,
            content: `## Ko'pburchaklar

**Ko'pburchak** — uchdan ortiq kesmalar bilan o'ralgan yassi figura.

### Ichki burchaklar yig'indisi
$$S_{burchak} = (n-2) \\cdot 180°$$

### Muntazam ko'pburchak
Barcha tomonlari va burchaklari teng.

Bir burchak:
$$\\alpha = \\frac{(n-2) \\cdot 180°}{n}$$

Yuza ($a$ — tomon, $R$ — tashqi aylana):
$$S = \\frac{1}{4} n a^2 \\cot\\frac{\\pi}{n}$$

### Misollar
| n | Nomi | Burchak |
|---|------|---------|
| 3 | Uchburchak | 60° |
| 4 | To'rtburchak | 90° |
| 5 | Beshburchak | 108° |
| 6 | Oltiburchak | 120° |`,
            examples: [
              "Beshburchak: (5-2)·180° = 540°, har biri 108°",
              "Oltiburchak: (6-2)·180° = 720°, har biri 120°"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Muntazam oltiburchak ichki burchaklari yig'indisi?",
                options: ["540°", "720°", "900°", "360°"],
                correctIndex: 1,
                explanation: "(6-2)·180° = 720°"
              },
              {
                question: "Muntazam beshburchakning bir burchagi?",
                options: ["100°", "108°", "120°", "90°"],
                correctIndex: 1,
                explanation: "(5-2)·180°/5 = 540°/5 = 108°"
              }
            ]
          }
        ]
      },
      {
        id: 'vektorlar',
        title: 'Vektorlar va koordinatalar',
        order: 5,
        topics: [
          {
            id: 'vektor-tushunchasi',
            title: 'Vektor va koordinatalar',
            duration: 15,
            difficulty: 'advanced',
            xpReward: 55,
            order: 1,
            content: `## Vektorlar

**Vektor** — uzunligi va yo'nalishi bor kattalik.
$\\vec{AB}$ — $A$ dan $B$ ga yo'nalgan vektor.

### Vektor koordinatalari
$$\\vec{a} = (x_2 - x_1, \\; y_2 - y_1)$$

### Vektor moduli (uzunligi)
$$|\\vec{a}| = \\sqrt{x^2 + y^2}$$

### Vektorlar ustida amallar
**Qo'shish:**
$$\\vec{a} + \\vec{b} = (a_x + b_x, \\; a_y + b_y)$$

**Skalyar ko'paytma:**
$$\\vec{a} \\cdot \\vec{b} = a_x b_x + a_y b_y$$

**Burchak:**
$$\\cos\\theta = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}| \\cdot |\\vec{b}|}$$`,
            examples: [
              "a=(3,4) → |a| = √(9+16) = 5",
              "a=(1,2), b=(3,4) → a·b = 3+8 = 11",
              "A(1,2), B(4,6) → AB = (3,4), |AB|=5"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Vektor (3,4) ning uzunligi?",
                options: ["3", "4", "5", "7"],
                correctIndex: 2,
                explanation: "|a| = √(9+16) = √25 = 5"
              },
              {
                question: "a=(2,0) va b=(0,3). Skalyar ko'paytma?",
                options: ["6", "0", "5", "1"],
                correctIndex: 1,
                explanation: "a·b = 2·0 + 0·3 = 0. Bu vektorlar perpendikulyar!"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'stereometriya',
    title: 'Stereometriya',
    subtitle: 'Fazodagi geometriya',
    description: "Prizma, piramida, silindr, konus va shar kabi fazoviy figuralarni o'rganamiz",
    emoji: '🧊',
    color: '#0F6E56',
    order: 2,
    chapters: [
      {
        id: 'fazo-asoslari',
        title: "Fazoda to'g'ri chiziq va tekislik",
        order: 1,
        topics: [
          {
            id: 'parallellik-perpendikulyarlik',
            title: "Parallellik va perpendikulyarlik",
            duration: 15,
            difficulty: 'intermediate',
            xpReward: 50,
            order: 1,
            content: `## Fazoda to'g'ri chiziq va tekislik

### Asosiy tushunchalar
**Tekislik** — fazodagi cheksiz yassı sirt.

**Uchta nuqta** — tekislikni aniqlaydi
(agar ular bir to'g'ri chiziqda bo'lmasa).

### Parallellik
- **Ikki to'g'ri chiziq** parallel → ular kesishmaydi
- **To'g'ri chiziq va tekislik** parallel → ular umumiy nuqtaga ega emas
- **Ikki tekislik** parallel → ular kesishmaydi

### Perpendikulyarlik
To'g'ri chiziq tekislikka perpendikulyar bo'lsa, u tekislikdagi **barcha** to'g'ri chiziqlarga perpendikulyar.

### Ayqash to'g'ri chiziqlar
Bir tekislikda bo'lmagan, kesishmaydigan va parallel bo'lmagan to'g'ri chiziqlar.

**Ular orasidagi burchak:**
$$\\cos\\theta = \\frac{|\\vec{a} \\cdot \\vec{b}|}{|\\vec{a}||\\vec{b}|}$$`,
            examples: [
              "Stol yuzasi va uning oyoqlari — perpendikulyar",
              "Xona shiftidagi parallel chiziqlar — parallel tekisliklar",
              "Kubning ayqash qirralari — ayqash to'g'ri chiziqlar"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Tekislikni aniqlash uchun minimum nechta nuqta kerak?",
                options: ["1", "2", "3", "4"],
                correctIndex: 2,
                explanation: "Bir to'g'ri chiziqda bo'lmagan 3 nuqta tekislikni aniq belgilaydi."
              },
              {
                question: "Ayqash to'g'ri chiziqlar nima?",
                options: [
                  "Parallel chiziqlar",
                  "Kesishuvchi chiziqlar",
                  "Bir tekislikda bo'lmagan, kesishmaydigan chiziqlar",
                  "Perpendikulyar chiziqlar"
                ],
                correctIndex: 2,
                explanation: "Ayqash chiziqlar — bir tekislikda bo'lmagan, kesishmaydigan va parallel bo'lmagan."
              }
            ]
          }
        ]
      },
      {
        id: 'kopyoqlar',
        title: "Ko'pyoqlar",
        order: 2,
        topics: [
          {
            id: 'prizma',
            title: 'Prizma va parallelepiped',
            duration: 18,
            difficulty: 'intermediate',
            xpReward: 55,
            order: 1,
            content: `## Prizma va parallelepiped

### Prizma
Ikki parallel teng asosli va yon tomonlari parallelogrammdan iborat ko'pyoq.

**To'g'ri prizma** — yon qiralari asosga perpendikulyar.

$$S_{yon} = P_{asos} \\cdot h$$
$$S_{to'liq} = S_{yon} + 2S_{asos}$$
$$V = S_{asos} \\cdot h$$

### To'g'ri burchakli parallelepiped
$$V = a \\cdot b \\cdot c$$
$$S_{to'liq} = 2(ab + bc + ac)$$
$$d = \\sqrt{a^2 + b^2 + c^2}$$`,
            examples: [
              "To'rtburchakli prizma 3×4×5: V = 60 sm³",
              "S_toʻliq = 2(12+20+15) = 94 sm²",
              "Diagonal: d = √(9+16+25) = √50 ≈ 7.07 sm"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "To'g'ri burchakli parallelepiped: 2×3×4. Hajm?",
                options: ["9", "18", "24", "36"],
                correctIndex: 2,
                explanation: "V = 2·3·4 = 24 sm³"
              },
              {
                question: "To'g'ri prizma hajmi formulasi?",
                options: ["V = P·h", "V = S_asos·h", "V = a·b·c", "V = ⅓S·h"],
                correctIndex: 1,
                explanation: "V = S_asos · h — asosning yuzi va balandlik ko'paytmasi."
              }
            ]
          },
          {
            id: 'piramida',
            title: 'Piramida va kesik piramida',
            duration: 18,
            difficulty: 'advanced',
            xpReward: 60,
            order: 2,
            content: `## Piramida

Asosi ko'pburchak, yon tomonlari uchburchak bo'lgan ko'pyoq.

**To'g'ri piramida** — tepalik asosning markaziga proeksiya qiladi.

$$V = \\frac{1}{3} S_{asos} \\cdot h$$
$$S_{yon} = \\frac{1}{2} P_{asos} \\cdot a$$

Bu yerda $a$ — yon qirraning apofemasi.

## Kesik piramida
$$V = \\frac{h}{3}(S_1 + S_2 + \\sqrt{S_1 S_2})$$

Bu yerda $S_1$, $S_2$ — asoslar yuzi.`,
            examples: [
              "Kvadrat asos 4×4, h=6: V = ⅓·16·6 = 32 sm³",
              "Misrda Xeops piramidasi: asos ≈230m, h≈146m",
              "V = ⅓·52900·146 ≈ 2.57 million m³"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Piramida hajmi formulasi?",
                options: ["V = S·h", "V = ⅓S·h", "V = ½S·h", "V = ⅔S·h"],
                correctIndex: 1,
                explanation: "V = ⅓ · S_asos · h"
              },
              {
                question: "Kvadrat asosi 6×6, balandligi 4. Hajm?",
                options: ["24", "36", "48", "72"],
                correctIndex: 2,
                explanation: "V = ⅓·36·4 = 48 sm³"
              }
            ]
          }
        ]
      },
      {
        id: 'aylanish-jismlari',
        title: 'Aylanish jismlari',
        order: 3,
        topics: [
          {
            id: 'silindr-konus',
            title: 'Silindr va Konus',
            duration: 16,
            difficulty: 'advanced',
            xpReward: 60,
            order: 1,
            content: `## Silindr va Konus

### Silindr
To'g'ri burchakli to'rtburchakni bir tomoni atrofida aylantirish.

$$V = \\pi r^2 h$$
$$S_{yon} = 2\\pi r h$$
$$S_{to'liq} = 2\\pi r(r + h)$$

### Konus
To'g'ri burchakli uchburchakni bir tomoni atrofida aylantirish.

$$V = \\frac{1}{3}\\pi r^2 h$$
$$l = \\sqrt{r^2 + h^2}$$
$$S_{yon} = \\pi r l$$
$$S_{to'liq} = \\pi r(r + l)$$`,
            examples: [
              "Silindr r=3, h=5: V=π·9·5=45π≈141.4 sm³",
              "Konus r=4, h=3: l=5, V=⅓π·16·3=16π≈50.3 sm³",
              "Konus S_yon = π·4·5 = 20π ≈ 62.8 sm²"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Silindr r=2, h=5. Hajm? (π≈3.14)",
                options: ["31.4", "62.8", "125.6", "15.7"],
                correctIndex: 1,
                explanation: "V = π·4·5 = 20π ≈ 62.8 sm³"
              },
              {
                question: "Konus hajmi silindrdning necha qismi (teng r va h)?",
                options: ["½", "⅓", "¼", "⅔"],
                correctIndex: 1,
                explanation: "V_konus = ⅓ · V_silindr (teng r va h bo'lganda)"
              }
            ]
          },
          {
            id: 'shar-sfera',
            title: 'Shar va Sfera',
            duration: 14,
            difficulty: 'advanced',
            xpReward: 60,
            order: 2,
            content: `## Shar va Sfera

**Sfera** — markazdan teng masofadagi nuqtalar to'plami (fazoda).
**Shar** — sfera va uning ichki qismi.

### Formulalar

$$V = \\frac{4}{3}\\pi r^3$$
$$S = 4\\pi r^2$$

### Sharning kesimi
Har qanday tekislik bilan kesim — **doira**.
Markaz orqali o'tuvchi kesim — **katta doira**.

### Qiziqarli fakt
Shar — berilgan sirt yuzi uchun eng katta hajmni beruvchi figura.

$$\\frac{V_{shar}}{V_{tashqi silindr}} = \\frac{2}{3}$$`,
            examples: [
              "r=3: V = 4/3·π·27 = 36π ≈ 113.1 sm³",
              "r=3: S = 4·π·9 = 36π ≈ 113.1 sm²",
              "Yer: r≈6371 km → V≈1.08·10¹² km³"
            ],
            hasQuiz: true,
            quiz: [
              {
                question: "Shar yuzi formulasi?",
                options: ["4πr²", "2πr²", "πr²", "⅔πr²"],
                correctIndex: 0,
                explanation: "S = 4πr²"
              },
              {
                question: "r=1 bo'lgan shar hajmi? (π≈3.14)",
                options: ["3.14", "4.19", "6.28", "12.56"],
                correctIndex: 1,
                explanation: "V = 4/3·π·1 = 4/3·3.14 ≈ 4.19 sm³"
              }
            ]
          }
        ]
      }
    ]
  }
]
