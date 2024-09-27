import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '../components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AccessibilityHub',
  description: 'A hub for accessibility tools, resources, and curriculum',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-white shadow-md mt-8">
            <div className="container mx-auto px-4 py-6 text-center text-gray-600">
              <p>&copy; 2023 AccessibilityHub. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}