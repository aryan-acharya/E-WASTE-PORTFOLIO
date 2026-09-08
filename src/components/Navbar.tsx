import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Home, 
  Layers, 
  Search, 
  Menu, 
  X, 
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { NavSection, AdminUser } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onOpenSearch?: () => void;
  onOpenAdmin?: () => void;
  adminUser?: AdminUser | null;
  totalAssignmentsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenSearch,
  onOpenAdmin,
  adminUser,
  totalAssignmentsCount
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setIsScrolled(currentScroll > 20);
      
      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'overview', label: 'Subject Overview', icon: <Layers className="w-4 h-4" /> },
    { id: 'assignments', label: 'Assignments', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const handleNavClick = (id: NavSection) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200/50 dark:bg-slate-800/50 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <header
        className={`fixed top-1 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${
          isScrolled ? 'pt-2' : 'pt-4'
        }`}
      >
        <div
          className={`rounded-2xl transition-all duration-300 px-4 sm:px-6 py-3 flex items-center justify-between glass-panel ${
            isScrolled
              ? 'shadow-lg shadow-emerald-950/5 border-slate-200/90 dark:border-slate-800/90'
              : 'border-slate-200/60 dark:border-slate-800/60'
          }`}
        >
          {/* Logo / Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-xl p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              AA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Aryan Acharya
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <GraduationCap className="w-3 h-3" />
                  Sem V
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                B.Tech Information Technology
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isActive
                      ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-emerald-500/20 dark:border-emerald-500/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {item.icon}
                    {item.label}
                    {item.id === 'assignments' && (
                      <span className="relative z-10 ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        {totalAssignmentsCount}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Action buttons (Admin Auth + Search + Theme Toggle + Mobile Menu) */}
          <div className="flex items-center gap-2">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                aria-label="Search assignments"
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 transition-all duration-300 border border-slate-200/80 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 flex items-center gap-2 group"
                title="Search assignments (Ctrl + K)"
              >
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden lg:inline-block pr-1">
                  Search
                </span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 bg-slate-200/80 dark:bg-slate-700/80 rounded">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Admin Management Button */}
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className={`px-3 py-2 rounded-2xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-300 border ${
                  adminUser?.isAdmin
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/60'
                }`}
                title="Admin Authentication & Coursework Management"
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${adminUser?.isAdmin ? 'text-emerald-400' : 'text-emerald-500'}`} />
                <span>{adminUser?.isAdmin ? 'Admin Mode' : 'Admin'}</span>
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors border border-slate-200/80 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 p-3 rounded-2xl glass-panel shadow-xl border border-slate-200/80 dark:border-slate-800/80"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.id === 'assignments' && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                          {totalAssignmentsCount}
                        </span>
                      )}
                    </button>
                  );
                })}

                {onOpenAdmin && (
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all mt-1 ${
                      adminUser?.isAdmin
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>{adminUser?.isAdmin ? 'Admin Console (Active)' : 'Admin Login'}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      SECURE
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

