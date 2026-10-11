import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading intelligence telemetry...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="relative flex items-center justify-center">
        <Loader2 className={`${sizeClasses} text-cyan-500 animate-spin`} />
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-md pointer-events-none" />
      </div>
      {message && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
};
