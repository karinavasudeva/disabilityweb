import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyles = 'px-6 py-3 rounded-full font-medium focus:outline-none transition-colors';
  
  const variantStyles = {
    default: 'bg-primary text-white hover:bg-opacity-90',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  };

  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <motion.button 
      className={buttonStyles} 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;