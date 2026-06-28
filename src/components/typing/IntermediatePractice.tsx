'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { saveSession, unlockAchievement, incrementPracticeTime, getSessions } from '@/lib/services/db';
import { 
  Zap, Play, Pause, RotateCcw, Target, AlertTriangle, ArrowRight, ArrowLeft,
  TrendingUp, Award, BarChart2, Sparkles, BookOpen, ShieldCheck
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { INTERMEDIATE_LESSONS } from '@/lib/services/lessons/intermediateData';

const TOOLTIP_CONTENT_STYLE = { backgroundColor: '#0f1322', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' };
const LINE_DOT_STYLE = { fill: '#00f2fe' };

const INTERMEDIATE_WORDS = [
  'about', 'after', 'again', 'all', 'along', 'also', 'always', 'another', 'around',
  'because', 'before', 'begin', 'between', 'build', 'business', 'called', 'change',
  'close', 'come', 'code', 'consist', 'daily', 'develop', 'differ', 'during', 'early',
  'effort', 'either', 'engine', 'enough', 'every', 'excel', 'example', 'experience',
  'family', 'father', 'fellow', 'finger', 'first', 'focus', 'follow', 'found',
  'general', 'great', 'group', 'habit', 'hand', 'helper', 'home', 'house', 'human',
  'important', 'improve', 'increase', 'indeed', 'input', 'keep', 'keyboard', 'large',
  'learn', 'learning', 'level', 'master', 'memory', 'metric', 'middle', 'might',
  'muscle', 'never', 'number', 'often', 'other', 'people', 'place', 'practice',
  'process', 'program', 'provide', 'public', 'question', 'quick', 'quiet', 'rhythm',
  'right', 'second', 'sentence', 'simple', 'since', 'small', 'speed', 'steady',
  'streak', 'study', 'system', 'target', 'their', 'there', 'think', 'timer', 'today',
  'together', 'type', 'typist', 'under', 'unified', 'until', 'value', 'water',
  'weekly', 'while', 'winner', 'wizard', 'world', 'write', 'writer', 'young'
];

export const IntermediatePractice: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user, profile, addToast, refreshProfile, isZenMode, setIsZenMode, playClickSound } = useApp();

  const [stats, setStats] = useState({
    avgWpm: 0,
    avgAccuracy: 0,
    bestWpm: 0,
    totalLessons: 0
  });

  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showAccuracyModal, setShowAccuracyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const progressChartData = useMemo(() => {
    return [...allSessions]
      .reverse()
      .slice(-10)
      .map((s, idx) => ({ name: `Run ${idx + 1}`, wpm: s.wpm }));
  }, [allSessions]);

  useEffect(() => {
    const loadStats = async () => {
      if (user) {
        try {
          const sess = await getSessions(user.id);
          setAllSessions(sess);
          
          const best = profile?.wpm || 0;
          
          const avgW = sess.length > 0 
            ? Math.round(sess.reduce((acc, s) => acc + s.wpm, 0) / sess.length) 
            : profile?.wpm || 0;
          const avgA = sess.length > 0 
            ? Math.round(sess.reduce((acc, s) => acc + s.accuracy, 0) / sess.length) 
            : profile?.accuracy || 0;

          setStats({
            avgWpm: avgW,
            avgAccuracy: avgA,
            bestWpm: best,
            totalLessons: sess.length
          });
        } catch (err) {
          console.error('Failed to load stats for intermediate landing:', err);
        }
      }
    };
    loadStats();
  }, [user, profile]);

  // Test setup
  const [testMode, setTestMode] = useState<'time' | 'words' | 'lessons'>('lessons');
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30); // 30, 60, 120, 180, or custom
  const [wordCount, setWordCount] = useState<number>(25); // 25, 50, 100
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [customInputVal, setCustomInputVal] = useState<string>('300'); // default 5 minutes (300s)
  const [isCustomWordCount, setIsCustomWordCount] = useState<boolean>(false);
  const [customWordInputVal, setCustomWordInputVal] = useState<string>('150'); // default 150 words

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [targetText, setTargetText] = useState('');
  const [rawTypedText, setRawTypedText] = useState('');
  
  // Timers and metrics
  const [timeLeft, setTimeLeft] = useState(30);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<{ time: number; wpm: number }[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setIsZenMode(true);
    return () => {
      setIsZenMode(false);
    };
  }, [setIsZenMode]);

  // Refs for tracking practice time on unmount/exits
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
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Generate lowercase text
  const generateText = (currentDuration?: number) => {
    if (testMode === 'lessons') {
      const lessonText = INTERMEDIATE_LESSONS[selectedLessonIdx] || INTERMEDIATE_LESSONS[0];
      setTargetText(lessonText);
      return;
    }
    let words: string[] = [];
    const activeDuration = currentDuration !== undefined ? currentDuration : duration;
    // Scale target length for time mode based on duration, assuming ~200 WPM max speed to be safe
    const targetLength = testMode === 'words' 
      ? wordCount 
      : Math.max(100, Math.ceil((activeDuration / 60) * 200));
    for (let i = 0; i < targetLength; i++) {
      const idx = Math.floor(Math.random() * INTERMEDIATE_WORDS.length);
      words.push(INTERMEDIATE_WORDS[idx]);
    }
    setTargetText(words.join(' '));
  };

  useEffect(() => {
    generateText();
  }, [testMode, duration, wordCount, selectedLessonIdx]);
  // Clean timer on unmount and save practice time
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (isPlayingRef.current && elapsedTimeRef.current > 0 && user) {
        incrementPracticeTime(user.id, elapsedTimeRef.current);
      }
    };
  }, [user]);

  // Timer Tick handler
  const handleStart = () => {
    let finalDuration = duration;
    
    // Sanitize custom duration if enabled
    if (isCustomDuration) {
      const parsed = parseInt(customInputVal);
      if (isNaN(parsed) || parsed < 10) {
        finalDuration = 10;
        setDuration(10);
        setCustomInputVal('10');
      } else if (parsed > 3600) {
        finalDuration = 3600;
        setDuration(3600);
        setCustomInputVal('3600');
      } else {
        finalDuration = parsed;
        setDuration(parsed);
      }
    }

    // If they were already playing, save elapsed practice time first
    if (isPlaying && elapsedTime > 0 && user) {
      incrementPracticeTime(user.id, elapsedTime);
    }

    generateText(finalDuration);
    setRawTypedText('');
    setInputIndex(0);
    setWpmHistory([]);
    setElapsedTime(0);
    setTimeLeft(testMode === 'time' ? finalDuration : 0);
    setIsPlaying(true);
    setIsPaused(false);
    setIsStarted(false);
    setShowResults(false);

    // Focus input
    setTimeout(() => {
      if (textInputRef.current) textInputRef.current.focus();
    }, 50);

    // Clear timer, but do NOT start it yet
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const tick = () => {
    setElapsedTime(prev => {
      const nextTime = prev + 1;
      
      // Calculate live WPM for history chart (every 3 seconds)
      if (nextTime % 3 === 0) {
        const wpmVal = calculateLiveWpm(rawTypedTextRef.current.length, nextTime);
        setWpmHistory(hist => [...hist, { time: nextTime, wpm: wpmVal }]);
      }
      
      return nextTime;
    });

    if (testMode === 'time') {
      setTimeLeft(t => Math.max(0, t - 1));
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    // Restart interval
    timerRef.current = setInterval(() => {
      tick();
    }, 1000);
    
    setTimeout(() => {
      if (textInputRef.current) textInputRef.current.focus();
    }, 50);
  };

  const handleRestart = () => {
    handleStart();
  };

  // Keyboard capture
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isPlaying || isPaused) return;

    const val = e.target.value.toLowerCase(); // Enforce lowercase
    // Clean string from numbers, uppercase, special characters
    const cleanVal = val.replace(/[^a-z\s]/g, '');
    
    // Start timer on first keystroke
    if (!isStarted && cleanVal.length === 1) {
      setIsStarted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        tick();
      }, 1000);
    }

    setRawTypedText(cleanVal);

    // Check if word mode and reached end of text
    const wordsTyped = cleanVal.trim().split(/\s+/).length;
    const targetWords = targetText.split(' ').length;
    
    // Check if finished
    if (cleanVal.length >= targetText.length || (testMode === 'words' && wordsTyped >= wordCount && cleanVal.endsWith(' '))) {
      handleFinished(elapsedTime + 1);
    }
  };

  // Live Metrics Calculations
  const calculateLiveWpm = (charsTyped: number, seconds: number) => {
    if (seconds <= 0) return 0;
    const words = charsTyped / 5;
    const minutes = seconds / 60;
    return Math.round(words / minutes);
  };

  const handleFinished = async (finalSeconds: number) => {
    setIsPlaying(false);
    setIsZenMode(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setShowResults(true);

    // Calculate metrics
    const cleanTyped = rawTypedText.trim();
    const cleanTarget = targetText.slice(0, cleanTyped.length);
    
    let totalErrors = 0;
    for (let i = 0; i < cleanTyped.length; i++) {
      if (cleanTyped[i] !== cleanTarget[i]) {
        totalErrors++;
      }
    }

    const accuracy = cleanTyped.length > 0 
      ? Math.max(0, Math.round(((cleanTyped.length - totalErrors) / cleanTyped.length) * 100))
      : 0;

    const finalWpm = calculateLiveWpm(cleanTyped.length, finalSeconds);

    // Calculate consistency based on WPM fluctuations (variance standard deviation)
    let consistency = 90; // fallback
    if (wpmHistory.length > 2) {
      const avgWpm = wpmHistory.reduce((sum, h) => sum + h.wpm, 0) / wpmHistory.length;
      const squaredDiffs = wpmHistory.map(h => Math.pow(h.wpm - avgWpm, 2));
      const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / wpmHistory.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(40, Math.min(100, Math.round((1 - stdDev / (avgWpm || 1)) * 100)));
    }

    if (user && finalWpm > 0) {
      try {
        await saveSession(user.id, {
          wpm: finalWpm,
          accuracy,
          levelType: 'intermediate',
          duration: finalSeconds,
          errors: totalErrors,
          charsTyped: cleanTyped.length
        });

        // Achievements triggers
        if (finalWpm >= 50) {
          const isUnlocked = await unlockAchievement(user.id, 'wpm_50');
          if (isUnlocked) {
            addToast('Achievement Unlocked!', 'Speed Demon (50 WPM)', 'achievement');
          }
        }
        if (finalWpm >= 100) {
          const isUnlocked = await unlockAchievement(user.id, 'wpm_100');
          if (isUnlocked) {
            addToast('Achievement Unlocked!', 'Hyper Sonic (100 WPM)', 'achievement');
          }
        }

        addToast('Test Completed!', `Saved session: ${finalWpm} WPM`, 'success');
        refreshProfile();
      } catch (err) {
        console.error('Failed to save intermediate session:', err);
      }
    }
  };

  // Effect to handle timer running out
  useEffect(() => {
    if (isPlaying && isStarted && testMode === 'time' && timeLeft <= 0) {
      handleFinished(duration);
    }
  }, [timeLeft, isPlaying, isStarted, testMode, duration]);

  // Text formatting highlight helpers
  const renderTextHighlights = () => {
    return targetText.split('').map((char, index) => {
      const typedChar = rawTypedText[index];
      
      let charClass = 'text-slate-500'; // Default untyped
      if (typedChar !== undefined) {
        charClass = typedChar === char ? 'text-white' : 'bg-cyber-red/30 text-cyber-red border-b border-cyber-red';
      }
      
      // Active letter highlight
      const isActive = index === rawTypedText.length;
      const activeClass = isActive 
        ? 'typing-caret-active animate-caret' 
        : '';

      return (
        <span key={index} className={`${charClass} ${activeClass} transition-all duration-100 font-mono tracking-wide`}>
          {char}
        </span>
      );
    });
  };

  const [inputIndex, setInputIndex] = useState(0);
  const currentErrors = rawTypedText.split('').filter((c, i) => c !== targetText[i]).length;
  const accuracy = rawTypedText.length > 0
    ? Math.max(0, Math.round(((rawTypedText.length - currentErrors) / rawTypedText.length) * 100))
    : 100;

  const currentWpm = calculateLiveWpm(rawTypedText.length, elapsedTime);

  return (
    <div className={`transition-all duration-500 ${isZenMode ? `w-full h-screen max-h-screen overflow-hidden flex flex-col justify-center mx-auto pb-0 ${isPlaying || showResults ? 'px-6 md:px-16 lg:px-24' : 'px-0'}` : 'space-y-6 max-w-5xl mx-auto pb-10'}`}>
      {/* 1. Configuration & Controls Bar */}
      {!isZenMode && (
        <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Zap size={20} />
            </div>
            <div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Level 2 - Intermediate Practice</span>
              <h2 className="text-lg font-bold text-white leading-tight">Speed & Consistency</h2>
            </div>
          </div>

          {/* Configuration settings (only active if not playing) */}
          {!isPlaying && !showResults && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex bg-slate-900 border border-white/5 p-1 rounded-lg">
                <button
                  onClick={() => setTestMode('lessons')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    testMode === 'lessons' ? 'bg-cyber-purple text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Lessons
                </button>
                <button
                  onClick={() => setTestMode('time')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    testMode === 'time' ? 'bg-cyber-purple text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Time Mode
                </button>
                <button
                  onClick={() => setTestMode('words')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    testMode === 'words' ? 'bg-cyber-purple text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Words Mode
                </button>
              </div>

              {testMode === 'lessons' && (
                <select
                  value={selectedLessonIdx}
                  onChange={(e) => setSelectedLessonIdx(Number(e.target.value))}
                  className="bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2 text-slate-300 focus:outline-none focus:border-cyber-purple max-w-[220px]"
                >
                  {INTERMEDIATE_LESSONS.map((l, idx) => (
                    <option key={idx} value={idx}>Lesson {idx + 1}: {l.slice(0, 25)}...</option>
                  ))}
                </select>
              )}

              {testMode === 'time' ? (
                <div className="flex bg-slate-900 border border-white/5 p-1 rounded-lg items-center gap-1.5">
                  {[30, 60, 120, 180].map((t) => (
                    <button
                      key={t}
                      onClick={() => { 
                        setDuration(t); 
                        setTimeLeft(t); 
                        setIsCustomDuration(false);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        !isCustomDuration && duration === t 
                          ? 'bg-slate-800 text-cyber-blue font-bold shadow-[0_0_8px_rgba(0,242,254,0.2)]' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                  
                  {/* Custom Duration Option */}
                  <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/10">
                    <button
                      onClick={() => {
                        setIsCustomDuration(true);
                        const numericVal = parseInt(customInputVal) || 300;
                        setDuration(numericVal);
                        setTimeLeft(numericVal);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        isCustomDuration 
                          ? 'bg-slate-800 text-cyber-blue font-bold shadow-[0_0_8px_rgba(0,242,254,0.2)]' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Custom
                    </button>
                    {isCustomDuration && (
                      <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-white/10">
                        <input
                          type="number"
                          min="10"
                          max="3600"
                          value={customInputVal}
                          onChange={(e) => {
                            const valStr = e.target.value;
                            setCustomInputVal(valStr);
                            const valNum = parseInt(valStr) || 0;
                            if (valNum >= 10 && valNum <= 3600) {
                              setDuration(valNum);
                              setTimeLeft(valNum);
                            }
                          }}
                          className="w-12 bg-transparent text-xs text-white focus:outline-none text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="300"
                        />
                        <span className="text-[10px] text-slate-500">s</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex bg-slate-900 border border-white/5 p-1 rounded-lg items-center gap-1.5">
                  {[25, 50, 100].map((w) => (
                    <button
                      key={w}
                      onClick={() => {
                        setWordCount(w);
                        setIsCustomWordCount(false);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        !isCustomWordCount && wordCount === w 
                          ? 'bg-slate-800 text-cyber-blue font-bold shadow-[0_0_8px_rgba(0,242,254,0.2)]' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {w}w
                    </button>
                  ))}

                  {/* Custom Word Count Option */}
                  <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/10">
                    <button
                      onClick={() => {
                        setIsCustomWordCount(true);
                        const numericVal = parseInt(customWordInputVal) || 150;
                        setWordCount(numericVal);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        isCustomWordCount 
                          ? 'bg-slate-800 text-cyber-blue font-bold shadow-[0_0_8px_rgba(0,242,254,0.2)]' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Custom
                    </button>
                    {isCustomWordCount && (
                      <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-white/10">
                        <input
                          type="number"
                          min="5"
                          max="1000"
                          value={customWordInputVal}
                          onChange={(e) => {
                            const valStr = e.target.value;
                            setCustomWordInputVal(valStr);
                            const valNum = parseInt(valStr) || 0;
                            if (valNum >= 5 && valNum <= 1000) {
                              setWordCount(valNum);
                            }
                          }}
                          className="w-12 bg-transparent text-xs text-white focus:outline-none text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="150"
                        />
                        <span className="text-[10px] text-slate-500">w</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Main Typing Canvas */}
      <div className={`relative overflow-hidden flex flex-col transition-all duration-500 ${isZenMode ? 'border-0 bg-transparent shadow-none p-0 w-full' : 'glass-card p-6 rounded-2xl'}`}>
        {!isPlaying ? (
          /* Upgraded Premium Landing Screen */
          <div className={`w-full mx-auto flex flex-col md:flex-row transition-all duration-500 animate-fade-in ${
            isZenMode 
              ? 'h-screen w-screen border-none rounded-none overflow-hidden' 
              : 'max-w-none rounded-3xl overflow-hidden border shadow-[0_20px_50px_rgba(0,0,0,0.45)]'
          }`}
               style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            
            {/* Left Content Area */}
            <div className="p-8 md:p-12 flex-1 flex flex-col justify-between space-y-8">
              
              {/* Top Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="p-1.5 rounded-lg border flex items-center justify-center cursor-pointer hover:bg-selection hover:border-accent hover:text-accent transition-all active:scale-[0.98]"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                      title="Back to Dashboard"
                    >
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  <div className="flex items-center gap-2.5 select-none">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-bg bg-accent shadow-[0_0_12px_var(--accent)]">
                      TM
                    </div>
                    <span className="text-sm font-bold tracking-wider" style={{ color: 'var(--text)' }}>
                      TypeMaster
                    </span>
                  </div>
                </div>
                
               {/* Track Progress button */}
                <button
                  onClick={() => setShowProgressModal(true)}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer hover:bg-surface-2 transition-all active:scale-[0.98]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  <TrendingUp size={12} style={{ color: 'var(--accent)' }} />
                  Track Progress Active
                </button>
              </div>

              {/* Central Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
                  <span className="inline-block w-1.5 h-1.5 rotate-45 bg-accent" />
                  Intermediate Assessment
                </div>
                
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-wide font-sans" style={{ color: 'var(--text)' }}>
                  Sharpen Your <span style={{ color: 'var(--accent)', textShadow: '0 0 10px var(--accent)' }}>Typing Skills</span>
                </h2>
                
                <p className="text-sm leading-relaxed max-w-md" style={{ color: 'var(--text-muted)' }}>
                  Type simple words and short lowercase sentences. Improve your typing rhythm and consistency.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleStart}
                    className="px-8 py-3 bg-accent text-bg hover:opacity-90 transition-all font-bold rounded-xl text-sm flex items-center gap-2.5 shadow-[0_0_20px_var(--accent)] active:scale-[0.98] cursor-pointer"
                  >
                    <Play size={14} fill="currentColor" />
                    Start Typing Test
                  </button>
                </div>
              </div>

              {/* Three Value Props Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                <button 
                  onClick={() => setShowAccuracyModal(true)}
                  className="flex items-center gap-2.5 hover:bg-selection/45 p-2 rounded-xl transition cursor-pointer text-left focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-accent" style={{ backgroundColor: 'var(--selection)' }}>
                    <Target size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: 'var(--text)' }}>Improve Accuracy</h4>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Focus on correct typing</p>
                  </div>
                </button>

                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="flex items-center gap-2.5 hover:bg-selection/45 p-2 rounded-xl transition cursor-pointer text-left focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-accent" style={{ backgroundColor: 'var(--selection)' }}>
                    <Zap size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: 'var(--text)' }}>Boost Speed</h4>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Change time/word rules</p>
                  </div>
                </button>

                <button 
                  onClick={() => setShowProgressModal(true)}
                  className="flex items-center gap-2.5 hover:bg-selection/45 p-2 rounded-xl transition cursor-pointer text-left focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-accent" style={{ backgroundColor: 'var(--selection)' }}>
                    <BarChart2 size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: 'var(--text)' }}>Track Progress</h4>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>See your improvement</p>
                  </div>
                </button>
              </div>

              {/* Bottom HUD bar */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border"
                     style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                  
                  <div 
                    onClick={() => setShowProgressModal(true)}
                    className="flex flex-col justify-between cursor-pointer hover:bg-white/5 p-2 rounded-lg transition"
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>WPM</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black" style={{ color: 'var(--text)' }}>{stats.avgWpm}</span>
                      <span className="text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>avg</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setShowAccuracyModal(true)}
                    className="flex flex-col justify-between cursor-pointer hover:bg-white/5 p-2 rounded-lg transition"
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Accuracy</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black" style={{ color: 'var(--text)' }}>{stats.avgAccuracy}%</span>
                      <span className="text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>avg</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setShowProgressModal(true)}
                    className="flex flex-col justify-between cursor-pointer hover:bg-white/5 p-2 rounded-lg transition"
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Best WPM</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black" style={{ color: 'var(--accent)' }}>{stats.bestWpm || '-'}</span>
                      <span className="text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>peak</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setShowProgressModal(true)}
                    className="flex flex-col justify-between cursor-pointer hover:bg-white/5 p-2 rounded-lg transition"
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Sessions</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black" style={{ color: 'var(--text)' }}>{stats.totalLessons}</span>
                      <span className="text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>done</span>
                    </div>
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="italic">"The expert in anything was once a beginner." — Helen Hayes</span>
                  <span className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Your data is safe and secure
                  </span>
                </div>
              </div>

            </div>

            {/* Right Graphic Banner */}
            <div className="hidden md:block md:w-5/12 relative border-l overflow-hidden animate-fade-in"
                 style={{ borderColor: 'var(--border)' }}>
              <img 
                src="/keyboard_desk_setup.png" 
                alt="Keyboard Desk Setup" 
                className="w-full h-full object-cover absolute inset-0"
              />
              {/* Elegant floating badge on visual */}
              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-md z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-200">Interactive Desk HUD</span>
              </div>
            </div>

          </div>
        ) : (
          /* Active typing engine container */
          <div className={`relative transition-all duration-500 ${isZenMode ? 'space-y-12' : 'space-y-6'}`}>
            {/* Live Metrics */}
            <div className={`flex justify-between items-center transition-all duration-300 ${isZenMode ? 'px-0 py-0 border-0 bg-transparent text-slate-500 text-lg' : 'bg-slate-950/30 px-4 py-2 border border-white/5 rounded-xl'}`}>
              <div className="flex items-center gap-2">
                <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-xs text-slate-400'}>WPM:</span>
                <span className={isZenMode ? 'text-3xl font-black text-cyber-blue text-glow-cyan' : 'text-xs font-bold text-cyber-blue'}>{currentWpm}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-xs text-slate-400'}>Accuracy:</span>
                <span className={isZenMode ? 'text-3xl font-black text-cyber-green' : 'text-xs font-bold text-cyber-green'}>{accuracy}%</span>
              </div>
              <div className="flex items-center gap-2">
                {testMode === 'time' ? (
                  <>
                    <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-xs text-slate-400'}>Time:</span>
                    <span className={isZenMode ? 'text-3xl font-black text-white' : 'text-xs font-bold text-white'}>{timeLeft}s</span>
                  </>
                ) : (
                  <>
                    <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-xs text-slate-400'}>Words:</span>
                    <span className={isZenMode ? 'text-3xl font-black text-white' : 'text-xs font-bold text-white'}>
                      {rawTypedText.trim().split(/\s+/).filter(Boolean).length} / {wordCount}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Display Text Panel */}
            <div className="relative animate-fade-in">
              {isPaused && (
                /* Blur Overlay */
                <div className="absolute inset-0 z-30 glass-panel rounded-2xl flex flex-col items-center justify-center space-y-4">
                  <span className="text-sm font-bold text-white tracking-wider uppercase">Assessment Paused</span>
                  <button
                    onClick={handleResume}
                    className="px-5 py-2 bg-cyber-blue text-slate-950 font-bold text-xs rounded-lg shadow-md hover:bg-cyber-blue/90 active:scale-[0.97]"
                  >
                    Resume Typing
                  </button>
                </div>
              )}

              <div 
                onClick={() => { if (textInputRef.current) textInputRef.current.focus(); }}
                className={`w-full transition-all duration-500 select-none cursor-text overflow-hidden relative whitespace-pre-wrap ${
                  isZenMode 
                    ? 'border-0 bg-transparent p-0 min-h-48 max-h-96 text-2xl md:text-3xl leading-loose font-mono' 
                    : 'border border-white/10 rounded-2xl bg-slate-950/50 p-8 min-h-36 max-h-56 overflow-y-auto text-lg leading-relaxed'
                }`}
              >
                {renderTextHighlights()}

                {!isStarted && (
                  <div className={`absolute flex items-center gap-1.5 text-slate-400 bg-slate-900 border border-white/5 px-2.5 py-1.5 rounded-lg animate-pulse select-none pointer-events-none ${
                    isZenMode ? 'right-0 bottom-0 text-xs' : 'right-3 bottom-3 text-[10px]'
                  }`}>
                    <Sparkles size={12} className="text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                    Type the first letter to begin timer
                  </div>
                )}
              </div>
            </div>

            {/* Ghost input area */}
            <textarea
              ref={textInputRef}
              value={rawTypedText}
              onChange={handleTextChange}
              onKeyDown={(e) => playClickSound(e.key)}
              disabled={isPaused}
              className="absolute w-0 h-0 opacity-0 pointer-events-none"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />

            {/* Control buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {isPaused ? (
                  <button
                    onClick={handleResume}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Play size={12} fill="white" />
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    disabled={!isStarted}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Pause size={12} fill="white" />
                    Pause
                  </button>
                )}
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-cyber-red/20 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RotateCcw size={12} />
                  Restart
                </button>
                <button
                  onClick={() => setIsZenMode(!isZenMode)}
                  className="px-4 py-2 bg-white/5 border border-cyber-blue/30 hover:bg-cyber-blue/10 text-cyber-blue rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer select-none"
                  title="Toggle distraction-free full-screen layout"
                >
                  {isZenMode ? 'Exit Full Screen' : 'Full Screen Mode'}
                </button>
              </div>

              <button
                onClick={() => {
                  if (isPlaying && elapsedTime > 0 && user) {
                    incrementPracticeTime(user.id, elapsedTime);
                  }
                  setIsPlaying(false);
                  setShowResults(false);
                  if (timerRef.current) clearInterval(timerRef.current);
                }}
                className="text-xs text-slate-500 hover:text-slate-300 font-semibold"
              >
                Back to settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showResults && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) { setShowResults(false); setIsZenMode(false); } }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in text-left"
        >
          <div className="glass-card max-w-2xl w-full p-6 rounded-2xl border border-white/10 shadow-2xl relative bg-slate-900/90 text-slate-100 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { setShowResults(false); setIsZenMode(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="py-2 space-y-6">
              <div className="text-center">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyber-green/10 text-cyber-green border border-cyber-green/20 mb-2">
                  Test Complete
                </div>
                <h3 className="text-xl font-bold text-white">Intermediate Assessment Completed</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div className="glass-card bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Speed (WPM)</span>
                  <span className="text-3xl font-extrabold text-cyber-blue text-glow-cyan mt-1 block">
                    {calculateLiveWpm(rawTypedText.trim().length, elapsedTime)}
                  </span>
                </div>
                <div className="glass-card bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Accuracy</span>
                  <span className={`text-3xl font-extrabold mt-1 block ${accuracy >= 95 ? 'text-cyber-green' : 'text-cyber-amber'}`}>
                    {accuracy}%
                  </span>
                </div>
                <div className="glass-card bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Consistency</span>
                  <span className="text-3xl font-extrabold text-purple-400 mt-1 block">
                    {wpmHistory.length > 2 
                      ? `${Math.max(40, Math.min(100, Math.round(90 - (wpmHistory.reduce((s, h) => s + Math.abs(h.wpm - currentWpm), 0) / wpmHistory.length))))}%`
                      : '92%'}
                  </span>
                </div>
                <div className="glass-card bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Practice Time</span>
                  <span className="text-3xl font-extrabold text-white mt-1 block">{elapsedTime}s</span>
                </div>
              </div>

              {/* Sparkline speed history chart */}
              {wpmHistory.length > 0 && (
                <div className="border border-white/5 bg-slate-950/40 p-5 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-cyber-blue" />
                    Speed Fluctuations Over Time
                  </h4>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={wpmHistory}>
                        <XAxis dataKey="time" stroke="#475569" fontSize={9} tickFormatter={(t) => `${t}s`} />
                        <YAxis stroke="#475569" fontSize={9} />
                        <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} />
                        <Line type="monotone" dataKey="wpm" stroke="#00f2fe" strokeWidth={2.5} dot={LINE_DOT_STYLE} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setShowResults(false);
                  setIsZenMode(false);
                  handleStart();
                }}
                className="w-full py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <RotateCcw size={16} />
                Take Another Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showProgressModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowProgressModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in text-left"
        >
          <div className="glass-card max-w-2xl w-full p-6 rounded-2xl border border-white/10 shadow-2xl relative bg-slate-900/90 text-slate-100">
            <button 
              onClick={() => setShowProgressModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-cyber-blue" size={20} />
              Your Typing Speed Progress
            </h3>
            
            {allSessions.length > 0 ? (
              <div className="space-y-6">
                <div className="h-56 w-full bg-slate-950/40 p-4 rounded-xl border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressChartData}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                      <YAxis stroke="#475569" fontSize={9} />
                      <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} />
                      <Line type="monotone" dataKey="wpm" stroke="#00f2fe" strokeWidth={2.5} dot={LINE_DOT_STYLE} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400">Recent Sessions</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {allSessions.slice(0, 5).map((s) => (
                      <div key={s.id} className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-lg border border-white/5 text-xs">
                        <span className="text-white capitalize font-semibold">{s.levelType} Mode</span>
                        <span className="text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                        <span className="text-cyber-blue font-bold">{s.wpm} WPM</span>
                        <span className="text-cyber-green font-semibold">{s.accuracy}% Acc</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                No session history recorded yet. Start practicing to see your progress chart!
              </div>
            )}
          </div>
        </div>
      )}

      {showAccuracyModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowAccuracyModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in text-left"
        >
          <div className="glass-card max-w-xl w-full p-6 rounded-2xl border border-white/10 shadow-2xl relative bg-slate-900/90 text-slate-100">
            <button 
              onClick={() => setShowAccuracyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Target className="text-cyber-green" size={20} />
              Typing Accuracy & Heatmap Analysis
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Here is your accuracy performance status, showing keys that receive the most frequent mistakes.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Accuracy</span>
                  <span className="text-2xl font-black text-cyber-green mt-1 block">{stats.avgAccuracy}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status Rank</span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    {stats.avgAccuracy >= 95 ? 'Sharpshooter' : stats.avgAccuracy >= 90 ? 'Sniper' : 'Skilled'}
                  </span>
                </div>
              </div>

              {/* Heatmap */}
              <div className="space-y-2 select-none border border-white/5 p-4 rounded-xl bg-slate-950/40">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">My Mistake Heatmap</span>
                <div className="space-y-1.5">
                  {[
                    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
                    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'],
                    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']
                  ].map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-center gap-1" style={{ paddingLeft: `${rIdx * 8}px` }}>
                      {row.map((key) => {
                        const storedErrors = typeof window !== 'undefined' ? localStorage.getItem('typemaster_key_errors') : null;
                        const keyErrors = storedErrors ? JSON.parse(storedErrors) : {};
                        const count = keyErrors[key] || 0;
                        let colorClass = 'bg-slate-800/40 border-slate-700/60 text-slate-500';
                        if (count === 1) colorClass = 'bg-amber-500/20 border-amber-500/40 text-amber-300';
                        if (count === 2) colorClass = 'bg-orange-500/30 border-orange-500/50 text-orange-200';
                        if (count > 2) colorClass = 'bg-cyber-red/30 border-cyber-red/50 text-rose-200 animate-pulse';

                        return (
                          <div 
                            key={key} 
                            title={`${key}: ${count} mistakes`}
                            className={`w-7 h-7 rounded border flex items-center justify-center text-[10px] font-bold ${colorClass}`}
                          >
                            {key}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettingsModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in text-left"
        >
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-white/10 shadow-2xl relative bg-slate-900/90 text-slate-100">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="text-cyber-purple" size={20} />
              Typing Test Customizer
            </h3>

            <div className="space-y-4">
              {/* Test Mode */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold block">Test Mode</label>
                <div className="flex bg-slate-950 border border-white/5 p-1 rounded-lg">
                  <button
                    onClick={() => setTestMode('lessons')}
                    className={`flex-1 py-2 rounded-md text-xs font-semibold transition cursor-pointer ${
                      testMode === 'lessons' ? 'bg-cyber-purple text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Lessons
                  </button>
                  <button
                    onClick={() => setTestMode('time')}
                    className={`flex-1 py-2 rounded-md text-xs font-semibold transition cursor-pointer ${
                      testMode === 'time' ? 'bg-cyber-purple text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Time Mode
                  </button>
                  <button
                    onClick={() => setTestMode('words')}
                    className={`flex-1 py-2 rounded-md text-xs font-semibold transition cursor-pointer ${
                      testMode === 'words' ? 'bg-cyber-purple text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Words Mode
                  </button>
                </div>
              </div>

              {/* Mode Options */}
              {testMode === 'lessons' ? (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold block">Select Lesson</label>
                  <select
                    value={selectedLessonIdx}
                    onChange={(e) => setSelectedLessonIdx(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2 text-slate-300 focus:outline-none focus:border-cyber-purple"
                  >
                    {INTERMEDIATE_LESSONS.map((l, idx) => (
                      <option key={idx} value={idx}>Lesson {idx + 1}: {l.slice(0, 40)}...</option>
                    ))}
                  </select>
                </div>
              ) : testMode === 'time' ? (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold block">Select Duration</label>
                  <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1 rounded-lg">
                    {[30, 60, 120, 180].map((t) => (
                      <button
                        key={t}
                        onClick={() => { 
                          setDuration(t); 
                          setTimeLeft(t); 
                          setIsCustomDuration(false);
                        }}
                        className={`py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                          !isCustomDuration && duration === t 
                            ? 'bg-slate-800 text-cyber-blue font-bold shadow-md' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {t}s
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom option */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">Custom Duration</span>
                    <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded border border-white/10">
                      <input
                        type="number"
                        min="10"
                        max="3600"
                        value={customInputVal}
                        onChange={(e) => {
                          const valStr = e.target.value;
                          setCustomInputVal(valStr);
                          const valNum = parseInt(valStr) || 0;
                          if (valNum >= 10 && valNum <= 3600) {
                            setDuration(valNum);
                            setTimeLeft(valNum);
                            setIsCustomDuration(true);
                          }
                        }}
                        className="w-12 bg-transparent text-xs text-white focus:outline-none text-center font-bold"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">sec</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold block">Select Word Count</label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-lg">
                    {[25, 50, 100].map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          setWordCount(w);
                          setIsCustomWordCount(false);
                        }}
                        className={`py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                          !isCustomWordCount && wordCount === w 
                            ? 'bg-slate-800 text-cyber-blue font-bold shadow-md' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {w}w
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom option */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">Custom Word Count</span>
                    <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded border border-white/10">
                      <input
                        type="number"
                        min="5"
                        max="1000"
                        value={customWordInputVal}
                        onChange={(e) => {
                          const valStr = e.target.value;
                          setCustomWordInputVal(valStr);
                          const valNum = parseInt(valStr) || 0;
                          if (valNum >= 5 && valNum <= 1000) {
                            setWordCount(valNum);
                            setIsCustomWordCount(true);
                          }
                        }}
                        className="w-12 bg-transparent text-xs text-white focus:outline-none text-center font-bold"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">words</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full mt-4 py-2.5 bg-cyber-purple hover:bg-cyber-purple/90 text-white font-bold rounded-lg text-xs transition shadow-md cursor-pointer"
              >
                Apply Custom Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
