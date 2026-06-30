'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { APP_NAME } from '@/lib/config';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Trophy, Zap, Target, Award, BookOpen, Sword, Settings, 
  Menu, X, Sparkles, FileText, Flame, Shield, LogOut,
  Users, ArrowLeft, Lock, Code
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black text-[var(--color-brand)]">
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

  // User panel navigation groups
  const userGroups = [
    {
      title: 'Dashboard',
      items: [{ id: 'dashboard', label: 'Overview', icon: <Target size={16} /> }]
    },
    {
      title: 'Practice',
      items: [
        { id: 'practice', label: 'Practice Mode', icon: <BookOpen size={16} /> },
        { id: 'my_words', label: 'My Words', icon: <FileText size={16} /> }
      ]
    },
    {
      title: 'Compete',
      items: [{ id: 'battle', label: 'Battle Arena', icon: <Sword size={16} /> }]
    },
    {
      title: 'Analytics',
      items: [{ id: 'leaderboard', label: 'Leaderboard', icon: <Award size={16} /> }]
    },
    {
      title: 'Achievements',
      items: [{ id: 'achievements', label: 'Achievements', icon: <Trophy size={16} /> }]
    }
  ];

  // Admin panel items
  const adminItems = [
    { id: 'dashboard', label: 'Overview', icon: <Target size={16} /> },
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
    { id: 'tests', label: 'Tests', icon: <Code size={16} /> },
    { id: 'words', label: 'Word Collections', icon: <BookOpen size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <Zap size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
    { id: 'return-app', label: 'Return to App', icon: <ArrowLeft size={16} /> },
  ];

  // Mobile Bottom Nav Tabs
  const mobileTabs = [
    { id: 'practice', label: 'Practice', icon: <BookOpen size={22} /> },
    { id: 'battle', label: 'Compete', icon: <Sword size={22} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <Target size={22} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Award size={22} /> },
    { id: 'settings', label: 'Profile', icon: <Settings size={22} /> },
  ];

  const getNavItemClasses = (isActive: boolean) => {
    return `w-full h-[36px] px-[10px] rounded-[var(--radius-md)] text-[13px] font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer ${
      isActive 
        ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]' 
        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)] bg-transparent'
    }`;
  };

  return (
    <div className={`flex bg-[var(--color-bg)] text-[var(--color-text-primary)] relative font-sans ${
      isZenMode 
        ? 'h-screen max-h-screen overflow-hidden w-screen' 
        : 'min-h-screen w-full'
    }`}>
      
      {/* Password Reset Modal Overlay */}
      <PasswordResetModal />
      
      {/* 1. Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] justify-between shrink-0 transition-all duration-500 ease-in-out ${
        isZenMode 
          ? 'w-0 opacity-0 p-0 border-r-0 overflow-hidden' 
          : 'w-[200px] opacity-100 p-[12px_8px]'
      }`}>
        <div className="space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-2 select-none cursor-pointer px-2 py-1" onClick={() => handleNavigate('dashboard')}>
            <div 
              className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center font-black text-xs text-black transition-all duration-300"
              style={{
                backgroundColor: 'var(--color-brand)',
                boxShadow: '0 0 10px var(--color-brand)'
              }}
            >
              KS
            </div>
            <h1 className="text-base font-bold tracking-wider text-[var(--color-text-primary)]">
              Key<span style={{ color: 'var(--color-brand)' }}>stra</span>
            </h1>
          </div>

          {/* User Profile Widget */}
          <div 
            onClick={() => handleNavigate('settings')}
            className="mx-1 p-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] hover:border-[var(--color-brand-border)] transition duration-200 cursor-pointer flex items-center gap-2.5"
          >
            <img src={profile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-[var(--color-border)]" />
            <div className="truncate min-w-0">
              <h4 className="text-[11px] font-semibold truncate text-[var(--color-text-primary)]">{profile.username}</h4>
              <span className="text-[9px] text-[var(--color-brand)] font-medium">Lvl {profile.level}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-3 px-1">
            {isAdminPanel ? (
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest font-bold px-2 text-[var(--color-text-muted)] block mb-1">
                  Admin Panel
                </span>
                {adminItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={getNavItemClasses(activeTab === item.id)}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {userGroups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest font-bold px-2 text-[var(--color-text-muted)] block mb-1">
                      {group.title}
                    </span>
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={getNavItemClasses(activeTab === item.id)}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Admin Dashboard Entry link (if in user panel and role is admin) */}
            {!isAdminPanel && profile.role === 'admin' && (
              <div className="pt-2 border-t border-[var(--color-border)]">
                <button
                  onClick={() => handleNavigate('admin')}
                  className={getNavItemClasses(activeTab === 'admin')}
                >
                  <Shield size={16} />
                  Admin Panel
                </button>
              </div>
            )}

            {/* Divider and Settings link */}
            {!isAdminPanel && (
              <div className="pt-2 border-t border-[var(--color-border)]">
                <button
                  onClick={() => handleNavigate('settings')}
                  className={getNavItemClasses(activeTab === 'settings')}
                >
                  <Settings size={16} />
                  Settings
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="px-1 pt-2 border-t border-[var(--color-border)]">
          <button
            onClick={() => {
              logOut();
              router.push('/');
            }}
            className="w-full h-[36px] px-[10px] rounded-[var(--radius-md)] text-[13px] font-medium flex items-center gap-2 text-[var(--color-error)] hover:bg-[rgba(225,112,85,0.08)] transition duration-200 cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* 2. Mobile Nav Header Bar (for screens <= 768px, styled using new tokens) */}
      <div className={`fixed top-0 left-0 right-0 z-40 border-b bg-[var(--color-surface)] px-4 flex items-center justify-between md:hidden transition-all duration-500 ease-in-out overflow-hidden ${
        isZenMode 
          ? 'h-0 opacity-0 border-b-0 py-0 pointer-events-none' 
          : 'h-14 opacity-100'
      }`} style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-bold tracking-wider text-[var(--color-text-primary)] cursor-pointer" onClick={() => handleNavigate('dashboard')}>
            Key<span style={{ color: 'var(--color-brand)' }}>stra</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]">
            <Flame size={11} className="text-[var(--color-brand)]" />
            <span>{profile.streak}d</span>
          </div>

          <button 
            onClick={() => handleNavigate('settings')}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition duration-200 border-[var(--color-border)] cursor-pointer select-none"
          >
            <img src={profile.avatarUrl} alt="Avatar" className="w-4 h-4 rounded-full border border-[var(--color-border)]" />
            <span className="text-[10px] font-bold text-[var(--color-text-primary)]">
              {profile.username}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Mobile Sidebar Drawer Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
          
          <div className="relative w-64 p-6 flex flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => { handleNavigate('dashboard'); setSidebarOpen(false); }}>
                  <div 
                    className="w-6 h-6 rounded text-black font-black text-xs flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--color-brand)',
                      boxShadow: '0 0 8px var(--color-brand)'
                    }}
                  >
                    KS
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-wider">
                    Key<span style={{ color: 'var(--color-brand)' }}>stra</span>
                  </span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-3">
                {isAdminPanel ? (
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest font-bold px-2 text-[var(--color-text-muted)] block mb-1">
                      Admin Panel
                    </span>
                    {adminItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={getNavItemClasses(activeTab === item.id)}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userGroups.map((group) => (
                      <div key={group.title} className="space-y-1">
                        <span className="text-[9px] uppercase tracking-widest font-bold px-2 text-[var(--color-text-muted)] block mb-1">
                          {group.title}
                        </span>
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            className={getNavItemClasses(activeTab === item.id)}
                          >
                            {item.icon}
                            {item.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Admin/Settings Links */}
                {!isAdminPanel && profile.role === 'admin' && (
                  <button onClick={() => handleNavigate('admin')} className={getNavItemClasses(activeTab === 'admin')}>
                    <Shield size={16} /> Admin Panel
                  </button>
                )}
                {!isAdminPanel && (
                  <button onClick={() => handleNavigate('settings')} className={getNavItemClasses(activeTab === 'settings')}>
                    <Settings size={16} /> Settings
                  </button>
                )}
              </nav>
            </div>
            
            <button
              onClick={() => {
                logOut();
                router.push('/');
              }}
              className="w-full h-[36px] px-[10px] rounded-[var(--radius-md)] text-[13px] font-medium flex items-center gap-2 text-[var(--color-error)] hover:bg-[rgba(225,112,85,0.08)] transition duration-200 cursor-pointer"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* 4. Main Panel Body */}
      <main className={`flex-1 flex flex-col min-w-0 ${isZenMode ? 'pt-0' : 'pt-14 md:pt-0'}`}>
        
        {/* Desktop Header HUD panel */}
        <header className={`hidden md:flex items-center justify-between border-b border-[var(--color-border)] px-8 shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${
          isZenMode 
            ? 'h-0 opacity-0 border-b-0 py-0 pointer-events-none' 
            : 'h-14 opacity-100'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              {activeTab === 'dashboard' ? 'Overview' : activeTab.replace(/([A-Z])/g, ' $1')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] select-none">
              <Flame size={13} className="text-[var(--color-brand)] animate-pulse" />
              <span>Streak: <span className="text-[var(--color-brand)]">{profile.streak}d</span></span>
            </div>

            {/* XP Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] select-none">
              <Zap size={13} className="text-[var(--color-brand)]" />
              <span>{profile.xp} XP</span>
            </div>

            {/* Rank Indicator */}
            <div className="flex items-center gap-2 text-xs select-none">
              <span className="font-semibold text-[var(--color-text-muted)]">Rank:</span>
              <strong className="flex items-center gap-1 text-[var(--color-text-primary)]">
                <Sparkles size={12} className="text-[var(--color-brand)]" />
                Lvl {profile.level} {globalRank > 0 && `(#${globalRank})`}
              </strong>
            </div>

            {/* Profile Button */}
            <button 
              onClick={() => handleNavigate('settings')}
              className="flex items-center gap-2 px-3 py-1 rounded-full border bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-all duration-200 border-[var(--color-border)] hover:border-[var(--color-brand-border)] cursor-pointer select-none group"
            >
              <img src={profile.avatarUrl} alt="Avatar" className="w-5.5 h-5.5 rounded-full border border-[var(--color-border)]" />
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {profile.username}
              </span>
            </button>
          </div>
        </header>

        {/* Content Pane (with padding-bottom for mobile bottom nav) */}
        <div className={`flex-grow overflow-y-auto ${
          isZenMode 
            ? 'p-0 overflow-hidden' 
            : 'p-6 md:p-8 pb-[72px] md:pb-8'
        }`}>
          {children}
        </div>
      </main>

      {/* 5. Mobile Bottom Nav (visible on screens <= 768px, hidden on desktop) */}
      {!isZenMode && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex justify-around items-center h-[56px] bg-[var(--color-surface)] border-t border-[var(--color-border)]">
          {mobileTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavigate(tab.id)}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer active:scale-95 transition-transform"
                style={{ minHeight: '44px' }}
                aria-label={tab.label}
              >
                <span className={`transition-colors duration-200 ${isActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'}`}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-medium mt-0.5 transition-colors duration-200 ${isActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};
