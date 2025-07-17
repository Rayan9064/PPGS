import { TelegramProvider } from '@/components/providers/telegram-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nutripal - Product Nutrition Scanner',
  description: 'Scan product barcodes to get detailed nutrition information and health grading',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <TelegramProvider>
            <div className="min-h-screen w-full max-w-none flex flex-col bg-white dark:bg-gray-900 transition-colors m-0 p-0">
              {children}
            </div>
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--tg-color-bg, #ffffff)',
                  color: 'var(--tg-color-text, #000000)',
                },
              }}
            />
          </TelegramProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
