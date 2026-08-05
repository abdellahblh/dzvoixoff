import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Admin from './pages/Admin';
import WhatsAppButton from './components/WhatsAppButton';
import { ErrorBoundary } from './components/ErrorBoundary';

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady } = useAuth();
  
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

import { ThemeProvider } from './context/ThemeContext';
import { useLocation } from 'react-router-dom';
import { trackPixelEvent } from './lib/pixel';

function PageViewTracker() {
  const location = useLocation();
  const { user } = useAuth();

  React.useEffect(() => {
    trackPixelEvent('PageView', {}, user ? { em: user.email, external_id: user.id } : {});
  }, [location.pathname, user?.email]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <PageViewTracker />
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Landing />} />
                  <Route path="login" element={<Login />} />
                  <Route 
                    path="dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="account" 
                    element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="admin" 
                    element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />
                </Route>
              </Routes>
              <WhatsAppButton />
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
