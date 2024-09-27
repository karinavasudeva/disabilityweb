import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MotionDiv = dynamic(() => import('@/components/MotionDiv'), { ssr: false });

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4">
      <section className="py-20">
        <MotionDiv
          className="text-6xl font-bold mb-8 text-left text-home"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Open Source Accessibility (OSA)
        </MotionDiv>
        <MotionDiv
          className="text-2xl mb-12 text-left text-gray-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Empowering people with disabilities through innovative, open-source technology solutions.
        </MotionDiv>
        <MotionDiv
          className="text-xl mb-12 text-left text-gray-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Our mission is to make accessibility tools freely available and customizable for everyone. Join our community to access, contribute, and innovate. 
        </MotionDiv>
        <MotionDiv
          className="text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <a href="mailto:vasudevakarina@gmail.com" className="btn btn-primary text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
            Email to Join
          </a>
        </MotionDiv>
      </section>
    </div>
  )
}

export default Home;
