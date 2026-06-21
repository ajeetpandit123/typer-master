'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { saveSession, unlockAchievement, incrementPracticeTime } from '@/lib/services/db';
import { 
  Zap, Play, Pause, RotateCcw, Target, AlertTriangle, ArrowRight,
  TrendingUp, Award, BarChart2, Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

export const IntermediatePractice: React.FC = () => {
  const { user, addToast, refreshProfile } = useApp();

  // Test setup
  const [testMode, setTestMode] = useState<'time' | 'words'>('time');
  const [duration, setDuration] = useState<number>(30); // 30, 60, 120, 180
  const [wordCount, setWordCount] = useState<number>(25); // 25, 50, 100

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
  const generateText = () => {
    let words: string[] = [];
    const targetLength = testMode === 'words' ? wordCount : 100; // Generate enough words
    for (let i = 0; i < targetLength; i++) {
      const idx = Math.floor(Math.random() * INTERMEDIATE_WORDS.length);
      words.push(INTERMEDIATE_WORDS[idx]);
    }
    setTargetText(words.join(' '));
  };

  useEffect(() => {
    generateText();
  }, [testMode, duration, wordCount]);
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
    // If they were already playing, save elapsed practice time first
    if (isPlaying && elapsedTime > 0 && user) {
      incrementPracticeTime(user.id, elapsedTime);
    }

    generateText();
    setRawTypedText('');
    setInputIndex(0);
    setWpmHistory([]);
    setElapsedTime(0);
    setTimeLeft(testMode === 'time' ? duration : 0);
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
        ? 'text-cyber-blue font-extrabold border-l-2 border-cyber-blue animate-caret bg-cyber-blue/15 px-0.5 rounded shadow-[0_0_8px_rgba(0,242,254,0.3)]' 
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
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* 1. Configuration & Controls Bar */}
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

            {testMode === 'time' ? (
              <div className="flex bg-slate-900 border border-white/5 p-1 rounded-lg">
                {[30, 60, 120, 180].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setDuration(t); setTimeLeft(t); }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      duration === t ? 'bg-slate-800 text-cyber-blue font-bold' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex bg-slate-900 border border-white/5 p-1 rounded-lg">
                {[25, 50, 100].map((w) => (
                  <button
                    key={w}
                    onClick={() => setWordCount(w)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      wordCount === w ? 'bg-slate-800 text-cyber-blue font-bold' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {w}w
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Main Typing Canvas */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col">
        {showResults ? (
          /* Results Panel */
          <div className="py-6 space-y-8">
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
                      <Tooltip contentStyle={{ backgroundColor: '#0f1322', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="wpm" stroke="#00f2fe" strokeWidth={2.5} dot={{ fill: '#00f2fe' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <button
              onClick={handleStart}
              className="w-full py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-md"
            >
              <RotateCcw size={16} />
              Take Another Test
            </button>
          </div>
        ) : !isPlaying ? (
          /* Landing Screen */
          <div className="py-12 flex flex-col items-center text-center max-w-lg mx-auto space-y-6">
            <Zap className="w-12 h-12 text-purple-400 text-glow-purple" />
            <div>
              <h3 className="text-xl font-bold text-white">Intermediate Typing assessment</h3>
              <p className="text-sm text-slate-400 mt-1">
                Type simple words and short lowercase sentences. Improve typing rhythm and consistency.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-lg hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-[0.98]"
            >
              <Play size={16} fill="white" />
              Start Typing Test
            </button>
          </div>
        ) : (
          /* Active typing engine container */
          <div className="space-y-6 relative">
            {/* Live Metrics */}
            <div className="flex justify-between items-center bg-slate-950/30 px-4 py-2 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Live WPM:</span>
                <span className="text-xs font-bold text-cyber-blue">{currentWpm}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Accuracy:</span>
                <span className="text-xs font-bold text-cyber-green">{accuracy}%</span>
              </div>
              <div className="flex items-center gap-2">
                {testMode === 'time' ? (
                  <>
                    <span className="text-xs text-slate-400">Time Remaining:</span>
                    <span className="text-xs font-bold text-white">{timeLeft}s</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-400">Words Typed:</span>
                    <span className="text-xs font-bold text-white">
                      {rawTypedText.trim().split(/\s+/).filter(Boolean).length} / {wordCount}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Display Text Panel */}
            <div className="relative">
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
                className="w-full border border-white/10 rounded-2xl bg-slate-950/50 p-8 min-h-36 text-lg leading-relaxed select-none cursor-text overflow-hidden max-h-56 overflow-y-auto relative whitespace-pre-wrap"
              >
                {renderTextHighlights()}

                {!isStarted && (
                  <div className="absolute right-3 bottom-3 flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900 border border-white/5 px-2.5 py-1.5 rounded-lg animate-pulse select-none pointer-events-none">
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
    </div>
  );
};
