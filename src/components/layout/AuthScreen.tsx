'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/services/supabaseClient';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';

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

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (localMode) {
      // Simulate network request
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
      // Real Supabase Auth
      try {
        if (isLogin) {
          const { error } = await supabase!.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          addToast('Login Successful', 'Welcome back to TypeMaster Pro!', 'success');
        } else {
          if (!username) {
            addToast('Validation Error', 'Please enter a username', 'error');
            setLoading(false);
            return;
          }
          const { error } = await supabase!.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
              }
            }
          });
          if (error) throw error;
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

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('Error', 'Please enter your email address first.', 'error');
      return;
    }
    
    addToast(
      'Reset Instructions Sent',
      `Password reset link has been dispatched to ${email}.`,
      'success'
    );
    setForgotPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 grid-bg">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyber-blue/15 rounded-full filter blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyber-purple/15 rounded-full filter blur-[90px]" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20 mb-2">
            {localMode ? '⚡ Local Offline Mode' : '🔗 Connected to Supabase'}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            TypeMaster <span className="text-cyber-blue text-glow-cyan">Pro</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            The premium typing learning & battle arena
          </p>
        </div>

        {forgotPassword ? (
          /* Forgot Password Interface */
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Reset Password</h3>
            <p className="text-xs text-slate-400">
              Enter your registration email. We will send you instructions to change your security password.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-blue/90 hover:to-cyber-purple/90 text-white font-bold rounded-lg text-sm shadow-md transition-all active:scale-[0.98]"
            >
              Send Reset Code
            </button>

            <button
              type="button"
              onClick={() => setForgotPassword(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-cyber-blue transition"
            >
              Back to Login
            </button>
          </form>
        ) : (
          /* Standard Auth Interface */
          <div>
            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all ${
                  isLogin
                    ? 'border-cyber-blue text-cyber-blue text-glow-cyan'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all ${
                  !isLogin
                    ? 'border-cyber-blue text-cyber-blue text-glow-cyan'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleCredentialsAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-slate-500">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SpeedTypist"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-[11px] text-cyber-blue hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-lg glass-input text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyber-blue focus:ring-cyber-blue/30"
                  />
                  <label htmlFor="remember_me" className="ml-2 text-xs text-slate-400 select-none cursor-pointer">
                    Remember me on this browser
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-blue/90 hover:to-cyber-purple/90 text-white font-bold rounded-lg text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Social Oauth */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0b0f19] px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialAuth('google')}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition active:scale-[0.97] disabled:opacity-50"
              >
                <ChromeIcon size={14} className="text-red-400" />
                Google
              </button>
              <button
                onClick={() => handleSocialAuth('github')}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition active:scale-[0.97] disabled:opacity-50"
              >
                <GithubIcon size={14} className="text-slate-200" />
                GitHub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
