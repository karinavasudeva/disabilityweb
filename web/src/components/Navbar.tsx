'use client'

import React from 'react'
import Link from 'next/link'

const menuItems = [
  { name: 'Home', href: '/' },
  { name: 'Tools', href: '/tools' },
  { name: 'Resources', href: '/resources' },
  { name: 'Curriculum', href: '/curriculum' },
]

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-3xl font-bold text-home">
            OSA
          </Link>
          <ul className="flex space-x-6">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`text-lg text-gray-600 hover:text-${item.name.toLowerCase()} transition-colors duration-300 border-b-2 border-transparent hover:border-${item.name.toLowerCase()} pb-1`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
