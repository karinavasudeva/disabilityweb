'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Search } from 'lucide-react'
import Button from '@/components/ui/button.js'
import Input from '@/components/ui/input.js'

const resources = [
  {
    name: 'Web Accessibility Initiative (WAI)',
    description: 'Strategies, standards, and resources to make the Web accessible to people with disabilities.',
    link: 'https://www.w3.org/WAI/',
    category: 'Guidelines',
  },
  {
    name: 'A11Y Project',
    description: 'A community-driven effort to make web accessibility easier.',
    link: 'https://a11yproject.com/',
    category: 'Community',
  },
  {
    name: 'WebAIM',
    description: 'Web accessibility resources, tools, and services.',
    link: 'https://webaim.org/',
    category: 'Tools',
  },
  {
    name: 'Accessibility Developer Guide',
    description: 'A comprehensive resource for developers to learn about web accessibility.',
    link: 'https://www.accessibility-developer-guide.com/',
    category: 'Learning',
  },
  {
    name: 'WAVE Web Accessibility Evaluation Tool',
    description: 'Tool for evaluating web accessibility.',
    link: 'https://wave.webaim.org/',
    category: 'Tools',
  },
]

const categories = ['All', 'Guidelines', 'Community', 'Tools', 'Learning']

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredResources = resources.filter(resource => 
    (resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory === 'All' || resource.category === selectedCategory)
  )

  return (
    <div className="container mx-auto px-4 space-y-8">
      <motion.h1 
        className="text-5xl font-bold mb-8 text-resources text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Accessibility Resources
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl mb-8 text-center text-gray-600"
      >
        Explore our curated list of accessibility resources
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-md mx-auto"
      >
        <div className="relative">
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-full border-2 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </motion.div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>
      <AnimatePresence>
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 space-y-4 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <h2 className="text-2xl font-semibold text-blue-600">{resource.name}</h2>
              <p className="text-gray-600">{resource.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-400">{resource.category}</span>
                <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                  <a href={resource.link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    Learn More <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
