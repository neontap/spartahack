import React from 'react';
import { AlertTriangle } from 'lucide-react';

const EnvironmentBanner = () => {
  // Only show in development environment
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-yellow-500 text-black px-4 py-2 flex items-center justify-center space-x-2">
      <AlertTriangle className="h-5 w-5" />
      <span className="font-medium">Development Environment</span>
    </div>
  );
};

export default EnvironmentBanner;
