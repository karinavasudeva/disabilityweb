import React, { useState, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

interface AccordionProps {
  children: ReactNode;
  [x: string]: any;
}

export const Accordion: React.FC<AccordionProps> = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

interface AccordionItemProps {
  children: ReactNode;
  value: string;
  [x: string]: any;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ children, value, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AccordionContext.Provider value={{ isOpen, setIsOpen }}>
      <div {...props}>{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionTriggerProps {
  children: ReactNode;
  className?: string;
  [x: string]: any;
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ children, className = '', ...props }) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within an AccordionItem');
  const { isOpen, setIsOpen } = context;

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

interface AccordionContentProps {
  children: ReactNode;
  className?: string;
  [x: string]: any;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({ children, className = '', ...props }) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionContent must be used within an AccordionItem');
  const { isOpen } = context;

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
