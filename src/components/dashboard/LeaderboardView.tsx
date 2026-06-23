'use client';

import React, { useEffect, useState } from 'react';
import { getLeaderboard, LeaderboardEntry } from '@/lib/services/db';
import { Trophy, Award, Zap, Target, Flame } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const list = await getLeaderboard();
        setEntries(list);
      } catch (err) {
        console.error('Failed to load leaderboard entries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Split top 3 for podium
  const podiumEntries = entries.slice(0, 3);
  const tableEntries = entries.slice(3);

  // Re-order podium as: 2nd place (left), 1st place (center), 3rd place (right)
  const sortedPodium = [];
  if (podiumEntries[1]) sortedPodium.push({ entry: podiumEntries[1], rank: 2 });
  if (podiumEntries[0]) sortedPodium.push({ entry: podiumEntries[0], rank: 1 });
  if (podiumEntries[2]) sortedPodium.push({ entry: podiumEntries[2], rank: 3 });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 1. Header & Period Filters */}
      <div className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy size={20} />
          </div>
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">TypeMaster Rankings</span>
            <h2 className="text-lg font-bold text-white leading-tight">Global Leaderboard</h2>
          </div>
        </div>

        {/* Period Selection */}
        <div className="flex bg-slate-900 border border-white/5 p-1 rounded-lg">
          {(['daily', 'weekly', 'monthly', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                period === p 
                  ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-white font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Visual Podium Grid */}
      {podiumEntries.length > 0 && (
        <div className="grid grid-cols-3 gap-4 items-end max-w-2xl mx-auto pt-6 pb-2">
          {sortedPodium.map(({ entry, rank }) => {
            const isFirst = rank === 1;
            const isSecond = rank === 2;
            const isThird = rank === 3;
            
            return (
              <div 
                key={entry.username} 
                className={`flex flex-col items-center relative ${
                  isFirst ? 'z-20' : 'z-10'
                }`}
              >
                {/* Crown for First Place */}
                {isFirst && (
                  <div className="absolute -top-7 text-2xl animate-bounce">
                    👑
                  </div>
                )}

                {/* Avatar with Glow border */}
                <div className={`relative rounded-full p-1 bg-slate-950 border ${
                  isFirst ? 'w-20 h-20 border-cyber-amber shadow-[0_0_15px_rgba(245,158,11,0.35)]' :
                  isSecond ? 'w-16 h-16 border-slate-300' :
                  'w-14 h-14 border-amber-700'
                }`}>
                  <img src={entry.avatarUrl} alt="Avatar" className="w-full h-full rounded-full" />
                  <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-slate-950 border ${
                    isFirst ? 'bg-cyber-amber border-cyber-amber shadow-sm' :
                    isSecond ? 'bg-slate-300 border-slate-300' :
                    'bg-amber-700 border-amber-700 text-amber-100'
                  }`}>
                    {rank}
                  </span>
                </div>

                {/* Podium Pedestal */}
                <div className={`w-full mt-4 glass-card rounded-t-2xl p-4 flex flex-col items-center justify-center border-b-0 ${
                  isFirst ? 'h-36 border-cyber-amber/35 bg-cyber-amber/5' :
                  isSecond ? 'h-28 border-slate-300/20 bg-slate-300/5' :
                  'h-24 border-amber-700/20 bg-amber-700/5'
                }`}>
                  <span className="text-xs font-bold text-white truncate max-w-full text-center block">
                    {entry.username}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Level {entry.level}
                  </span>
                  <div className="flex items-center gap-1.5 mt-2 bg-slate-950/40 px-2 py-0.5 rounded-full border border-white/5">
                    <Zap size={10} className="text-cyber-blue" />
                    <span className="text-xs font-black text-white">{entry.wpm}</span>
                    <span className="text-[8px] text-slate-500">WPM</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. placements Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 font-semibold">
              <th className="p-4">Rank</th>
              <th className="p-4">User</th>
              <th className="p-4 text-center">Level</th>
              <th className="p-4 text-center">Top WPM</th>
              <th className="p-4 text-center">Accuracy</th>
              <th className="p-4 text-center">Battle Wins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tableEntries.length > 0 ? (
              tableEntries.map((entry, idx) => (
                <tr 
                  key={entry.username} 
                  className="hover:bg-white/5 transition duration-150"
                >
                  <td className="p-4 font-bold text-slate-400">
                    #{idx + 4}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={entry.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-white/5" />
                      <span className="font-bold text-white">{entry.username}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-slate-300">
                    {entry.level}
                  </td>
                  <td className="p-4 text-center font-bold text-cyber-blue">
                    {entry.wpm} WPM
                  </td>
                  <td className="p-4 text-center text-cyber-green">
                    {entry.accuracy}%
                  </td>
                  <td className="p-4 text-center text-slate-400">
                    {entry.wins || 0}
                  </td>
                </tr>
              ))
            ) : (
              podiumEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    No leaderboard placements found. Complete practice sessions to see results.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
