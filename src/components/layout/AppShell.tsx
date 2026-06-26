'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { APP_NAME } from '@/lib/config';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Trophy, Zap, Target, Hourglass, ShieldAlert, Award, 
  BookOpen, MessageSquare, Code, Sword, Settings, 
  Menu, X, Sparkles, Database, FileText, Flame, Shield, LogOut,
  Users, ArrowLeft
} from 'lucide-react';
import { PasswordResetModal } from '@/components/layout/PasswordResetModal';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { 
    user, 
    profile, 
    globalRank,
    loading, 
    logOut, 
    isZenMode, 
    setIsZenMode,
    addToast 
  } = useApp();
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdminPanel = pathname.startsWith('/admin');

  // Active Tab computation based on path & search query
  const getActiveTab = (): string => {
    if (isAdminPanel) {
      if (pathname === '/admin/dashboard') return 'overview';
      if (pathname === '/admin/users') return 'users';
      if (pathname === '/admin/tests') return 'tests';
      if (pathname === '/admin/analytics') return 'analytics';
      if (pathname === '/admin/words') return 'words';
      if (pathname === '/admin/settings') return 'settings';
      return 'overview';
    }
    const tabParam = searchParams?.get('tab');
    return tabParam || 'dashboard';
  };

  const activeTab = getActiveTab();

  const hasToastedAccessDenied = useRef(false);

  // Client-side route protection & error query toast
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam === 'unauthorized') {
      if (!hasToastedAccessDenied.current) {
        addToast('Access Denied', 'You do not have permission to access this page.', 'error');
        hasToastedAccessDenied.current = true;
      }
      router.replace(pathname);
      return;
    }

    if (!loading && profile) {
      if (pathname.startsWith('/admin') && profile.role !== 'admin') {
        if (!hasToastedAccessDenied.current) {
          addToast('Access Denied', 'You do not have permission to access this page.', 'error');
          hasToastedAccessDenied.current = true;
        }
        router.push('/dashboard');
      } else {
        hasToastedAccessDenied.current = false;
      }
    }
  }, [profile, loading, pathname, router, addToast, searchParams]);

  const handleNavigate = (tabId: string) => {
    setIsZenMode(false);
    setSidebarOpen(false);

    if (isAdminPanel) {
      if (tabId === 'return-app') {
        router.push('/dashboard');
      } else {
        router.push(`/admin/${tabId}`);
      }
    } else {
      if (tabId === 'admin') {
        router.push('/admin/dashboard');
      } else if (tabId === 'dashboard') {
        router.push('/dashboard');
      } else {
        router.push(`/dashboard?tab=${tabId}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[var(--accent,#FF6B00)] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black text-[var(--accent,#FF6B00)]">
            KS
          </div>
        </div>
      </div>
    );
  }

  // If unauthorized or loading auth state, show nothing until redirect
  if (!user || !profile || (pathname.startsWith('/admin') && profile.role !== 'admin')) {
    return null;
  }

  // Get dynamic navigation items based on active workspace
  const navItems = isAdminPanel
    ? [
        { id: 'dashboard', label: 'Overview', icon: <Target size={16} /> },
        { id: 'users', label: 'Users', icon: <Users size={16} /> },
        { id: 'tests', label: 'Tests', icon: <Code size={16} /> },
        { id: 'words', label: 'Word Collections', icon: <BookOpen size={16} /> },
        { id: 'analytics', label: 'Analytics', icon: <Zap size={16} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
        { id: 'return-app', label: 'Return to App', icon: <ArrowLeft size={16} /> },
      ]
    : [
        { id: 'dashboard', label: 'Overview', icon: <Target size={16} /> },
        { id: 'practice', label: 'Practice Mode', icon: <BookOpen size={16} /> },
        { id: 'my_words', label: 'My Words', icon: <FileText size={16} /> },
        { id: 'battle', label: 'Battle Arena', icon: <Sword size={16} /> },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Award size={16} /> },
        { id: 'achievements', label: 'Achievements', icon: <Trophy size={16} /> },
      ];

  // If user is admin and in user panel, append Admin Dashboard to the sidebar
  if (!isAdminPanel && profile.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Dashboard', icon: <Shield size={16} /> });
  }

  // Append Settings to the user panel at the very end
  if (!isAdminPanel) {
    navItems.push({ id: 'settings', label: 'Settings', icon: <Settings size={16} /> });
  }

  return (
    <div className={`flex bg-[#0B0B0B] text-white relative font-sans selection:bg-[rgba(var(--accent-rgb),0.3)] selection:text-white ${
      isZenMode 
        ? 'h-screen max-h-screen overflow-hidden w-screen' 
        : 'min-h-screen w-full'
    }`}>
      
      {/* Password Reset Modal Overlay */}
      <PasswordResetModal />
      
      {/* 1. Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-[#222222] bg-[#111111]/80 backdrop-blur-md justify-between shrink-0 transition-all duration-500 ease-in-out ${
        isZenMode 
          ? 'w-0 opacity-0 p-0 border-r-0 overflow-hidden' 
          : 'w-64 opacity-100 p-6'
      }`}>
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => handleNavigate('dashboard')}>
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-black transition-all duration-300"
              style={{
                backgroundColor: 'var(--accent)',
                boxShadow: '0 0 12px var(--accent)'
              }}
            >
              KS
            </div>
            <h1 className="text-lg font-bold tracking-wider text-white transition-all duration-300">
              Key<span className="transition-all duration-300" style={{ color: 'var(--accent)', textShadow: '0 0 6px var(--accent)' }}>stra</span>
            </h1>
          </div>

          {/* User Profile Widget */}
          <div 
            onClick={() => handleNavigate('settings')}
            className="p-3 rounded-xl border flex items-center gap-3 bg-[#181818] border-[#222222] hover:border-[rgba(var(--accent-rgb),0.4)] transition duration-200 cursor-pointer"
          >
            <img src={profile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-[#222222]" />
            <div className="truncate">
              <h4 className="text-xs font-bold truncate text-white">{profile.username}</h4>
              <span className="text-[10px] font-semibold text-[var(--accent)]">Lvl {profile.level} Typist</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest font-bold mb-2 px-3 text-slate-500">
              Menu
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const isReturnApp = item.id === 'return-app';
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all border cursor-pointer ${
                    isReturnApp
                      ? 'border-transparent text-[#FF6B00] hover:bg-[#FF6B00]/10'
                      : isActive 
                        ? 'bg-[rgba(var(--accent-rgb),0.1)] border-[var(--accent)] text-[var(--accent)]' 
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-[#181818]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>


      </aside>

      {/* 2. Mobile Nav Header Bar */}
      <div className={`fixed top-0 left-0 right-0 z-40 border-b bg-[#111111]/85 backdrop-blur-xl px-4 flex items-center justify-between lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${
        isZenMode 
          ? 'h-0 opacity-0 border-b-0 py-0 pointer-events-none' 
          : 'h-14 opacity-100'
      }`} style={{ borderColor: '#222222' }}>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-bold tracking-wider text-white cursor-pointer transition-all duration-300" onClick={() => handleNavigate('dashboard')}>
            Key<span className="font-bold transition-all duration-300" style={{ color: 'var(--accent)', textShadow: '0 0 6px var(--accent)' }}>stra</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#222222] bg-[#181818] text-white">
            <Flame size={11} className="text-[var(--accent)]" />
            <span>{profile.streak}d</span>
          </div>

          <button 
            onClick={() => handleNavigate('settings')}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-[#111111] hover:bg-[#181818] transition duration-200 border-[#222222] cursor-pointer select-none"
          >
            <img src={profile.avatarUrl} alt="Avatar" className="w-4 h-4 rounded-full border border-[#222222]" />
            <span className="text-[10px] font-bold text-white">
              {profile.username}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
          
          <div className="relative w-64 p-6 flex flex-col justify-between border-r border-[#222222] bg-[#111111]">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => { handleNavigate('dashboard'); setSidebarOpen(false); }}>
                  <div 
                    className="w-6 h-6 rounded text-black font-black text-xs flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--accent)',
                      boxShadow: '0 0 8px var(--accent)'
                    }}
                  >
                    KS
                  </div>
                  <span className="text-sm font-bold text-white tracking-wider transition-all duration-300">
                    Key<span className="transition-all duration-300" style={{ color: 'var(--accent)', textShadow: '0 0 4px var(--accent)' }}>stra</span>
                  </span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isReturnApp = item.id === 'return-app';
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition border cursor-pointer ${
                        isReturnApp
                          ? 'border-transparent text-[#FF6B00] hover:bg-[#FF6B00]/10'
                          : activeTab === item.id 
                            ? 'bg-[rgba(var(--accent-rgb),0.1)] border-[var(--accent)] text-[var(--accent)]' 
                            : 'border-transparent text-slate-400 hover:text-white hover:bg-[#181818]'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>


          </div>
        </div>
      )}

      {/* 4. Main Panel Body */}
      <main className={`flex-1 flex flex-col min-w-0 ${isZenMode ? 'pt-0' : 'pt-14 lg:pt-0'}`}>
        
        {/* Header HUD panel */}
        <header className={`hidden lg:flex items-center justify-between border-b border-[#222222] px-8 shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${
          isZenMode 
            ? 'h-0 opacity-0 border-b-0 py-0 pointer-events-none' 
            : 'h-14 opacity-100'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {activeTab === 'dashboard' ? 'Overview' : activeTab.replace(/([A-Z])/g, ' $1')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border border-[#222222] bg-[#181818] text-white select-none">
              <Flame size={13} className="text-[var(--accent)] animate-pulse" />
              <span>Streak: <span className="text-[var(--accent)]">{profile.streak}d</span></span>
            </div>

            {/* XP Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border border-[#222222] bg-[#181818] text-white select-none">
              <Zap size={13} className="text-[var(--accent)]" />
              <span>{profile.xp} XP</span>
            </div>

            {/* Rank Indicator */}
            <div className="flex items-center gap-2 text-xs select-none">
              <span className="font-semibold text-slate-400">Rank:</span>
              <strong className="flex items-center gap-1 text-white">
                <Sparkles size={12} className="text-[var(--accent)]" />
                Lvl {profile.level} {globalRank > 0 && `(#${globalRank})`}
              </strong>
            </div>

            {/* Profile Button */}
            <button 
              onClick={() => handleNavigate('settings')}
              className="flex items-center gap-2 px-3 py-1 rounded-full border bg-[#111111] hover:bg-[#181818] transition-all duration-200 border-[#222222] hover:border-[rgba(var(--accent-rgb),0.4)] cursor-pointer select-none group"
            >
              <img src={profile.avatarUrl} alt="Avatar" className="w-5.5 h-5.5 rounded-full border border-[#222222]" />
              <span className="text-xs font-bold text-white">
                {profile.username}
              </span>
            </button>
          </div>
        </header>

        {/* Content Pane */}
        <div className={`flex-1 ${
          isZenMode 
            ? 'p-0 overflow-hidden' 
            : 'p-6 md:p-8 overflow-y-auto'
        }`}>
          {children}
        </div>
      </main>

    </div>
  );
};
