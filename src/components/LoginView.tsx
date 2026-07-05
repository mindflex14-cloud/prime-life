import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  Fingerprint, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Compass, 
  Flame, 
  Lightbulb,
  CloudLightning,
  Eye,
  EyeOff
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
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

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

  const handleBiometricSimulate = () => {
    if (biometricScanning || biometricSuccess) return;
    setBiometricScanning(true);
    setErrorMessage('');
    
    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        // Authenticate successfully into sandbox bypass
        onBypass();
      }, 1000);
    }, 2200);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in all security fields.');
      return;
    }
    setIsLoggingIn(true);
    setErrorMessage('');

    // Custom simulated secure sandbox login
    setTimeout(() => {
      setIsLoggingIn(false);
      onBypass();
    }, 1500);
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4 select-none ${
      isDarkMode ? 'bg-[#030307] text-slate-200' : 'bg-[#f5f5f9] text-slate-800'
    }`} id="premium-login-view">
      
      {/* Dynamic Grid Background with futuristic laser accents */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25 dark:opacity-35">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        
        {/* App Emblem / Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <div className="relative group mb-3">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-violet-600 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-500 scale-95" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0b0c10] to-[#1a1c24] border border-white/10 flex items-center justify-center relative shadow-2xl">
              <Compass className="w-7 h-7 text-cyan-400 stroke-[1.8] animate-spin-slow" />
            </div>
            
            {/* Pulsing orbit rings */}
            <div className="absolute -inset-1.5 rounded-2xl border border-cyan-500/30 animate-ping pointer-events-none opacity-40" style={{ animationDuration: '3s' }} />
          </div>

          <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-400 uppercase leading-none">
            PRIME LIFE
          </h1>
          <p className="text-[10px] font-mono tracking-[0.25em] text-cyan-400/80 uppercase mt-2 font-bold">
            Cognitive Ecosystem • OS V3
          </p>
        </motion.div>

        {/* Master Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative rounded-3xl overflow-hidden border border-white/5 dark:border-white/10 shadow-2xl bg-[#ffffffb3] dark:bg-[#0c0d14bd] backdrop-blur-2xl p-6 md:p-8"
        >
          {/* Card Top Border Accent */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          {/* Welcome Greeting */}
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold tracking-wide text-slate-800 dark:text-slate-100">
              Welcome to the Sandbox
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Connect to sync your growth ledger across neural systems
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 text-center font-medium"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold ml-1">
                E-Mail / Neural Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4 stroke-[1.8]" />
                </span>
                <input 
                  type="email" 
                  required
                  placeholder="name@prime.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500/50 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                  Security Code
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); setErrorMessage('Please sign in via Google SSO or proceed as Guest to skip authorization.') }} className="text-[10px] text-cyan-400 hover:underline">
                  Forgot Password?
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500/50 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono"
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

            {/* Premium Futuristic iOS Login Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full relative mt-2 group overflow-hidden rounded-xl py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white font-medium text-xs font-mono uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <Cpu className="w-4 h-4 animate-spin" /> Synchronizing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Access Environment <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </form>

          {/* Visual Separator */}
          <div className="relative my-6 flex items-center">
            <div className="flex-1 border-t border-slate-200 dark:border-white/5" />
            <span className="px-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Biometric & SSO Options
            </span>
            <div className="flex-1 border-t border-slate-200 dark:border-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Simulated Biometric Face/Touch ID */}
            <button
              type="button"
              onClick={handleBiometricSimulate}
              disabled={biometricScanning || biometricSuccess}
              className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-center transition-all outline-none ${
                biometricSuccess 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md'
                  : biometricScanning 
                    ? 'bg-cyan-500/5 border-cyan-500/30 text-cyan-400 animate-pulse'
                    : 'bg-slate-50/40 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/10 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="relative">
                <Fingerprint className={`w-6 h-6 ${biometricSuccess ? 'text-emerald-400' : 'text-cyan-400'} stroke-[1.5]`} />
                {biometricScanning && (
                  <div className="absolute -inset-2 border-2 border-cyan-400 rounded-full animate-ping pointer-events-none opacity-70" />
                )}
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                {biometricSuccess ? 'Authenticated' : biometricScanning ? 'Scanning...' : 'Simulate Face ID'}
              </span>
            </button>

            {/* Google Single Sign On Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSigningIn}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/40 dark:bg-white/5 hover:bg-slate-100/50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/10 text-slate-600 dark:text-slate-300 transition-all outline-none"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                {isGoogleSigningIn ? 'Connecting...' : 'Google SSO'}
              </span>
            </button>
          </div>

          {/* Secure Environment Badges */}
          <div className="mt-6 flex justify-center items-center gap-4 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 stroke-[1.8]" /> RLS Protected
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 stroke-[1.8]" /> Offline Caching
            </span>
          </div>

        </motion.div>

        {/* Guest Mode Option / Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-6 text-center"
        >
          <button
            onClick={onBypass}
            className="text-xs font-mono font-bold tracking-wider text-slate-500 hover:text-cyan-400 transition-colors uppercase outline-none focus:outline-none"
          >
            ⚡ Proceed with Sandbox Local Storage sandbox
          </button>
        </motion.div>

      </div>
    </div>
  );
}
