'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getProfile, updateProfile, UserProfile } from '@/lib/services/db';
import { CHALLENGES, QUOTES, Quote, Challenge } from '@/lib/services/mockData';
import { 
  ShieldAlert, Settings, Plus, RotateCcw, AlertTriangle, CheckCircle, 
  Trash2, User, BookOpen, FileText, ChevronRight, Users, TrendingUp,
  Activity, ArrowRight, Zap, Target, Search, Filter, Edit3, Trash
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';

interface AdminViewProps {
  activeSubTab: 'overview' | 'users' | 'tests' | 'words' | 'analytics' | 'settings';
}

interface WordSet {
  id: string;
  name: string;
  category: string;
  words: string;
  usageCount: number;
}

const DEFAULT_GROWTH_DATA = [
  { name: 'Jan', users: 2 },
  { name: 'Feb', users: 5 },
  { name: 'Mar', users: 9 },
  { name: 'Apr', users: 15 },
  { name: 'May', users: 20 },
  { name: 'Jun', users: 24 }
];

const DEFAULT_WPM_DISTRIBUTION = [
  { name: '10-30 WPM', count: 3 },
  { name: '30-50 WPM', count: 8 },
  { name: '50-70 WPM', count: 12 },
  { name: '70-90 WPM', count: 5 },
  { name: '90+ WPM', count: 2 }
];

const DEFAULT_ACCURACY_DISTRIBUTION = [
  { name: 'Day 1', acc: 92 },
  { name: 'Day 3', acc: 93 },
  { name: 'Day 7', acc: 94.5 },
  { name: 'Day 14', acc: 96.2 },
  { name: 'Day 30', acc: 97.8 }
];

const ADMIN_TOOLTIP_CONTENT_STYLE = { backgroundColor: '#111', borderColor: '#222' };
const ADMIN_TOOLTIP_LABEL_STYLE = { color: '#FF6B00' };

export const AdminView: React.FC<AdminViewProps> = ({ activeSubTab }) => {
  const { user, profile, addToast, refreshProfile } = useApp();

  // API Fetched States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Test Management
  const [customTests, setCustomTests] = useState<any[]>([]);
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestText, setNewTestText] = useState('');
  const [newTestCategory, setNewTestCategory] = useState('Beginner');
  const [newTestWpm, setNewTestWpm] = useState(30);
  const [newTestAccuracy, setNewTestAccuracy] = useState(90);
  const [newTestDuration, setNewTestDuration] = useState(60);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  // Word Collections
  const [wordSets, setWordSets] = useState<WordSet[]>([
    { id: 'ws-1', name: 'English Vocabulary', category: 'English Vocabulary', words: 'the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she', usageCount: 142 },
    { id: 'ws-2', name: 'Coding Keywords', category: 'Coding', words: 'const let function class import export return if else while for async await try catch throw new typeof instanceof interface type extends implements', usageCount: 89 },
    { id: 'ws-3', name: 'Competitive Wordlist', category: 'Competitive', words: 'algorithm binary pointer recursion dynamic stack queue vector structure complexity optimization speed compilation runtime segment tree matrix exponentiation', usageCount: 65 }
  ]);
  const [newSetName, setNewSetName] = useState('');
  const [newSetCategory, setNewSetCategory] = useState('English Vocabulary');
  const [newSetWords, setNewSetWords] = useState('');
  const [editingSetId, setEditingSetId] = useState<string | null>(null);

  // Platform Settings
  const [xpMultiplier, setXpMultiplier] = useState(1.5);
  const [rankThreshold, setRankThreshold] = useState(500);
  const [testPresets, setTestPresets] = useState([15, 30, 60, 90, 120]);
  const [newDurationPreset, setNewDurationPreset] = useState<number>(45);
  const [leaderboardRows, setLeaderboardRows] = useState(50);

  const growthChartData = useMemo(() => {
    return analyticsData?.growth || DEFAULT_GROWTH_DATA;
  }, [analyticsData?.growth]);

  // Fetch Users and Analytics from Secured APIs
  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      if (usersData.users) {
        setUsersList(usersData.users);
      }

      const analyticsRes = await fetch('/api/admin/analytics');
      const analyticsData = await analyticsRes.json();
      if (!analyticsData.error) {
        setAnalyticsData(analyticsData);
      }
    } catch (err) {
      console.error('Failed to retrieve admin details:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    // Pre-populate with challenges and quotes
    const formatted = CHALLENGES.map(c => ({
      id: c.id,
      title: c.title,
      text: c.text,
      category: 'Progression',
      targetWpm: c.targetWpm,
      targetAccuracy: c.targetAccuracy,
      timeLimit: c.timeLimit
    }));
    setCustomTests(formatted);
  }, []);

  // Filtered Users computation
  const filteredUsers = usersList.filter((u) => {
    const username = u?.username || '';
    const email = u?.email || '';
    const matchesSearch = username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u?.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // User Actions
  const handleBoostUser = async (userToBoost: any) => {
    try {
      if (userToBoost.id === 'guest-user-id') {
        // Boost locally
        const nextLevel = (profile?.level || 1) + 1;
        await updateProfile(userToBoost.id, {
          level: nextLevel,
          xp: 0
        });
        addToast('Stats Boosted', `Level upgraded to ${nextLevel}!`, 'success');
        refreshProfile();
      } else {
        // Boost Supabase user directly using standard db update
        const nextLevel = userToBoost.level + 1;
        await updateProfile(userToBoost.id, {
          level: nextLevel,
          xp: 0
        });
        addToast('Stats Boosted', `Upgraded ${userToBoost.username} to Level ${nextLevel}!`, 'success');
      }
      fetchAdminData();
    } catch (err) {
      addToast('Error', 'Failed to boost statistics', 'error');
    }
  };

  // Test Actions
  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestTitle || !newTestText) {
      addToast('Validation Failed', 'Please fill in all typing test details.', 'error');
      return;
    }

    const testPayload = {
      title: newTestTitle,
      text: newTestText,
      category: newTestCategory,
      targetWpm: newTestWpm,
      targetAccuracy: newTestAccuracy,
      timeLimit: newTestDuration
    };

    try {
      const res = await fetch('/api/admin/create-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      const data = await res.json();
      
      if (data.success) {
        setCustomTests([data.test, ...customTests]);
        setNewTestTitle('');
        setNewTestText('');
        addToast('Test Created', 'New practice text saved successfully.', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast('API Error', err.message || 'Failed to create test', 'error');
    }
  };

  const handleUpdateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestId || !newTestTitle || !newTestText) return;

    const testPayload = {
      id: editingTestId,
      title: newTestTitle,
      text: newTestText,
      category: newTestCategory,
      targetWpm: newTestWpm,
      targetAccuracy: newTestAccuracy,
      timeLimit: newTestDuration
    };

    try {
      const res = await fetch('/api/admin/update-test', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      const data = await res.json();

      if (data.success) {
        setCustomTests(customTests.map(t => t.id === editingTestId ? data.test : t));
        setNewTestTitle('');
        setNewTestText('');
        setEditingTestId(null);
        addToast('Test Updated', 'Typing test changes saved successfully.', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast('API Error', err.message || 'Failed to update test', 'error');
    }
  };

  const handleDeleteTest = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/delete-test?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        setCustomTests(customTests.filter(t => t.id !== id));
        addToast('Test Removed', 'Practice text deleted successfully.', 'info');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast('API Error', err.message || 'Failed to delete test', 'error');
    }
  };

  // Word Collection Actions
  const handleSaveWordSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetName || !newSetWords) {
      addToast('Validation Failed', 'Please enter a collection name and words.', 'error');
      return;
    }

    if (editingSetId) {
      setWordSets(wordSets.map(s => s.id === editingSetId ? { ...s, name: newSetName, category: newSetCategory, words: newSetWords } : s));
      setEditingSetId(null);
      addToast('Collection Updated', 'Word set changes saved.', 'success');
    } else {
      const newSet: WordSet = {
        id: `ws-${Math.random().toString(36).substring(7)}`,
        name: newSetName,
        category: newSetCategory,
        words: newSetWords,
        usageCount: 0
      };
      setWordSets([newSet, ...wordSets]);
      addToast('Collection Added', 'Word collection created successfully.', 'success');
    }

    setNewSetName('');
    setNewSetWords('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Overview Dashboard view */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Dashboard HUD statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="glass-card p-4 rounded-xl relative overflow-hidden">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Users</span>
              <h2 className="text-2xl font-black text-white mt-1">{analyticsData?.totalUsers || 24}</h2>
              <div className="text-[9px] text-[#FF6B00] font-bold mt-1">+12% growth</div>
            </div>
            
            <div className="glass-card p-4 rounded-xl relative overflow-hidden">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Users (7d)</span>
              <h2 className="text-2xl font-black text-white mt-1">{analyticsData?.activeUsers || 8}</h2>
              <div className="text-[9px] text-emerald-400 font-bold mt-1">33% active rate</div>
            </div>

            <div className="glass-card p-4 rounded-xl relative overflow-hidden">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Tests Run</span>
              <h2 className="text-2xl font-black text-white mt-1">{analyticsData?.totalTestsCompleted || 154}</h2>
              <div className="text-[9px] text-slate-500 font-bold mt-1">across all modes</div>
            </div>

            <div className="glass-card p-4 rounded-xl relative overflow-hidden">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Average speed</span>
              <h2 className="text-2xl font-black text-white mt-1">{analyticsData?.averageWpm || 46.8} WPM</h2>
              <div className="text-[9px] text-emerald-400 font-bold mt-1">target average exceed</div>
            </div>

            <div className="glass-card p-4 rounded-xl relative overflow-hidden col-span-2 lg:col-span-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">XP Multipliers</span>
              <h2 className="text-2xl font-black text-[#FF6B00] mt-1">{xpMultiplier}x</h2>
              <div className="text-[9px] text-[#FF6B00] font-bold mt-1">active boost status</div>
            </div>
          </div>

          {/* Quick Growth Analytics chart */}
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[#FF6B00]" />
              Platform Registration Growth
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthChartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#444" fontSize={10} />
                  <YAxis stroke="#444" fontSize={10} />
                  <Tooltip contentStyle={ADMIN_TOOLTIP_CONTENT_STYLE} labelStyle={ADMIN_TOOLTIP_LABEL_STYLE} />
                  <Area type="monotone" dataKey="users" stroke="#FF6B00" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recent User Registrations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#222222] text-slate-500 font-semibold">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3 text-center">Level</th>
                    <th className="pb-3 text-right">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {usersList.slice(0, 4).map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition">
                      <td className="py-3 font-semibold text-white">{u.username}</td>
                      <td className="py-3 text-slate-400">{u.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-center font-bold text-white">Lvl {u.level}</td>
                      <td className="py-3 text-right text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Management view */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search inputs */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-3.5 text-slate-500"><Search size={14} /></span>
              <input
                type="text"
                placeholder="Search username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#111111] border border-[#222222] focus:border-[#FF6B00]/50 focus:outline-none text-xs text-white"
              />
            </div>
            
            {/* Filter selectors */}
            <div className="flex gap-2">
              <button 
                onClick={() => setRoleFilter('all')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition ${
                  roleFilter === 'all' ? 'bg-[#FF6B00]/10 border-[#FF6B00] text-[#FF6B00]' : 'border-[#222222] text-slate-400'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setRoleFilter('admin')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition ${
                  roleFilter === 'admin' ? 'bg-[#FF6B00]/10 border-[#FF6B00] text-[#FF6B00]' : 'border-[#222222] text-slate-400'
                }`}
              >
                Admins
              </button>
              <button 
                onClick={() => setRoleFilter('user')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition ${
                  roleFilter === 'user' ? 'bg-[#FF6B00]/10 border-[#FF6B00] text-[#FF6B00]' : 'border-[#222222] text-slate-400'
                }`}
              >
                Users
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Users Table */}
            <div className="glass-card p-5 rounded-2xl lg:col-span-8 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#222222] text-slate-500 font-semibold">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3 text-center">Level</th>
                    <th className="pb-3 text-center">Tests</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className={`hover:bg-[#181818]/40 transition cursor-pointer ${selectedUser?.id === u.id ? 'bg-[#FF6B00]/5' : ''}`} onClick={() => setSelectedUser(u)}>
                      <td className="py-3 font-semibold text-white">
                        <div>{u.username}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{u.email}</div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-center font-bold text-white">Lvl {u.level}</td>
                      <td className="py-3 text-center text-slate-300 font-semibold">{u.total_tests}</td>
                      <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleBoostUser(u)}
                          className="px-2.5 py-1 bg-[#FF6B00]/10 hover:bg-[#FF6B00] hover:text-black border border-[#FF6B00]/30 transition text-[#FF6B00] text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Level Up
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Profile Detail Summary Panel */}
            <div className="glass-card p-5 rounded-2xl lg:col-span-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#222222] pb-2">Profile HUD Detail</h3>
              {selectedUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-900 border border-[#222222] rounded-full flex items-center justify-center text-lg font-bold text-[#FF6B00]">
                      {(selectedUser.username || '').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{selectedUser.username}</h4>
                      <p className="text-[10px] text-slate-500">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-[#222222] pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account ID:</span>
                      <span className="font-mono text-slate-300 text-[10px]">{selectedUser.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Role Membership:</span>
                      <span className="text-[#FF6B00] font-semibold uppercase">{selectedUser.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Join Date:</span>
                      <span className="text-slate-300">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Practice Time:</span>
                      <span className="text-slate-300">{Math.round(selectedUser.practice_time / 60)} mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Average accuracy:</span>
                      <span className="text-emerald-400 font-semibold">{selectedUser.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best Speed achieved:</span>
                      <span className="text-[#FF6B00] font-bold">{selectedUser.wpm} WPM</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 text-xs py-10">
                  Select a user from the list to view their summary details.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Management view */}
      {activeSubTab === 'tests' && (
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              {editingTestId ? 'Edit Predefined Typing Test' : 'Create Predefined Typing Test'}
            </h3>
            
            <form onSubmit={editingTestId ? handleUpdateTest : handleCreateTest} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 space-y-1">
                <label className="text-slate-400 font-semibold">Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intermediate Shift Sequences"
                  value={newTestTitle}
                  onChange={(e) => setNewTestTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0B0B] border border-[#222222] focus:border-[#FF6B00]/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Category Type</label>
                <select
                  value={newTestCategory}
                  onChange={(e) => setNewTestCategory(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#222222] focus:border-[#FF6B00]/50 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Coding">Coding</option>
                  <option value="English Vocabulary">English Vocabulary</option>
                  <option value="Competitive">Competitive</option>
                </select>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-slate-400 font-semibold">Typing Practice Text</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste the raw text users must type..."
                  value={newTestText}
                  onChange={(e) => setNewTestText(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0B0B] border border-[#222222] focus:border-[#FF6B00]/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">WPM Target</label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={newTestWpm}
                  onChange={(e) => setNewTestWpm(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0B0B] border border-[#222222] focus:border-[#FF6B00]/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Accuracy Target (%)</label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={newTestAccuracy}
                  onChange={(e) => setNewTestAccuracy(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0B0B] border border-[#222222] focus:border-[#FF6B00]/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Duration (seconds)</label>
                <input
                  type="number"
                  min={10}
                  max={600}
                  value={newTestDuration}
                  onChange={(e) => setNewTestDuration(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0B0B] border border-[#222222] focus:border-[#FF6B00]/50 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                {editingTestId && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewTestTitle('');
                      setNewTestText('');
                      setEditingTestId(null);
                    }}
                    className="px-4 py-2 border border-[#222222] hover:bg-[#181818] rounded-xl text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-black font-bold rounded-xl cursor-pointer"
                >
                  {editingTestId ? 'Save Edits' : 'Save Test'}
                </button>
              </div>
            </form>
          </div>

          {/* Test List */}
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Active Typing Tests ({customTests.length})</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {customTests.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-[#0B0B0B] border border-[#222222] text-xs">
                  <div>
                    <h4 className="font-bold text-white">{t.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {t.category} | {t.timeLimit}s | Target: {t.targetWpm} WPM / {t.targetAccuracy}% Acc
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingTestId(t.id);
                        setNewTestTitle(t.title);
                        setNewTestText(t.text);
                        setNewTestCategory(t.category);
                        setNewTestWpm(t.targetWpm);
                        setNewTestAccuracy(t.targetAccuracy);
                        setNewTestDuration(t.timeLimit);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteTest(t.id)}
                      className="p-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-900/30 text-rose-400 rounded cursor-pointer"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Word Collections view */}
      {activeSubTab === 'words' && (
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              {editingSetId ? 'Edit Word Collection' : 'Create Custom Word Set'}
            </h3>

            <form onSubmit={handleSaveWordSet} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python Key Functions"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0B0B] border border-[#222222] focus:border-[#FF6B00]/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Category Type</label>
                <select
                  value={newSetCategory}
                  onChange={(e) => setNewSetCategory(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#222222] focus:border-[#FF6B00]/50 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
                >
                  <option value="English Vocabulary">English Vocabulary</option>
                  <option value="Coding">Coding</option>
                  <option value="Competitive">Competitive</option>
                  <option value="Keyboard Layout Layouts">Layout Drill</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-slate-400 font-semibold">Words (separated by spaces)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Insert lists of words..."
                  value={newSetWords}
                  onChange={(e) => setNewSetWords(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0B0B] border border-[#222222] focus:border-[#FF6B00]/50 focus:outline-none font-mono"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                {editingSetId && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewSetName('');
                      setNewSetWords('');
                      setEditingSetId(null);
                    }}
                    className="px-4 py-2 border border-[#222222] hover:bg-[#181818] rounded-xl text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-black font-bold rounded-xl cursor-pointer"
                >
                  {editingSetId ? 'Save Edits' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>

          {/* List Collections */}
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Word Collections Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wordSets.map((ws) => (
                <div key={ws.id} className="p-4 rounded-xl bg-[#0B0B0B] border border-[#222222] flex flex-col justify-between text-xs gap-3">
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white">{ws.name}</h4>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">{ws.category}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono line-clamp-2 mt-2">{ws.words}</p>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-[#222222] pt-2 mt-1">
                    <span className="text-[10px] text-slate-400">Usage runs: <strong className="text-white">{ws.usageCount}</strong></span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingSetId(ws.id);
                          setNewSetName(ws.name);
                          setNewSetCategory(ws.category);
                          setNewSetWords(ws.words);
                        }}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        onClick={() => {
                          setWordSets(wordSets.filter(s => s.id !== ws.id));
                          addToast('Collection Deleted', 'Word set deleted successfully.', 'info');
                        }}
                        className="p-1 bg-rose-950/40 hover:bg-rose-900 border border-rose-900/30 text-rose-400 rounded cursor-pointer"
                      >
                        <Trash size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Platform Analytics view */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Speed Curve Charts */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={14} className="text-[#FF6B00]" />
                User Speed Distributions
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEFAULT_WPM_DISTRIBUTION}>
                    <XAxis dataKey="name" stroke="#444" fontSize={9} />
                    <YAxis stroke="#444" fontSize={9} />
                    <Tooltip contentStyle={ADMIN_TOOLTIP_CONTENT_STYLE} />
                    <Bar dataKey="count" fill="#FF6B00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Error rate metrics */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-[#FF6B00]" />
                Accuracy Distributions
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={DEFAULT_ACCURACY_DISTRIBUTION}>
                    <XAxis dataKey="name" stroke="#444" fontSize={9} />
                    <YAxis stroke="#444" domain={[90, 100]} fontSize={9} />
                    <Tooltip contentStyle={ADMIN_TOOLTIP_CONTENT_STYLE} />
                    <Line type="monotone" dataKey="acc" stroke="#FF6B00" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Settings view */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-xs">
            
            {/* Multipliers & thresholds */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#222222] pb-2">Multipliers & Thresholds</h3>
              
              <div className="space-y-4">
                {/* XP Multiplier */}
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">XP Reward Multiplier</span>
                    <span className="text-[#FF6B00] font-bold">{xpMultiplier}x</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={xpMultiplier}
                    onChange={(e) => setXpMultiplier(Number(e.target.value))}
                    className="w-full accent-[#FF6B00] cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">Multiplies the XP gained by users upon typing completion.</p>
                </div>

                {/* Level Up Threshold */}
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Base Level XP Threshold</span>
                    <span className="text-white font-bold">{rankThreshold} XP</span>
                  </div>
                  <input
                    type="number"
                    min={100}
                    max={2000}
                    step={50}
                    value={rankThreshold}
                    onChange={(e) => setRankThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0B0B] border border-[#222222] focus:border-[#FF6B00]/50 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Calculates level thresholds: Level * Threshold.</p>
                </div>
              </div>
            </div>

            {/* Test Duration Presets */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#222222] pb-2">Default Test Presets</h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {testPresets.map((preset) => (
                    <div key={preset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0B0B] border border-[#222222] text-white">
                      <span>{preset}s</span>
                      <button
                        onClick={() => setTestPresets(testPresets.filter(p => p !== preset))}
                        className="text-rose-500 hover:text-rose-400 ml-1 font-bold cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Add duration (s)"
                    value={newDurationPreset || ''}
                    onChange={(e) => setNewDurationPreset(Number(e.target.value))}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#0B0B0B] border border-[#222222] focus:border-[#FF6B00]/50 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (newDurationPreset && !testPresets.includes(newDurationPreset)) {
                        setTestPresets([...testPresets, newDurationPreset].sort((a, b) => a - b));
                        setNewDurationPreset(0);
                        addToast('Preset Added', 'New default time limit configured.', 'success');
                      }
                    }}
                    className="px-4 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-black font-bold rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
