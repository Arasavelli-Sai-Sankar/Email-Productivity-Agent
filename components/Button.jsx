import React from 'react';
import { LoadingSpinner } from './LoadingSpinner.jsx';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  let baseStyles = "inline-flex items-center justify-center font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Size styles
  if (size === 'sm') {
    baseStyles += " px-3 py-1 text-sm";
  } else if (size === 'lg') {
    baseStyles += " px-6 py-3 text-lg";
  } else { // md
    baseStyles += " px-4 py-2 text-base";
  }

  // Variant styles
  if (variant === 'primary') {
    baseStyles += " bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
  } else if (variant === 'secondary') {
    baseStyles += " bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400";
  } else if (variant === 'danger') {
    baseStyles += " bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";
  } else if (variant === 'outline') {
    baseStyles += " bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500";
  }

  // Disabled styles
  if (isLoading || disabled) {
    baseStyles += " opacity-60 cursor-not-allowed";
  }

  return (
    <button
      className={`${baseStyles} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : children}
    </button>
  );
};