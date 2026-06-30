'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { getChallengeProgress, saveChallengeCompletion, saveSession, incrementPracticeTime } from '@/lib/services/db';
import { CHALLENGES, Challenge } from '@/lib/services/mockData';
import { 
  Trophy, Lock, Play, RotateCcw, CheckCircle, XCircle, ArrowRight,
  Target, Zap, Clock, ShieldAlert, Award, Sparkles, ArrowLeft
} from 'lucide-react';

export const ChallengePractice: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user, addToast, refreshProfile, isZenMode, setIsZenMode, playClickSound } = useApp();

  const [progress, setProgress] = useState<Record<number, any>>({});
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  
  // Gameplay states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [rawTypedText, setRawTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [passed, setPassed] = useState(false);
  const [failReason, setFailReason] = useState('');

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

  useEffect(() => {
    const activeEl = activeCharRef.current;
    const container = containerRef.current;
    if (activeEl && container) {
      const activeRect = activeEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const activeTop = activeRect.top - containerRect.top + container.scrollTop;
      
      if (activeTop !== lastActiveTopRef.current) {
        lastActiveTopRef.current = activeTop;
        const containerHeight = container.clientHeight;
        const activeHeight = activeRect.height;
        const targetScrollTop = activeTop - (containerHeight / 2) + (activeHeight / 2);
        
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: rawTypedText.length <= 1 ? 'auto' : 'smooth'
        });
      }
    }
  }, [rawTypedText]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const lastActiveTopRef = useRef<number>(0);

  // Load user progress
  const loadProgress = async () => {
    if (!user) return;
    try {
      const prog = await getChallengeProgress(user.id);
      setProgress(prog);
    } catch (err) {
      console.error('Failed to load challenge progress:', err);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [user]);

  useEffect(() => {
    if (isPlaying && !showResults) {
      setIsZenMode(true);
    } else {
      setIsZenMode(false);
    }
    return () => {
      setIsZenMode(false);
    };
  }, [isPlaying, showResults, setIsZenMode]);

  // Clean timer and save practice time
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (isPlayingRef.current && elapsedTimeRef.current > 0 && user) {
        incrementPracticeTime(user.id, elapsedTimeRef.current);
      }
    };
  }, [user]);

  const startChallenge = (challenge: Challenge) => {
    if (isPlaying && elapsedTime > 0 && user) {
      incrementPracticeTime(user.id, elapsedTime);
    }

    setSelectedChallenge(challenge);
    setRawTypedText('');
    setElapsedTime(0);
    setTimeLeft(challenge.timeLimit);
    setIsPlaying(true);
    setIsStarted(false);
    setShowResults(false);
    setPassed(false);
    setFailReason('');

    setTimeout(() => {
      if (textInputRef.current) textInputRef.current.focus();
    }, 50);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const tick = () => {
    setElapsedTime(prev => prev + 1);
    setTimeLeft(prev => Math.max(0, prev - 1));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isPlaying || !selectedChallenge) return;

    const val = e.target.value;

    // Start timer on first keystroke
    if (!isStarted && val.length === 1) {
      setIsStarted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        tick();
      }, 1000);
    }

    setRawTypedText(val);

    // Completed all text
    if (val.length >= selectedChallenge.text.length) {
      handleFinished(false);
    }
  };

  const handleFinished = async (isTimeout: boolean) => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setShowResults(true);

    if (!selectedChallenge) return;

    const cleanTyped = rawTypedText.trim();
    const cleanTarget = selectedChallenge.text.slice(0, cleanTyped.length);

    let errors = 0;
    for (let i = 0; i < cleanTyped.length; i++) {
      if (cleanTyped[i] !== cleanTarget[i]) {
        errors++;
      }
    }

    const accuracy = cleanTyped.length > 0
      ? Math.max(0, Math.round(((cleanTyped.length - errors) / cleanTyped.length) * 100))
      : 0;

    const finalSeconds = isTimeout ? selectedChallenge.timeLimit : elapsedTime;
    const finalWpm = Math.round((cleanTyped.length / 5) / ((finalSeconds || 1) / 60));

    // Validate metrics targets
    let isPass = true;
    let reason = '';

    if (isTimeout && cleanTyped.length < selectedChallenge.text.length) {
      isPass = false;
      reason = 'Time ran out before you finished the challenge text.';
    } else if (finalWpm < selectedChallenge.targetWpm) {
      isPass = false;
      reason = `Speed of ${finalWpm} WPM was below the target of ${selectedChallenge.targetWpm} WPM.`;
    } else if (accuracy < selectedChallenge.targetAccuracy) {
      isPass = false;
      reason = `Accuracy of ${accuracy}% was below the requirement of ${selectedChallenge.targetAccuracy}%.`;
    }

    setPassed(isPass);
    setFailReason(reason);

    if (isPass && user) {
      try {
        await saveChallengeCompletion(user.id, selectedChallenge.level, finalWpm, accuracy);
        await saveSession(user.id, {
          wpm: finalWpm,
          accuracy,
          levelType: 'challenge' as any,
          duration: finalSeconds,
          errors,
          charsTyped: cleanTyped.length
        });
        addToast('Level Passed!', `Challenge Level ${selectedChallenge.level} unlocked the next card!`, 'success');
        refreshProfile();
        loadProgress(); // reload progress
      } catch (err) {
        console.error('Failed to unlock next level:', err);
      }
    } else if (!isPass) {
      addToast('Challenge Failed', 'You did not meet the requirements.', 'error');
    }
  };

  // Effect to handle timer running out
  useEffect(() => {
    if (isPlaying && isStarted && timeLeft <= 0) {
      handleFinished(true);
    }
  }, [timeLeft, isPlaying, isStarted]);

  // Render highlights
  const renderTextHighlights = () => {
    if (!selectedChallenge) return null;
    return selectedChallenge.text.split('').map((char, index) => {
      const typedChar = rawTypedText[index];
      let charClass = 'text-slate-500';
      if (typedChar !== undefined) {
        charClass = typedChar === char ? 'text-white' : 'bg-cyber-red/35 text-cyber-red border-b border-cyber-red';
      }

      const isActive = index === rawTypedText.length;
      return (
        <span 
          key={index} 
          ref={isActive ? activeCharRef : undefined}
          className={`${charClass} ${isActive ? 'typing-caret-active animate-caret' : ''} font-mono tracking-wide`}
        >
          {char}
        </span>
      );
    });
  };

  // Determine if a level is unlocked
  // Level 1 is always unlocked. Other levels are unlocked if level - 1 is completed.
  const isLevelUnlocked = (level: number) => {
    if (level === 1) return true;
    return !!progress[level - 1];
  };

  const accuracy = rawTypedText.length > 0 && selectedChallenge
    ? Math.max(0, Math.round((selectedChallenge.text.split('').filter((c, i) => rawTypedText[i] === c).length / rawTypedText.length) * 100))
    : 100;

  const currentWpm = Math.round((rawTypedText.length / 5) / ((elapsedTime || 1) / 60));

  return (
    <div className={`transition-all duration-500 ${isZenMode ? 'w-full h-screen max-h-screen overflow-hidden flex flex-col justify-center mx-auto px-6 md:px-16 lg:px-24 pb-0' : 'space-y-4 w-full pb-2'}`}>
      {/* 1. Header Navigation */}
      {!isZenMode && (
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg border flex items-center justify-center cursor-pointer hover:bg-selection hover:border-accent hover:text-accent transition-all active:scale-[0.98] mr-1"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}
                title="Back to Dashboard"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy size={20} />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Challenge Progression Mode</span>
              <h2 className="text-lg font-bold text-white leading-tight">60 Progressive Levels of Speed & Precision</h2>
            </div>
          </div>
        </div>
      )}

      {/* 2. Content Sandbox */}
      {selectedChallenge ? (
        /* Active gameplay console */
        <div className={`relative overflow-hidden flex flex-col transition-all duration-500 ${isZenMode ? 'border-0 bg-transparent shadow-none p-0 w-full' : 'glass-card p-6 rounded-2xl'}`}>
          {/* Active gameplay sandbox */}
          <div className={`relative transition-all duration-500 ${isZenMode ? 'space-y-12' : 'space-y-6'}`}>
            {/* Stats headers */}
            <div className={`flex justify-between items-center transition-all duration-300 ${isZenMode ? 'px-0 py-0 border-0 bg-transparent text-slate-500 text-lg' : 'bg-slate-950/30 px-4 py-2.5 border border-white/5 rounded-xl text-xs'}`}>
              <div className="flex items-center gap-1.5">
                <Zap size={isZenMode ? 18 : 14} className="text-cyber-blue text-glow-cyan" />
                <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-slate-400 font-medium'}>Target:</span>
                <span className={isZenMode ? 'text-3xl font-black text-cyber-blue text-glow-cyan' : 'font-bold text-white'}>{selectedChallenge.targetWpm} WPM</span>
                <span className={isZenMode ? 'text-sm font-semibold text-slate-400 ml-1' : 'text-slate-500'}>({currentWpm} WPM)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target size={isZenMode ? 18 : 14} className="text-cyber-green" />
                <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-slate-400 font-medium'}>Accuracy:</span>
                <span className={isZenMode ? 'text-3xl font-black text-cyber-green' : 'font-bold text-white'}>{selectedChallenge.targetAccuracy}%</span>
                <span className={isZenMode ? 'text-sm font-semibold text-slate-400 ml-1' : 'text-slate-500'}>({accuracy}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={isZenMode ? 18 : 14} className="text-cyber-red" />
                <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-slate-400 font-medium'}>Timer:</span>
                <span className={isZenMode ? 'text-3xl font-black text-white' : `font-bold ${timeLeft <= 10 ? 'text-cyber-red animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
              {!isZenMode && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] uppercase font-black tracking-widest text-slate-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedChallenge.focusType === 'accuracy' ? 'bg-cyber-green animate-pulse' :
                    selectedChallenge.focusType === 'speed' ? 'bg-orange-500 animate-pulse' :
                    selectedChallenge.focusType === 'endurance' ? 'bg-purple-500 animate-pulse' :
                    'bg-cyber-blue'
                  }`} />
                  {selectedChallenge.focusType} Trial
                </div>
              )}
            </div>

            {/* Text Highlights Box */}
            <div 
              ref={containerRef}
              onClick={() => { if (textInputRef.current) textInputRef.current.focus(); }}
              className={`w-full transition-all duration-500 select-none cursor-text overflow-hidden relative whitespace-pre-wrap ${
                isZenMode 
                  ? 'border-0 bg-transparent p-0 min-h-48 max-h-96 text-2xl md:text-3xl leading-loose font-mono' 
                  : 'border border-white/10 rounded-2xl bg-slate-950/50 p-8 min-h-32 max-h-56 overflow-y-auto text-lg leading-relaxed'
              }`}
            >
              {renderTextHighlights()}

              {!isStarted && (
                <div className={`absolute flex items-center gap-1.5 text-slate-400 bg-slate-900 border border-white/5 px-2.5 py-1.5 rounded-lg animate-pulse select-none pointer-events-none ${
                  isZenMode ? 'right-0 bottom-0 text-xs' : 'right-3 bottom-3 text-[10px]'
                }`}>
                  <Sparkles size={12} className="text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                  Type the first letter to begin level timer
                </div>
              )}
            </div>

            {/* Ghost input area */}
            <textarea
              ref={textInputRef}
              value={rawTypedText}
              onChange={handleTextChange}
              onKeyDown={(e) => playClickSound(e.key)}
              className="absolute w-0 h-0 opacity-0 pointer-events-none"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => startChallenge(selectedChallenge)}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  Restart Level
                </button>
                <button
                  onClick={() => setIsZenMode(!isZenMode)}
                  className="px-4 py-2 bg-white/5 border border-cyber-blue/30 hover:bg-cyber-blue/10 text-cyber-blue rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Toggle distraction-free full-screen layout"
                >
                  {isZenMode ? 'Exit Full Screen' : 'Full Screen Mode'}
                </button>
              </div>

              <div className="flex items-center gap-4">
                {onBack && (
                  <button
                    onClick={() => {
                      setIsZenMode(false);
                      onBack();
                    }}
                    className="text-xs text-cyber-red hover:text-cyber-red/80 font-semibold underline cursor-pointer"
                  >
                    Exit Practice
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isPlaying && elapsedTime > 0 && user) {
                      incrementPracticeTime(user.id, elapsedTime);
                    }
                    setSelectedChallenge(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300 font-semibold"
                >
                  Exit Level
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Progress cards grid list */
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {CHALLENGES.map((chal) => {
            const unlocked = isLevelUnlocked(chal.level);
            const score = progress[chal.level];
            
            return (
              <div
                key={chal.id}
                onClick={() => { if (unlocked) startChallenge(chal); }}
                className={`glass-card p-5 rounded-2xl border flex flex-col justify-between h-40 transition-all ${
                  unlocked 
                    ? 'border-white/10 bg-slate-900/40 cursor-pointer hover:border-cyber-blue/40 hover:scale-[1.03]' 
                    : 'border-white/5 bg-slate-950/30 opacity-40 cursor-not-allowed select-none'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-500">Lvl {chal.level}</span>
                  {unlocked ? (
                    score ? (
                      <CheckCircle size={16} className="text-cyber-green" />
                    ) : (
                      <Award size={16} className="text-cyber-blue animate-pulse" />
                    )
                  ) : (
                    <Lock size={14} className="text-slate-500" />
                  )}
                </div>

                <div className="my-2">
                  <h4 className={`text-sm font-extrabold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                    Level {chal.level}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      chal.focusType === 'accuracy' ? 'bg-cyber-green' :
                      chal.focusType === 'speed' ? 'bg-orange-500' :
                      chal.focusType === 'endurance' ? 'bg-purple-500' :
                      'bg-cyber-blue'
                    }`} />
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                      {chal.focusType}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 truncate">
                    Req: {chal.targetWpm} W / {chal.targetAccuracy}%
                  </p>
                </div>

                {score ? (
                  <div className="mt-2 text-[10px] text-cyber-green bg-cyber-green/5 border border-cyber-green/20 px-2 py-0.5 rounded-md flex justify-between">
                    <span>Passed</span>
                    <strong>{score.wpm} WPM</strong>
                  </div>
                ) : unlocked ? (
                  <div className="mt-2 text-[10px] text-cyber-blue bg-cyber-blue/5 border border-cyber-blue/20 px-2 py-0.5 rounded-md text-center font-semibold">
                    Play Challenge
                  </div>
                ) : (
                  <div className="mt-2 text-[10px] text-slate-500 bg-slate-950/40 px-2 py-0.5 rounded-md text-center">
                    Locked
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Results Modal */}
      {showResults && selectedChallenge && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) { setShowResults(false); setIsZenMode(false); } }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in text-left"
        >
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-white/10 shadow-2xl relative bg-slate-900/90 text-slate-100 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { setShowResults(false); setIsZenMode(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
            
            <div className="py-6 flex flex-col items-center text-center space-y-6 w-full">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border ${
                passed 
                  ? 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green shadow-[0_0_15px_rgba(16,185,129,0.35)]' 
                  : 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red shadow-[0_0_15px_rgba(244,63,94,0.35)]'
              }`}>
                {passed ? <CheckCircle size={36} /> : <XCircle size={36} />}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {passed ? 'Level Completed successfully!' : 'Requirements Not Met'}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Challenge Level {selectedChallenge.level}
                </p>
                {!passed && (
                  <p className="text-xs text-cyber-red font-semibold bg-cyber-red/5 border border-cyber-red/20 px-3 py-2 rounded-lg mt-3">
                    {failReason}
                  </p>
                )}
              </div>

              {/* Stats card */}
              <div className="grid grid-cols-2 gap-4 w-full bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <div className="text-center p-2 border-r border-white/5">
                  <span className="text-xs text-slate-400 font-semibold block">Speed achieved</span>
                  <span className={`text-2xl font-extrabold mt-1 block ${passed ? 'text-cyber-blue text-glow-cyan' : 'text-slate-400'}`}>
                    {currentWpm} WPM
                  </span>
                  <span className="text-[10px] text-slate-500">Target: {selectedChallenge.targetWpm} WPM</span>
                </div>
                <div className="text-center p-2">
                  <span className="text-xs text-slate-400 font-semibold block">Accuracy achieved</span>
                  <span className={`text-2xl font-extrabold mt-1 block ${passed ? 'text-cyber-green' : 'text-slate-400'}`}>
                    {accuracy}%
                  </span>
                  <span className="text-[10px] text-slate-500">Target: {selectedChallenge.targetAccuracy}%</span>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setShowResults(false);
                    setIsZenMode(false);
                    startChallenge(selectedChallenge);
                  }}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  Retry Level
                </button>
                {passed && selectedChallenge.level < CHALLENGES.length ? (
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setIsZenMode(false);
                      startChallenge(CHALLENGES[selectedChallenge.level]);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    Next Level
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setIsZenMode(false);
                      setSelectedChallenge(null);
                    }}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition cursor-pointer"
                  >
                    Exit Level
                  </button>
                )}
              </div>

              {onBack && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setIsZenMode(false);
                      onBack();
                    }}
                    className="text-xs text-cyber-red hover:text-cyber-red/80 font-semibold underline transition cursor-pointer"
                  >
                    Exit Practice
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



