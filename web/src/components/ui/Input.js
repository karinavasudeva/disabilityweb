import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col">
      {label && <label className="mb-1 text-sm text-gray-600">{label}</label>}
      <input 
        className={`px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props} 
      />
    </div>
  );
};

export default Input;
