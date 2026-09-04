'use client'

import { Suspense } from 'react'
import { ThemeProvider, useTheme } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { LanguageProvider } from '@/lib/language-context'
import RouteProgress from '@/components/route-progress'
import LanguageEffectOverlay from '@/components/language-effect-overlay'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      enableSystem
      attribute='class'
      defaultTheme='system'
      disableTransitionOnChange={false}
    >
      <LanguageProvider>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <LanguageEffectOverlay />
        {children}
        <ToasterProvider />
      </LanguageProvider>
    </ThemeProvider>
  )
}

function ToasterProvider() {
  const { resolvedTheme } = useTheme()

  return (
    <Toaster
      position='top-right'
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    />
  )
}
