import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  AppWindow,
  GitFork,
  Cpu,
  ShieldAlert,
  CalendarDays,
  Boxes,
  FileSpreadsheet,
  Settings,
  Zap,
  Activity,
  Layers,
  Sparkles,
  LogOut,
  ChevronRight,
  Shield,
  ServerCog,
  Cloud,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { user, logout, isAdmin } = useAuth();
  const { serverCount } = useInventory();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Server Inventory', path: '/servers', icon: Server, badge: String(serverCount) },
    { name: 'Run Assessment', path: '/assessment', icon: Sparkles, highlight: true },
    { name: 'VM Right-Sizing', path: '/vm-recommendations', icon: Cpu },
    { name: 'Risk Assessment', path: '/risks', icon: ShieldAlert },
    { name: 'Migration Plan', path: '/migration-plan', icon: CalendarDays },
    { name: 'Migration Waves', path: '/migration-waves', icon: Layers },
    { name: 'Host Consolidation', path: '/consolidation', icon: Boxes },
    { name: 'Dependencies', path: '/dependencies', icon: GitFork },
    { name: 'Applications', path: '/applications', icon: AppWindow },
    { name: 'Google Cloud Engine', path: '/cloud', icon: Cloud, badge: 'GCP Live' },
    { name: 'Reports & Export', path: '/reports', icon: FileSpreadsheet },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900/95 dark:bg-[#0B0F19]/95 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-slate-800/80 justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-slate-950 stroke-slate-950" />
              <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-wider bg-gradient-to-r from-slate-900 via-cyan-700 to-teal-700 dark:from-white dark:via-cyan-200 dark:to-teal-300 bg-clip-text text-transparent">
                  NEXUS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-widest uppercase bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  v2.4
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase block -mt-0.5">
                Migration Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
            Platform Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-transparent text-cyan-600 dark:text-cyan-300 border-l-2 border-l-cyan-500 border-y border-r border-cyan-500/20 shadow-sm shadow-cyan-950/20 font-bold'
                      : item.highlight
                      ? 'text-amber-600 dark:text-amber-300 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-200 border border-amber-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300'
                            : item.highlight
                            ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400'
                            : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                      </div>
                      <span className="tracking-tight">{item.name}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-slate-100 dark:bg-slate-800/80 text-cyan-700 dark:text-cyan-300 rounded-md border border-slate-200 dark:border-slate-700">
                          {item.badge}
                        </span>
                      )}
                      {item.highlight && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                      )}
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#070A12]/80">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-sm">
                {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {user?.username || 'admin'}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold block">
                  {isAdmin ? 'ADMINISTRATOR' : 'READONLY'}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

