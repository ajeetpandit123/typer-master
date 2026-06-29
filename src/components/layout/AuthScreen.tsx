'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/services/supabaseClient';
import { APP_NAME } from '@/lib/config';
import { Lock, Mail, User, Eye, EyeOff, Trophy, Sparkles, Sword, TrendingUp, Users, Activity, ArrowRight, Shield } from 'lucide-react';
import { KeyboardBackground3D } from './KeyboardBackground3D';
import { InteractivePreview } from './InteractivePreview';
import { motion } from 'framer-motion';

const ChromeIcon = ({ className, size = 14 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="8" x2="22" y2="8" />
    <line x1="12" y1="16" x2="6" y2="5.5" />
    <line x1="8" y1="12" x2="19" y2="19" />
  </svg>
);

const GithubIcon = ({ className, size = 14 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const AuthScreen: React.FC = () => {
  const { localMode, logInLocal, signUpLocal, addToast } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mouse tilt variables
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: -y * 8, // subtle rotation
      ry: x * 8
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (localMode) {
      setTimeout(async () => {
        try {
          if (isLogin) {
            const guestUsername = username || email.split('@')[0] || 'GuestTypist';
            await logInLocal(guestUsername, email);
          } else {
            if (!username) {
              addToast('Validation Error', 'Please enter a username', 'error');
              setLoading(false);
              return;
            }
            await signUpLocal(username, email);
          }
        } catch (err: any) {
          addToast('Auth Error', err.message || 'Operation failed', 'error');
        } finally {
          setLoading(false);
        }
      }, 800);
    } else {
      try {
        if (isLogin) {
          const { error } = await supabase!.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          addToast('Login Successful', `Welcome back to ${APP_NAME}!`, 'success');
        } else {
          if (!username) {
            addToast('Validation Error', 'Please enter a username', 'error');
            setLoading(false);
            return;
          }

          const { data: existingUser } = await supabase!
            .from('profiles')
            .select('username')
            .eq('username', username)
            .maybeSingle();

          if (existingUser) {
            addToast('Registration Failed', 'This username is already taken. Please choose another one.', 'error');
            setLoading(false);
            return;
          }

          const { data, error } = await supabase!.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
              }
            }
          });
          if (error) throw error;

          if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
            addToast('Registration Failed', 'This email is already registered. Please sign in instead.', 'error');
            setLoading(false);
            return;
          }

          addToast('Registration Successful', 'Please check your email to confirm registration.', 'success');
        }
      } catch (err: any) {
        addToast('Authentication Failed', err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    if (localMode) {
      setLoading(true);
      setTimeout(() => {
        const mockName = provider === 'google' ? 'GoogleTypist' : 'GitHubCoder';
        const mockEmail = `${mockName.toLowerCase()}@example.com`;
        logInLocal(mockName, mockEmail);
        setLoading(false);
      }, 600);
    } else {
      try {
        const { error } = await supabase!.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } catch (err: any) {
        addToast('OAuth Failed', err.message, 'error');
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('Error', 'Please enter your email address first.', 'error');
      return;
    }
    
    setLoading(true);
    if (localMode) {
      setTimeout(() => {
        addToast(
          'Reset Instructions Sent',
          `Password reset link has been dispatched to ${email}.`,
          'success'
        );
        setForgotPassword(false);
        setLoading(false);
      }, 800);
    } else {
      try {
        const { error } = await supabase!.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}`,
        });
        if (error) throw error;
        addToast(
          'Reset Instructions Sent',
          `Password reset link has been dispatched to ${email}.`,
          'success'
        );
        setForgotPassword(false);
      } catch (err: any) {
        addToast('Reset Failed', err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen max-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#070a13] font-sans selection:bg-orange-500/30 selection:text-white">
      {/* Interactive 3D Canvas Keyboard Background */}
      <KeyboardBackground3D />

      {/* Atmospheric depth lighting overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#020306]/90 via-[#070a13]/70 to-[#020306]/90 pointer-events-none z-0" />

      {/* Main Grid Wrapper */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-8 lg:px-12 py-6 lg:py-0 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Side: Hero Section */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col items-start text-left text-white max-w-xl select-none pt-16 lg:pt-12"
        >
          {/* Logo inline at the top of the Hero Column */}
          <div className="flex items-center gap-2.5 mb-6 select-none">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.4)]">
              <svg className="w-5 h-5 text-[#070a13]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 5h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm1 4v2h2V9H5zm4 0v2h2V9H9zm4 0v2h2V9h-2zm4 0v2h2V9h-2zM5 13v2h2v-2H5zm4 0v2h6v-2H9zm8 0v2h2v-2h-2z" />
              </svg>
            </div>
            <span className="text-md font-bold text-white tracking-wider">
              Key<span className="text-orange-500">stra</span>
            </span>
          </div>

          <h1 className="font-extrabold tracking-tight text-5xl lg:text-[56px] leading-[1.05] text-white">
            Master Every<br />
            <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.2)]">Keystroke</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 font-normal mt-4 max-w-md leading-relaxed">
            The ultimate typing arena for speed, accuracy and competition.
          </p>

          {/* Motivational Quote */}
          <div className="relative border-l-[3px] border-orange-500/80 pl-6 py-1 my-4 max-w-md">
            <span className="text-orange-500/20 text-5xl font-serif absolute -top-4 -left-1 select-none">“</span>
            <p className="text-sm text-slate-300 font-medium leading-relaxed relative z-10">
              The keyboard is your weapon.<br/>
              Master it, and words become power.
            </p>
            <p className="text-xs text-orange-500 font-bold mt-2 tracking-wider">
              — Keystra
            </p>
          </div>

          {/* Feature Grid: 4 Horizontal Dark Cards */}
          <div className="grid grid-cols-4 gap-3 mt-4 w-full max-w-md">
            <div className="bg-[#0c0d12]/75 border border-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center aspect-square transition-all duration-300 hover:border-orange-500/20 hover:bg-[#0c0d12]/90">
              <TrendingUp className="text-orange-500 mb-1.5" size={16} />
              <span className="text-[10px] font-bold text-white leading-tight">Live WPM</span>
              <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Tracking</span>
            </div>

            <div className="bg-[#0c0d12]/75 border border-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center aspect-square transition-all duration-300 hover:border-orange-500/20 hover:bg-[#0c0d12]/90">
              <Users className="text-orange-500 mb-1.5" size={16} />
              <span className="text-[10px] font-bold text-white leading-tight">Multiplayer</span>
              <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Battles</span>
            </div>

            <div className="bg-[#0c0d12]/75 border border-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center aspect-square transition-all duration-300 hover:border-orange-500/20 hover:bg-[#0c0d12]/90">
              <Trophy className="text-orange-500 mb-1.5" size={16} />
              <span className="text-[10px] font-bold text-white leading-tight">Global</span>
              <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Leaderboards</span>
            </div>

            <div className="bg-[#0c0d12]/75 border border-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center aspect-square transition-all duration-300 hover:border-orange-500/20 hover:bg-[#0c0d12]/90">
              <Sparkles className="text-orange-500 mb-1.5" size={16} />
              <span className="text-[10px] font-bold text-white leading-tight">AI Typing</span>
              <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Coach</span>
            </div>
          </div>

          {/* Interactive Arena Preview Widget */}
          <div className="w-full max-w-md mt-5">
            <InteractivePreview />
          </div>
        </motion.div>

        {/* Right Side: Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="lg:col-span-5 flex justify-center w-full"
        >
          {/* Glassmorphic tilt card */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transition: 'transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}
            className="w-full max-w-md bg-[#0a0c12]/50 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-500 hover:border-orange-500/30 hover:shadow-[0_20px_50px_rgba(249,115,22,0.15)] relative overflow-hidden group"
          >
            {/* Soft inner glow gradient */}
            <div className="absolute -top-1/4 -right-1/4 w-52 h-52 bg-orange-500/10 rounded-full blur-[80px] group-hover:bg-orange-500/15 transition-all duration-500" />
            
            {/* Connected status badge */}
            <div className="text-center mb-6 relative select-none">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Key<span className="text-orange-500 font-black">stra</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                The premium typing learning & battle arena
              </p>
            </div>

            {forgotPassword ? (
              /* Forgot Password Interface */
              <form onSubmit={handleForgotPassword} className="space-y-4 relative z-10">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Reset Password</h3>
                <p className="text-xs text-slate-400">
                  Enter your registration email. We will send you instructions to change your security password.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-[13px] text-slate-500">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/10 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] active:translate-y-0 active:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Send Reset Code'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setForgotPassword(false)}
                  className="w-full text-center text-xs text-slate-400 hover:text-orange-500 transition cursor-pointer"
                >
                  Back to Login
                </button>
              </form>
            ) : (
              /* Standard Auth Interface */
              <div className="relative z-10">
                {/* Tabs */}
                <div className="flex border-b border-white/5 mb-4 relative select-none">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center transition-colors relative z-10 cursor-pointer ${
                      isLogin ? 'text-orange-500 font-extrabold' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center transition-colors relative z-10 cursor-pointer ${
                      !isLogin ? 'text-orange-500 font-extrabold' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Sign Up
                  </button>
                  <div
                    className="absolute bottom-0 h-0.5 bg-orange-500 transition-all duration-300"
                    style={{
                      width: '50%',
                      left: isLogin ? '0%' : '50%'
                    }}
                  />
                </div>

                {/* Email & Password Form */}
                <form onSubmit={handleCredentialsAuth} className="space-y-3">
                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Username</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-[13px] text-slate-500">
                          <User size={14} />
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SpeedTypist"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/10 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email Address</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-[13px] text-slate-500">
                        <Mail size={14} />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Password</label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setForgotPassword(true)}
                          className="text-[10px] text-orange-500 hover:underline cursor-pointer font-bold"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-[13px] text-slate-500">
                        <Lock size={14} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {isLogin && (
                    <div className="flex items-center select-none py-1">
                      <input
                        id="remember_me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-800 bg-black/60 text-orange-500 focus:ring-orange-500/30 accent-orange-500 cursor-pointer"
                      />
                      <label htmlFor="remember_me" className="ml-2.5 text-xs text-slate-400 cursor-pointer">
                        Remember me on this browser
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] active:translate-y-0 active:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* Social Oauth */}
                <div className="relative my-6 select-none">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <span className="bg-[#0b0f19]/0 backdrop-blur-md px-3">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSocialAuth('google')}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-[#0f1118]/60 hover:bg-[#0f1118]/80 text-slate-200 hover:text-white text-xs font-bold transition active:scale-[0.98] cursor-pointer"
                  >
                    <ChromeIcon size={14} className="text-red-400" />
                    Google
                  </button>
                  <button
                    onClick={() => handleSocialAuth('github')}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-[#0f1118]/60 hover:bg-[#0f1118]/80 text-slate-200 hover:text-white text-xs font-bold transition active:scale-[0.98] cursor-pointer"
                  >
                    <GithubIcon size={14} className="text-slate-200" />
                    GitHub
                  </button>
                </div>

                {/* Security encryption footer */}
                <div className="flex items-center justify-center gap-1.5 mt-6 text-[10px] text-slate-500 font-medium select-none">
                  <Shield size={12} className="text-slate-500" />
                  <span>Your data is encrypted and secure</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
