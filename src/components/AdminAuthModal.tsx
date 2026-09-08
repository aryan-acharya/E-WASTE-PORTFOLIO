import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  LogOut, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  RotateCw,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { AdminUser } from '../types';
import { 
  loginWithGoogleRedirect, 
  logoutUser, 
  isRunningInIframe, 
  ADMIN_EMAIL 
} from '../lib/firebase';

export const VERCEL_PRODUCTION_URL = 'https://e-waste-portfolio-seven.vercel.app/';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AdminUser | null;
  onOpenManagementConsole?: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenManagementConsole
}) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const inIframe = isRunningInIframe();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogleRedirect();
    } catch (err: any) {
      console.error('Google Redirect error:', err);
      setErrorMsg(err?.message || 'Failed to initiate Google Sign-In redirect.');
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

  const handleSwitchAccount = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      await loginWithGoogleRedirect();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to switch accounts.');
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
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 font-sans"
        >
          {/* Header */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${
                currentUser && !currentUser.isAdmin 
                  ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30' 
                  : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
              }`}>
                {currentUser && !currentUser.isAdmin ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
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
            {/* Official Production URL Reference */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Production Domain</span>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-mono mt-0.5">
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

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* If In Iframe, Show Clear Guidance */}
            {inIframe && !currentUser && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-400 text-xs">
                      Iframe Preview Notice
                    </h4>
                    <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                      Google OAuth redirect flows require a top-level browser window. Click below to open the production site in a direct tab to sign in:
                    </p>
                  </div>
                </div>

                <a
                  href={`${VERCEL_PRODUCTION_URL}#admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Production Website to Sign In</span>
                </a>
              </div>
            )}

            {currentUser ? (
              /* Signed In State */
              currentUser.isAdmin ? (
                /* Authenticated as Verified Admin */
                <div className="space-y-4 text-center">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'A'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {currentUser.displayName || 'Authorized Administrator'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {currentUser.email}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-300 dark:border-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Administrator (Google OAuth)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {onOpenManagementConsole && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenManagementConsole();
                        }}
                        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01]"
                      >
                        <span>Open Management Console</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    <div className="flex gap-2.5">
                      <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={handleSignOut}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-rose-600/20"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Authenticated as NON-ADMIN (403 ACCESS DENIED) */
                <div className="space-y-4 text-center">
                  <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-md">
                      <ShieldAlert className="w-6 h-6" />
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                        403 Access Denied
                      </span>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">
                        Unauthorized Account
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-1 break-all">
                        Signed in as: <strong className="text-white">{currentUser.email}</strong>
                      </p>
                    </div>

                    <p className="text-xs text-rose-300/90 leading-relaxed font-sans pt-1">
                      You are not authorized to manage this portfolio. Only the verified course coordinator (<code className="text-amber-300 font-mono text-[11px]">{ADMIN_EMAIL}</code>) has management privileges.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={onClose}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs transition-colors shadow-md shadow-emerald-500/20"
                    >
                      Return to Portfolio
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSwitchAccount}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Switch Account
                      </button>
                      <button
                        onClick={handleSignOut}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-mono text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Unauthenticated Sign-In View */
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Sign in with your verified administrator Google account to add coursework, upload PDFs, edit details, and manage assignments.
                </p>

                {/* Google Sign In (Top-level redirect) */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 shadow-sm transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <RotateCw className="w-4 h-4 animate-spin text-emerald-500" />
                  ) : (
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
                  )}
                  <span>{isLoading ? 'Redirecting to Google...' : 'Sign in with Google'}</span>
                </button>

                <div className="pt-2 text-center">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    Uses Top-Level Google OAuth Redirect • Single Auth System
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
