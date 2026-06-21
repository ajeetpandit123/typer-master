'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { saveSession } from '@/lib/services/db';
import { QUOTES, Quote } from '@/lib/services/mockData';
import { 
  FileText, Play, RotateCcw, Target, Hourglass, ArrowRight, BookOpen, Quote as QuoteIcon, Sparkles
} from 'lucide-react';

export const QuotePractice: React.FC = () => {
  const { user, addToast, refreshProfile } = useApp();

  // Settings
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLength, setSelectedLength] = useState<string>('all');

  // Active Quote State
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [rawTypedText, setRawTypedText] = useState('');
  
  // Timers & Stats
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Load random quote based on filters
  const loadNewQuote = () => {
    let list = [...QUOTES];
    if (selectedCategory !== 'all') {
      list = list.filter(q => q.category === selectedCategory);
    }
    if (selectedLength !== 'all') {
      list = list.filter(q => q.lengthCategory === selectedLength);
    }

    if (list.length === 0) {
      // Fallback if list is empty
      list = [...QUOTES];
    }

    const randomIdx = Math.floor(Math.random() * list.length);
    setActiveQuote(list[randomIdx]);
    
    // Reset state
    setRawTypedText('');
    setElapsedTime(0);
    setIsPlaying(false);
    setIsStarted(false);
    setShowResults(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    loadNewQuote();
  }, [selectedCategory, selectedLength]);

  // Clean timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    
    // Start timer on first keystroke
    if (!isStarted && val.length === 1) {
      setIsStarted(true);
      setIsPlaying(true);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    setRawTypedText(val);

    if (activeQuote && val.length >= activeQuote.text.length) {
      handleFinished(elapsedTime);
    }
  };

  const handleFinished = async (finalSeconds: number) => {
    setIsPlaying(false);
    setIsStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setShowResults(true);

    if (!activeQuote) return;

    const cleanTyped = rawTypedText.trim();
    const cleanTarget = activeQuote.text.slice(0, cleanTyped.length);
    
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
          levelType: 'quote',
          duration: finalSeconds || 1,
          errors: totalErrors,
          charsTyped: cleanTyped.length
        });

        addToast('Quote Mode Complete!', `WPM: ${finalWpm} | Acc: ${accuracy}%`, 'success');
        refreshProfile();
      } catch (err) {
        console.error('Failed to save quote session:', err);
      }
    }
  };

  const renderTextHighlights = () => {
    if (!activeQuote) return null;
    return activeQuote.text.split('').map((char, index) => {
      const typedChar = rawTypedText[index];
      
      let charClass = 'text-slate-500';
      if (typedChar !== undefined) {
        charClass = typedChar === char ? 'text-white' : 'bg-cyber-red/35 text-cyber-red border-b border-cyber-red';
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

  const accuracy = rawTypedText.length > 0 && activeQuote
    ? Math.max(0, Math.round((activeQuote.text.split('').filter((c, i) => rawTypedText[i] === c).length / rawTypedText.length) * 100))
    : 100;

  const currentWpm = Math.round((rawTypedText.length / 5) / ((elapsedTime || 1) / 60));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* 1. Header & Filters */}
      <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
            <QuoteIcon size={20} />
          </div>
          <div>
            <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">Quote Mode</span>
            <h2 className="text-lg font-bold text-white leading-tight">Inspirational & Educational Quotes</h2>
          </div>
        </div>

        {/* Dropdown Filters (Disabled during typing) */}
        {!isStarted && !showResults && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2 text-slate-300 focus:outline-none focus:border-cyber-blue"
            >
              <option value="all">All Categories</option>
              <option value="motivation">Motivation</option>
              <option value="business">Business</option>
              <option value="technology">Technology</option>
              <option value="leadership">Leadership</option>
              <option value="education">Education</option>
              <option value="philosophy">Philosophy</option>
            </select>

            <select
              value={selectedLength}
              onChange={(e) => setSelectedLength(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2 text-slate-300 focus:outline-none focus:border-cyber-blue"
            >
              <option value="all">All Lengths</option>
              <option value="short">Short (10-30 words)</option>
              <option value="medium">Medium (30-80 words)</option>
              <option value="long">Long (80+ words)</option>
            </select>
          </div>
        )}
      </div>

      {/* 2. Typing Area */}
      <div className="glass-card p-6 rounded-2xl flex flex-col relative overflow-hidden">
        {showResults ? (
          /* Results Panel */
          <div className="py-6 space-y-6">
            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyber-amber/15 text-cyber-amber border border-cyber-amber/30 mb-2">
                Quote Completed
              </span>
              <h3 className="text-xl font-bold text-white">Assessment Complete</h3>
              {activeQuote && (
                <p className="text-xs text-slate-400 italic mt-2">
                  &ldquo;{activeQuote.text}&rdquo; &mdash; {activeQuote.author}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full bg-slate-950/40 p-5 border border-white/5 rounded-xl">
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Speed</span>
                <span className="text-3xl font-extrabold text-cyber-blue text-glow-cyan mt-1 block">{currentWpm} WPM</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Accuracy</span>
                <span className="text-3xl font-extrabold text-cyber-green mt-1 block">{accuracy}%</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Time</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">{elapsedTime}s</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Mistakes</span>
                <span className="text-3xl font-extrabold text-cyber-red mt-1 block">
                  {activeQuote ? activeQuote.text.length - activeQuote.text.split('').filter((c, i) => rawTypedText[i] === c).length : 0}
                </span>
              </div>
            </div>

            <button
              onClick={loadNewQuote}
              className="w-full py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-md"
            >
              <RotateCcw size={16} />
              Load Next Quote
            </button>
          </div>
        ) : (
          /* Active Typing Engine */
          <div className="space-y-6">
            {/* Live Stats */}
            <div className="flex justify-between items-center bg-slate-950/30 px-4 py-2 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Category:</span>
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  {activeQuote?.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Live Speed:</span>
                <span className="text-xs font-bold text-cyber-blue">{isStarted ? currentWpm : 0} WPM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Accuracy:</span>
                <span className="text-xs font-bold text-cyber-green">{accuracy}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Time:</span>
                <span className="text-xs font-bold text-white">{elapsedTime}s</span>
              </div>
            </div>

            {/* Quote block layout */}
            <div 
              onClick={() => { if (textInputRef.current) textInputRef.current.focus(); }}
              className="w-full border border-white/10 rounded-2xl bg-slate-950/50 p-8 min-h-36 text-lg leading-relaxed select-none cursor-text relative overflow-hidden"
            >
              {renderTextHighlights()}
              
              {!isStarted && (
                <div className="absolute right-3 bottom-3 flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900 border border-white/5 px-2.5 py-1.5 rounded-lg animate-pulse">
                  <Sparkles size={12} className="text-yellow-400" />
                  Type the first letter to begin timer
                </div>
              )}
            </div>

            {/* Ghost input area */}
            <textarea
              ref={textInputRef}
              value={rawTypedText}
              onChange={handleStartTyping}
              className="absolute w-0 h-0 opacity-0 pointer-events-none"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />

            {/* Controls */}
            {activeQuote && (
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Author: <strong className="text-white">{activeQuote.author}</strong></span>
                <button
                  onClick={loadNewQuote}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg font-bold transition flex items-center gap-1.5"
                >
                  <RotateCcw size={12} />
                  New Quote
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
