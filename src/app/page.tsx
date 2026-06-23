'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
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

import { 
  Trophy, Zap, Target, Hourglass, ShieldAlert, Award, 
  BookOpen, MessageSquare, Code, Sword, LogOut, Settings, 
  Menu, X, Sparkles, Database, DatabaseZap, FileText
} from 'lucide-react';

export default function Home() {
  const { user, profile, loading, localMode, logOut, caretBlinking, setCaretBlinking, cursorStyle, setCursorStyle, isZenMode } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-dark">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black text-cyber-blue">TM</div>
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
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'beginner':
        return <BeginnerPractice />;
      case 'intermediate':
        return <IntermediatePractice />;
      case 'advanced':
        return <AdvancedPractice />;
      case 'quote':
        return <QuotePractice />;
      case 'challenge':
        return <ChallengePractice />;
      case 'coding':
        return <CodingPractice />;
      case 'exam':
        return <ExamPractice />;
      case 'battle':
        return <MultiplayerBattle />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'admin':
        return <AdminView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
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
    { id: 'battle', label: 'Multiplayer Battle', icon: <Sword size={16} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Award size={16} />, header: 'Rankings' },
    { id: 'admin', label: 'Admin Dashboard', icon: <Database size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen flex bg-cyber-dark text-slate-100 grid-bg relative">
      
      {/* 1. Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-white/5 bg-[#090d16]/80 backdrop-blur-xl justify-between shrink-0 transition-all duration-500 ease-in-out ${
        isZenMode 
          ? 'w-0 opacity-0 p-0 border-r-0 overflow-hidden' 
          : 'w-64 opacity-100 p-6'
      }`}>
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyber-blue to-cyber-purple flex items-center justify-center font-black text-slate-950 text-sm shadow-[0_0_10px_rgba(0,242,254,0.3)]">
              TM
            </div>
            <h1 className="text-lg font-bold tracking-wider text-white">
              TypeMaster <span className="text-cyber-blue text-glow-cyan">Pro</span>
            </h1>
          </div>

          {/* User Profile Widget */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex items-center gap-3">
            <img src={profile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-cyber-blue/30" />
            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate">{profile.username}</h4>
              <span className="text-[10px] text-cyber-blue font-semibold">Lvl {profile.level} Typist</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item, idx) => {
              const isActive = activeTab === item.id;
              return (
                <div key={item.id}>
                  {item.header && (
                    <div className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mt-4 mb-1 px-3">
                      {item.header}
                    </div>
                  )}
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyber-blue/10 to-cyber-purple/10 border border-cyber-blue/20 text-cyber-blue text-glow-cyan' 
                        : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
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

        {/* Sidebar Footer Logout */}
        <button
          onClick={logOut}
          className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-cyber-red hover:bg-cyber-red/5 transition flex items-center gap-2.5 border border-transparent hover:border-cyber-red/10"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      {/* 2. Mobile Nav Header Bar */}
      <div className={`fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-[#090d16]/80 backdrop-blur-xl px-4 flex items-center justify-between lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${
        isZenMode 
          ? 'h-0 opacity-0 border-b-0 py-0 pointer-events-none' 
          : 'h-14 opacity-100'
      }`}>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-200"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-bold text-white tracking-wider">
            TypeMaster <span className="text-cyber-blue text-glow-cyan">Pro</span>
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mobile Cursor Style Toggle */}
          <button
            onClick={() => setCursorStyle(cursorStyle === 'cyber' ? 'simple' : 'cyber')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold border transition-all ${
              cursorStyle === 'cyber' 
                ? 'border-cyber-blue/30 bg-cyber-blue/5 text-cyber-blue' 
                : 'border-white/10 bg-slate-900 text-slate-400'
            }`}
            title="Toggle cursor theme style"
          >
            {cursorStyle === 'cyber' ? 'Cyber' : 'Simple'}
          </button>

          {/* Mobile Cursor Blink Toggle */}
          <button
            onClick={() => setCaretBlinking(!caretBlinking)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold border transition-all ${
              caretBlinking 
                ? 'border-cyber-blue/30 bg-cyber-blue/5 text-cyber-blue' 
                : 'border-white/10 bg-slate-900 text-slate-400'
            }`}
            title="Toggle caret blinking"
          >
            {caretBlinking ? 'Blink' : 'Steady'}
          </button>

          {/* Database indicator */}
          <span className="text-[10px] bg-slate-900 border border-white/5 px-2.5 py-1 rounded text-slate-400 flex items-center gap-1">
            <Database size={10} className="text-cyber-blue" />
            {localMode ? 'Local' : 'Supabase'}
          </span>
        </div>
      </div>

      {/* 3. Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          
          {/* Sidebar */}
          <div className="relative w-64 bg-slate-950 p-6 flex flex-col justify-between border-r border-white/5">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-base font-bold text-white tracking-wider">TypeMaster Pro</h1>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition ${
                      activeTab === item.id 
                        ? 'bg-gradient-to-r from-cyber-blue/15 to-cyber-purple/15 text-cyber-blue border border-cyber-blue/20' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <button
              onClick={() => { logOut(); setSidebarOpen(false); }}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-cyber-red transition flex items-center gap-2.5"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* 4. Main Panel Body */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isZenMode ? 'pt-0' : 'pt-14 lg:pt-0'}`}>
        
        {/* Header HUD panel */}
        <header className={`hidden lg:flex items-center justify-between border-b border-white/5 px-8 shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${
          isZenMode 
            ? 'h-0 opacity-0 border-b-0 py-0 pointer-events-none' 
            : 'h-14 opacity-100'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider capitalize">
              {activeTab === 'dashboard' ? 'Overview' : activeTab.replace(/([A-Z])/g, ' $1')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Cursor Style Toggle */}
            <button
              onClick={() => setCursorStyle(cursorStyle === 'cyber' ? 'simple' : 'cyber')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border transition-all duration-300 cursor-pointer select-none ${
                cursorStyle === 'cyber' 
                  ? 'border-cyber-blue/30 bg-cyber-blue/5 text-cyber-blue shadow-[0_0_8px_rgba(0,242,254,0.15)]' 
                  : 'border-white/10 bg-slate-900 text-slate-400'
              }`}
              title="Toggle glowing neon cursor vs simple vertical line cursor"
            >
              {cursorStyle === 'cyber' ? (
                <>
                  <span>Cyber Cursor</span>
                </>
              ) : (
                <>
                  <span>Simple Cursor</span>
                </>
              )}
            </button>

            {/* Cursor Blink Toggle */}
            <button
              onClick={() => setCaretBlinking(!caretBlinking)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border transition-all duration-300 cursor-pointer select-none ${
                caretBlinking 
                  ? 'border-cyber-blue/30 bg-cyber-blue/5 text-cyber-blue shadow-[0_0_8px_rgba(0,242,254,0.15)]' 
                  : 'border-white/10 bg-slate-900 text-slate-400'
              }`}
              title="Toggle cursor blinking animation"
            >
              {caretBlinking ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-ping" />
                  <span>Blinking</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Steady</span>
                </>
              )}
            </button>

            {/* Database indicator */}
            <span className="text-[10px] bg-slate-900 border border-white/5 px-2.5 py-1 rounded-full text-slate-400 flex items-center gap-1.5 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${localMode ? 'bg-cyber-blue animate-pulse' : 'bg-cyber-green'}`} />
              <DatabaseZap size={10} className="text-slate-400" />
              {localMode ? 'Local state engine active' : 'Supabase database synced'}
            </span>

            {/* User header XP preview */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Rank:</span>
              <strong className="text-white flex items-center gap-1">
                <Sparkles size={12} className="text-yellow-400" />
                Lvl {profile.level}
              </strong>
            </div>
          </div>
        </header>

        {/* Content Pane */}
        <div className={`flex-1 overflow-y-auto transition-all duration-500 ease-in-out ${isZenMode ? 'p-0' : 'p-6 md:p-8'}`}>
          {renderActiveView()}
        </div>
      </main>

    </div>
  );
}
