import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware tahrirlandi: Firebase Client Auth bilan cookie sinxronizatsiyasi
// ba'zan server yuborgan so'rovlarda uzulib qoladi (masalan, dynamic route fetch'larda).
// Shuning uchun himoyani to'g'ridan-to'g'ri app/(dashboard)/layout.tsx da 
// Client Context orqali tekshirish eng ishonchli (bu allaqachon mantiqan sozlangan).
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
