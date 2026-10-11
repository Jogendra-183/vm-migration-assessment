import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'teal' | 'violet' | 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
  badge?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'danger';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'cyan',
  badge,
  badgeType = 'success',
}) => {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
      glow: 'hover:shadow-cyan-500/10',
    },
    teal: {
      border: 'border-teal-500/20 hover:border-teal-500/50',
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
      glow: 'hover:shadow-teal-500/10',
    },
    violet: {
      border: 'border-violet-500/20 hover:border-violet-500/50',
      iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
      glow: 'hover:shadow-violet-500/10',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      glow: 'hover:shadow-emerald-500/10',
    },
    blue: {
      border: 'border-sky-500/20 hover:border-sky-500/50',
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
      glow: 'hover:shadow-sky-500/10',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      glow: 'hover:shadow-amber-500/10',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/50',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      glow: 'hover:shadow-rose-500/10',
    },
    slate: {
      border: 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      glow: '',
    },
  }[color];

  const badgeStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    info: 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    danger: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  }[badgeType];

  return (
    <div
      className={`nexus-card p-5 rounded-2xl border ${colorMap.border} transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl ${colorMap.glow} relative overflow-hidden group`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${colorMap.iconBg} transition-transform group-hover:scale-110 shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3.5 flex items-baseline justify-between gap-2">
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
