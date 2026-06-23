'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { saveSession, unlockAchievement } from '@/lib/services/db';
import { HandGuide } from './HandGuide';
import { KeyboardVisualizer } from './KeyboardVisualizer';
import { BookOpen, RefreshCw, CheckCircle, AlertTriangle, ArrowRight, Play } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  characters: string;
  description: string;
}

const BEGINNER_LESSONS: Lesson[] = [
  { id: 'beg-1', title: 'Home Row Index Keys', description: 'Practice typing F, J, G, and H.', characters: 'fg hj fg hj ff jj gg hh fjhg hgjf jfgh hgfj' },
  { id: 'beg-2', title: 'Home Row Middle Keys', description: 'Practice adding D and K.', characters: 'dk dk dd kk fjdk fjdk gjdk hgdk dfjk kdfj' },
  { id: 'beg-3', title: 'Home Row Ring Keys', description: 'Practice adding S and L.', characters: 'sl sl ss ll sldk sldk fjsl fjsl ghsl lsgh sdkl' },
  { id: 'beg-4', title: 'Home Row Pinky Keys', description: 'Practice adding A and semicolon (;).', characters: 'a; a; aa ;; asdf jkl; a;sl dkfj gha; ;ahg ask; df;s' },
  { id: 'beg-5', title: 'Top Row Index Keys', description: 'Practice adding R, U, T, and Y.', characters: 'ru ty ru ty rr uu tt yy fjru ghty ruty urty trfu' },
  { id: 'beg-6', title: 'Top Row Middle & Ring Keys', description: 'Practice adding E, I, W, and O.', characters: 'ei wo ei wo ee ii ww oo ewoi owew dkei slwo eiwo' },
  { id: 'beg-7', title: 'Top Row Pinky Keys', description: 'Practice adding Q and P.', characters: 'qp qp qq pp qpwo eirq pqei woqp qpdk ;pqw poqi' },
  { id: 'beg-8', title: 'Bottom Row Index Keys', description: 'Practice adding V, M, B, and N.', characters: 'vm bn vm bn vv mm bb nn fjvm ghbn vmbn nbvm vbnm' },
  { id: 'beg-9', title: 'Bottom Row Ring & Middle Keys', description: 'Practice adding C, X, Z, and punctuation.', characters: 'cx z, cx z, cc xx zz ,, c,xz zx,c dkc, slzx cx,z' },
  { id: 'beg-10', title: 'Full Alphabet Fluidity', description: 'Combine all rows and practice complete word rhythms.', characters: 'the quick brown fox jumps over the lazy dog' }
];

export const BeginnerPractice: React.FC = () => {
  const { user, addToast, refreshProfile, isZenMode, setIsZenMode, playClickSound } = useApp();
  
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [inputIndex, setInputIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [errorKey, setErrorKey] = useState<string | undefined>(undefined);
  const [showResults, setShowResults] = useState(false);
  const [showHandGuide, setShowHandGuide] = useState(true);

  const lesson = BEGINNER_LESSONS[currentLessonIdx];
  const targetText = lesson.characters;
  const targetChar = targetText[inputIndex] || '';

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

  // Track key errors key-by-key
  const recordKeyError = (char: string) => {
    if (typeof window === 'undefined') return;
    const key = char.toUpperCase();
    if (!key || key === ' ') return;
    
    const storedErrors = localStorage.getItem('typemaster_key_errors');
    const errors: Record<string, number> = storedErrors ? JSON.parse(storedErrors) : {};
    errors[key] = (errors[key] || 0) + 1;
    localStorage.setItem('typemaster_key_errors', JSON.stringify(errors));
  };

  useEffect(() => {
    if (!isPlaying || showResults) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser shortcuts
      if (e.key === 'Tab' || e.key === 'Backspace' || e.key === ' ') {
        e.preventDefault();
      }

      // Ignore modifier keys
      if (e.key.length > 1 && e.key !== 'Spacebar' && e.key !== ' ' && e.key !== 'Backspace') return;

      playClickSound(e.key);

      const typed = e.key;
      const expected = targetText[inputIndex];

      if (typed === expected) {
        // Correct character typed
        const nextTyped = [...typedChars, typed];
        setTypedChars(nextTyped);
        setInputIndex(prev => prev + 1);
        setErrorKey(undefined);

        // Check if finished
        if (inputIndex + 1 >= targetText.length) {
          handleLessonCompleted(nextTyped.length, mistakes);
        }
      } else {
        // Mistake
        setMistakes(prev => prev + 1);
        setErrorKey(typed);
        recordKeyError(expected);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, inputIndex, targetText, typedChars, mistakes, showResults]);

  const handleStart = () => {
    setIsPlaying(true);
    setInputIndex(0);
    setMistakes(0);
    setTypedChars([]);
    setErrorKey(undefined);
    setShowResults(false);
  };

  const handleLessonCompleted = async (totalTyped: number, totalMistakes: number) => {
    setIsPlaying(false);
    setShowResults(true);

    const totalKeys = totalTyped + totalMistakes;
    const accuracy = totalKeys > 0 ? Math.max(0, Math.round((totalTyped / totalKeys) * 100)) : 100;

    if (user) {
      try {
        // Save dummy typing session (Beginner, 0 duration/wpm mock metrics)
        await saveSession(user.id, {
          wpm: 0, // Beginner mode does not compute WPM
          accuracy,
          levelType: 'beginner',
          duration: 25, // mock duration
          errors: totalMistakes,
          charsTyped: totalTyped
        });

        // Award achievement on first lesson completion
        const isUnlocked = await unlockAchievement(user.id, 'first_lesson');
        if (isUnlocked) {
          addToast('Achievement Unlocked!', 'Unlocked "First Steps" Badge', 'achievement');
        }

        addToast('Lesson Finished!', `Accuracy: ${accuracy}%`, 'success');
        refreshProfile();
      } catch (err) {
        console.error('Failed to save beginner session:', err);
      }
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIdx + 1 < BEGINNER_LESSONS.length) {
      setCurrentLessonIdx(prev => prev + 1);
      setShowResults(false);
      setIsPlaying(false);
      setInputIndex(0);
      setMistakes(0);
    } else {
      addToast('Path Complete!', 'You have finished all Level 1 lessons!', 'success');
    }
  };

  const totalKeys = inputIndex + mistakes;
  const accuracy = totalKeys > 0 ? Math.max(0, Math.round((inputIndex / totalKeys) * 100)) : 100;
  const progressPercent = Math.min(100, Math.round((inputIndex / targetText.length) * 100));

  return (
    <div className={`transition-all duration-500 ${isZenMode ? 'w-full h-screen max-h-screen overflow-hidden flex flex-col justify-center mx-auto px-6 md:px-16 lg:px-24 pb-0' : 'space-y-6 max-w-5xl mx-auto pb-10'}`}>
      {/* 1. Header Navigation */}
      {!isZenMode && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen size={20} />
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Level 1 - Beginner Learning Path</span>
              <h2 className="text-lg font-bold text-white leading-tight">Lesson {currentLessonIdx + 1}: {lesson.title}</h2>
            </div>
          </div>
          
          {/* Lesson Select */}
          <select 
            value={currentLessonIdx} 
            onChange={(e) => {
              setCurrentLessonIdx(Number(e.target.value));
              setIsPlaying(false);
              setShowResults(false);
              setInputIndex(0);
              setMistakes(0);
            }}
            className="bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2 text-slate-300 focus:outline-none focus:border-cyber-blue"
          >
            {BEGINNER_LESSONS.map((l, idx) => (
              <option key={l.id} value={idx}>Lesson {idx + 1}: {l.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* 2. Main Arena Card */}
      <div className={`relative overflow-hidden flex flex-col items-center transition-all duration-500 ${isZenMode ? 'border-0 bg-transparent shadow-none p-0 w-full' : 'glass-card p-6 rounded-2xl'}`}>
        {showResults ? (
          /* Lesson Completed Panel */
          <div className="py-8 flex flex-col items-center text-center max-w-md w-full space-y-6">
            <div className="w-16 h-16 bg-cyber-green/10 border border-cyber-green/30 rounded-full flex items-center justify-center text-cyber-green shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle size={36} />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white">Lesson Completed!</h3>
              <p className="text-sm text-slate-400 mt-1">{lesson.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full bg-slate-950/40 p-4 rounded-xl border border-white/5">
              <div className="text-center p-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Accuracy</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">
                  {targetText.length + mistakes > 0 ? Math.round((targetText.length / (targetText.length + mistakes)) * 100) : 100}%
                </span>
              </div>
              <div className="text-center p-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Mistakes</span>
                <span className="text-2xl font-extrabold text-cyber-red mt-1 block">{mistakes}</span>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleStart}
                className="flex-1 py-3 border border-white/10 hover:border-white/20 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                Retry Lesson
              </button>
              <button
                onClick={handleNextLesson}
                className="flex-1 py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-md"
              >
                Next Lesson
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Active Practice Arena */
          <div className="w-full space-y-6">
            {/* Live Stats */}
            <div className={`flex justify-between items-center transition-all duration-300 w-full ${isZenMode ? 'px-0 py-0 border-0 bg-transparent text-slate-500 text-lg' : 'bg-slate-950/30 px-4 py-2 border border-white/5 rounded-xl'}`}>
              <div className="flex items-center gap-2">
                <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-xs text-slate-400'}>Accuracy:</span>
                <span className={isZenMode ? 'text-3xl font-black text-cyber-green text-glow-cyan' : `text-xs font-bold ${accuracy >= 90 ? 'text-cyber-green' : 'text-cyber-amber'}`}>{accuracy}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-xs text-slate-400'}>Mistakes:</span>
                <span className={isZenMode ? 'text-3xl font-black text-cyber-red' : 'text-xs font-bold text-cyber-red'}>{mistakes}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={isZenMode ? 'text-sm uppercase tracking-wider text-slate-500 font-semibold' : 'text-xs text-slate-400'}>Progress:</span>
                <span className={isZenMode ? 'text-3xl font-black text-white' : 'text-xs font-bold text-white'}>{progressPercent}%</span>
              </div>
            </div>

            {/* Typography Arena */}
            <div className={`w-full transition-all duration-500 flex items-center justify-center text-3xl font-mono relative overflow-hidden select-none whitespace-pre-wrap ${
              isZenMode 
                ? 'border-0 bg-transparent p-0 min-h-36 leading-loose' 
                : 'border border-white/10 rounded-2xl bg-slate-950/50 p-8 leading-relaxed'
            }`}>
              {!isZenMode && (
                <div className="absolute top-2 left-2 text-[10px] uppercase font-bold text-slate-600 tracking-widest">
                  Interactive Text Box
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center text-center max-w-2xl leading-loose tracking-wide">
                {targetText.split('').map((char, index) => {
                  let charClass = 'text-slate-600';
                  if (index < inputIndex) {
                    charClass = 'text-slate-400 font-semibold';
                  } else if (index === inputIndex) {
                    charClass = 'typing-caret-active-bottom animate-pulse-caret relative';
                  }
                  
                  return (
                    <span 
                      key={index} 
                      className={`${charClass} transition-colors duration-150`}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={handleStart}
                className="text-xs text-slate-500 hover:text-slate-300 font-semibold underline flex items-center gap-1.5"
              >
                Reset Lesson
              </button>
              <button 
                onClick={() => setIsZenMode(!isZenMode)}
                className="text-xs text-cyber-blue hover:text-cyber-blue/80 font-semibold underline flex items-center gap-1.5"
              >
                {isZenMode ? 'Exit Full Screen' : 'Full Screen Mode'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Guide Overlays */}
      {isPlaying && !showResults && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <HandGuide 
              targetKey={targetChar === ' ' ? 'SPACE' : targetChar} 
              onClose={() => setShowHandGuide(false)}
            />
          </div>
          <div className="md:col-span-2">
            <KeyboardVisualizer 
              targetKey={targetChar === ' ' ? ' ' : targetChar} 
              errorKey={errorKey}
            />
          </div>
        </div>
      )}
    </div>
  );
};
