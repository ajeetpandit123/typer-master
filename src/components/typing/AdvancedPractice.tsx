'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { saveSession, incrementPracticeTime } from '@/lib/services/db';
import { 
  ShieldAlert, Play, RotateCcw, Target, AlertTriangle, ArrowRight,
  TrendingUp, BarChart3, AlertCircle, Clock, Zap, Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ADVANCED_TEXTS = [
  "The formula is: Total = (Subtotal * 1.085) + Shipping; where Shipping = $14.95.",
  "ERROR 404: The request at 'https://typemaster.pro/api/v1/battle?room=9928' returned a NullPointerException.",
  "Check validation rules: Password must contain >= 1 uppercase letter, 1 digit, and 1 symbol (like #, $, or %).",
  "Is JavaScript fast? Let's test: const speedTest = () => { return Math.max(88, 92, 104); };",
  "The 1990s saw the birth of the World Wide Web (WWW). By 2026, internet speeds exceeded 10 Gbps!",
  "Are you ready? Press 'Shift + Alt + T' to launch the multiplayer battle terminal; code room #48A.",
  "In software design, standard regex patterns like /^[A-Z_]+[0-9]*$/i are used to test global environments.",
  "Philosophers ask: \"Is truth relative, or absolute?\" Scientific analysis suggests 99.9% of facts are verifiable.",
  "Calculate coordinates: x = (r * cos(theta)) - 12.5; y = (r * sin(theta)) + 45.3; z = -1.0;",
  "Advanced typing requires speed (>=80 WPM), precision (>=98% Acc), and absolute consistency!"
];

interface KeyStat {
  char: string;
  latencySum: number;
  count: number;
  errors: number;
}

export const AdvancedPractice: React.FC = () => {
  const { user, addToast, refreshProfile } = useApp();

  const [currentTextIdx, setCurrentTextIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [rawTypedText, setRawTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Character-specific metrics
  const [charSpeeds, setCharSpeeds] = useState<Record<string, KeyStat>>({});
  
  // Timing refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastKeyTimeRef = useRef<number>(0);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

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

  const targetText = ADVANCED_TEXTS[currentTextIdx];

  // Clean timer on unmount and save practice time
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (isPlayingRef.current && elapsedTimeRef.current > 0 && user) {
        incrementPracticeTime(user.id, elapsedTimeRef.current);
      }
    };
  }, [user]);

  // Initialize
  const handleStart = () => {
    if (isPlaying && elapsedTime > 0 && user) {
      incrementPracticeTime(user.id, elapsedTime);
    }

    setRawTypedText('');
    setElapsedTime(0);
    setTimeLeft(60);
    setCharSpeeds({});
    setIsPlaying(true);
    setIsStarted(false);
    setShowResults(false);
    lastKeyTimeRef.current = Date.now();

    setTimeout(() => {
      if (textInputRef.current) textInputRef.current.focus();
    }, 50);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleFinished = async (finalSeconds: number) => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setShowResults(true);

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

    const finalWpm = Math.round((cleanTyped.length / 5) / ((finalSeconds || 1) / 60));

    if (user && finalWpm > 0) {
      try {
        await saveSession(user.id, {
          wpm: finalWpm,
          accuracy,
          levelType: 'advanced',
          duration: finalSeconds,
          errors: totalErrors,
          charsTyped: cleanTyped.length
        });

        addToast('Advanced Test Completed!', `${finalWpm} WPM | ${accuracy}% Acc`, 'success');
        refreshProfile();
      } catch (err) {
        console.error('Failed to save advanced session:', err);
      }
    }
  };

  // Effect to handle timer running out (60 seconds)
  useEffect(() => {
    if (isPlaying && isStarted && elapsedTime >= 60) {
      handleFinished(60);
    }
  }, [elapsedTime, isPlaying, isStarted]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isPlaying) return;

    const val = e.target.value;
    
    // Start timer on first keystroke
    if (!isStarted && val.length === 1) {
      setIsStarted(true);
      lastKeyTimeRef.current = Date.now();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    const now = Date.now();
    const latency = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;

    setRawTypedText(val);

    // Compute key latency for character stats (exclude spaces & backspaces)
    if (val.length > rawTypedText.length) {
      const typedChar = val[val.length - 1];
      const expectedChar = targetText[val.length - 1];
      const isCorrect = typedChar === expectedChar;
      const keyName = expectedChar ? expectedChar.toUpperCase() : '';

      if (keyName && keyName !== ' ' && keyName.length === 1) {
        // Record key details
        setCharSpeeds(prev => {
          const current = prev[keyName] || { char: keyName, latencySum: 0, count: 0, errors: 0 };
          
          // Save error counts to global heatmap if wrong
          if (!isCorrect && typeof window !== 'undefined') {
            const storedErrors = localStorage.getItem('typemaster_key_errors');
            const errors: Record<string, number> = storedErrors ? JSON.parse(storedErrors) : {};
            errors[keyName] = (errors[keyName] || 0) + 1;
            localStorage.setItem('typemaster_key_errors', JSON.stringify(errors));
          }

          return {
            ...prev,
            [keyName]: {
              char: keyName,
              latencySum: current.latencySum + (isCorrect ? latency : 0),
              count: current.count + (isCorrect ? 1 : 0),
              errors: current.errors + (isCorrect ? 0 : 1)
            }
          };
        });
      }
    }

    if (val.length >= targetText.length) {
      handleFinished(elapsedTime + 1);
    }
  };

  // Format Recharts character speeds
  const getSpeedChartData = () => {
    return Object.values(charSpeeds)
      .filter(stat => stat.count > 0)
      .map(stat => ({
        key: stat.char,
        speed: Math.round(1000 / (stat.latencySum / stat.count)), // character taps per second
        errors: stat.errors
      }))
      .slice(0, 10); // top 10 characters
  };

  const renderTextHighlights = () => {
    return targetText.split('').map((char, index) => {
      const typedChar = rawTypedText[index];
      
      let charClass = 'text-slate-500';
      if (typedChar !== undefined) {
        charClass = typedChar === char ? 'text-white' : 'bg-cyber-red/30 text-cyber-red border-b border-cyber-red';
      }
      
      const isActive = index === rawTypedText.length;
      const activeClass = isActive 
        ? 'text-cyber-blue font-extrabold border-l-2 border-cyber-blue animate-caret bg-cyber-blue/15 px-0.5 rounded shadow-[0_0_8px_rgba(0,242,254,0.3)]' 
        : '';

      return (
        <span key={index} className={`${charClass} ${activeClass} transition-all duration-700 font-mono tracking-wide`}>
          {char}
        </span>
      );
    });
  };

  const accuracy = rawTypedText.length > 0
    ? Math.max(0, Math.round((targetText.split('').filter((c, i) => rawTypedText[i] === c).length / rawTypedText.length) * 100))
    : 100;

  const currentWpm = Math.round((rawTypedText.length / 5) / ((elapsedTime || 1) / 60));

  const chartData = getSpeedChartData();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* 1. Header Header */}
      <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Level 3 - Advanced Learning Path</span>
            <h2 className="text-lg font-bold text-white leading-tight">Complex Sentences & Symbols</h2>
          </div>
        </div>

        {/* Text Selection */}
        {!isPlaying && !showResults && (
          <select 
            value={currentTextIdx} 
            onChange={(e) => {
              setCurrentTextIdx(Number(e.target.value));
              setRawTypedText('');
            }}
            className="bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2 text-slate-300 focus:outline-none focus:border-cyber-blue"
          >
            {ADVANCED_TEXTS.map((t, idx) => (
              <option key={idx} value={idx}>Module {idx + 1}: {t.slice(0, 25)}...</option>
            ))}
          </select>
        )}
      </div>

      {/* 2. Typing Sandbox */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col">
        {showResults ? (
          /* Advanced results board */
          <div className="py-6 space-y-8">
            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyber-pink/15 text-cyber-pink border border-cyber-pink/30 mb-2">
                Advanced Metrics Analysis
              </span>
              <h3 className="text-xl font-bold text-white">Advanced Typing Summary</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div className="glass-card bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Speed (WPM)</span>
                <span className="text-3xl font-extrabold text-cyber-blue text-glow-cyan mt-1 block">
                  {currentWpm}
                </span>
              </div>
              <div className="glass-card bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Accuracy</span>
                <span className="text-3xl font-extrabold text-cyber-green mt-1 block">
                  {accuracy}%
                </span>
              </div>
              <div className="glass-card bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Errors Made</span>
                <span className="text-3xl font-extrabold text-cyber-red mt-1 block">
                  {targetText.length - targetText.split('').filter((c, i) => rawTypedText[i] === c).length}
                </span>
              </div>
              <div className="glass-card bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Time Elapsed</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">{elapsedTime}s</span>
              </div>
            </div>

            {/* Key Latency and error graphs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Latency Graph */}
              <div className="border border-white/5 bg-slate-950/40 p-5 rounded-xl">
                <h4 className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-cyber-blue" />
                  Key Latency Analysis (Keys / Second)
                </h4>
                <div className="h-44 w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="key" stroke="#475569" fontSize={9} />
                        <YAxis stroke="#475569" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f1322', border: '1px solid rgba(255,255,255,0.08)' }} />
                        <Bar dataKey="speed" fill="#00f2fe" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                      No character latency details available.
                    </div>
                  )}
                </div>
              </div>

              {/* Character Errors List */}
              <div className="border border-white/5 bg-slate-950/40 p-5 rounded-xl">
                <h4 className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-cyber-pink" />
                  Mistake Details (Key Typos)
                </h4>
                <div className="space-y-2 overflow-y-auto max-h-44 pr-1">
                  {Object.values(charSpeeds).filter(s => s.errors > 0).length > 0 ? (
                    Object.values(charSpeeds)
                      .filter(s => s.errors > 0)
                      .sort((a, b) => b.errors - a.errors)
                      .map((stat, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg text-xs border border-white/5">
                          <span className="font-bold text-white">Character &apos;{stat.char}&apos;</span>
                          <span className="text-cyber-red font-semibold">{stat.errors} typos</span>
                        </div>
                      ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-xs py-8">
                      Flawless! Zero errors recorded during this run.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-md"
            >
              <RotateCcw size={16} />
              Restart Assessment
            </button>
          </div>
        ) : !isPlaying ? (
          /* Start Screen */
          <div className="py-12 flex flex-col items-center text-center max-w-lg mx-auto space-y-6">
            <ShieldAlert className="w-12 h-12 text-rose-400 text-glow-rose" />
            <div>
              <h3 className="text-xl font-bold text-white">Advanced Typing assessment</h3>
              <p className="text-sm text-slate-400 mt-1">
                Practices quotes containing uppercase modifiers, numbers, symbols, and double combinations.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-lg hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-[0.98]"
            >
              <Play size={16} fill="white" />
              Begin Assessment
            </button>
          </div>
        ) : (
          /* Active typing engine container */
          <div className="space-y-6 relative">
            {/* Live Metrics */}
            <div className="flex justify-between items-center bg-slate-950/30 px-4 py-2 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">WPM:</span>
                <span className="text-xs font-bold text-cyber-blue">{currentWpm}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Accuracy:</span>
                <span className="text-xs font-bold text-cyber-green">{accuracy}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Time Remaining:</span>
                <span className="text-xs font-bold text-white">{60 - elapsedTime}s</span>
              </div>
            </div>

            {/* Display Text Panel */}
            <div 
              onClick={() => { if (textInputRef.current) textInputRef.current.focus(); }}
              className="w-full border border-white/10 rounded-2xl bg-slate-950/50 p-8 min-h-36 text-lg leading-relaxed select-none cursor-text overflow-hidden relative"
            >
              {renderTextHighlights()}

              {!isStarted && (
                <div className="absolute right-3 bottom-3 flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900 border border-white/5 px-2.5 py-1.5 rounded-lg animate-pulse select-none pointer-events-none">
                  <Sparkles size={12} className="text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                  Type the first letter to begin timer
                </div>
              )}
            </div>

            {/* Ghost input area */}
            <textarea
              ref={textInputRef}
              value={rawTypedText}
              onChange={handleTextChange}
              className="absolute w-0 h-0 opacity-0 pointer-events-none"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />

            {/* Controls */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw size={12} />
                Restart
              </button>

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
