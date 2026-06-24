'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { saveSession, incrementPracticeTime, getSessions, TypingSession } from '@/lib/services/db';
import { 
  FileText, Play, RotateCcw, Target, Hourglass, ArrowRight, 
  Sparkles, ArrowLeft, Clipboard, Trash2, Clock, History, Zap, Check, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MyWords: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user, addToast, refreshProfile, isZenMode, setIsZenMode, playClickSound } = useApp();

  // Screen state
  const [screen, setScreen] = useState<'setup' | 'typing' | 'results'>('setup');

  // Setup options
  const [customText, setCustomText] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number | 'custom'>(60);
  const [customDuration, setCustomDuration] = useState<number>(30);

  // Active Typing State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [rawTypedText, setRawTypedText] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [errors, setErrors] = useState(0);
  const [history, setHistory] = useState<TypingSession[]>([]);

  // Results State
  const [results, setResults] = useState<{
    wpm: number;
    accuracy: number;
    correctChars: number;
    incorrectChars: number;
    totalChars: number;
    duration: number;
    completionPercentage: number;
  } | null>(null);

  // Refs for tracking practice time and countdown
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);
  const elapsedTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  const rawTypedTextRef = useRef('');

  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    rawTypedTextRef.current = rawTypedText;
  }, [rawTypedText]);

  // Sync Zen Mode with screen status
  useEffect(() => {
    if (isPlaying && screen === 'typing') {
      setIsZenMode(true);
    } else {
      setIsZenMode(false);
    }
    return () => {
      setIsZenMode(false);
    };
  }, [isPlaying, screen, setIsZenMode]);

  // Load user test history of my_words
  const loadHistory = async () => {
    if (!user) return;
    try {
      const allSessions = await getSessions(user.id);
      const filtered = allSessions.filter(s => s.levelType === 'my_words');
      setHistory(filtered.slice(0, 10)); // Top 10 recent custom tests
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user, screen]);

  // Clean timer and save practice time on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (isPlayingRef.current && elapsedTimeRef.current > 0 && user) {
        incrementPracticeTime(user.id, elapsedTimeRef.current);
      }
    };
  }, [user]);

  // Text metrics helpers
  const charCount = customText.length;
  const wordCount = customText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Determine active duration
  const getActiveDuration = (): number => {
    if (selectedDuration === 'custom') {
      return customDuration;
    }
    return selectedDuration;
  };

  // Validation Checkers
  const isTextValid = charCount >= 20 && charCount <= 20000;
  const isDurationValid = selectedDuration === 'custom' 
    ? (customDuration >= 10 && customDuration <= 600)
    : true;
  const canStart = isTextValid && isDurationValid;

  // Actions
  const handleClearText = () => {
    setCustomText('');
    addToast('Cleared', 'Pasted text cleared successfully', 'info');
  };

  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCustomText(text);
        addToast('Pasted', 'Text pasted from clipboard', 'success');
      } else {
        addToast('Clipboard Empty', 'Could not find any text in clipboard', 'error');
      }
    } catch (err) {
      addToast('Paste Failed', 'Please paste manually inside the box', 'error');
    }
  };

  // Starting test
  const handleStartTest = () => {
    if (!canStart) return;
    setRawTypedText('');
    setElapsedTime(0);
    setErrors(0);
    setIsPlaying(true);
    setIsStarted(false);
    setScreen('typing');
    // Focus textarea in next tick
    setTimeout(() => {
      if (textInputRef.current) textInputRef.current.focus();
    }, 100);
  };

  // Tracking keystrokes
  const handleStartTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const maxLen = customText.length;
    
    // Safety check: ignore inputs beyond text bounds
    if (val.length > maxLen) return;

    // Trigger keypress audio
    if (val.length > rawTypedText.length) {
      const typedChar = val[val.length - 1];
      playClickSound(typedChar);
    }

    // Start timer on first keystroke
    const duration = getActiveDuration();
    if (!isStarted && val.length === 1) {
      setIsStarted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const next = prev + 1;
          if (next >= duration) {
            handleFinished(next, rawTypedTextRef.current);
            return next;
          }
          return next;
        });
      }, 1000);
    }

    // Track real-time errors
    let errorCount = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== customText[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);
    setRawTypedText(val);

    // Complete early if they type the entire custom passage
    if (val.length >= maxLen) {
      handleFinished(elapsedTime, val);
    }
  };

  // Finished test
  const handleFinished = async (finalSeconds: number, finalTypedText: string) => {
    setIsPlaying(false);
    setIsStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    const totalDuration = getActiveDuration();
    const activeSeconds = Math.min(finalSeconds || 1, totalDuration);

    // Calculate final metrics
    const cleanTyped = finalTypedText;
    let finalErrors = 0;
    for (let i = 0; i < cleanTyped.length; i++) {
      if (cleanTyped[i] !== customText[i]) {
        finalErrors++;
      }
    }

    const correctChars = Math.max(0, cleanTyped.length - finalErrors);
    const accuracy = cleanTyped.length > 0
      ? Math.round((correctChars / cleanTyped.length) * 100)
      : 100;

    const finalWpm = Math.round((cleanTyped.length / 5) / ((activeSeconds || 1) / 60));
    const completionPercentage = Math.min(100, Math.round((cleanTyped.length / customText.length) * 100));

    setResults({
      wpm: finalWpm,
      accuracy,
      correctChars,
      incorrectChars: finalErrors,
      totalChars: cleanTyped.length,
      duration: activeSeconds,
      completionPercentage
    });

    setScreen('results');

    // Save sessions to DB (Supabase / Local)
    if (user && finalWpm > 0) {
      try {
        await saveSession(user.id, {
          wpm: finalWpm,
          accuracy,
          levelType: 'my_words',
          duration: activeSeconds || 1,
          errors: finalErrors,
          charsTyped: cleanTyped.length
        });
        addToast('Saved Results', `Custom test session saved successfully.`, 'success');
        refreshProfile();
      } catch (err) {
        console.error('Failed to save session:', err);
      }
    }
  };

  // Render text highlighting with sliding optimization window
  const renderTextHighlights = () => {
    const typedLen = rawTypedText.length;
    // Sliding window boundaries (limit spans rendered to avoid react slowdowns)
    const windowStart = Math.max(0, typedLen - 150);
    const windowEnd = Math.min(customText.length, typedLen + 300);

    const spans = [];
    const fontSizeClass = isZenMode ? 'text-xl md:text-2xl leading-loose' : 'text-lg leading-relaxed';
    
    // Prefix ellipsis if window slices original text
    if (windowStart > 0) {
      spans.push(<span key="start-dots" className={`opacity-25 font-mono ${fontSizeClass}`}>... </span>);
    }

    for (let i = windowStart; i < windowEnd; i++) {
      const char = customText[i];
      const typedChar = rawTypedText[i];
      let charClass = 'opacity-40 text-slate-400';

      if (typedChar !== undefined) {
        charClass = typedChar === char 
          ? 'text-white font-medium' 
          : 'bg-rose-500/20 text-rose-400 border-b border-rose-500 font-medium';
      }

      const isActive = i === typedLen;
      const activeClass = isActive 
        ? 'border-l-2 border-orange-500 relative animate-pulse' 
        : '';

      if (char === '\n') {
        spans.push(
          <span key={i} className={`${charClass} ${activeClass} font-mono ${fontSizeClass}`}>
            ↵<br />
          </span>
        );
      } else {
        spans.push(
          <span key={i} className={`${charClass} ${activeClass} font-mono ${fontSizeClass} whitespace-pre-wrap transition-colors duration-75`}>
            {char}
          </span>
        );
      }
    }

    // Suffix ellipsis if window slices original text
    if (windowEnd < customText.length) {
      spans.push(<span key="end-dots" className={`opacity-25 font-mono ${fontSizeClass}`}> ...</span>);
    }

    return spans;
  };

  // Performance message selector
  const getPerformanceFeedback = (wpm: number, acc: number) => {
    if (wpm >= 85 && acc >= 96) return { title: 'Excellent Performance 🚀', desc: 'Outstanding speed and accuracy! Master class typing.' };
    if (wpm >= 55 || acc >= 90) return { title: 'Great Job 🔥', desc: 'Impressive accuracy and timing. Keep moving up!' };
    return { title: 'Keep Practicing 💪', desc: 'Consistency is key. Type slower to lock in that accuracy!' };
  };

  const activeDuration = getActiveDuration();
  const timeLeft = activeDuration - elapsedTime;
  const progressPercentage = Math.round((rawTypedText.length / (customText.length || 1)) * 100);

  return (
    <div className={`transition-all duration-500 ${isZenMode ? 'w-full h-screen max-h-screen overflow-hidden flex flex-col justify-center mx-auto px-6 md:px-16 lg:px-24 pb-0 pt-0' : 'space-y-6 max-w-5xl mx-auto pb-10'}`}>
      
      {/* HUD Header Banner */}
      {!isZenMode && (
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between"
             style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-surface-2 transition border"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                   style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--accent)' }}>
                <FileText size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>SaaS Premium</span>
                <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--text)' }}>My Words Practice</h2>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* SETUP SCREEN */}
        {screen === 'setup' && (
          <motion.div
            key="setup-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
          >
            {/* Custom Input Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 rounded-2xl border space-y-5"
                   style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                
                <div className="flex justify-between items-center border-b pb-3"
                     style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Paste Your Custom Text</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePasteText}
                      className="px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 hover:bg-surface-2 transition select-none cursor-pointer"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      <Clipboard size={12} />
                      Paste
                    </button>
                    <button
                      onClick={handleClearText}
                      className="px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition select-none cursor-pointer"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={12} />
                      Clear
                    </button>
                  </div>
                </div>

                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full h-64 p-4 rounded-xl border focus:outline-none focus:ring-1 focus:ring-orange-500/20 text-sm leading-relaxed font-sans placeholder-slate-600 transition duration-300 shadow-inner"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  placeholder="Paste your article, notes, code snippet, interview questions, essay, or any text you want to practice..."
                />

                {/* Counter Footer */}
                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl border"
                     style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <div className="flex flex-col text-center">
                    <span className="text-[8px] font-bold uppercase">Words</span>
                    <span className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>{wordCount}</span>
                  </div>
                  <div className="flex flex-col text-center border-x" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-[8px] font-bold uppercase">Characters</span>
                    <span className={`text-sm font-extrabold ${customText.length > 20000 ? 'text-rose-500' : ''}`} style={{ color: customText.length > 20000 ? 'var(--error)' : 'var(--text)' }}>
                      {charCount.toLocaleString()} <span className="text-[8px] font-medium opacity-50">/ 20k</span>
                    </span>
                  </div>
                  <div className="flex flex-col text-center">
                    <span className="text-[8px] font-bold uppercase">Reading Time</span>
                    <span className="text-sm font-extrabold" style={{ color: 'var(--accent)' }}>{estimatedReadingTime} min</span>
                  </div>
                </div>

                {/* Validation Warnings */}
                {charCount > 0 && charCount < 20 && (
                  <div className="text-xs font-bold text-rose-500 text-center animate-pulse">
                    ⚠ Practice text is too short. Minimum 20 characters required. (Currently: {charCount})
                  </div>
                )}
                {charCount > 20000 && (
                  <div className="text-xs font-bold text-rose-500 text-center animate-pulse">
                    ⚠ Text exceeds limit. Maximum 20,000 characters allowed. (Currently: {charCount})
                  </div>
                )}
              </div>
            </div>

            {/* Test Settings Column */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl border space-y-6"
                   style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                
                <h3 className="text-xs font-extrabold uppercase tracking-wider border-b pb-3"
                    style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                  Test Configuration
                </h3>

                {/* Duration Pills */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                    Duration Selector
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 60, 90, 120].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setSelectedDuration(sec)}
                        className={`py-2 px-1 rounded-lg text-xs font-bold border transition cursor-pointer select-none ${
                          selectedDuration === sec 
                            ? 'border-accent text-accent' 
                            : 'border-border text-text-muted hover:text-text hover:bg-surface-2'
                        }`}
                        style={{ 
                          backgroundColor: selectedDuration === sec ? 'var(--selection)' : 'transparent',
                          borderColor: selectedDuration === sec ? 'var(--accent)' : 'var(--border)'
                        }}
                      >
                        {sec}s
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedDuration('custom')}
                      className={`py-2 px-1 rounded-lg text-xs font-bold border transition cursor-pointer select-none ${
                        selectedDuration === 'custom' 
                          ? 'border-accent text-accent' 
                          : 'border-border text-text-muted hover:text-text hover:bg-surface-2'
                      }`}
                      style={{ 
                        backgroundColor: selectedDuration === 'custom' ? 'var(--selection)' : 'transparent',
                        borderColor: selectedDuration === 'custom' ? 'var(--accent)' : 'var(--border)'
                      }}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {/* Custom input slider/field */}
                {selectedDuration === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Seconds</span>
                      <span className="text-xs font-extrabold" style={{ color: 'var(--accent)' }}>{customDuration}s</span>
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="range"
                        min="10"
                        max="600"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(Number(e.target.value))}
                        className="flex-1 h-1.5 rounded-lg focus:outline-none cursor-pointer align-middle mt-1.5"
                        style={{ accentColor: 'var(--accent)', backgroundColor: 'var(--bg)' }}
                      />
                      <input
                        type="number"
                        min="10"
                        max="600"
                        value={customDuration}
                        onChange={(e) => {
                          const val = Math.max(10, Math.min(600, Number(e.target.value)));
                          setCustomDuration(val);
                        }}
                        className="w-16 px-2 py-1 rounded border text-xs text-center focus:outline-none"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                    <div className="text-[9px] leading-normal" style={{ color: 'var(--text-muted)' }}>
                      Supports values between 10 and 600 seconds.
                    </div>
                  </motion.div>
                )}

                {/* Start Test CTA */}
                <button
                  onClick={handleStartTest}
                  disabled={!canStart}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play size={12} fill="currentColor" />
                  Start Custom Test
                </button>
              </div>

              {/* History panel */}
              {history.length > 0 && (
                <div className="glass-card p-6 rounded-2xl border space-y-4"
                     style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b pb-3"
                      style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                    <History size={14} /> Previous Custom Sessions
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {history.map((s) => (
                      <div 
                        key={s.id}
                        className="p-2.5 rounded-xl border flex items-center justify-between text-xs transition hover:bg-surface-2"
                        style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                      >
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-orange-500">{s.wpm} WPM</div>
                          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                            Length: {s.charsTyped.toLocaleString()} chars
                          </div>
                        </div>
                        <div className="text-right space-y-0.5">
                          <div className="font-bold" style={{ color: 'var(--text)' }}>{s.accuracy}% Acc</div>
                          <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                            {new Date(s.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TYPING TEST SCREEN */}
        {screen === 'typing' && (
          <motion.div
            key="typing-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* HUD Indicators panel */}
            <div className={`transition-all duration-300 ${
              isZenMode 
                ? 'flex justify-between items-center text-slate-500 text-lg border-b border-white/5 pb-4 mb-4 select-none' 
                : 'grid grid-cols-4 gap-4'
            }`}>
              {isZenMode ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Time:</span>
                    <span className="text-2xl font-black text-white">{timeLeft}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Speed:</span>
                    <span className="text-2xl font-black text-orange-500">{rawTypedText.length > 0 ? Math.round((rawTypedText.length / 5) / ((elapsedTime || 1) / 60)) : 0} WPM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Accuracy:</span>
                    <span className="text-2xl font-black text-emerald-400">{rawTypedText.length > 0 ? Math.round(((rawTypedText.length - errors) / rawTypedText.length) * 100) : 100}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Progress:</span>
                    <span className="text-2xl font-black text-white">{progressPercentage}%</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="glass-card p-4 rounded-xl border text-center flex flex-col items-center justify-center"
                       style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                      <Clock size={12} /> Time Left
                    </span>
                    <span className="text-2xl font-extrabold text-white tracking-tight">
                      {timeLeft}s
                    </span>
                  </div>

                  <div className="glass-card p-4 rounded-xl border text-center flex flex-col items-center justify-center"
                       style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                      <Target size={12} /> Live WPM
                    </span>
                    <span className="text-2xl font-extrabold text-orange-500 tracking-tight">
                      {rawTypedText.length > 0 ? Math.round((rawTypedText.length / 5) / ((elapsedTime || 1) / 60)) : 0}
                    </span>
                  </div>

                  <div className="glass-card p-4 rounded-xl border text-center flex flex-col items-center justify-center"
                       style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                      <Sparkles size={12} /> Accuracy
                    </span>
                    <span className="text-2xl font-extrabold text-white tracking-tight">
                      {rawTypedText.length > 0 ? Math.round(((rawTypedText.length - errors) / rawTypedText.length) * 100) : 100}%
                    </span>
                  </div>

                  <div className="glass-card p-4 rounded-xl border text-center flex flex-col items-center justify-center"
                       style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                      <History size={12} /> Progress
                    </span>
                    <span className="text-2xl font-extrabold text-white tracking-tight">
                      {progressPercentage}%
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Main Interactive Typing Window */}
            <div 
              onClick={() => { if (textInputRef.current) textInputRef.current.focus(); }}
              className={`w-full transition-all duration-500 select-none cursor-text overflow-hidden relative whitespace-pre-wrap ${
                isZenMode 
                  ? 'border-0 bg-transparent p-0 min-h-48 max-h-96 text-2xl md:text-3xl leading-loose font-mono' 
                  : 'border border-white/10 rounded-2xl bg-slate-950/50 p-8 min-h-36 max-h-56 overflow-y-auto text-lg leading-relaxed'
              }`}
              style={isZenMode ? {} : { backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Virtual input window text */}
              <div className="text-slate-500 font-mono transition-all duration-100">
                {renderTextHighlights()}
              </div>

              {/* Hidden raw input receiver */}
              <textarea
                ref={textInputRef}
                value={rawTypedText}
                onChange={handleStartTyping}
                disabled={!isPlaying}
                className="absolute w-0 h-0 opacity-0 pointer-events-none"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>

            {/* Screen Actions bar */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400 select-none">
                {!isStarted ? '⚡ Press any key on your keyboard inside the box to start timer...' : '✏ Practice typing. Complete the custom passage or let time run out.'}
              </span>
              <button
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  setScreen('setup');
                }}
                className="px-4 py-2 border text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-surface-2 transition select-none cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <ArrowLeft size={14} />
                Abandom Session
              </button>
            </div>

            {/* Progress percentage slider */}
            <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all duration-300 shadow-[0_0_8px_#f97316]" style={{ width: `${progressPercentage}%` }} />
            </div>
          </motion.div>
        )}

        {/* RESULTS SCREEN */}
        {screen === 'results' && results && (
          <motion.div
            key="results-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            {/* Dynamic performance motivation card */}
            {(() => {
              const feedback = getPerformanceFeedback(results.wpm, results.accuracy);
              return (
                <div className="glass-card p-6 rounded-2xl border text-center relative overflow-hidden shadow-2xl"
                     style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px]" />
                  <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--accent)' }}>
                    {feedback.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    {feedback.desc}
                  </p>
                </div>
              );
            })()}

            {/* Grid metrics stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-2xl border text-center"
                   style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Typing Speed</span>
                <span className="text-4xl font-extrabold text-orange-500 tracking-tight">{results.wpm} WPM</span>
              </div>
              <div className="glass-card p-5 rounded-2xl border text-center"
                   style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Accuracy Score</span>
                <span className="text-4xl font-extrabold text-white tracking-tight">{results.accuracy}%</span>
              </div>
            </div>

            {/* Detailed data table */}
            <div className="glass-card p-6 rounded-2xl border space-y-4 shadow-sm"
                 style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              <h4 className="text-xs font-bold uppercase tracking-wider border-b pb-2.5 flex items-center gap-1.5"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <Target size={14} style={{ color: 'var(--accent)' }} /> Practice Analytics Summary
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="text-slate-400">Total Characters Typed:</span>
                  <span className="font-bold">{results.totalChars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="text-slate-400">Correct Keys:</span>
                  <span className="font-bold text-emerald-500">{results.correctChars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="text-slate-400">Incorrect Keys / Errors:</span>
                  <span className="font-bold text-rose-500">{results.incorrectChars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="text-slate-400">Completion rate:</span>
                  <span className="font-bold text-orange-400">{results.completionPercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Test Duration:</span>
                  <span className="font-bold">{results.duration} seconds</span>
                </div>
              </div>
            </div>

            {/* Actions CTA row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleStartTest}
                className="py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                Try Again
              </button>
              <button
                onClick={() => setScreen('setup')}
                className="py-3.5 border rounded-xl text-xs font-extrabold uppercase tracking-widest transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <ArrowRight size={14} />
                Setup Page
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
