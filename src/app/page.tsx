'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { APP_NAME } from '@/lib/config';
import { AuthScreen } from '@/components/layout/AuthScreen';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { BeginnerPractice } from '@/components/typing/BeginnerPractice';
import { IntermediatePractice } from '@/components/typing/IntermediatePractice';
import { AdvancedPractice } from '@/components/typing/AdvancedPractice';
import { QuotePractice } from '@/components/typing/QuotePractice';
import { ChallengePractice } from '@/components/typing/ChallengePractice';
import { CodingPractice } from '@/components/typing/CodingPractice';
import { MultiplayerBattle } from '@/components/battle/MultiplayerBattle';
import { LeaderboardView } from '@/components/dashboard/LeaderboardView';
import { AdminView } from '@/components/dashboard/AdminView';
import { ExamPractice } from '@/components/typing/ExamPractice';
import { SettingsView } from '@/components/dashboard/SettingsView';
import { PasswordResetModal } from '@/components/layout/PasswordResetModal';
import { MyWords } from '@/components/typing/MyWords';

import { 
  Trophy, Zap, Target, Hourglass, ShieldAlert, Award, 
  BookOpen, MessageSquare, Code, Sword, Settings, 
  Menu, X, Sparkles, Database, DatabaseZap, FileText,
  Flame
} from 'lucide-react';

export default function Home() {
  const { user, profile, loading, localMode, logOut, caretBlinking, setCaretBlinking, cursorStyle, setCursorStyle, isZenMode, setIsZenMode, isResettingPassword } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    const practiceTabs = ['beginner', 'intermediate', 'advanced', 'quote', 'challenge', 'coding', 'exam'];
    if (!practiceTabs.includes(tab)) {
      setIsZenMode(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-dark">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black text-cyber-blue">
            {APP_NAME.split(' ').map(w => w[0]).join('')}
          </div>
        </div>
      </div>
    );
  }

  // Render Auth screen if guest or offline check hasn't run
  if (!user || !profile) {
    return <AuthScreen />;
  }

  // Render corresponding component
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => navigateTo(tab)} />;
      case 'beginner':
        return <BeginnerPractice onBack={() => navigateTo('dashboard')} />;
      case 'intermediate':
        return <IntermediatePractice onBack={() => navigateTo('dashboard')} />;
      case 'advanced':
        return <AdvancedPractice onBack={() => navigateTo('dashboard')} />;
      case 'quote':
        return <QuotePractice onBack={() => navigateTo('dashboard')} />;
      case 'challenge':
        return <ChallengePractice onBack={() => navigateTo('dashboard')} />;
      case 'coding':
        return <CodingPractice onBack={() => navigateTo('dashboard')} />;
      case 'exam':
        return <ExamPractice onBack={() => navigateTo('dashboard')} />;
      case 'battle':
        return <MultiplayerBattle />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'admin':
        return <AdminView />;
      case 'settings':
        return <SettingsView />;
      case 'my_words':
        return <MyWords onBack={() => navigateTo('dashboard')} />;
      default:
        return <DashboardView onNavigate={(tab) => navigateTo(tab)} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Target size={16} /> },
    { id: 'beginner', label: 'Level 1: Beginner', icon: <BookOpen size={16} />, header: 'Learning Paths' },
    { id: 'intermediate', label: 'Level 2: Intermediate', icon: <Zap size={16} /> },
    { id: 'advanced', label: 'Level 3: Advanced', icon: <ShieldAlert size={16} /> },
    { id: 'quote', label: 'Quote Mode', icon: <MessageSquare size={16} />, header: 'Typing Modes' },
    { id: 'challenge', label: 'Challenge Mode', icon: <Trophy size={16} /> },
    { id: 'coding', label: 'Coding Practice', icon: <Code size={16} /> },
    { id: 'exam', label: 'Exam Simulator', icon: <FileText size={16} /> },
    { id: 'my_words', label: 'My Words', icon: <FileText size={16} /> },
    { id: 'battle', label: 'Multiplayer Battle', icon: <Sword size={16} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Award size={16} />, header: 'Rankings' },
    { id: 'admin', label: 'Admin Dashboard', icon: <Database size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} />, header: 'Customizer' },
  ];

  return (
    <div className={`flex bg-bg text-text grid-bg relative ${
      isZenMode 
        ? 'h-screen max-h-screen overflow-hidden w-screen' 
        : 'min-h-screen w-full'
    }`}>
      
      {/* Password Reset Modal Overlay */}
      <PasswordResetModal />
      
      {/* 1. Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-border bg-surface justify-between shrink-0 transition-all duration-500 ease-in-out ${
        isZenMode 
          ? 'w-0 opacity-0 p-0 border-r-0 overflow-hidden' 
          : 'w-64 opacity-100 p-6'
      }`}>
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 select-none">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--accent)', 
                color: 'var(--bg)', 
                boxShadow: '0 0 12px var(--accent)' 
              }}
            >
              KS
            </div>
            <h1 className="text-lg font-bold tracking-wider" style={{ color: 'var(--text)' }}>
              Key<span style={{ color: 'var(--accent)', textShadow: '0 0 6px var(--accent)' }}>stra</span>
            </h1>
          </div>

          {/* User Profile Widget */}
          <div className="p-3 rounded-xl border flex items-center gap-3 bg-surface-2 border-border">
            <img src={profile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-border" />
            <div className="truncate">
              <h4 className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>{profile.username}</h4>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>Lvl {profile.level} Typist</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item, idx) => {
              const isActive = activeTab === item.id;
              return (
                <div key={item.id}>
                  {item.header && (
                    <div className="text-[9px] uppercase tracking-widest font-bold mt-4 mb-1 px-3 text-text-muted">
                      {item.header}
                    </div>
                  )}
                  <button
                    onClick={() => navigateTo(item.id)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all border ${
                      isActive 
                        ? 'bg-selection border-accent text-accent' 
                        : 'border-transparent text-text-muted hover:text-text hover:bg-surface-2'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* 2. Mobile Nav Header Bar */}
      <div className={`fixed top-0 left-0 right-0 z-40 border-b bg-surface/85 backdrop-blur-xl px-4 flex items-center justify-between lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${
        isZenMode 
          ? 'h-0 opacity-0 border-b-0 py-0 pointer-events-none' 
          : 'h-14 opacity-100'
      }`} style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-text-muted hover:text-text cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-bold tracking-wider" style={{ color: 'var(--text)' }}>
            Key<span className="font-bold" style={{ color: 'var(--accent)', textShadow: '0 0 6px var(--accent)' }}>stra</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mobile Streak Indicator */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
               style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            <Flame size={11} className="text-orange-500" />
            <span>{profile.streak}d</span>
          </div>

          {/* Mobile Profile Trigger */}
          <button 
            onClick={() => navigateTo('settings')}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-surface hover:bg-surface-2 transition duration-200 border-border cursor-pointer select-none"
          >
            <img src={profile.avatarUrl} alt="Avatar" className="w-4 h-4 rounded-full border border-border" />
            <span className="text-[10px] font-bold" style={{ color: 'var(--text)' }}>
              {profile.username}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          
          {/* Sidebar */}
          <div className="relative w-64 p-6 flex flex-col justify-between border-r"
               style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-base font-bold tracking-wider" style={{ color: 'var(--text)' }}>{APP_NAME}</h1>
                <button onClick={() => setSidebarOpen(false)} className="text-text-muted hover:text-text cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { navigateTo(item.id); setSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition border cursor-pointer ${
                      activeTab === item.id 
                        ? 'bg-selection text-accent' 
                        : 'border-transparent text-text-muted hover:text-text hover:bg-surface-2'
                    }`}
                    style={{
                      borderColor: activeTab === item.id ? 'var(--accent)' : 'transparent'
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Panel Body */}
      <main className={`flex-1 flex flex-col min-w-0 ${isZenMode ? 'pt-0' : 'pt-14 lg:pt-0'}`}>
        
        {/* Header HUD panel */}
        <header className={`hidden lg:flex items-center justify-between border-b px-8 shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${
          isZenMode 
            ? 'h-0 opacity-0 border-b-0 py-0 pointer-events-none' 
            : 'h-14 opacity-100'
        }`} style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider capitalize" style={{ color: 'var(--text-muted)' }}>
              {activeTab === 'dashboard' ? 'Overview' : activeTab.replace(/([A-Z])/g, ' $1')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border select-none"
                 style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              <Flame size={13} className="text-orange-500 animate-pulse" />
              <span>Streak: <span style={{ color: 'var(--accent)' }}>{profile.streak}d</span></span>
            </div>

            {/* XP Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border select-none"
                 style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              <Zap size={13} style={{ color: 'var(--accent)' }} />
              <span>{profile.xp} XP</span>
            </div>

            {/* User Rank Indicator (remains as usual) */}
            <div className="flex items-center gap-2 text-xs select-none">
              <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>Rank:</span>
              <strong className="flex items-center gap-1" style={{ color: 'var(--text)' }}>
                <Sparkles size={12} style={{ color: 'var(--accent)' }} />
                Lvl {profile.level}
              </strong>
            </div>

            {/* Profile Button */}
            <button 
              onClick={() => navigateTo('settings')}
              className="flex items-center gap-2 px-3 py-1 rounded-full border bg-surface hover:bg-surface-2 transition-all duration-200 border-border cursor-pointer select-none group"
            >
              <img src={profile.avatarUrl} alt="Avatar" className="w-5.5 h-5.5 rounded-full border border-border group-hover:border-accent transition duration-200" />
              <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>
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
          {renderActiveView()}
        </div>
      </main>

    </div>
  );
}
