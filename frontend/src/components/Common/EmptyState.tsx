import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Try adjusting your search query or filter parameters.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 mb-4 border border-slate-200 dark:border-slate-800 shadow-inner">
        <Icon className="w-8 h-8 text-cyan-500/80" />
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h4>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-xl transition-all shadow-md shadow-cyan-500/20 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
