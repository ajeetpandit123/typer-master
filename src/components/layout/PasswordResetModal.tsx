'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/services/supabaseClient';
import { Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export const PasswordResetModal: React.FC = () => {
  const { isResettingPassword, setIsResettingPassword, addToast, logOut } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isResettingPassword) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      addToast('Validation Error', 'Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Validation Error', 'Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase!.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      addToast('Success', 'Your password has been successfully reset. You can now login using your new password.', 'success');
      setIsResettingPassword(false);
      
      // Optionally sign them out to force logging in with new credentials, or keep them signed in
      // Let's keep them signed in but successfully close the modal.
    } catch (err: any) {
      addToast('Reset Failed', err.message || 'Could not update password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md border rounded-2xl p-8 relative shadow-2xl transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--surface)', 
          borderColor: 'var(--border)',
          boxShadow: '0 0 25px rgba(0, 242, 254, 0.15)'
        }}
      >
        <div className="text-center mb-6">
          <div className="inline-block p-3 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 mb-3" style={{ color: 'var(--accent)' }}>
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create New Password</h2>
          <p className="text-xs text-slate-400 mt-2">
            Please enter your new secure password below to regain full access to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">New Password</label>
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

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-lg glass-input text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Warning banner */}
          <div className="p-3 rounded-lg border text-[11px] flex gap-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'var(--error)', color: 'var(--error)' }}>
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <span>Min password length is 6 characters. Do not close this browser tab until you have saved your new password.</span>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-bold rounded-lg text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Save Password & Login'
              )}
            </button>
            
            <button
              type="button"
              onClick={logOut}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-red-400 transition"
            >
              Cancel & Log Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
