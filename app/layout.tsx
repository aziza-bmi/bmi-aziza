import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const viewport: Viewport = {
  themeColor: '#4F46E5',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: "GeoMind AI — Geometriyani AI bilan o'rgan",
    template: "%s | GeoMind AI",
  },
  description: "Sun'iy intellekt yordamida geometriyani interaktiv va qiziqarli tarzda o'rganish platformasi. AI muallim, interaktiv chizuvchi, adaptiv testlar.",
  keywords: ["geometriya", "AI", "matematika", "o'rganish", "ta'lim", "GeoMind"],
  authors: [{ name: 'GeoMind AI' }],
  creator: 'GeoMind AI',
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    title: "GeoMind AI — Geometriyani AI bilan o'rgan",
    description: "Sun'iy intellekt yordamida geometriyani o'rganish platformasi",
    siteName: 'GeoMind AI',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const t = localStorage.getItem('theme')
              if (t === 'dark' || (!t &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
              }
            } catch(e) {}
          `
        }} />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
