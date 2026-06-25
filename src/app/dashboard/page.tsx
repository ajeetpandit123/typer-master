'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { BeginnerPractice } from '@/components/typing/BeginnerPractice';
import { IntermediatePractice } from '@/components/typing/IntermediatePractice';
import { AdvancedPractice } from '@/components/typing/AdvancedPractice';
import { QuotePractice } from '@/components/typing/QuotePractice';
import { ChallengePractice } from '@/components/typing/ChallengePractice';
import { CodingPractice } from '@/components/typing/CodingPractice';
import { ExamPractice } from '@/components/typing/ExamPractice';
import { MultiplayerBattle } from '@/components/battle/MultiplayerBattle';
import { LeaderboardView } from '@/components/dashboard/LeaderboardView';
import { SettingsView } from '@/components/dashboard/SettingsView';
import { MyWords } from '@/components/typing/MyWords';
import { ACHIEVEMENTS } from '@/lib/services/mockData';
import { getUnlockedAchievements } from '@/lib/services/db';
import { Trophy, BookOpen, MessageSquare, Code, Award, FileText, Zap, Sparkles, Flame, Play, ShieldAlert, Calendar, Sword } from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, loading } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

  const activeTab = searchParams?.get('tab') || 'dashboard';

  // Redirect to home (auth screen) if user session is absent
  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.replace('/');
    }
  }, [user, profile, loading, router]);

  // Load achievements when achievements tab is visible
  useEffect(() => {
    const loadBadges = async () => {
      if (user && activeTab === 'achievements') {
        setLoadingBadges(true);
        try {
          const badges = await getUnlockedAchievements(user.id);
          setUnlockedBadges(badges);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingBadges(false);
        }
      }
    };
    loadBadges();
  }, [user, activeTab]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
        <div className="w-16 h-16 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navigateTo = (tab: string) => {
    if (tab === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard?tab=${tab}`);
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-cyber-blue" />;
      case 'Zap': return <Zap className="w-6 h-6 text-cyber-cyan" />;
      case 'Flame': return <Sparkles className="w-6 h-6 text-orange-400" />;
      case 'CalendarDays': return <Calendar className="w-6 h-6 text-purple-400" />;
      case 'Trophy': return <Trophy className="w-6 h-6 text-[#FF6B00]" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6 text-red-500" />;
      case 'Sword': return <Sword className="w-6 h-6 text-pink-400" />;
      default: return <Award className="w-6 h-6 text-slate-400" />;
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={navigateTo} />;
      case 'practice':
        return (
          <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider">Practice Arena</span>
                <h2 className="text-xl font-bold text-white mt-1">Select a practice mode to hone your typing</h2>
                <p className="text-xs text-slate-400 mt-0.5">Learn layout positioning, code syntax patterns, or simulate exam certifications.</p>
              </div>
            </div>

            {/* Practice Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Learning Paths */}
              <div className="glass-card p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-2">Learning Paths</h3>
                <div className="space-y-2">
                  {[
                    { id: 'beginner', title: 'Level 1: Beginner', desc: 'Home row alignment, core layout, keys positioning.', icon: <BookOpen size={16} className="text-emerald-500" /> },
                    { id: 'intermediate', title: 'Level 2: Intermediate', desc: 'Shift capitalizations, upper/lower combination speeds.', icon: <Zap size={16} className="text-[#FF6B00]" /> },
                    { id: 'advanced', title: 'Level 3: Advanced', desc: 'Top numbers row, special characters, parentheses combinations.', icon: <ShieldAlert size={16} className="text-rose-500" /> }
                  ].map((mode) => (
                    <div key={mode.id} className="flex justify-between items-center p-3.5 rounded-xl bg-[#181818]/60 border border-[#222222] hover:border-[#FF6B00]/40 transition duration-150">
                      <div className="flex gap-3 items-center">
                        <div className="p-2 rounded-lg bg-[#0B0B0B] border border-[#222222]">
                          {mode.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{mode.title}</h4>
                          <p className="text-[10px] text-slate-400">{mode.desc}</p>
                        </div>
                      </div>
                      <button onClick={() => navigateTo(mode.id)} className="p-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-black font-bold cursor-pointer">
                        <Play size={12} fill="black" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Practice Modes */}
              <div className="glass-card p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-2">Typing Modes</h3>
                <div className="space-y-2">
                  {[
                    { id: 'quote', title: 'Quote Mode', desc: 'Practice typing famous quotes, philosophy, and tech phrases.', icon: <MessageSquare size={16} className="text-blue-500" /> },
                    { id: 'challenge', title: 'Challenge Mode', desc: 'Beat preset progression levels with tight speed & accuracy thresholds.', icon: <Trophy size={16} className="text-[#FF6B00]" /> },
                    { id: 'coding', title: 'Coding Practice', desc: 'Practice keywords and syntax in JavaScript, C++, and Java.', icon: <Code size={16} className="text-purple-500" /> },
                    { id: 'exam', title: 'Exam Simulator', desc: 'Certify your words per minute speed in formal layout trials.', icon: <FileText size={16} className="text-indigo-500" /> }
                  ].map((mode) => (
                    <div key={mode.id} className="flex justify-between items-center p-3.5 rounded-xl bg-[#181818]/60 border border-[#222222] hover:border-[#FF6B00]/40 transition duration-150">
                      <div className="flex gap-3 items-center">
                        <div className="p-2 rounded-lg bg-[#0B0B0B] border border-[#222222]">
                          {mode.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{mode.title}</h4>
                          <p className="text-[10px] text-slate-400">{mode.desc}</p>
                        </div>
                      </div>
                      <button onClick={() => navigateTo(mode.id)} className="p-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-black font-bold cursor-pointer">
                        <Play size={12} fill="black" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'beginner':
        return <BeginnerPractice onBack={() => navigateTo('practice')} />;
      case 'intermediate':
        return <IntermediatePractice onBack={() => navigateTo('practice')} />;
      case 'advanced':
        return <AdvancedPractice onBack={() => navigateTo('practice')} />;
      case 'quote':
        return <QuotePractice onBack={() => navigateTo('practice')} />;
      case 'challenge':
        return <ChallengePractice onBack={() => navigateTo('practice')} />;
      case 'coding':
        return <CodingPractice onBack={() => navigateTo('practice')} />;
      case 'exam':
        return <ExamPractice onBack={() => navigateTo('practice')} />;
      case 'my_words':
        return <MyWords onBack={() => navigateTo('dashboard')} />;
      case 'battle':
        return <MultiplayerBattle />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'settings':
        return <SettingsView />;
      case 'achievements':
        return (
          <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider">Trophy Room</span>
                <h2 className="text-xl font-bold text-white mt-1">Platform Achievements</h2>
                <p className="text-xs text-slate-400 mt-0.5">Complete milestones to unlock rare medals and boost your level statistics.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Completed</div>
                  <div className="text-lg font-black text-[#FF6B00]">
                    {unlockedBadges.length} / {ACHIEVEMENTS.length}
                  </div>
                </div>
              </div>
            </div>

            {loadingBadges ? (
              <div className="flex justify-center p-20">
                <div className="w-10 h-10 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ACHIEVEMENTS.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  return (
                    <div 
                      key={badge.id}
                      className={`glass-card p-5 rounded-2xl flex flex-col items-center text-center transition-all duration-300 relative border ${
                        isUnlocked 
                          ? 'border-[#FF6B00]/30 bg-[#FF6B00]/5 text-white hover:scale-[1.03]' 
                          : 'border-white/5 bg-[#111111]/30 opacity-40 text-slate-500 grayscale'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-[#0B0B0B] mb-3 border ${
                        isUnlocked ? 'border-[#FF6B00]/40 shadow-[0_0_12px_rgba(255,107,0,0.2)]' : 'border-[#222222]'
                      }`}>
                        {getAchievementIcon(badge.icon)}
                      </div>
                      <h4 className="text-xs font-bold text-white">{badge.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] leading-relaxed">
                        {badge.description}
                      </p>
                      {isUnlocked ? (
                        <div className="mt-3 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
                          Unlocked (+{badge.xpReward} XP)
                        </div>
                      ) : (
                        <div className="mt-3 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-[#222222] text-slate-500">
                          Locked
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      default:
        return <DashboardView onNavigate={navigateTo} />;
    }
  };

  return <AppShell>{renderActiveTab()}</AppShell>;
}
