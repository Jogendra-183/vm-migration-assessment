import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useInventory } from '../../context/InventoryContext';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { serverCount } = useInventory();

  const getPageTitle = (path: string): string => {
    switch (path) {
      case '/dashboard': return 'Executive Migration Dashboard';
      case '/servers': return `Physical Server Inventory (${serverCount} Servers)`;
      case '/assessment': return 'Migration Assessment & Suitability Engine';
      case '/vm-recommendations': return 'VM Right-Sizing Recommendations';
      case '/risks': return 'Migration Risk Assessment Matrix';
      case '/migration-plan': return 'Workload Migration Master Plan';
      case '/migration-waves': return 'Migration Waves Execution Board';
      case '/consolidation': return 'Virtualization Host Consolidation Simulator';
      case '/dependencies': return 'Infrastructure & Application Dependency Map';
      case '/applications': return 'Enterprise Application Catalog';
      case '/reports': return 'Executive Reports & Data Export';
      case '/settings': return 'System Settings & Scoring Configuration';
      default:
        if (path.startsWith('/servers/')) return 'Server Deep-Dive Analysis';
        return 'VM Migration Platform';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 flex transition-colors duration-200 nexus-grid-pattern relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          pageTitle={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
