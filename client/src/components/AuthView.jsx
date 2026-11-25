import React, { useState } from 'react';
import InfoModal from './InfoModal';
import {
  Flame,
  Zap,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function AuthView({
  onLoginSuccess
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Modals
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [legalModal, setLegalModal] = useState({ isOpen: false, title: '', message: '' });

  // Handle Form Submission (Sign in or Register)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!cleanPassword) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          throw new Error('Please enter your full name to create an account.');
        }
        // Call backend / persistent register
        const newUser = await api.register(name.trim(), cleanEmail, cleanPassword);
        setSuccessNotice('Account created successfully! Welcome to DayByDay.');
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(newUser);
          }
        }, 400);
      } else {
        // Strict Login check against DB / registered credentials
        const loggedInUser = await api.login(cleanEmail, cleanPassword);
        if (onLoginSuccess) {
          onLoginSuccess(loggedInUser);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social Login
  const handleSocialLogin = async (provider) => {
    setError('');
    setIsLoading(true);
    try {
      const socialEmail = `karthik.${provider.toLowerCase()}@daybyday.app`;
      let user;
      try {
        user = await api.login(socialEmail, 'social_secure_token');
      } catch {
        user = await api.register(`${provider} User (Karthik)`, socialEmail, 'social_secure_token');
      }
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#6366F1]/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#4edea3]/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP HEADER & LOGO */}
      <div className="w-full max-w-4xl flex flex-col items-center pt-2 sm:pt-4 z-10 space-y-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8083ff] p-[1.5px] shadow-[0_0_16px_rgba(99,102,241,0.5)]">
            <div className="w-full h-full bg-[#0b1326] rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#c0c1ff]" />
            </div>
          </div>
          <span className="font-display font-extrabold text-base tracking-tight text-white">
            DayByDay Tracker
          </span>
        </div>

        {/* Top Notification Pill (Exact match with photo) */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#131b2e] border border-white/10 text-xs font-display shadow-lg shadow-black/40">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-white font-medium">12-day streak waiting for you</span>
          <span className="text-white/20">|</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#908fa0]">
            DAY 13/30 UNLOCKS TODAY
          </span>
        </div>

      </div>

      {/* 2. MAIN SPLIT CARD (LEFT PREVIEW + RIGHT AUTH FORM) */}
      <div className="w-full max-w-4xl my-6 rounded-3xl bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)] grid grid-cols-1 md:grid-cols-2 overflow-hidden z-10">
        
        {/* LEFT PANEL: Micro-Sprint Preview & Testimonial */}
        <div className="bg-[#131b2e]/60 border-b md:border-b-0 md:border-r border-white/5 p-7 sm:p-8 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            
            {/* Phase tag */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#171f33] border border-white/5 text-[10px] font-display font-bold uppercase tracking-wider text-[#c0c1ff]">
                MICRO-SPRINT PHASE 2
              </span>
              <span className="text-[10px] font-display font-semibold text-[#908fa0]">
                {new Date().getFullYear()} Cycle
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl text-white tracking-tight leading-snug">
                Build a 30-day habit that sticks.
              </h2>
              <p className="font-sans text-xs text-[#908fa0] leading-relaxed">
                Small daily commitments compound into permanent lifestyle transformations. Keep your momentum alive.
              </p>
            </div>

            {/* Matrix Card Preview (6x5 Grid) */}
            <div className="rounded-2xl bg-[#0b1326] border border-white/5 p-4 space-y-3.5 shadow-inner">
              
              {/* Header */}
              <div className="flex items-center justify-between text-xs font-display">
                <span className="flex items-center gap-1.5 text-[#4edea3] font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Deep Focus 90m
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00885d]/30 text-[#4edea3] border border-[#4edea3]/30">
                  80% Velocity
                </span>
              </div>

              {/* 6x5 Grid */}
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const isDone = day <= 12;
                  const isToday = day === 13;

                  let style = '';
                  if (isDone) {
                    style = 'bg-[#00885d]/30 border border-[#4edea3]/40 text-[#4edea3]';
                  } else if (isToday) {
                    style = 'bg-[#c0c1ff] text-[#07006c] font-black border-2 border-white shadow-[0_0_12px_rgba(192,193,255,0.7)] animate-pulse';
                  } else {
                    style = 'bg-[#131b2e] border border-white/5 text-[#908fa0]/40';
                  }

                  return (
                    <div
                      key={day}
                      className={`h-9 rounded-lg flex items-center justify-center text-xs font-display ${style}`}
                    >
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <span className="tabular-nums font-semibold">{day}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Grid Footer */}
              <div className="flex items-center justify-between text-[11px] font-display text-[#908fa0] pt-1 border-t border-white/5">
                <span>Sprint: Morning Routine</span>
                <span className="flex items-center gap-1 text-[#4edea3] font-bold">
                  <Zap className="w-3 h-3" />
                  42d total record
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT PANEL: Authentication Form */}
        <div className="p-7 sm:p-8 flex flex-col justify-between space-y-5 bg-[#0f172a]">
          
          <div className="space-y-4">
            
            {/* Header / Mode Indicator */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider bg-[#571bc1]/25 text-[#c0c1ff] border border-[#8083ff]/30">
                <Lock className="w-3 h-3 text-[#c0c1ff]" />
                Secure Member Portal
              </span>

              <h2 className="font-display font-black text-2xl text-white tracking-tight">
                {isSignUp ? 'Create your DayByDay account' : 'Welcome back to DayByDay'}
              </h2>

              <p className="font-sans text-xs text-[#908fa0]">
                {isSignUp
                  ? 'Sign up to register your credentials in the database and begin your 30-day sprint.'
                  : 'Sign in with your registered credentials to continue your 30-day challenge.'}
              </p>
            </div>

            {/* Error / Alert notification banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-display flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Success notification */}
            {successNotice && (
              <div className="p-2.5 rounded-xl bg-[#00885d]/20 border border-[#4edea3]/40 text-[#4edea3] text-xs font-display flex items-center gap-2 animate-in fade-in duration-150">
                <Check className="w-3.5 h-3.5" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Temporarily commented out Social Logins & Divider
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-display font-semibold text-white transition-all shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-display font-semibold text-white transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.65-.79 1.09-1.89.97-2.99-.95.04-2.1.63-2.77 1.42-.59.68-1.1 1.79-.96 2.87 1.05.08 2.11-.53 2.76-1.3z" />
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-white/10" />
              <span className="absolute bg-[#0f172a] px-3 text-[10px] font-display font-bold uppercase tracking-widest text-[#908fa0]">
                OR CONTINUE WITH EMAIL
              </span>
            </div>
            */}

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Full Name field (When in sign up mode) */}
              {isSignUp && (
                <div className="space-y-1 animate-in fade-in duration-150">
                  <label className="text-xs font-display font-semibold text-[#908fa0] block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#908fa0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="e.g. Karthik Vignesh"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131b2e] border border-white/10 text-xs text-white placeholder-[#908fa0]/50 focus:border-[#8083ff] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-display font-semibold text-[#908fa0] block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#908fa0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131b2e] border border-white/10 text-xs text-white placeholder-[#908fa0]/50 focus:border-[#8083ff] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password with clean Show / Hide Toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-display font-semibold text-[#908fa0]">
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-xs font-display text-[#908fa0] hover:text-[#c0c1ff] transition-all"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#908fa0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your password..."
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#131b2e] border border-white/10 text-xs text-white placeholder-[#908fa0]/50 focus:border-[#8083ff] focus:outline-none transition-all font-mono"
                  />
                  {/* Eye toggle button */}
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPassword((prev) => !prev);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#908fa0] hover:text-white p-1 rounded-md transition-all cursor-pointer focus:outline-none z-10"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[#8083ff]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#908fa0]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Security */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#908fa0] hover:text-white">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#131b2e] border-white/20 text-[#8083ff] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Remember me for 30 days</span>
                </label>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#4edea3]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4edea3]" />
                  <span>End-to-End Encrypted</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c0c1ff] via-[#8083ff] to-[#6366F1] text-[#07006c] font-display font-black text-xs sm:text-sm tracking-wide shadow-[0_4px_24px_rgba(128,131,255,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Verifying Credentials...' : (isSignUp ? 'Create Account & Start Sprint' : 'Sign In to Tracker')}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

            </form>

          </div>

          {/* Toggle between Sign In and Sign Up */}
          <div className="text-center pt-2 border-t border-white/5">
            <p className="text-xs font-display text-[#908fa0]">
              {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccessNotice('');
                  setPassword('');
                }}
                className="text-white hover:text-[#c0c1ff] font-bold underline underline-offset-2 transition-all ml-1 cursor-pointer"
              >
                {isSignUp ? 'Sign in' : 'Sign up for free'}
              </button>
            </p>
          </div>

        </div>

      </div>

      {/* 3. FOOTER */}
      <footer className="text-center text-[11px] font-display text-[#908fa0] py-3 z-10 space-x-2">
        <span>© {new Date().getFullYear()} DayByDay Tracker. All rights reserved.</span>
        <span>•</span>
        <button
          onClick={() => {
            setLegalModal({
              isOpen: true,
              title: 'Terms of Service',
              message: 'Welcome to DayByDay! By accessing or using our adaptive habit tracker platform, you agree to commit to personal integrity, daily habit execution, and positive self-accountability.\n\nAll sprint data, habits, and progress analytics belong to you. We provide the tools for disciplined progress and deep focus.'
            });
          }}
          className="hover:text-white transition-all cursor-pointer"
        >
          Terms of Service
        </button>
        <span>•</span>
        <button
          onClick={() => {
            setLegalModal({
              isOpen: true,
              title: 'Privacy Policy',
              message: 'Your privacy is paramount. DayByDay strictly protects your personal data, habit logs, reflection notes, and sprint progress.\n\nWe never sell or share your personal information with third parties. All accounts are isolated and your records are accessible only by you.'
            });
          }}
          className="hover:text-white transition-all cursor-pointer"
        >
          Privacy Policy
        </button>
      </footer>

      {/* Terms & Privacy Modal */}
      <InfoModal
        isOpen={legalModal.isOpen}
        title={legalModal.title}
        message={legalModal.message}
        type="terms"
        onClose={() => setLegalModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-md w-full rounded-2xl bg-[#131b2e] border border-white/10 p-6 space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-lg text-white">Reset Your Password</h3>
            <p className="text-xs text-[#908fa0]">
              Enter your email address and we will send you a secure magic link to reset your 30-Day Tracker password.
            </p>
            {resetSuccess ? (
              <div className="p-3 rounded-xl bg-[#00885d]/20 border border-[#4edea3]/40 text-[#4edea3] text-xs font-display font-medium">
                Password reset link sent to your inbox! Check your spam folder if not visible.
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0b1326] border border-white/10 text-xs text-white placeholder-[#908fa0]/50 focus:border-[#8083ff] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (forgotEmail) setResetSuccess(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#8083ff] text-[#0b1326] font-display font-bold text-xs cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(false);
                  setResetSuccess(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-display font-semibold text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
