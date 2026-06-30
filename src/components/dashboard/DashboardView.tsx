'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getSessions, getChallengeProgress, TypingSession, getUnlockedAchievements } from '@/lib/services/db';
import { ACHIEVEMENTS } from '@/lib/services/mockData';
import { 
  Play, Target, Award, BookOpen, Sword, Trophy, Sparkles, Zap, Lock, Calendar, MessageSquare, Code, ShieldAlert
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { XPBar } from '../ui/XPBar';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';

export const DashboardView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, profile, refreshProfile } = useApp();
  const [sessions, setSessions] = useState<TypingSession[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [challengeCount, setChallengeCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  // Dynamic calculations for Stats
  const stats = useMemo(() => {
    const totalSess = sessions.length;
    const avgWpm = totalSess > 0 
      ? Math.round(sessions.reduce((sum, s) => sum + s.wpm, 0) / totalSess)
      : 0;
    const avgAcc = totalSess > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSess)
      : 0;
    
    // Calculate simple comparison for trend (last 5 vs earlier 5)
    const recentWpms = sessions.slice(0, 5);
    const olderWpms = sessions.slice(5, 10);
    const recentAvg = recentWpms.length > 0 ? recentWpms.reduce((sum, s) => sum + s.wpm, 0) / recentWpms.length : 0;
    const olderAvg = olderWpms.length > 0 ? olderWpms.reduce((sum, s) => sum + s.wpm, 0) / olderWpms.length : 0;
    const wpmTrend = Math.max(0, Math.round(recentAvg - olderAvg)) || 2;
    
    const recentAcc = recentWpms.length > 0 ? recentWpms.reduce((sum, s) => sum + s.accuracy, 0) / recentWpms.length : 0;
    const olderAcc = olderWpms.length > 0 ? olderWpms.reduce((sum, s) => sum + s.accuracy, 0) / olderWpms.length : 0;
    const accuracyTrend = Math.max(0, Math.round(recentAcc - olderAcc)) || 1;

    return {
      avgWpm: avgWpm || profile?.wpm || 0,
      wpmTrend,
      accuracy: avgAcc || profile?.accuracy || 0,
      accuracyTrend,
      totalSessions: totalSess,
      bestWpm: profile?.wpm || (sessions.length > 0 ? Math.max(...sessions.map(s => s.wpm)) : 0)
    };
  }, [sessions, profile]);

  const sessionsThisWeek = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    return sessions.filter(s => new Date(s.createdAt) >= startOfWeek).length;
  }, [sessions]);

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Flame': return <Sparkles className="w-5 h-5" />;
      case 'CalendarDays': return <Calendar className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
      case 'Sword': return <Sword className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  if (loading || !profile) {
    return (
      <div className="space-y-6 pb-10">
        {/* Skeleton Zone 1 */}
        <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] p-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 w-full max-w-md">
            <Skeleton width="60%" height="24px" />
            <Skeleton width="40%" height="16px" />
            <Skeleton width="140px" height="36px" borderRadius="var(--radius-md)" />
            <Skeleton width="80%" height="12px" />
          </div>
          <div className="flex flex-col items-center shrink-0">
            <Skeleton width="56px" height="56px" borderRadius="50%" />
            <Skeleton width="60px" height="12px" className="mt-1" />
          </div>
        </div>
        {/* Skeleton Zone 2 */}
        <div className="px-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton height="140px" borderRadius="var(--radius-lg)" />
          <Skeleton height="140px" borderRadius="var(--radius-lg)" />
          <Skeleton height="140px" borderRadius="var(--radius-lg)" />
          <Skeleton height="140px" borderRadius="var(--radius-lg)" />
        </div>
      </div>
    );
  }

  const isBrandNewUser = sessions.length === 0;

  return (
    <div className="bg-[var(--color-bg)] min-h-screen text-[var(--color-text-primary)] font-sans">
      {/* Zone 1 — Welcome strip */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] p-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-[18px] font-medium text-[var(--color-text-primary)]">
            Good morning, {profile.username}
          </h2>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {sessionsThisWeek} sessions this week · {profile.streak}-day streak 🔥
          </p>
          <button 
            onClick={() => onNavigate('practice')}
            className="mt-4 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] text-white text-[14px] font-medium hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <Play size={14} fill="currentColor" />
            Start practice
          </button>
          
          <XPBar 
            currentXP={profile.xp} 
            maxXP={profile.level * 500} 
            level={profile.level} 
            className="mt-4 w-full max-w-[320px]" 
          />
        </div>

        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="w-[56px] h-[56px] rounded-full border-2 border-[var(--color-brand)] flex items-center justify-center text-[20px] font-medium text-[var(--color-brand)] bg-[var(--color-brand-light)]">
            {profile.level}
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] mt-1 font-semibold uppercase tracking-wider">
            Lvl Typist
          </span>
        </div>
      </div>

      {isBrandNewUser ? (
        <div className="px-6 md:px-8 py-8">
          <EmptyState
            icon={<Code />}
            title="You haven't typed yet"
            description="Complete your first session to see your stats and start leveling up."
            action={{
              label: "Start your first session",
              onClick: () => onNavigate('practice')
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Zone 2 — Stats row */}
          <div className="px-6 md:px-8 pt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label="AVG WPM" 
              value={stats.avgWpm} 
              trend={`↑ +${stats.wpmTrend} this week`} 
              trendDirection="up" 
            />
            <StatCard 
              label="ACCURACY" 
              value={`${stats.accuracy}%`} 
              trend={`↑ +${stats.accuracyTrend}%`} 
              trendDirection="up" 
            />
            <StatCard 
              label="SESSIONS" 
              value={stats.totalSessions} 
              trend="all time" 
              trendDirection="neutral" 
            />
            <StatCard 
              label="BEST WPM" 
              value={stats.bestWpm} 
              trend="personal best" 
              trendDirection="neutral" 
            />
          </div>

          {/* Zone 3 — Progress + history */}
          <div className="px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* WPM Chart Card (Col-span 9) */}
            <Card variant="default" titleText="WPM over time" className="lg:col-span-9">
              <div className="h-[240px] w-full mt-2">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} />
                      <Line type="monotone" dataKey="wpm" stroke="var(--color-brand)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] text-[12px]">
                    No practice history. Complete typing exercises to populate graphs!
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Sessions Card (Col-span 3) */}
            <Card variant="default" className="lg:col-span-3 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">Recent sessions</span>
                <button 
                  onClick={() => onNavigate('practice')}
                  className="text-[12px] text-[var(--color-brand)] hover:underline cursor-pointer font-medium"
                >
                  View all →
                </button>
              </div>

              <div className="divide-y divide-[var(--color-border)]">
                {sessions.slice(0, 3).map((s) => (
                  <div key={s.id} className="flex items-center justify-between h-[52px] py-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[18px] font-medium text-[var(--color-text-primary)] w-12 shrink-0">
                        {s.wpm}
                      </span>
                      <div className="truncate">
                        <span className="text-[14px] text-[var(--color-text-primary)] capitalize block truncate">
                          {s.levelType}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-muted)] block">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-[12px] font-medium text-[var(--color-success)] shrink-0">
                      {s.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Zone 4 — Achievements */}
          <div className="px-6 md:px-8 py-8">
            <Card variant="default">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[15px] font-medium text-[var(--color-text-primary)]">Achievements</h3>
                <span className="text-[12px] text-[var(--color-text-muted)] font-medium">
                  {unlockedBadges.length} / {ACHIEVEMENTS.length}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {ACHIEVEMENTS.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  return isUnlocked ? (
                    <div 
                      key={badge.id}
                      className="bg-[var(--color-brand-light)] border border-[var(--color-brand-border)] rounded-[var(--radius-md)] p-3 flex flex-col items-center justify-center text-center group relative cursor-help"
                      title={`${badge.title}: ${badge.description}`}
                    >
                      <div className="text-[var(--color-brand)] mb-1">
                        {getAchievementIcon(badge.icon)}
                      </div>
                      <span className="text-[9px] font-semibold text-[var(--color-brand)] truncate max-w-full">
                        {badge.title}
                      </span>
                    </div>
                  ) : (
                    <div 
                      key={badge.id}
                      className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 flex flex-col items-center justify-center text-center group relative opacity-60"
                      title={`${badge.title} (Locked)`}
                    >
                      <Lock size={16} className="text-[var(--color-text-muted)] mb-1" />
                      <span className="text-[9px] font-semibold text-[var(--color-text-muted)] truncate max-w-full">
                        {badge.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
