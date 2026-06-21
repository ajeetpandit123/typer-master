'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { saveSession, incrementPracticeTime } from '@/lib/services/db';
import { CODING_LESSONS, CodingLesson } from '@/lib/services/mockData';
import { 
  Code, Play, RotateCcw, Target, Hourglass, ArrowRight, CheckCircle, 
  Terminal, ShieldCheck, Award, Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const CodingPractice: React.FC = () => {
  const { user, addToast, refreshProfile } = useApp();

  // Settings
  const [selectedLang, setSelectedLang] = useState<'javascript' | 'java' | 'cpp'>('javascript');
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);

  // Gameplay
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [rawTypedText, setRawTypedText] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Symbol analytics
  const [totalSymbols, setTotalSymbols] = useState(0);
  const [symbolErrors, setSymbolErrors] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Refs for tracking practice time on unmount/exits
  const elapsedTimeRef = useRef(0);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Filter lessons
  const filteredLessons = CODING_LESSONS.filter(l => l.language === selectedLang);
  const lesson = filteredLessons[selectedLessonIdx] || filteredLessons[0] || CODING_LESSONS[0];
  const targetCode = lesson.code;

  useEffect(() => {
    setSelectedLessonIdx(0);
    setRawTypedText('');
    setIsPlaying(false);
    setShowResults(false);
  }, [selectedLang]);

  // Clean timer on unmount and save practice time
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (isPlayingRef.current && elapsedTimeRef.current > 0 && user) {
        incrementPracticeTime(user.id, elapsedTimeRef.current);
      }
    };
  }, [user]);

  const handleStart = () => {
    if (isPlaying && elapsedTime > 0 && user) {
      incrementPracticeTime(user.id, elapsedTime);
    }

    setRawTypedText('');
    setElapsedTime(0);
    setTotalSymbols(0);
    setSymbolErrors(0);
    setIsPlaying(true);
    setIsStarted(false);
    setShowResults(false);

    setTimeout(() => {
      if (textInputRef.current) textInputRef.current.focus();
    }, 50);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isPlaying) return;

    const val = e.target.value;
    
    // Start timer on first keystroke
    if (!isStarted && val.length === 1) {
      setIsStarted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    const expected = targetCode[val.length - 1];
    const typed = val[val.length - 1];

    // Symbol check
    const isSymbol = expected && /[{}[\]()<>#;,.=+\-*/&|!%^:]/.test(expected);
    if (isSymbol && val.length > rawTypedText.length) {
      setTotalSymbols(prev => prev + 1);
      if (typed !== expected) {
        setSymbolErrors(prev => prev + 1);
      }
    }

    // Auto-indent assist: if expected is a newline followed by spaces, and user hits enter, auto-fill spaces
    if (typed === '\n' && val.length > rawTypedText.length) {
      let rest = targetCode.slice(val.length);
      const leadingSpaces = rest.match(/^[ ]+/);
      if (leadingSpaces) {
        setRawTypedText(val + leadingSpaces[0]);
        
        // Check if auto indent finished the module
        if (val.length + leadingSpaces[0].length >= targetCode.length) {
          handleFinished(elapsedTime + 1, val + leadingSpaces[0]);
        }
        return;
      }
    }

    setRawTypedText(val);

    if (val.length >= targetCode.length) {
      handleFinished(elapsedTime + 1, val);
    }
  };

  const handleFinished = async (finalSeconds: number, finalTyped: string) => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setShowResults(true);

    const cleanTyped = finalTyped;
    const cleanTarget = targetCode.slice(0, cleanTyped.length);

    let errors = 0;
    for (let i = 0; i < cleanTyped.length; i++) {
      if (cleanTyped[i] !== cleanTarget[i]) {
        errors++;
      }
    }

    const accuracy = cleanTyped.length > 0
      ? Math.max(0, Math.round(((cleanTyped.length - errors) / cleanTyped.length) * 100))
      : 0;

    const finalWpm = Math.round((cleanTyped.length / 5) / ((finalSeconds || 1) / 60));

    // Save language-specific progress inside local storage
    if (typeof window !== 'undefined') {
      const storedProgress = localStorage.getItem('typemaster_coding_progress');
      const progressMap: Record<string, number> = storedProgress ? JSON.parse(storedProgress) : {};
      progressMap[selectedLang] = Math.max(progressMap[selectedLang] || 0, selectedLessonIdx + 1);
      localStorage.setItem('typemaster_coding_progress', JSON.stringify(progressMap));
    }

    if (user && finalWpm > 0) {
      try {
        await saveSession(user.id, {
          wpm: finalWpm,
          accuracy,
          levelType: 'coding',
          duration: finalSeconds,
          errors,
          charsTyped: cleanTyped.length
        });
        
        addToast('Coding lesson Completed!', `Saved session: ${finalWpm} WPM`, 'success');
        refreshProfile();
      } catch (err) {
        console.error('Failed to save coding session:', err);
      }
    }
  };

  // Language wise progress bar stats helper
  const getLanguageProgress = (lang: string) => {
    if (typeof window === 'undefined') return { count: 0, total: 0, percent: 0 };
    const stored = localStorage.getItem('typemaster_coding_progress');
    const map = stored ? JSON.parse(stored) : {};
    const count = map[lang] || 0;
    const total = CODING_LESSONS.filter(l => l.language === lang).length;
    return { count, total, percent: Math.round((count / (total || 1)) * 100) };
  };

  const getLanguageChartData = () => {
    return [
      { name: 'JavaScript', value: getLanguageProgress('javascript').percent, color: '#f59e0b' },
      { name: 'Java', value: getLanguageProgress('java').percent, color: '#f43f5e' },
      { name: 'C++', value: getLanguageProgress('cpp').percent, color: '#00f2fe' }
    ];
  };

  const symbolAccuracy = totalSymbols > 0
    ? Math.max(0, Math.round(((totalSymbols - symbolErrors) / totalSymbols) * 100))
    : 100;

  // Render highlights code editor style
  const renderCodeEditorText = () => {
    const lines = targetCode.split('\n');
    let cumulativeIndex = 0;

    return lines.map((line, lineIdx) => {
      const elements = line.split('').map((char, charIdx) => {
        const absoluteIndex = cumulativeIndex + charIdx;
        const typedChar = rawTypedText[absoluteIndex];

        let charClass = 'text-slate-600';
        if (typedChar !== undefined) {
          charClass = typedChar === char ? 'text-white' : 'bg-cyber-red/35 text-cyber-red border-b border-cyber-red';
        }

        const isActive = absoluteIndex === rawTypedText.length;
        const activeClass = isActive 
          ? 'text-cyber-blue font-extrabold border-l-2 border-cyber-blue animate-caret bg-cyber-blue/15 px-0.5 rounded shadow-[0_0_8px_rgba(0,242,254,0.3)]' 
          : '';

        // Standard light color formatting helper (basic token coloring for wow-effect)
        let customSyntaxStyle = '';
        if (charClass === 'text-slate-600') {
          // Color keywords if not typed yet
          if (line.substring(0, charIdx + 1).endsWith('const') || line.substring(0, charIdx + 1).endsWith('let') || line.substring(0, charIdx + 1).endsWith('function') || line.substring(0, charIdx + 1).endsWith('class') || line.substring(0, charIdx + 1).endsWith('public') || line.substring(0, charIdx + 1).endsWith('void')) {
            customSyntaxStyle = 'text-purple-400 font-medium';
          } else if (/[0-9]/.test(char)) {
            customSyntaxStyle = 'text-amber-400';
          } else if (/[{}()[\]]/.test(char)) {
            customSyntaxStyle = 'text-yellow-300';
          } else if (/["']/.test(char)) {
            customSyntaxStyle = 'text-green-400';
          }
        }

        return (
          <span key={charIdx} className={`${charClass} ${activeClass} ${customSyntaxStyle} font-mono tracking-wide`}>
            {char}
          </span>
        );
      });

      // Increment including newline character
      cumulativeIndex += line.length + 1;

      return (
        <div key={lineIdx} className="code-editor-line font-mono text-sm leading-relaxed whitespace-pre py-0.5 select-none">
          {elements}
        </div>
      );
    });
  };

  const accuracy = rawTypedText.length > 0
    ? Math.max(0, Math.round((targetCode.split('').filter((c, i) => rawTypedText[i] === c).length / rawTypedText.length) * 100))
    : 100;

  const currentWpm = Math.round((rawTypedText.length / 5) / ((elapsedTime || 1) / 60));

  const jsProg = getLanguageProgress('javascript');
  const javaProg = getLanguageProgress('java');
  const cppProg = getLanguageProgress('cpp');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* 1. Header Navigation */}
      <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Code size={20} />
          </div>
          <div>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Coding Typing Mode</span>
            <h2 className="text-lg font-bold text-white leading-tight">Developer Syntax Familiarity</h2>
          </div>
        </div>

        {/* Configurations */}
        {!isPlaying && !showResults && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as any)}
              className="bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2 text-slate-300 focus:outline-none focus:border-cyber-blue"
            >
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            <select
              value={selectedLessonIdx}
              onChange={(e) => {
                setSelectedLessonIdx(Number(e.target.value));
                setRawTypedText('');
              }}
              className="bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2 text-slate-300 focus:outline-none"
            >
              {filteredLessons.map((l, idx) => (
                <option key={l.id} value={idx}>Module {idx + 1}: {l.title} ({l.difficulty})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Main Typing Area */}
      <div className="glass-card p-6 rounded-2xl flex flex-col relative overflow-hidden">
        {showResults ? (
          /* Results Dashboard */
          <div className="py-6 space-y-6">
            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 mb-2">
                Coding Exercise Complete
              </span>
              <h3 className="text-xl font-bold text-white">{lesson.title} ({lesson.language.toUpperCase()})</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full bg-slate-950/40 p-4 border border-white/5 rounded-xl">
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Coding Speed</span>
                <span className="text-3xl font-extrabold text-cyber-blue text-glow-cyan mt-1 block">{currentWpm} WPM</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Accuracy</span>
                <span className="text-3xl font-extrabold text-cyber-green mt-1 block">{accuracy}%</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Symbol Accuracy</span>
                <span className="text-3xl font-extrabold text-purple-400 mt-1 block">{symbolAccuracy}%</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Duration</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">{elapsedTime}s</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStart}
                className="flex-1 py-3 border border-white/10 hover:border-white/20 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} />
                Retry Module
              </button>
              {selectedLessonIdx + 1 < filteredLessons.length ? (
                <button
                  onClick={() => {
                    setSelectedLessonIdx(prev => prev + 1);
                    setShowResults(false);
                    setIsPlaying(false);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  Next Module
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={() => setShowResults(false)}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition"
                >
                  Back to Selection
                </button>
              )}
            </div>
          </div>
        ) : !isPlaying ? (
          /* Start Screen */
          <div className="py-12 flex flex-col items-center text-center max-w-lg mx-auto space-y-6">
            <Terminal className="w-12 h-12 text-blue-400 text-glow-blue" />
            <div>
              <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{lesson.description}</p>
            </div>

            <div className="text-xs border border-white/5 bg-slate-950/50 p-4 rounded-xl text-left w-full space-y-3">
              <div className="flex justify-between font-semibold border-b border-white/5 pb-2">
                <span className="text-slate-300">Language: {lesson.language.toUpperCase()}</span>
                <span className="text-slate-300">Difficulty: {lesson.difficulty}</span>
              </div>
              <p className="text-slate-400">
                You will type actual programming blocks. Double spaces, tabs, and parentheses must match exactly. Carriage returns will trigger auto-indent guides.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-lg hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-[0.98]"
            >
              <Play size={16} fill="white" />
              Start Coding Lesson
            </button>
          </div>
        ) : (
          /* Active IDE Editor Workspace */
          <div className="space-y-4">
            {/* Live Metrics HUD */}
            <div className="flex justify-between items-center bg-slate-950/30 px-4 py-2 border border-white/5 rounded-xl text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping" />
                <span className="text-slate-400 font-bold uppercase tracking-wider">{selectedLang.toUpperCase()} Mode</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-500 mr-1">WPM:</span>
                  <span className="font-bold text-cyber-blue">{currentWpm}</span>
                </div>
                <div>
                  <span className="text-slate-500 mr-1">Accuracy:</span>
                  <span className="font-bold text-cyber-green">{accuracy}%</span>
                </div>
                <div>
                  <span className="text-slate-500 mr-1">Symbol Acc:</span>
                  <span className="font-bold text-purple-400">{symbolAccuracy}%</span>
                </div>
                <div>
                  <span className="text-slate-500 mr-1">Timer:</span>
                  <span className="font-bold text-white">{elapsedTime}s</span>
                </div>
              </div>
            </div>

            {/* Simulated VS Code Editor Pane */}
            <div 
              onClick={() => { if (textInputRef.current) textInputRef.current.focus(); }}
              className="w-full border border-slate-800 rounded-xl bg-[#090d16] p-5 shadow-2xl relative select-none cursor-text overflow-x-auto min-h-48"
            >
              {/* Tab Header bar */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-[#06090e] border-b border-slate-800/80 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  <span className="text-[10px] text-slate-500 font-mono ml-4 truncate max-w-xs select-none">
                    src/lessons/{lesson.id}.{selectedLang === 'javascript' ? 'js' : selectedLang === 'java' ? 'java' : 'cpp'}
                  </span>
                </div>
                {!isStarted && (
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 bg-[#0c1424] border border-white/5 px-2 py-0.5 rounded animate-pulse select-none">
                    <Sparkles size={10} className="text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                    Type the first letter to start coding timer
                  </div>
                )}
              </div>

              {/* Code lines container */}
              <div className="mt-6 pt-2 font-mono">
                {renderCodeEditorText()}
              </div>
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
            <div className="flex justify-between items-center text-xs">
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw size={12} />
                Reset Code
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
                className="text-slate-500 hover:text-slate-300 font-semibold"
              >
                Exit editor
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Visual Analytics Section */}
      {!isPlaying && !showResults && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Language statistics graphs */}
          <div className="glass-card p-5 rounded-2xl md:col-span-2">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
              <Terminal size={16} className="text-cyber-blue" />
              Language Progress Tracker
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getLanguageChartData()}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                  <YAxis stroke="#475569" domain={[0, 100]} fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1322', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                    {getLanguageChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Module lists summaries */}
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mb-2">
              <Award size={16} className="text-cyber-amber" />
              Language Stats
            </h3>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">JavaScript:</span>
                <span className="text-white font-bold">{jsProg.count} / {jsProg.total} ({jsProg.percent}%)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Java:</span>
                <span className="text-white font-bold">{javaProg.count} / {javaProg.total} ({javaProg.percent}%)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">C++:</span>
                <span className="text-white font-bold">{cppProg.count} / {cppProg.total} ({cppProg.percent}%)</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-500">
              Complete coding lessons to increase language scores and level accomplishments.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
