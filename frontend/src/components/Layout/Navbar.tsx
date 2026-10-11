import React from 'react';
import { Menu, Play, Sun, Moon, ShieldCheck, Database, ChevronRight, Activity, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
  pageTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, pageTitle }) => {
  const { user, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { serverCount } = useInventory();
  const navigate = useNavigate();
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview';
    if (path.startsWith('/servers')) return 'Infrastructure';
    if (path === '/assessment' || path === '/vm-recommendations') return 'Intelligence';
    if (path === '/risks') return 'Governance';
    if (path.includes('migration')) return 'Execution';
    if (path === '/consolidation') return 'Optimization';
    if (path === '/dependencies' || path === '/applications') return 'Topology';
    if (path === '/reports') return 'Analytics';
    if (path === '/settings') return 'Administration';
    return 'Platform';
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0B0F19]/80 backdrop-blur-2xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center space-x-3.5">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Drawer"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/80 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb + Page Title */}
        <div>
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>NEXUS</span>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">{getBreadcrumb()}</span>
          </div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight -mt-0.5">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* PostgreSQL Database connected indicator */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs shadow-sm">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <Database className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="font-medium">vmmigration</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">{serverCount} Nodes</span>
        </div>

        {/* User Role Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 text-xs font-bold tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
          <span>{isAdmin ? 'ADMIN' : 'VIEWER'}</span>
        </div>

        {/* Quick Run Assessment CTA */}
        {isAdmin && (
          <button
            onClick={() => navigate('/assessment')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950 stroke-slate-950" />
            <span className="hidden sm:inline">Run Assessment</span>
          </button>
        )}

        {/* Theme switch button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      </div>
    </header>
  );
};

