import { WebProvider } from '@/components/providers/web-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { UserDataProvider } from '@/components/providers/user-data-provider'
import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'NutriGrade - Product Nutrition Scanner',
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
  // ...existing code...

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.className} m-0 p-0`}>
        <ThemeProvider>
          <WebProvider>
            <UserDataProvider>
              <main className="min-h-screen w-full flex flex-col bg-white dark:bg-gray-900 transition-colors">
                {children}
              </main>
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#ffffff',
                    color: '#000000',
                  },
                }}
              />
            </UserDataProvider>
          </WebProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
