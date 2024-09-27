import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'default', 
  children, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'px-4 py-2 rounded transition-colors duration-300';
  const variantClasses = variant === 'default' 
    ? 'bg-blue-500 text-white hover:bg-blue-600' 
    : 'border border-blue-500 text-blue-500 hover:bg-blue-50';

  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
