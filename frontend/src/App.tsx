import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { InventoryProvider } from './context/InventoryContext';
import { AppLayout } from './components/Layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Servers } from './pages/Servers';
import { ServerDetail } from './pages/ServerDetail';
import { AssessmentPage } from './pages/Assessment';
import { VmRecommendations } from './pages/VmRecommendations';
import { Risks } from './pages/Risks';
import { MigrationPlan } from './pages/MigrationPlan';
import { MigrationWaves } from './pages/MigrationWaves';
import { Consolidation } from './pages/Consolidation';
import { Dependencies } from './pages/Dependencies';
import { Applications } from './pages/Applications';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { GoogleCloud } from './pages/GoogleCloud';
import { LoadingSpinner } from './components/Common/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner message="Checking authentication session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InventoryProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="servers" element={<Servers />} />
                <Route path="servers/:id" element={<ServerDetail />} />
                <Route path="assessment" element={<AssessmentPage />} />
                <Route path="vm-recommendations" element={<VmRecommendations />} />
                <Route path="risks" element={<Risks />} />
                <Route path="migration-plan" element={<MigrationPlan />} />
                <Route path="migration-waves" element={<MigrationWaves />} />
                <Route path="consolidation" element={<Consolidation />} />
                <Route path="dependencies" element={<Dependencies />} />
                <Route path="applications" element={<Applications />} />
                <Route path="reports" element={<Reports />} />
                <Route path="cloud" element={<GoogleCloud />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
