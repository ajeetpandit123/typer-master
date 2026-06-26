'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getSessions, getChallengeProgress, TypingSession, getUnlockedAchievements } from '@/lib/services/db';
import { ACHIEVEMENTS } from '@/lib/services/mockData';
import { 
  Trophy, Zap, Target, Hourglass, ShieldAlert, Award, Clock, ArrowRight, 
  Sparkles, Calendar, BookOpen, MessageSquare, Code, Sword
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const CHART_MARGIN = { top: 10, right: 10, left: -20, bottom: 0 };
const TOOLTIP_CONTENT_STYLE = { backgroundColor: '#0f1322', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' };
const TOOLTIP_LABEL_STYLE = { color: '#94a3b8' };
const LINE_DOT_STYLE = { fill: '#8b5cf6', strokeWidth: 1 };

export const DashboardView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, profile, refreshProfile } = useApp();
  const [sessions, setSessions] = useState<TypingSession[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [challengeCount, setChallengeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Key Error Heatmap Data Simulation/Loading
  const [keyErrors, setKeyErrors] = useState<Record<string, number>>({});

  // Recharts Formatted Data
  const chartData = useMemo(() => {
    return [...sessions]
      .reverse()
      .slice(-15) // last 15 sessions
      .map((s, idx) => ({
        name: `T${idx + 1}`,
        wpm: s.wpm,
        accuracy: s.accuracy,
        date: new Date(s.createdAt).toLocaleDateString()
      }));
  }, [sessions]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        await refreshProfile();
        const sessList = await getSessions(user.id);
        setSessions(sessList);

        const badges = await getUnlockedAchievements(user.id);
        setUnlockedBadges(badges);

        const chalProgress = await getChallengeProgress(user.id);
        setChallengeCount(Object.keys(chalProgress).length);

        // Load error heatmap data from localStorage
        if (typeof window !== 'undefined') {
          const storedErrors = localStorage.getItem('typemaster_key_errors');
          if (storedErrors) {
            setKeyErrors(JSON.parse(storedErrors));
          } else {
            // Default mock errors for first load visualization
            setKeyErrors({ 'Q': 1, 'Z': 3, 'P': 2, 'B': 1, 'X': 2, 'C': 1 });
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  if (loading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Format Practice Time
  const formatPracticeTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h ${remainingMins}m`;
  };

  // Standard keyboard rows for Heatmap visualization
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']
  ];

  // Helper to color keys based on error count
  const getKeyErrorColor = (key: string) => {
    const count = keyErrors[key] || 0;
    if (count === 0) return 'bg-slate-800/40 border-slate-700/60 text-slate-400';
    if (count === 1) return 'bg-amber-500/20 border-amber-500/40 text-amber-300';
    if (count === 2) return 'bg-orange-500/30 border-orange-500/50 text-orange-200';
    return 'bg-cyber-red/30 border-cyber-red/50 text-rose-200 text-glow-red animate-pulse';
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-cyber-blue" />;
      case 'Zap': return <Zap className="w-6 h-6 text-cyber-cyan" />;
      case 'Flame': return <Sparkles className="w-6 h-6 text-orange-400" />;
      case 'CalendarDays': return <Calendar className="w-6 h-6 text-purple-400" />;
      case 'Trophy': return <Trophy className="w-6 h-6 text-cyber-amber" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6 text-red-500" />;
      case 'Sword': return <Sword className="w-6 h-6 text-pink-400" />;
      default: return <Award className="w-6 h-6 text-slate-400" />;
    }
  };

  // Level stats
  const nextLevelXpNeeded = profile.level * 500;
  const xpPercentage = Math.min(100, Math.round((profile.xp / nextLevelXpNeeded) * 100));

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header Banner */}
      <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-cyber-blue/10 to-cyber-purple/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <img 
            src={profile.avatarUrl} 
            alt="Profile Avatar" 
            className="w-20 h-20 rounded-full border-2 border-cyber-blue/50 p-1 shadow-lg bg-slate-900"
          />
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Welcome, {profile.username}!
              <span className="text-xs bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30 px-2 py-0.5 rounded-full">
                Level {profile.level}
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">Ready to break your typing boundaries today?</p>
            
            {/* XP Bar */}
            <div className="mt-3 w-64 md:w-80">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>XP Progress</span>
                <span>{profile.xp} / {nextLevelXpNeeded} XP</span>
              </div>
              <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-cyber-blue to-cyber-purple h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,242,254,0.5)]"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('beginner')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-blue to-cyber-purple text-white font-bold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition flex items-center gap-2"
          >
            Start Practice
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. Key Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Top WPM</span>
            <Zap className="text-cyber-blue w-5 h-5 text-glow-cyan" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{profile.wpm}</span>
            <span className="text-xs text-slate-500 ml-1">WPM</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Accuracy</span>
            <Target className="text-cyber-purple w-5 h-5" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{profile.accuracy}</span>
            <span className="text-xs text-slate-500 ml-1">%</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Practice Time</span>
            <Hourglass className="text-cyber-pink w-5 h-5" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-white leading-none">
              {formatPracticeTime(profile.practiceTime)}
            </span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Challenges</span>
            <ShieldAlert className="text-cyber-amber w-5 h-5" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{challengeCount}</span>
            <span className="text-xs text-slate-500 ml-1">/ 20</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
            <Award className="text-cyber-green w-5 h-5" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{profile.streak}</span>
            <span className="text-xs text-slate-500 ml-1">Days</span>
          </div>
        </div>
      </div>

      {/* 3. Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyber-blue" />
            Speed Progress (WPM)
          </h3>
          <div className="h-60 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={CHART_MARGIN}>
                  <defs>
                    <linearGradient id="wpmGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={TOOLTIP_CONTENT_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                  />
                  <Area type="monotone" dataKey="wpm" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#wpmGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <span>No practice history. Complete typing exercises to populate graphs!</span>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyber-purple" />
            Accuracy Trend (%)
          </h3>
          <div className="h-60 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={CHART_MARGIN}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" domain={[70, 100]} fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={TOOLTIP_CONTENT_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} dot={LINE_DOT_STYLE} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <span>No practice history. Complete typing exercises to populate graphs!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Heatmap & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Widget */}
        <div className="glass-card p-5 rounded-2xl lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyber-pink" />
              Keyboard Error Heatmap
            </h3>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Tracks characters with frequent typos
            </span>
          </div>
          
          <div className="space-y-2 select-none border border-white/5 p-4 rounded-xl bg-slate-950/40">
            {keyboardRows.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1.5" style={{ paddingLeft: `${rIdx * 12}px` }}>
                {row.map((key) => {
                  const errCount = keyErrors[key] || 0;
                  return (
                    <div 
                      key={key} 
                      title={`${key}: ${errCount} mistakes recorded`}
                      className={`w-9 h-9 md:w-11 md:h-11 rounded-lg border flex flex-col items-center justify-center text-xs font-bold transition-all relative ${getKeyErrorColor(key)}`}
                    >
                      <span>{key}</span>
                      {errCount > 0 && (
                        <span className="absolute bottom-0.5 text-[8px] opacity-70">
                          {errCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-5 rounded-2xl flex flex-col">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyber-green" />
            Recent Activity
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-56 pr-1">
            {sessions.length > 0 ? (
              sessions.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      s.levelType === 'beginner' ? 'bg-cyan-400' :
                      s.levelType === 'intermediate' ? 'bg-purple-400' :
                      s.levelType === 'advanced' ? 'bg-pink-400' :
                      s.levelType === 'quote' ? 'bg-yellow-400' :
                      s.levelType === 'coding' ? 'bg-blue-400' :
                      'bg-green-400'
                    }`} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 capitalize">{s.levelType} Test</h4>
                      <p className="text-[10px] text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">{s.wpm} WPM</div>
                    <div className="text-[10px] text-slate-400">{s.accuracy}% Acc</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <span>No activities recorded yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Achievements Shelf */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-cyber-amber" />
          Achievements & Medals
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {ACHIEVEMENTS.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <div 
                key={badge.id}
                title={`${badge.title}: ${badge.description} (+${badge.xpReward} XP)`}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all relative group cursor-help ${
                  isUnlocked 
                    ? 'border-cyber-amber/30 bg-cyber-amber/5 text-slate-100 hover:scale-[1.03]' 
                    : 'border-white/5 bg-slate-900/30 opacity-40 text-slate-500 grayscale'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-slate-950/80 mb-2 border ${
                  isUnlocked ? 'border-cyber-amber/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-white/5'
                }`}>
                  {getAchievementIcon(badge.icon)}
                </div>
                <span className="text-xs font-bold text-center truncate max-w-full">{badge.title}</span>
                <span className="text-[9px] text-slate-400 text-center opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 border border-white/10 px-2 py-1 rounded w-32 shadow-lg transition-all z-20 pointer-events-none">
                  {badge.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
