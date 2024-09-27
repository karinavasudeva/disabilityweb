import React from 'react';
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Search } from 'lucide-react'
import Button from './ui/button'
import Input from './ui/input'

const tools = [
  { name: 'Screen Reader Plus', description: 'Enhanced screen reader with customizable voices and languages.', link: '#', category: 'Visual' },
  { name: 'ColorBlind Assist', description: 'Color adjustment tool for various types of color blindness.', link: '#', category: 'Visual' },
  { name: 'GestureControl', description: 'Hands-free computer control using facial gestures.', link: '#', category: 'Motor' },
  { name: 'EasyCaption', description: 'Real-time captioning tool for video and audio content.', link: '#', category: 'Auditory' },
  { name: 'AccessibleForms', description: 'Library for creating fully accessible web forms.', link: '#', category: 'Cognitive' },
  { name: 'NavigateEase', description: 'Keyboard navigation enhancement for web applications.', link: '#', category: 'Motor' },
]

export default function Tools() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredTools = tools.filter(tool => 
    (selectedCategory === 'All' || tool.category === selectedCategory) &&
    (tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-center text-blue-600"
      >
        Our Tools
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl text-gray-600 text-center max-w-2xl mx-auto"
      >
        Explore our collection of open-source accessibility tools. Each tool is designed to address specific needs and can be customized to suit individual requirements.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4"
      >
        <div className="relative w-full md:w-64">
          <Input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border-2 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex space-x-2">
          {['All', 'Visual', 'Auditory', 'Motor', 'Cognitive'].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-blue-600 text-white' : 'text-blue-600'}
            >
              {category}
            </Button>
          ))}
        </div>
      </motion.div>
      <AnimatePresence>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          layout
        >
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.name}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6 space-y-4 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <h2 className="text-2xl font-semibold text-blue-600">{tool.name}</h2>
              <p className="text-gray-600">{tool.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-400">{tool.category}</span>
                <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                  Learn More <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}