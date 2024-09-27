import React from 'react';

const Input = ({ className = '', ...props }) => {
  const inputStyles = `w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`;

  return <input className={inputStyles} {...props} />;
};

export default Input;