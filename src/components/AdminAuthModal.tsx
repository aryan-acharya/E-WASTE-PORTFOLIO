import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  LogIn, 
  LogOut, 
  AlertCircle, 
  Mail, 
  Key, 
  CheckCircle2,
  Sparkles,
  UserCheck,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { AdminUser } from '../types';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  logoutUser 
} from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

export const VERCEL_PRODUCTION_URL = 'https://e-waste-portfolio-seven.vercel.app/';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AdminUser | null;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [emailInput, setEmailInput] = useState('aryanacharya0211@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDomainError, setIsDomainError] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'google' | 'email'>('google');

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

  const handleCopyDomain = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setIsDomainError(false);
    try {
      const user = await loginWithGoogle();
      if (!user) {
        setErrorMsg('Sign in could not be completed. Please try again.');
        return;
      }
      
      if (!user.isAdmin) {
        setErrorMsg(
          `Signed in as ${user.email || 'unknown account'}. Access restricted: Only authorized administrator account can manage coursework assignments.`
        );
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err?.code === 'auth/unauthorized-domain') {
        setIsDomainError(true);
        setErrorMsg('Authentication domain not authorized in Firebase.');
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMsg('The sign-in popup was blocked by your browser. Please allow popups or open in a new tab.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in window closed before completing.');
      } else {
        setErrorMsg(err?.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
        const user = await loginWithEmail(emailInput.trim(), passwordInput.trim());
        if (!user.isAdmin) {
          setErrorMsg(
            'Access restricted: This account is not authorized to manage coursework assignments.'
          );
        } else {
          onClose();
        }
      } catch (err: any) {
        console.error('Email Sign In error:', err);
        setErrorMsg(err?.message || 'Invalid credentials or account does not exist.');
      } finally {
        setIsLoading(false);
      }
    };

    const handleSignOut = async () => {
      setIsLoading(true);
      try {
        await logoutUser();
        onClose();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to sign out.');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Portfolio Security
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Admin Portal
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Production Vercel App Link */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Official Production Website</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate font-mono mt-0.5">
                    e-waste-portfolio-seven.vercel.app
                  </div>
                </div>
                <a
                  href={VERCEL_PRODUCTION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono flex items-center gap-1.5 shrink-0 transition-all shadow-sm shadow-emerald-500/20"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {errorMsg && !isDomainError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {isDomainError && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-300 text-sm">
                        Iframe Preview Notice
                      </h4>
                      <p className="text-[11px] text-amber-200/80 mt-1 leading-relaxed">
                        Google Sign-In popups are blocked inside this editor iframe preview. Open your website directly on Vercel to sign in with Google seamlessly:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-1 gap-2">
                      <a
                        href={VERCEL_PRODUCTION_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs transition-colors shadow-md shadow-emerald-500/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open on e-waste-portfolio-seven.vercel.app</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {currentUser ? (
                /* Already Signed In View */
                <div className="space-y-5 text-center">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'A'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {currentUser.displayName || 'Authorized User'}
                      </h4>
                      {currentUser.email && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {currentUser.email}
                        </p>
                      )}
                    </div>

                    {currentUser.isAdmin ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-300 dark:border-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Administrator</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-700">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Public Visitor (Read-Only)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleSignOut}
                      disabled={isLoading}
                      className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-rose-600/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Sign In Options */
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Sign in with your verified administrator account to manage coursework submissions, upload PDFs, edit details, or remove assignments.
                  </p>

                  {/* Google Sign In Button */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 shadow-sm transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                    <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase">
                      Or Admin Credentials
                    </span>
                  </div>

                  {/* Email Form */}
                  <form onSubmit={handleEmailSignIn} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Admin Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="admin@institution.edu"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform transform active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Sign In as Admin</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
};
