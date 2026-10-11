import React from 'react';
import { Classification, RiskLevel, MigrationPriority, BusinessCriticality, WaveStatus } from '../../types';

interface StatusBadgeProps {
  type: 'classification' | 'risk' | 'priority' | 'criticality' | 'waveStatus';
  value?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'md' }) => {
  if (!value) {
    return <span className="text-slate-400 text-xs font-mono">-</span>;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  }[size];

  let style = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  let dotColor = 'bg-slate-400';
  let label = value;

  if (type === 'classification') {
    switch (value as Classification) {
      case 'READY_TO_MIGRATE':
        style = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 shadow-sm shadow-emerald-500/10';
        dotColor = 'bg-emerald-500';
        label = 'Ready to Migrate';
        break;
      case 'REQUIRES_OPTIMIZATION':
        style = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 shadow-sm shadow-amber-500/10';
        dotColor = 'bg-amber-500';
        label = 'Requires Optimization';
        break;
      case 'KEEP_PHYSICAL':
        style = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/60 shadow-sm shadow-rose-500/10';
        dotColor = 'bg-rose-500';
        label = 'Keep Physical';
        break;
      case 'RETIRE':
        style = 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';
        dotColor = 'bg-slate-400';
        label = 'Retire';
        break;
    }
  } else if (type === 'risk') {
    switch (value as RiskLevel) {
      case 'LOW':
        style = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60';
        dotColor = 'bg-emerald-500';
        label = 'Low Risk';
        break;
      case 'MEDIUM':
        style = 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700/60';
        dotColor = 'bg-cyan-500';
        label = 'Medium Risk';
        break;
      case 'HIGH':
        style = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60';
        dotColor = 'bg-amber-500';
        label = 'High Risk';
        break;
      case 'CRITICAL':
        style = 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-400 dark:border-rose-700 font-extrabold';
        dotColor = 'bg-rose-500';
        label = 'Critical Risk';
        break;
    }
  } else if (type === 'priority') {
    switch (value as MigrationPriority) {
      case 'PRIORITY_1':
        style = 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700/60 font-bold';
        dotColor = 'bg-violet-500';
        label = 'Priority 1 (Pilot)';
        break;
      case 'PRIORITY_2':
        style = 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700/60';
        dotColor = 'bg-cyan-500';
        label = 'Priority 2 (Core)';
        break;
      case 'PRIORITY_3':
        style = 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700/60';
        dotColor = 'bg-teal-500';
        label = 'Priority 3 (Complex)';
        break;
      case 'PRIORITY_4':
        style = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';
        dotColor = 'bg-slate-400';
        label = 'Priority 4 (Deferred)';
        break;
    }
  } else if (type === 'criticality') {
    switch (value as BusinessCriticality) {
      case 'LOW':
        style = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';
        dotColor = 'bg-slate-400';
        label = 'Low';
        break;
      case 'MEDIUM':
        style = 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700/60';
        dotColor = 'bg-cyan-500';
        label = 'Medium';
        break;
      case 'HIGH':
        style = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-semibold';
        dotColor = 'bg-amber-500';
        label = 'High';
        break;
      case 'CRITICAL':
        style = 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-400 dark:border-rose-700 font-extrabold';
        dotColor = 'bg-rose-500';
        label = 'Critical';
        break;
    }
  } else if (type === 'waveStatus') {
    switch (value as WaveStatus) {
      case 'COMPLETED':
        style = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60';
        dotColor = 'bg-emerald-500';
        label = 'Completed';
        break;
      case 'IN_PROGRESS':
        style = 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700/60 animate-pulse';
        dotColor = 'bg-cyan-500 animate-ping';
        label = 'In Progress';
        break;
      case 'PLANNED':
        style = 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
        dotColor = 'bg-slate-400';
        label = 'Planned';
        break;
      case 'ON_HOLD':
        style = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60';
        dotColor = 'bg-amber-500';
        label = 'On Hold';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeClasses} ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};
