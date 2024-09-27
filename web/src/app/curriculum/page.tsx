'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import Input from '@/components/ui/Input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';

const modules = [
  {
    title: 'Introduction to Disability Studies',
    description: 'An overview of disability studies and its importance in society.',
    topics: [
      'Historical perspectives on disability',
      'Models of disability: medical, social, and cultural',
      'Disability rights movement',
    ],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    readings: [
      { title: 'Disability Studies: An Introduction', url: '#' },
      { title: 'The Social Model of Disability', url: '#' },
    ],
  },
  {
    title: 'Accessibility and Universal Design',
    description: 'Understanding the principles of accessibility and universal design.',
    topics: [
      'Principles of universal design',
      'Accessible web design',
      'Mobile accessibility',
    ],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    readings: [
      { title: 'Universal Design Principles', url: '#' },
      { title: 'Web Content Accessibility Guidelines (WCAG) Overview', url: '#' },
    ],
  },
  {
    title: 'Assistive Technologies',
    description: 'Exploring various assistive technologies and their applications.',
    topics: [
      'Screen readers and text-to-speech',
      'Alternative input devices',
      'Augmentative and alternative communication (AAC)',
    ],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    readings: [
      { title: 'Introduction to Assistive Technologies', url: '#' },
      { title: 'AAC Devices and Their Impact', url: '#' },
    ],
  },
]

const Curriculum = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredModules = modules.filter(module => 
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="container mx-auto px-4 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-bold mb-8 text-curriculum text-center"
      >
        Accessibility Curriculum
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl mb-8 text-center text-gray-600"
      >
        Explore our comprehensive curriculum on web accessibility
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
            placeholder="Search modules and topics..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-full border-2 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </motion.div>
      <AnimatePresence>
        <motion.div layout className="space-y-4">
          {filteredModules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Accordion type="single" collapsible="true">
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <h3 className="text-xl font-semibold text-gray-800">{module.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold mb-2">Topics:</h4>
                        <ul className="list-disc pl-5">
                          {module.topics.map((topic, topicIndex) => (
                            <li key={topicIndex} className="text-gray-700">{topic}</li>
                          ))}
                        </ul>
                      </div>
                      {module.video && (
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Video Lecture:</h4>
                          <div className="max-w-2xl mx-auto">
                            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                              <iframe
                                src={module.video}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                              ></iframe>
                            </div>
                          </div>
                        </div>
                      )}
                      {module.readings && module.readings.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Readings:</h4>
                          <ul className="space-y-2">
                            {module.readings.map((reading, readingIndex) => (
                              <li key={readingIndex}>
                                <a
                                  href={reading.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                  </svg>
                                  {reading.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default Curriculum
