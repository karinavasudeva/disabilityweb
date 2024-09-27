import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const AccordionContext = createContext(null);

export const Accordion = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

export const AccordionItem = ({ children, value, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AccordionContext.Provider value={{ isOpen, setIsOpen }}>
      <div {...props}>{children}</div>
    </AccordionContext.Provider>
  );
};

export const AccordionTrigger = ({ children, className = '', ...props }) => {
  const { isOpen, setIsOpen } = useContext(AccordionContext);

  return (
    <button
      className={`flex justify-between items-center w-full ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      {isOpen ? <ChevronUp /> : <ChevronDown />}
    </button>
  );
};

export const AccordionContent = ({ children, className = '', ...props }) => {
  const { isOpen } = useContext(AccordionContext);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={className}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};