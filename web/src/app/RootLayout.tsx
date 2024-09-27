'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Button from '@/components/ui/button'

const menuItems = [
  { name: 'Home', href: '/' },
  { name: 'Tools', href: '/tools' },
  { name: 'Resources', href: '/resources' },
  { name: 'Curriculum', href: '/curriculum' },
]

interface RootLayoutProps {
  children: ReactNode
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${Math.min(scrollY / 100, 0.9)})`,
          backdropFilter: `blur(${Math.min(scrollY / 10, 8)}px)`,
        }}
      >
        {/* ... header content ... */}
      </motion.header>
      <main className="container mx-auto px-4 pt-24 flex-grow">
        {children}
      </main>
      <footer className="bg-gray-100 mt-auto py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 Open Source Accessibility Tools. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}

export default RootLayout
