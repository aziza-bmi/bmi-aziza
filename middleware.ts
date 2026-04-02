import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = [
  '/dashboard',
  '/chat',
  '/lessons',
  '/quiz',
  '/canvas',
  '/profile',
  '/settings',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtected) {
    const token = request.cookies.get('__session') ||
                  request.cookies.get('firebase-auth-token')
    
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/lessons/:path*',
    '/quiz/:path*',
    '/canvas/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
}
