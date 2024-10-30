import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-4 sm:p-8">
      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}