'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { QUOTES, CHALLENGES, CODING_LESSONS, Quote, Challenge, CodingLesson } from '@/lib/services/mockData';
import { getProfile, updateProfile, UserProfile } from '@/lib/services/db';
import { 
  ShieldAlert, Settings, Plus, RotateCcw, AlertTriangle, CheckCircle, 
  Trash2, User, BookOpen, FileText, ChevronRight
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { user, profile, addToast, refreshProfile } = useApp();

  // Tabs
  const [activeSubTab, setActiveSubTab] = useState<'quotes' | 'challenges' | 'lessons' | 'users'>('quotes');

  // Quotes Management state
  const [localQuotes, setLocalQuotes] = useState<Quote[]>([]);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('');
  const [newQuoteCategory, setNewQuoteCategory] = useState<'motivation' | 'business' | 'technology' | 'leadership' | 'education' | 'philosophy'>('motivation');
  const [newQuoteLength, setNewQuoteLength] = useState<'short' | 'medium' | 'long'>('short');

  // Lessons Management state
  const [localLessons, setLocalLessons] = useState<CodingLesson[]>([]);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonLang, setNewLessonLang] = useState<'javascript' | 'java' | 'cpp'>('javascript');
  const [newLessonDiff, setNewLessonDiff] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [newLessonCode, setNewLessonCode] = useState('');

  // User Boost state
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Initial fetch
    setLocalQuotes(QUOTES);
    setLocalLessons(CODING_LESSONS);
    if (profile) setTargetUser(profile);
  }, [profile]);

  // Actions
  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteText || !newQuoteAuthor) {
      addToast('Error', 'Please fill out all quote fields.', 'error');
      return;
    }

    const newItem: Quote = {
      id: `q-custom-${Math.random().toString(36).substring(7)}`,
      text: newQuoteText,
      author: newQuoteAuthor,
      category: newQuoteCategory,
      lengthCategory: newQuoteLength
    };

    QUOTES.unshift(newItem); // Inserts into active global reference
    setLocalQuotes([newItem, ...localQuotes]);
    
    // Clear inputs
    setNewQuoteText('');
    setNewQuoteAuthor('');
    addToast('Quote Added', 'Successfully added custom quote to database.', 'success');
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle || !newLessonCode) {
      addToast('Error', 'Please fill out all coding exercise fields.', 'error');
      return;
    }

    const newItem: CodingLesson = {
      id: `js-custom-${Math.random().toString(36).substring(7)}`,
      level: CODING_LESSONS.length + 1,
      language: newLessonLang,
      difficulty: newLessonDiff,
      title: newLessonTitle,
      description: `Practice custom syntax for ${newLessonTitle}`,
      code: newLessonCode
    };

    CODING_LESSONS.unshift(newItem);
    setLocalLessons([newItem, ...localLessons]);
    
    // Clear inputs
    setNewLessonTitle('');
    setNewLessonCode('');
    addToast('Coding Lesson Added', 'Successfully added custom coding exercise.', 'success');
  };

  const handleBoostXp = async () => {
    if (!user || !profile) return;
    try {
      const nextLevel = profile.level + 1;
      await updateProfile(user.id, {
        level: nextLevel,
        xp: 0
      });
      addToast('Level Boosted', `Level upgraded to ${nextLevel}!`, 'success');
      refreshProfile();
      
      // Reload profile
      const updated = await getProfile(user.id);
      setTargetUser(updated);
    } catch (err) {
      addToast('Error', 'Failed to boost level stats', 'error');
    }
  };

  const handleResetProgress = async () => {
    if (!user) return;
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('typemaster_profile');
        localStorage.removeItem('typemaster_sessions');
        localStorage.removeItem('typemaster_challenges');
        localStorage.removeItem('typemaster_unlocked_achievements');
        localStorage.removeItem('typemaster_key_errors');
        localStorage.removeItem('typemaster_coding_progress');
        localStorage.removeItem('typemaster_battle_wins');
      }

      await updateProfile(user.id, {
        level: 1,
        xp: 0,
        wpm: 0,
        accuracy: 0,
        practiceTime: 0,
        streak: 1
      });

      addToast('Progress Reset', 'All local statistics cleared.', 'info');
      window.location.reload();
    } catch (err) {
      addToast('Error', 'Reset failed.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 1. Header hud */}
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/30 flex items-center justify-center text-slate-400">
            <Settings size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Super Administrator</span>
            <h2 className="text-lg font-bold text-white leading-tight">Admin Console Dashboard</h2>
          </div>
        </div>
      </div>

      {/* 2. Admin Tabs selectors */}
      <div className="flex border-b border-white/5 pb-2 gap-4 flex-wrap">
        {[
          { id: 'quotes', label: 'Manage Quotes', icon: <FileText size={14} /> },
          { id: 'challenges', label: 'Progression Targets', icon: <ShieldAlert size={14} /> },
          { id: 'lessons', label: 'Coding Lessons', icon: <BookOpen size={14} /> },
          { id: 'users', label: 'Manage Users', icon: <User size={14} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === tab.id
                ? 'bg-slate-900 border border-white/10 text-cyber-blue font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Sub tab render */}
      <div className="glass-card p-6 rounded-2xl">
        {activeSubTab === 'quotes' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white">Create Custom Quotes</h3>
            <form onSubmit={handleAddQuote} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Quote Text</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Insert typing quote content..."
                  value={newQuoteText}
                  onChange={(e) => setNewQuoteText(e.target.value)}
                  className="w-full pl-3 pr-3 py-2.5 rounded-lg glass-input text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Author</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Steve Jobs"
                  value={newQuoteAuthor}
                  onChange={(e) => setNewQuoteAuthor(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg glass-input text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Category</label>
                <select
                  value={newQuoteCategory}
                  onChange={(e) => setNewQuoteCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2.5 text-slate-300 focus:outline-none"
                >
                  <option value="motivation">Motivation</option>
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                  <option value="leadership">Leadership</option>
                  <option value="education">Education</option>
                  <option value="philosophy">Philosophy</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Size Category</label>
                <select
                  value={newQuoteLength}
                  onChange={(e) => setNewQuoteLength(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2.5 text-slate-300 focus:outline-none"
                >
                  <option value="short">Short (10-30 words)</option>
                  <option value="medium">Medium (30-80 words)</option>
                  <option value="long">Long (80+ words)</option>
                </select>
              </div>
              <div className="md:col-span-2 pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyber-blue text-slate-950 font-bold text-xs rounded-lg shadow-md hover:bg-cyber-blue/90"
                >
                  Save Quote
                </button>
              </div>
            </form>

            {/* List */}
            <div className="border-t border-white/5 pt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-400">Quotes Database ({localQuotes.length} total)</h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {localQuotes.map((q, idx) => (
                  <div key={q.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-950/40 border border-white/5 text-xs">
                    <div>
                      <p className="text-white font-semibold line-clamp-1">&ldquo;{q.text}&rdquo;</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">&mdash; {q.author} | {q.category} ({q.lengthCategory})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'challenges' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white mb-2">Progression Challenge Limits</h3>
            <p className="text-xs text-slate-400">
              Configure target requirements for the 20 levels. These variables shape the progression checks.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 font-semibold">
                    <th className="p-3">Level</th>
                    <th className="p-3">Title</th>
                    <th className="p-3 text-center">WPM target</th>
                    <th className="p-3 text-center">Accuracy target</th>
                    <th className="p-3 text-center">Time Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {CHALLENGES.map((chal) => (
                    <tr key={chal.id} className="hover:bg-white/5 transition duration-150">
                      <td className="p-3 font-bold text-cyber-blue">Lvl {chal.level}</td>
                      <td className="p-3 text-white font-semibold">{chal.title}</td>
                      <td className="p-3 text-center text-slate-300 font-bold">{chal.targetWpm} WPM</td>
                      <td className="p-3 text-center text-cyber-green">{chal.targetAccuracy}%</td>
                      <td className="p-3 text-center text-white">{chal.timeLimit}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'lessons' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white">Create Coding Exercise Module</h3>
            <form onSubmit={handleAddLesson} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Exercise Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Async Fetch Request"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg glass-input text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Language</label>
                <select
                  value={newLessonLang}
                  onChange={(e) => setNewLessonLang(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2.5 text-slate-300 focus:outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Difficulty</label>
                <select
                  value={newLessonDiff}
                  onChange={(e) => setNewLessonDiff(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2.5 text-slate-300 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Source Code</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Paste raw syntax indentation template..."
                  value={newLessonCode}
                  onChange={(e) => setNewLessonCode(e.target.value)}
                  className="w-full pl-3 pr-3 py-2.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
              <div className="md:col-span-2 pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyber-blue text-slate-950 font-bold text-xs rounded-lg shadow-md hover:bg-cyber-blue/90"
                >
                  Save Exercise
                </button>
              </div>
            </form>

            {/* List */}
            <div className="border-t border-white/5 pt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 font-mono">Coding Exercises Database ({localLessons.length} total)</h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {localLessons.map((l) => (
                  <div key={l.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-950/40 border border-white/5 text-xs font-mono">
                    <div>
                      <p className="text-white font-semibold">{l.title}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">{l.language.toUpperCase()} | {l.difficulty} (Lvl {l.level})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'users' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white mb-2">User Stats Configuration (Local User)</h3>
            <p className="text-xs text-slate-400">
              Direct tools for testing level transitions and verifying achievements workflows.
            </p>

            {targetUser && (
              <div className="glass-card bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-4 max-w-md">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">User Target:</span>
                  <strong className="text-white">{targetUser.username}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Active Level:</span>
                  <strong className="text-white">{targetUser.level}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">XP Progress:</span>
                  <strong className="text-white">{targetUser.xp} XP</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Top WPM:</span>
                  <strong className="text-white">{targetUser.wpm} WPM</strong>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={handleBoostXp}
                    className="flex-1 py-2 bg-cyber-blue text-slate-950 font-bold text-xs rounded-lg shadow-md hover:bg-cyber-blue/90"
                  >
                    Level Up (+1 Level)
                  </button>
                  <button
                    onClick={handleResetProgress}
                    className="flex-1 py-2 border border-cyber-red/50 bg-cyber-red/5 hover:bg-cyber-red/10 text-cyber-red font-bold text-xs rounded-lg"
                  >
                    Reset ALL Data
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
