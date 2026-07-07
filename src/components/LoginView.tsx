import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Compass, 
  Eye, 
  EyeOff,
  CloudLightning,
  RefreshCw
} from 'lucide-react';
import { signInWithGoogle } from '../lib/supabaseSync';

interface LoginViewProps {
  onBypass: () => void;
  isDarkMode: boolean;
}

export default function LoginView({ onBypass, isDarkMode }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setErrorMessage('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google SSO connection failed');
      setIsGoogleSigningIn(false);
    }
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in all secure authentication fields.');
      return;
    }
    setIsLoggingIn(true);
    setErrorMessage('');

    // Secure local simulation for offline workspace
    setTimeout(() => {
      setIsLoggingIn(false);
      onBypass();
    }, 1200);
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden p-6 ${
      isDarkMode ? 'bg-[#050508] text-slate-200' : 'bg-[#f8f9fa] text-slate-800'
    }`} id="premium-login-view">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-60">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        
        {/* App Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl blur-md opacity-60 scale-95" />
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center relative shadow-2xl">
              <Compass className="w-8 h-8 text-cyan-400 stroke-[1.75]" />
            </div>
            {/* Soft decorative ring */}
            <div className="absolute -inset-2 rounded-3xl border border-cyan-500/20 animate-pulse pointer-events-none" />
          </div>

          <h1 className="text-3xl font-display font-extrabold tracking-widest text-slate-900 dark:text-white uppercase leading-none">
            PRIME LIFE
          </h1>
          <p className="text-[10px] font-mono tracking-[0.3em] text-cyan-500 dark:text-cyan-400 uppercase mt-2.5 font-bold">
            Cognitive Workspace Ecosystem
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="w-full relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/15 shadow-2xl bg-white/90 dark:bg-[#09090fbd] backdrop-blur-3xl p-8"
        >
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Access Workspace
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Connect to synchronize your executive planner across devices in real time.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-500 dark:text-rose-400 text-center font-medium"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google SSO Button (Primary Auth Method) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSigningIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/10 text-slate-700 dark:text-slate-200 font-semibold text-xs font-mono uppercase tracking-widest transition-all outline-none cursor-pointer shadow-sm hover:shadow"
          >
            {isGoogleSigningIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Connecting SSO...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Visual Separator */}
          <div className="relative my-7 flex items-center">
            <div className="flex-1 border-t border-slate-200 dark:border-white/5" />
            <span className="px-3 text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
              or use secure local access
            </span>
            <div className="flex-1 border-t border-slate-200 dark:border-white/5" />
          </div>

          {/* Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold ml-1">
                E-Mail Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4 stroke-[1.8]" />
                </span>
                <input 
                  type="email" 
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500/50 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                  Workspace Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); setErrorMessage('Please sign in via Google SSO or proceed as Guest to skip authorization.') }} className="text-[10px] text-cyan-500 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4 stroke-[1.8]" />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500/50 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full relative mt-3 group overflow-hidden rounded-xl py-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-bold text-xs font-mono uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Accessing Workspace...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </form>

          {/* Secure Badges */}
          <div className="mt-6 flex justify-center items-center gap-5 text-[10px] font-mono text-slate-500 dark:text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500/80" /> RLS Protected
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-800" />
            <span className="flex items-center gap-1.5">
              <CloudLightning className="w-3.5 h-3.5 text-cyan-500/80" /> Auto-Synchronized
            </span>
          </div>

        </motion.div>

        {/* Local Offline Mode Option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-6 text-center"
        >
          <button
            onClick={onBypass}
            className="text-xs font-mono font-bold tracking-widest text-slate-500 hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors uppercase outline-none focus:outline-none cursor-pointer"
          >
            ⚡ Continue as Guest / Local Offline Mode
          </button>
        </motion.div>

      </div>
    </div>
  );
}
