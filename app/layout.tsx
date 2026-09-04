import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

import { getSiteUrl } from '@/lib/site'
import { cn } from '@/lib/utils'

import './globals.css'
import Providers from '@/components/providers'
import Header from '@/components/header'
import Footer from '@/components/footer'
import AIChatAssistant from '@/components/ai-chat-assistant'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  fallback: ['system-ui', 'arial']
})
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  fallback: ['Georgia', 'serif']
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Nanda Safiq Alfiansyah Portfolio',
  description:
    'Personal developer portfolio and blog featuring project showcases, certificates, work experience, interactive terminal, and dashboard.',
  icons: {
    icon: [
      { url: '/icon', sizes: '32x32', type: 'image/png' },
      { url: '/images/macos-logo.jpg', sizes: '512x512', type: 'image/jpeg' }
    ],
    shortcut: '/icon',
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
      { url: '/images/macos-logo.jpg', sizes: '512x512', type: 'image/jpeg' }
    ]
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          'flex min-h-screen flex-col font-sans antialiased',
          inter.variable,
          playfair.variable
        )}
      >
        <Providers>
          <Header />
          <main className='grow'>{children}</main>
          <Footer />
          <AIChatAssistant />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
