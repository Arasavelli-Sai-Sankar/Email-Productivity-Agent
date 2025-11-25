import React from 'react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  let spinnerSize = 'w-6 h-6';
  let borderWidth = 'border-2';

  if (size === 'sm') {
    spinnerSize = 'w-4 h-4';
    borderWidth = 'border-2';
  } else if (size === 'lg') {
    spinnerSize = 'w-8 h-8';
    borderWidth = 'border-4';
  }

  return (
    <div
      className={`${spinnerSize} ${borderWidth} border-white-400 border-t-blue-500 rounded-full animate-spin ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};