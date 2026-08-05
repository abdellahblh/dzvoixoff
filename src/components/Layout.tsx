import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Mic, LogOut, User as UserIcon, LayoutDashboard, Globe, Menu, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login';

  const isAdmin = user?.email === 'abdellah.bellahcene2004@gmail.com';

  const navItems = [
    { to: "/", icon: Mic, label: t('home') || 'Home', show: true },
    { to: "/dashboard", icon: LayoutDashboard, label: t('dashboard'), show: !!user },
    { to: "/account", icon: UserIcon, label: t('account') || 'Account', show: !!user },
    { to: "/admin", icon: Shield, label: 'Admin', show: isAdmin },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-brand-dark font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-16 md:pb-0">
      {!isAuthPage && (
        <>
          <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-brand-navy/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 group shrink-0">
                <img src="/logo.svg" alt="DZ VoixOff Logo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
                <span className="font-bold text-base sm:text-xl tracking-tight text-brand-navy dark:text-white">
                  DZVOIXOFF
                </span>
                <span className="text-lg hidden sm:block" title="Algeria">🇩🇿</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-4">
                <ThemeToggle />
                
                <div className="flex items-center gap-2 mr-4">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-transparent text-sm font-medium text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer"
                  >
                    <option value="ar" className="bg-white dark:bg-brand-navy">العربية</option>
                    <option value="fr" className="bg-white dark:bg-brand-navy">Français</option>
                    <option value="en" className="bg-white dark:bg-brand-navy">English</option>
                  </select>
                </div>

                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className={cn(
                          "text-sm font-bold transition-colors hover:text-brand-teal flex items-center gap-1",
                          location.pathname === '/admin' ? "text-brand-teal" : "text-slate-600 dark:text-slate-400"
                        )}
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-brand-teal flex items-center gap-1",
                        location.pathname === '/dashboard' ? "text-brand-teal" : "text-slate-600 dark:text-slate-400"
                      )}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>{t('dashboard')}</span>
                    </Link>
                    <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2" />
                    <div className="flex items-center gap-3">
                      <Link to="/account" className="flex items-center gap-2 group">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 group-hover:border-brand-teal transition-colors object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:border-brand-teal transition-colors">
                            <UserIcon className="w-4 h-4" />
                          </div>
                        )}
                      </Link>
                      <button
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"
                        title={t('logout')}
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="text-sm font-medium bg-brand-navy dark:bg-brand-teal text-white dark:text-brand-navy px-4 py-2 rounded-lg hover:bg-brand-navy-light dark:hover:bg-brand-teal-hover transition-colors whitespace-nowrap"
                  >
                    {t('login')}
                  </Link>
                )}
              </nav>

              {/* Mobile Header Controls */}
              <div className="flex md:hidden items-center gap-3">
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-transparent text-xs font-medium text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer"
                  >
                    <option value="ar" className="bg-white dark:bg-brand-navy">AR</option>
                    <option value="fr" className="bg-white dark:bg-brand-navy">FR</option>
                    <option value="en" className="bg-white dark:bg-brand-navy">EN</option>
                  </select>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Mobile Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-brand-navy/90 backdrop-blur-lg border-t border-slate-200 dark:border-white/10 px-4 h-16 flex items-center justify-around transition-colors shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            {navItems.filter(item => item.show).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                  location.pathname === item.to 
                    ? "text-brand-teal" 
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className={`text-[10px] font-medium ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {item.label}
                </span>
                {location.pathname === item.to && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 w-8 h-1 bg-brand-teal rounded-t-full"
                  />
                )}
              </Link>
            ))}
            
            {user ? (
              <button
                onClick={logout}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-slate-400 dark:text-slate-500"
              >
                <LogOut className="w-5 h-5" />
                <span className={`text-[10px] font-medium ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {t('logout')}
                </span>
              </button>
            ) : (
              <Link
                to="/login"
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                  location.pathname === "/login" 
                    ? "text-brand-teal" 
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                <UserIcon className="w-5 h-5" />
                <span className={`text-[10px] font-medium ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {t('login')}
                </span>
              </Link>
            )}
          </nav>
        </>
      )}

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
